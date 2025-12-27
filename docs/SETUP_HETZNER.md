# 🚀 Setup Direct - Hetzner + Ollama + N8N

## 🎯 Configuration actuelle

Vous avez déjà :
- ✅ Serveur Hetzner (GPU)
- ✅ Ollama installé
- ✅ N8N installé

On va configurer :
- 🔧 Ollama (télécharger modèle, exposer API)
- 🔧 N8N (workflows, webhooks)
- 🔧 Next.js (pointer vers Ollama)
- ✅ Tests bout en bout

---

## 📋 ÉTAPE 1 : Configuration Ollama

### 1.1 Vérifier l'installation

```bash
# SSH dans votre serveur Hetzner
ssh root@votre-serveur-hetzner.com

# Vérifier Ollama
ollama --version
# Attendu: ollama version 0.x.x

# Vérifier si Ollama tourne
ps aux | grep ollama
```

### 1.2 Choisir et télécharger le modèle

**Option A : Llama 3.1 8B (Recommandé pour démarrer)**
- ⚡ Rapide (< 2s par réponse)
- 💾 RAM : ~16 GB
- ⭐ Qualité : Très bonne

```bash
ollama pull llama3.1:8b
```

**Option B : Mistral 7B**
- ⚡ Très rapide (< 1s par réponse)
- 💾 RAM : ~14 GB
- ⭐ Qualité : Excellente pour français

```bash
ollama pull mistral:7b
```

**Option C : Llama 3.1 70B (Si GPU puissant)**
- 🐌 Plus lent (~5s par réponse)
- 💾 RAM : ~140 GB
- ⭐ Qualité : Exceptionnelle

```bash
ollama pull llama3.1:70b
```

**Téléchargement en cours** (peut prendre 10-30 min selon le modèle) :
```bash
# Suivre la progression
ollama list
```

### 1.3 Tester Ollama localement

```bash
# Test simple
ollama run llama3.1:8b "Bonjour, peux-tu m'aider à prendre rendez-vous chez le dentiste ?"

# Si ça fonctionne, vous devriez voir une réponse cohérente
```

### 1.4 Configurer Ollama en service (accessible via API)

**A. Créer le service systemd**

```bash
# Créer le fichier service
sudo nano /etc/systemd/system/ollama.service
```

**Contenu** :
```ini
[Unit]
Description=Ollama Service
After=network.target

[Service]
Type=simple
User=root
Environment="OLLAMA_HOST=0.0.0.0:11434"
ExecStart=/usr/local/bin/ollama serve
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
```

**B. Activer le service**

```bash
# Recharger systemd
sudo systemctl daemon-reload

# Activer Ollama au démarrage
sudo systemctl enable ollama

# Démarrer Ollama
sudo systemctl start ollama

# Vérifier le statut
sudo systemctl status ollama
# Doit afficher "active (running)"
```

### 1.5 Tester l'API Ollama

```bash
# Depuis le serveur
curl http://localhost:11434/api/generate -d '{
  "model": "llama3.1:8b",
  "prompt": "Hello, how are you?",
  "stream": false
}'

# Vous devriez voir une réponse JSON
```

### 1.6 Exposer Ollama via HTTPS (IMPORTANT pour production)

**A. Installer nginx**

```bash
sudo apt update
sudo apt install nginx -y
```

**B. Configurer nginx reverse proxy**

```bash
sudo nano /etc/nginx/sites-available/ollama
```

**Contenu** :
```nginx
server {
    listen 80;
    server_name ollama.votre-domaine.com;

    location / {
        proxy_pass http://localhost:11434;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts pour LLM (peut prendre du temps)
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
}
```

**C. Activer le site**

```bash
# Créer le lien symbolique
sudo ln -s /etc/nginx/sites-available/ollama /etc/nginx/sites-enabled/

# Tester la config
sudo nginx -t

# Recharger nginx
sudo systemctl reload nginx
```

