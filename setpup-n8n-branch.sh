#!/bin/bash
# setup-n8n-branch.sh
# Script d'automatisation pour créer la branche N8N + Ollama

set -e  # Arrêter en cas d'erreur

echo "🚀 Setup N8N + Ollama Integration Branch"
echo "=========================================="
echo ""

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Vérifier qu'on est dans un repo Git
if [ ! -d .git ]; then
    echo -e "${RED}❌ Erreur: Ce répertoire n'est pas un repo Git${NC}"
    exit 1
fi

# 1. Créer la branche
echo -e "${BLUE}📌 Étape 1/8: Création de la branche${NC}"
git checkout main 2>/dev/null || git checkout master
git pull origin main 2>/dev/null || git pull origin master
git checkout -b feature/n8n-ollama-integration
echo -e "${GREEN}✅ Branche créée${NC}"
echo ""

# 2. Créer la structure de dossiers
echo -e "${BLUE}📁 Étape 2/8: Création des dossiers${NC}"
mkdir -p lib/ai
mkdir -p app/api/ai/chat
mkdir -p app/booking/chat
mkdir -p app/dashboard/knowledge
mkdir -p app/dashboard/rules
mkdir -p n8n/workflows
mkdir -p docs
echo -e "${GREEN}✅ Dossiers créés${NC}"
echo ""

# 3. Copier les fichiers (depuis /mnt/user-data/outputs)
echo -e "${BLUE}📄 Étape 3/8: Copie des fichiers${NC}"

# Vérifier si les fichiers source existent
if [ ! -f /mnt/user-data/outputs/schema-v3-ia.prisma ]; then
    echo -e "${RED}❌ Fichiers source non trouvés dans /mnt/user-data/outputs${NC}"
    echo "Veuillez d'abord télécharger les fichiers générés par Claude"
    exit 1
fi

cp /mnt/user-data/outputs/schema-v3-ia.prisma prisma/schema.prisma
cp /mnt/user-data/outputs/llm-client.ts lib/ai/llm-client.ts
cp /mnt/user-data/outputs/ai-tools.ts lib/ai/tools.ts
cp /mnt/user-data/outputs/system-prompt.ts lib/ai/system-prompt.ts
cp /mnt/user-data/outputs/ai-chat-route.ts app/api/ai/chat/route.ts
cp /mnt/user-data/outputs/n8n-whatsapp-complete.json n8n/workflows/whatsapp-booking.json
cp /mnt/user-data/outputs/ARCHITECTURE_IA_COMPLETE.md docs/ARCHITECTURE_IA.md
cp /mnt/user-data/outputs/SETUP_HETZNER_DIRECT.md docs/SETUP_HETZNER.md
cp /mnt/user-data/outputs/DEPLOYMENT_CHECKLIST.md docs/DEPLOYMENT_CHECKLIST.md

echo -e "${GREEN}✅ Fichiers copiés${NC}"
echo ""

# 4. Créer .env.local.example
echo -e "${BLUE}🔐 Étape 4/8: Création de .env.local.example${NC}"
cat > .env.local.example << 'EOF'
# ==============================================
# DATABASE
# ==============================================
DATABASE_URL=postgresql://user:password@host:5432/database

# ==============================================
# LLM CONFIGURATION (Ollama sur Hetzner)
# ==============================================
LLM_PROVIDER=ollama
LLM_MODEL=llama3.1:8b
OLLAMA_URL=https://ollama.votre-domaine.com

# Fallback Claude API (optionnel)
ANTHROPIC_API_KEY=sk-ant-xxxxx

# ==============================================
# GOOGLE CALENDAR
# ==============================================
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxxxx
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback

# ==============================================
# N8N WEBHOOKS
# ==============================================
N8N_WEBHOOK_URL=https://n8n.votre-domaine.com/webhook

# ==============================================
# TWILIO (WhatsApp)
# ==============================================
TWILIO_ACCOUNT_SID=ACxxxxx
TWILIO_AUTH_TOKEN=xxxxx
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

