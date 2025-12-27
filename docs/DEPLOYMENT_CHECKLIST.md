# ✅ Checklist de Déploiement - IA Booking

## 📋 Phase 1 : MVP (Semaines 1-2)

### Semaine 1 : Backend & IA

- [ ] **Base de données**
  - [ ] Copier `schema-v3-ia.prisma` → `prisma/schema.prisma`
  - [ ] Exécuter migration : `npx prisma migrate dev --name add_ai_features`
  - [ ] Créer `prisma/seed-v3.ts` avec KnowledgeBase + CustomRules
  - [ ] Exécuter seed : `npx prisma db seed`
  - [ ] Vérifier dans Prisma Studio : `npx prisma studio`

- [ ] **Librairies IA**
  - [ ] Installer : `npm install @anthropic-ai/sdk date-fns`
  - [ ] Créer dossier : `mkdir -p lib/ai`
  - [ ] Copier `llm-client.ts` → `lib/ai/llm-client.ts`
  - [ ] Copier `ai-tools.ts` → `lib/ai/tools.ts`
  - [ ] Copier `system-prompt.ts` → `lib/ai/system-prompt.ts`

- [ ] **API Routes**
  - [ ] Créer dossier : `mkdir -p app/api/ai/chat`
  - [ ] Copier `ai-chat-route.ts` → `app/api/ai/chat/route.ts`
  - [ ] Tester : `curl -X POST http://localhost:3000/api/ai/chat -d '{"newMessage":"Bonjour","phone":"+32471234567","channel":"web"}'`

- [ ] **Variables d'environnement**
  - [ ] Ajouter à `.env.local` :
    ```
    LLM_PROVIDER=claude
    LLM_MODEL=claude-sonnet-4-20250514
    ANTHROPIC_API_KEY=sk-ant-xxxxx
    NEXTJS_APP_URL=http://localhost:3000
    ```
  - [ ] Obtenir API key Anthropic : https://console.anthropic.com/

### Semaine 2 : Frontend & WhatsApp

- [ ] **Page booking avec IA**
  - [ ] Créer `app/booking/chat/page.tsx`
  - [ ] Tester conversation complète
  - [ ] Vérifier création RDV dans DB

- [ ] **WhatsApp Setup (Twilio)**
  - [ ] Créer compte Twilio : https://www.twilio.com/try-twilio
  - [ ] Activer WhatsApp Sandbox
  - [ ] Noter Account SID, Auth Token, WhatsApp Number
  - [ ] Ajouter à `.env.local` :
    ```
    TWILIO_ACCOUNT_SID=ACxxxxx
    TWILIO_AUTH_TOKEN=xxxxx
    TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
    DENTIST_PHONE=+32471234567
    ```

- [ ] **N8N Setup**
  - [ ] Créer compte N8N Cloud : https://n8n.io/
  - [ ] Importer workflow : `n8n-whatsapp-complete.json`
  - [ ] Configurer credentials Twilio
  - [ ] Configurer credentials Supabase (optionnel pour logs)
  - [ ] Copier webhook URL
  - [ ] Configurer Twilio Webhook URL

- [ ] **Tests End-to-End**
  - [ ] Envoyer WhatsApp au bot : "Bonjour"
  - [ ] Demander RDV : "Je veux un contrôle"
  - [ ] Donner préférences : "L'après-midi"
  - [ ] Choisir créneau : "Le 2"
  - [ ] Vérifier création dans Supabase
  - [ ] Vérifier événement Google Calendar (si configuré)

---

## 📋 Phase 2 : Optimisation (Semaines 3-4)

### Dashboard Dentiste

- [ ] **Gestion Base de Connaissances**
  - [ ] Créer `app/dashboard/knowledge/page.tsx`
  - [ ] Permettre ajout/édition/suppression entrées KB
  - [ ] Catégories : TARIFS, ACCES, FAQ, HORAIRES, etc.

- [ ] **Gestion Règles Personnalisées**
  - [ ] Créer `app/dashboard/rules/page.tsx`
  - [ ] Permettre ajout règles (ex: "Pas de RDV mercredi matin")
  - [ ] Tester application règles dans find_available_slots

- [ ] **Analytics IA**
  - [ ] Créer `app/dashboard/ai-analytics/page.tsx`
  - [ ] Afficher métriques :
    - [ ] Nombre conversations/jour
    - [ ] Taux conversion (conv → RDV)
    - [ ] Coût IA mensuel
    - [ ] Questions non répondues
    - [ ] Temps moyen réponse

### Bot Telegram

- [ ] **Setup Telegram**
  - [ ] Créer bot avec BotFather
  - [ ] Noter Bot Token
  - [ ] Ajouter à `.env.local` :
    ```
    TELEGRAM_BOT_TOKEN=1234567890:ABCdef...
    ```

- [ ] **N8N Workflow Telegram**
  - [ ] Dupliquer workflow WhatsApp
  - [ ] Adapter pour Telegram API
  - [ ] Tester conversation complète

---

## 📋 Phase 3 : LLM Local (Semaines 5-8)

### Serveur GPU