**D. Installer SSL (Let's Encrypt)**

```bash
# Installer certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtenir certificat SSL
sudo certbot --nginx -d ollama.votre-domaine.com

# Vérifier auto-renewal
sudo certbot renew --dry-run
```

**E. Tester depuis l'extérieur**

```bash
# Depuis votre machine locale
curl https://ollama.votre-domaine.com/api/generate -d '{
  "model": "llama3.1:8b",
  "prompt": "Test",
  "stream": false
}'
```

---

## 📋 ÉTAPE 2 : Configuration N8N

### 2.1 Vérifier N8N

```bash
# Vérifier si N8N tourne
ps aux | grep n8n

# Ou si systemd service
sudo systemctl status n8n
```

### 2.2 Accéder à N8N

Ouvrez votre navigateur :
```
https://n8n.votre-domaine.com
```

Connectez-vous avec vos identifiants.

### 2.3 Importer le workflow WhatsApp

**A. Dans N8N, cliquez sur :**
- Workflows → New Workflow → Import from File

**B. Modifier le workflow importé**

Dans le workflow JSON, mettre à jour les URLs :

**Nœud "Call AI API"** :
```json
{
  "url": "https://votre-app.vercel.app/api/ai/chat"
}
```

**Environnement N8N** (Settings → Environment Variables) :
```bash
NEXTJS_APP_URL=https://votre-app.vercel.app
TWILIO_ACCOUNT_SID=ACxxxxx
TWILIO_AUTH_TOKEN=xxxxx
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
DENTIST_PHONE=+32471234567
```

### 2.4 Tester le workflow

**A. Activer le workflow**

**B. Récupérer l'URL du webhook**
- Cliquer sur le nœud "Webhook WhatsApp"
- Copier l'URL : `https://n8n.votre-domaine.com/webhook/xxxxx`

**C. Configurer Twilio**
- Aller sur Twilio Console
- WhatsApp → Sandbox Settings → Webhook URL
- Coller l'URL du webhook N8N

---

## 📋 ÉTAPE 3 : Configuration Next.js (Projet local)

### 3.1 Cloner et installer

```bash
# Sur votre machine locale
git clone votre-repo
cd dentist-app

# Installer les dépendances
npm install
```

### 3.2 Copier les fichiers IA

```bash
# Créer les dossiers
mkdir -p lib/ai
mkdir -p app/api/ai/chat

# Copier les fichiers fournis
cp llm-client.ts lib/ai/
cp ai-tools.ts lib/ai/tools.ts
cp system-prompt.ts lib/ai/
cp ai-chat-route.ts app/api/ai/chat/route.ts
```

### 3.3 Variables d'environnement

Créer `.env.local` :

```bash
# LLM Configuration - Ollama sur Hetzner
LLM_PROVIDER=ollama
LLM_MODEL=llama3.1:8b
OLLAMA_URL=https://ollama.votre-domaine.com

# Database (Supabase)
DATABASE_URL=postgresql://...

# Google Calendar (sessions précédentes)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# App URL (pour N8N callbacks)
NEXTJS_APP_URL=http://localhost:3000

# Twilio (pour tests locaux si besoin)
TWILIO_ACCOUNT_SID=ACxxxxx
TWILIO_AUTH_TOKEN=xxxxx
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

### 3.4 Mettre à jour le schéma Prisma

```bash
# Copier le nouveau schéma
cp schema-v3-ia.prisma prisma/schema.prisma

# Créer la migration
npx prisma migrate dev --name add_ai_features

# Générer le client
npx prisma generate
```

### 3.5 Seed la base de données

Créer `prisma/seed-v3.ts` :

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // 1. Récupérer ou créer le dentiste
  let dentist = await prisma.dentist.findFirst()
  
  if (!dentist) {
    dentist = await prisma.dentist.create({
      data: {
        email: 'dr.martin@dentist.com',
        name: 'Dr. Marie Martin',
        phone: '0123456789',
        specialties: ['Dentisterie générale', 'Orthodontie'],
        workingHours: {
          monday: { start: '09:00', end: '18:00' },
          tuesday: { start: '09:00', end: '18:00' },
          wednesday: { start: '09:00', end: '18:00' },
          thursday: { start: '09:00', end: '18:00' },
          friday: { start: '09:00', end: '18:00' },
          saturday: { start: '09:00', end: '13:00' },
          sunday: null,
        },
      },
    })
  }

  // 2. Seed InterventionDuration (si pas déjà fait)
  const interventions = [
    { type: 'CONTROLE', default: 30, min: 15, max: 45, price: 50 },
    { type: 'URGENCE', default: 30, min: 15, max: 60, price: 60 },
    { type: 'DETARTRAGE', default: 45, min: 30, max: 60, price: 80 },
    { type: 'CARIE', default: 60, min: 45, max: 90, price: 120 },
    { type: 'IMPLANT', default: 120, min: 90, max: 180, price: 1500 },
  ]

  for (const int of interventions) {
    await prisma.interventionDuration.upsert({
      where: { interventionType: int.type as any },
      update: {},
      create: {
        interventionType: int.type as any,
        defaultDuration: int.default,
        minDuration: int.min,
        maxDuration: int.max,
        estimatedPrice: int.price,
      },
    })
  }

  // 3. Seed KnowledgeBase
  const kbEntries = [
    {
      category: 'TARIFS',
      title: 'Tarif contrôle dentaire',
      content: 'Le contrôle dentaire coûte 50€. Il est partiellement remboursé par la mutuelle (environ 30€ selon votre mutuelle).',
      keywords: ['contrôle', 'check-up', 'prix', 'tarif', 'remboursement'],
    },
    {
      category: 'TARIFS',
      title: 'Tarif détartrage',
      content: 'Le détartrage coûte 80€. Il est remboursé par la mutuelle une fois par an.',
      keywords: ['détartrage', 'nettoyage', 'tartre', 'prix'],
    },
    {
      category: 'ACCES',
      title: 'Adresse et accès',
      content: `Cabinet Dentaire Sainte-Catherine
Rue Sainte-Catherine 15, 1000 Bruxelles

🚗 Parking : Parking Sainte-Catherine à 50m (2€/h)
🚇 Métro : De Brouckère (lignes 1, 5)
🚌 Bus : Lignes 47, 88
♿ PMR : Accès de plain-pied avec rampe`,
      keywords: ['adresse', 'parking', 'transport', 'métro', 'bus', 'pmr', 'handicap'],
    },
    {
      category: 'HORAIRES',
      title: 'Horaires d\'ouverture',
      content: `📅 Lundi - Vendredi : 9h - 18h
📅 Samedi : 9h - 13h
📅 Dimanche : Fermé

🚨 Urgences acceptées en dehors des horaires sur appel.`,
      keywords: ['horaires', 'ouverture', 'fermeture', 'samedi', 'dimanche', 'urgence'],
    },
  ]

  for (const entry of kbEntries) {
    await prisma.knowledgeBase.create({
      data: {
        dentistId: dentist.id,
        category: entry.category as any,
        title: entry.title,
        content: entry.content,
        keywords: entry.keywords,
      },
    })
  }

  // 4. Seed CustomRules
  const rules = [
    {
      ruleType: 'HORAIRE',
      dayOfWeek: 'wednesday',
      timeStart: '00:00',
      timeEnd: '10:00',
      description: 'Pas de RDV le mercredi matin (réunion équipe)',
      action: 'BLOCK',
      priority: 10,
    },
    {
      ruleType: 'PAUSE',
      timeStart: '12:00',
      timeEnd: '14:00',
      description: 'Pause déjeuner',
      action: 'BLOCK',
      priority: 5,
    },
  ]

  for (const rule of rules) {
    await prisma.customRule.create({
      data: {
        dentistId: dentist.id,
        ruleType: rule.ruleType as any,
        dayOfWeek: rule.dayOfWeek,
        timeStart: rule.timeStart,
        timeEnd: rule.timeEnd,
        description: rule.description,
        action: rule.action as any,
        priority: rule.priority,
      },
    })
  }

  console.log('✅ Seed completed!')
}

main()
  .catch