# ==============================================
# TELEGRAM
# ==============================================
TELEGRAM_BOT_TOKEN=1234567890:ABCdef...

# ==============================================
# APP CONFIGURATION
# ==============================================
NEXTJS_APP_URL=http://localhost:3000
DENTIST_PHONE=+32471234567

# ==============================================
# SUPABASE (Next-Auth)
# ==============================================
NEXTAUTH_SECRET=xxxxx
NEXTAUTH_URL=http://localhost:3000
EOF

echo -e "${GREEN}✅ .env.local.example créé${NC}"
echo ""

# 5. Installer les dépendances
echo -e "${BLUE}📦 Étape 5/8: Installation des dépendances${NC}"
npm install @anthropic-ai/sdk date-fns
echo -e "${GREEN}✅ Dépendances installées${NC}"
echo ""

# 6. Créer le fichier seed
echo -e "${BLUE}🌱 Étape 6/8: Création du seed${NC}"
cat > prisma/seed-v3.ts << 'SEEDEOF'
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

  // 2. Seed InterventionDuration
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
      content: 'Le contrôle dentaire coûte 50€. Il est partiellement remboursé par la mutuelle (environ 30€).',
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
      content: 'Cabinet Dentaire Sainte-Catherine, Rue Sainte-Catherine 15, 1000 Bruxelles. Parking Sainte-Catherine à 50m. Métro De Brouckère. Accès PMR.',
      keywords: ['adresse', 'parking', 'transport', 'métro', 'pmr'],
    },
    {
      category: 'HORAIRES',
      title: 'Horaires',
      content: 'Lundi-Vendredi: 9h-18h, Samedi: 9h-13h, Dimanche: Fermé. Urgences acceptées.',
      keywords: ['horaires', 'ouverture', 'urgence'],
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
  await prisma.customRule.create({
    data: {
      dentistId: dentist.id,
      ruleType: 'HORAIRE',
      dayOfWeek: 'wednesday',
      timeStart: '00:00',
      timeEnd: '10:00',
      description: 'Pas de RDV le mercredi matin',
      action: 'BLOCK',
      priority: 10,
    },
  })

  await prisma.customRule.create({
    data: {
      dentistId: dentist.id,
      ruleType: 'PAUSE',
      timeStart: '12:00',
      timeEnd: '14:00',
      description: 'Pause déjeuner',
      action: 'BLOCK',
      priority: 5,
    },
  })

  console.log('✅ Seed completed!')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
SEEDEOF

echo -e "${GREEN}✅ Seed créé${NC}"
echo ""

# 7. Git add
echo -e "${BLUE}📝 Étape 7/8: Git add${NC}"
git add .
echo -e "${GREEN}✅ Fichiers staged${NC}"
echo ""

# 8. Résumé
echo -e "${BLUE}📊 Étape 8/8: Résumé${NC}"
echo ""
echo "Fichiers ajoutés/modifiés:"
git status --short
echo ""

# Instructions finales
echo -e "${GREEN}✅ Setup terminé !${NC}"
echo ""
echo "Prochaines étapes:"
echo ""
echo "1️⃣  Configurer .env.local (copier depuis .env.local.example)"
echo "   cp .env.local.example .env.local"
echo "   # Puis éditer avec vos vraies valeurs"
echo ""
echo "2️⃣  Migration Prisma:"
echo "   npx prisma migrate dev --name add_n8n_features"
echo "   npx prisma generate"
echo "   npx prisma db seed"
echo ""
echo "3️⃣  Tester localement:"
echo "   npm run dev"
echo "   # Puis: curl http://localhost:3000/api/ai/chat -X POST -d '{...}'"
echo ""
echo "4️⃣  Commit:"
echo "   git commit -m \"feat: Add N8N + Ollama integration\""
echo ""
echo "5️⃣  Push:"
echo "   git push -u origin feature/n8n-ollama-integration"
echo ""
echo -e "${BLUE}📚 Documentation disponible dans /docs/${NC}"
echo ""