- [ ] **Location serveur**
  - [ ] Choisir provider (Hetzner, OVH, AWS)
  - [ ] Specs minimum :
    - [ ] GPU : NVIDIA RTX 3090 ou A100
    - [ ] RAM : 64 GB
    - [ ] Stockage : 500 GB SSD
  - [ ] OS : Ubuntu 22.04

- [ ] **Installation Ollama**
  - [ ] SSH dans serveur
  - [ ] Installer Ollama : `curl -fsSL https://ollama.com/install.sh | sh`
  - [ ] Démarrer : `ollama serve`
  - [ ] Télécharger modèle : `ollama pull llama3.1:70b`
  - [ ] Tester : `curl http://localhost:11434/api/generate -d '{"model":"llama3.1:70b","prompt":"Hello"}'`

- [ ] **Exposer l'API**
  - [ ] Installer nginx
  - [ ] Configurer reverse proxy
  - [ ] SSL avec Let's Encrypt
  - [ ] Tester : `curl https://ollama.votre-domaine.com/api/generate`

### Migration Progressive

- [ ] **Mise à jour env**
  - [ ] Ajouter à `.env.production` :
    ```
    LLM_PROVIDER=ollama
    LLM_MODEL=llama3.1:70b
    OLLAMA_URL=https://ollama.votre-domaine.com
    ```

- [ ] **Tests performance**
  - [ ] Latence (doit être < 5s)
  - [ ] Qualité réponses (A/B testing vs Claude)
  - [ ] Coût (électricité serveur vs API)

- [ ] **Migration 50/50**
  - [ ] Heures creuses → Ollama
  - [ ] Heures de pointe → Claude API
  - [ ] Monitoring erreurs

- [ ] **Migration 100% Ollama**
  - [ ] Si tests OK après 2 semaines
  - [ ] Backup Claude API en fallback

---

## 📋 Production Checklist

### Sécurité

- [ ] **API Keys**
  - [ ] Toutes les clés en variables d'environnement
  - [ ] Jamais committées dans Git
  - [ ] Rotation régulière (tous les 3 mois)

- [ ] **Rate Limiting**
  - [ ] API IA : Max 100 requêtes/heure/utilisateur
  - [ ] N8N Webhooks : Max 1000/jour

- [ ] **RGPD**
  - [ ] Consentement patient pour stockage données
  - [ ] Possibilité d'export données
  - [ ] Possibilité de suppression données
  - [ ] Logs audit activés

### Monitoring

- [ ] **Uptime**
  - [ ] Uptimerobot ou équivalent
  - [ ] Alertes SMS/email si down

- [ ] **Logs**
  - [ ] Sentry ou équivalent pour erreurs
  - [ ] Logs N8N activés
  - [ ] Logs conversations archivés

- [ ] **Coûts**
  - [ ] Dashboard coûts IA
  - [ ] Alertes si > budget mensuel

### Backups

- [ ] **Database**
  - [ ] Backup Supabase quotidien activé
  - [ ] Test restore tous les mois

- [ ] **Code**
  - [ ] Git repository privé
  - [ ] Branches : main, dev, staging
  - [ ] Tags pour releases

---

## 📊 Métriques de succès

### Semaine 4 (fin Phase 1)

- [ ] ✅ 100% des RDV web passent par IA
- [ ] ✅ 50+ conversations WhatsApp/semaine
- [ ] ✅ 80% taux de conversion (conv → RDV)
- [ ] ✅ < 10s temps de réponse moyen
- [ ] ✅ < $50 coût IA mensuel

### Semaine 8 (fin Phase 2)

- [ ] ✅ 200+ conversations/semaine
- [ ] ✅ 90% satisfaction patient
- [ ] ✅ Dashboard dentiste utilisé quotidiennement
- [ ] ✅ Telegram bot actif

### Semaine 12 (fin Phase 3)

- [ ] ✅ 100% LLM local (si objectif atteint)
- [ ] ✅ < $20 coût IA mensuel (électricité serveur)
- [ ] ✅ < 3s latence LLM
- [ ] ✅ Qualité réponses = Claude API

---

## 🚨 Escalade & Support

### Si problème bloquant

1. **Vérifier logs** : N8N, Vercel, Supabase
2. **Tester localement** : `npm run dev`
3. **Rollback** si nécessaire : Git revert
4. **Contacter support** : Anthropic, Twilio, N8N

### Contacts utiles

- Anthropic Support : https://support.anthropic.com/
- Twilio Support : https://www.twilio.com/help
- N8N Community : https://community.n8n.io/
- Supabase Support : https://supabase.com/support

---

## ✅ Checklist finale avant Go Live

- [ ] Tous les tests passent ✅
- [ ] Variables d'environnement production configurées ✅
- [ ] SSL/HTTPS activé ✅
- [ ] Backups configurés ✅
- [ ] Monitoring activé ✅
- [ ] Documentation à jour ✅
- [ ] Formation dentiste effectuée ✅
- [ ] Plan de rollback prêt ✅

---

**Prêt au déploiement ! 🚀**

Date : __________  
Signé : __________