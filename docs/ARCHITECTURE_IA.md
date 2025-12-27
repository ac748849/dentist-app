# 🤖 Architecture IA Booking Conversationnel - Cabinet Dentaire

## 🎯 Vue d'ensemble

Système de réservation intelligent multi-canal avec :
- ✅ IA conversationnelle (comprend préférences patient)
- ✅ Base de connaissances éditable (tarifs, accès, FAQ)
- ✅ Règles personnalisées dentiste (contraintes horaires)
- ✅ Multi-canal : Site, WhatsApp, Telegram
- ✅ Migration progressive : Claude API → LLM local

---

## 🏗️ Architecture technique

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CANAUX D'ENTRÉE                              │
├─────────────────────────────────────────────────────────────────────┤
│  📱 WhatsApp        💻 Site /booking        📲 Telegram             │
│   (Twilio)          (React Form)            (Bot API)               │
└────────┬──────────────────┬──────────────────────┬──────────────────┘
         │                  │                      │
         │                  │                      │
         ▼                  ▼                      ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          N8N WORKFLOWS                              │
│                   (Orchestrateur principal)                         │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │  WORKFLOW 1 : Conversation Management                        │ │
│  │  ├─ Webhook entrant (WhatsApp/Telegram/Site)                 │ │
│  │  ├─ Détection du canal                                       │ │
│  │  ├─ Récupération contexte patient (DB)                       │ │
│  │  ├─ Appel LLM (Claude API ou Local)                          │ │
│  │  ├─ Extraction des intentions/préférences                    │ │
│  │  └─ Routage vers workflow approprié                          │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │  WORKFLOW 2 : Slot Finder AI                                 │ │
│  │  ├─ Analyse des préférences patient                          │ │
│  │  │  • "Au plus tôt"                                          │ │
│  │  │  • "Seulement après-midi"                                 │ │
│  │  │  • "Uniquement les mardis"                                │ │
│  │  │  • "Avant 10h"                                            │ │
│  │  ├─ Récupération Google Calendar (via API)                   │ │
│  │  ├─ Application des règles dentiste (DB)                     │ │
│  │  ├─ Calcul créneaux intelligents (Python/JS)                 │ │
│  │  ├─ Scoring des créneaux (urgence, préférences)              │ │
│  │  └─ Retour top 3-5 créneaux au LLM                           │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │  WORKFLOW 3 : Knowledge Base QA                              │ │
│  │  ├─ Question patient (tarifs, accès, etc.)                   │ │
│  │  ├─ Recherche sémantique dans KB (Pinecone/Weaviate)         │ │
│  │  ├─ Récupération documents pertinents                        │ │
│  │  ├─ LLM génère réponse avec sources                          │ │
│  │  └─ Envoi réponse formatée                                   │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │  WORKFLOW 4 : Appointment Booking                            │ │
│  │  ├─ Patient choisit créneau                                  │ │
│  │  ├─ Validation disponibilité (double-check)                  │ │
│  │  ├─ Création RDV dans DB (Prisma API)                        │ │
│  │  ├─ Création événement Google Calendar                       │ │
│  │  ├─ Envoi confirmation (SMS + WhatsApp/Telegram)             │ │
│  │  └─ Notification dentiste                                    │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                     │
└────────┬────────────────────────────────────────────┬──────────────┘
         │                                            │
         ▼                                            ▼
┌──────────────────────────┐            ┌──────────────────────────┐
│   LLM LAYER (Évolutif)   │            │   BASES DE DONNÉES       │
├──────────────────────────┤            ├──────────────────────────┤
│                          │            │                          │
│  PHASE 1 (MVP)           │            │  PostgreSQL (Supabase)   │
│  └─ Claude API           │            │  ├─ Patients             │
│     (Anthropic)          │            │  ├─ Appointments         │
│                          │            │  ├─ KnowledgeBase        │
│  PHASE 2 (Production)    │            │  ├─ CustomRules          │
│  └─ LLM Local            │            │  └─ ConversationHistory  │
│     ├─ Llama 3.1 70B     │            │                          │
│     ├─ Mistral 7B        │            │  Vector DB (Pinecone)    │
│     └─ Ollama Server     │            │  └─ KB Embeddings        │
│                          │            │                          │
│  API Unifiée             │            │  Google Calendar API     │
│  └─ /api/llm/chat        │            │  └─ Événements dentiste  │
│                          │            │                          │
└──────────────────────────┘            └──────────────────────────┘
```

---

## 📊 Schéma de données enrichi (Prisma)

### Nouveaux modèles

```prisma
// 1. Base de connaissances éditable par le dentiste
model KnowledgeBase {
  id          String   @id @default(cuid())
  dentistId   String
  category    String   // "tarifs", "acces", "faq", "horaires"
  title       String
  content     String   @db.Text
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  dentist     Dentist  @relation(fields: [dentistId], references: [id])
  
  @@index([dentistId, category])
}

// 2. Règles personnalisées du dentiste
model CustomRule {
  id          String   @id @default(cuid())
  dentistId   String
  ruleType    RuleType // "HORAIRE", "JOUR", "PAUSE", "BLOCAGE"
  priority    Int      @default(0) // Plus élevé = plus prioritaire
  
  // Configuration de la règle
  dayOfWeek   String?  // "monday", "tuesday", etc.
  timeStart   String?  // "10:00"
  timeEnd     String?  // "12:00"
  description String
  
  // Exemple: "Pas de patients avant 10h les mercredis"
  // ruleType: HORAIRE
  // dayOfWeek: "wednesday"
  // timeStart: "00:00"
  // timeEnd: "10:00"
  // description: "Pas de RDV le mercredi matin"
  
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  dentist     Dentist  @relation(fields: [dentistId], references: [id])
  
  @@index([dentistId, isActive])
}

enum RuleType {
  HORAIRE     // Bloquer certaines heures
  JOUR        // Bloquer certains jours
  PAUSE       // Pause déjeuner custom
  BLOCAGE     // Blocage temporaire
}

// 3. Historique des conversations (pour contexte IA)
model ConversationHistory {
  id             String   @id @default(cuid())
  patientId      String?
  channel        String   // "whatsapp", "telegram", "web"
  externalId     String?  // WhatsApp phone, Telegram chat_id, session_id
  
  messages       Json     // Array de messages avec rôle (user/assistant)
  currentIntent  String?  // "booking", "info", "question"
  extractedData  Json?    // Données extraites (préférences, type RDV, etc.)
  
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  patient        Patient? @relation(fields: [patientId], references: [id])
  
  @@index([externalId, channel])
  @@index([patientId])
}

// 4. Préférences patient pour IA
model PatientPreferences {
  id                String   @id @default(cuid())
  patientId         String   @unique
  
  preferredDays     String[] // ["monday", "tuesday"]
  preferredTimes    String   // "morning", "afternoon", "evening"
  urgencyDefault    String   @default("normal") // "urgent", "normal", "flexible"
  
  // Historique des choix (pour ML)
  bookingHistory    Json?    // Patterns de réservation
  
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  patient           Patient  @relation(fields: [patientId], references: [id])
}

// 5. Enrichissement Patient
model Patient {
  // ... champs existants
  
  // Nouveaux
  conversations     ConversationHistory[]
  preferences       PatientPreferences?
}

// 6. Enrichissement Dentist
model Dentist {
  // ... champs existants
  
  // Nouveaux
  knowledgeBase     KnowledgeBase[]
  customRules       CustomRule[]
}
```

---

## 🧠 Fonctionnement de l'IA conversationnelle

### Exemple de conversation WhatsApp

```
Patient: "Bonjour, j'ai besoin d'un rdv pour un contrôle"

IA (analyse):
- Intent: booking
- Type: CONTROLE
- Préférences: non spécifiées

IA: "Bonjour ! Je peux vous proposer un contrôle.
     Avez-vous une préférence de jour ou d'horaire ?"

Patient: "Uniquement l'après-midi, et si possible un mardi"

IA (extraction):
- preferredTimes: "afternoon"
- preferredDays: ["tuesday"]

IA (appelle Slot Finder):
- Récupère créneaux mardis après-midi
- Applique règles dentiste
- Calcul scoring
- Top 3: mardi 27 déc 14h, mardi 27 déc 15h30, mardi 3 janv 14h

IA: "Voici les créneaux disponibles le mardi après-midi :
     1️⃣ Mardi 27 décembre à 14h00
     2️⃣ Mardi 27 décembre à 15h30
     3️⃣ Mardi 3 janvier à 14h00
     
     Quel créneau préférez-vous ?"

Patient: "Le 2"

IA (booking):
- Crée RDV mardi 27 déc 15h30
- Ajoute à Google Calendar
- Envoie confirmation

IA: "✅ Votre RDV est confirmé !
     📅 Mardi 27 décembre 2024 à 15h30
     ⏱️ Durée : 30 minutes
     💰 Tarif : 50€
     
     Vous recevrez un rappel 24h avant."
```

---

## 🔧 Implémentation technique

### 1. API LLM Unifiée (migration progressive)

```typescript
// lib/ai/llm-client.ts

export type LLMProvider = 'claude' | 'local'

interface LLMConfig {
  provider: LLMProvider
  model: string
  temperature: number
}

export class LLMClient {
  private config: LLMConfig

  constructor(config?: Partial<LLMConfig>) {
    this.config = {
      provider: (process.env.LLM_PROVIDER as LLMProvider) || 'claude',
      model: process.env.LLM_MODEL || 'claude-sonnet-4-20250514',
      temperature: 0.7,
      ...config,
    }
  }

  async chat(messages: Message[], tools?: Tool[]): Promise<LLMResponse> {
    if (this.config.provider === 'claude') {
      return this.claudeChat(messages, tools)
    } else {
      return this.localChat(messages, tools)
    }
  }

  private async claudeChat(messages: Message[], tools?: Tool[]) {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: this.config.model,
        messages,
        tools,
        max_tokens: 4096,
        temperature: this.config.temperature,
      }),
    })

    return response.json()
  }

  private async localChat(messages: Message[], tools?: Tool[]) {
    // Appel à Ollama ou LM Studio local
    const response = await fetch(`${process.env.LOCAL_LLM_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.config.model, // ex: "llama3.1:70b"
        messages,
        tools,
        stream: false,
      }),
    })

    return response.json()
  }
}
```

### 2. Tools pour l'IA (Function Calling)

```typescript
// lib/ai/tools.ts

export const AI_TOOLS = [
  {
    name: 'find_available_slots',
    description: 'Trouve les créneaux disponibles selon les préférences du patient',
    input_schema: {
      type: 'object',
      properties: {
        intervention_type: {
          type: 'string',
          enum: ['CONTROLE', 'URGENCE', 'DETARTRAGE', 'CARIE', ...],
          description: 'Type d\'intervention',
        },
        preferred_days: {
          type: 'array',
          items: { type: 'string' },
          description: 'Jours préférés (monday, tuesday, etc.)',
        },
        preferred_time: {
          type: 'string',
          enum: ['morning', 'afternoon', 'evening', 'anytime'],
          description: 'Plage horaire préférée',
        },
        urgency: {
          type: 'string',
          enum: ['urgent', 'normal', 'flexible'],
          description: 'Niveau d\'urgence',
        },
        max_results: {
          type: 'number',
          default: 5,
          description: 'Nombre max de créneaux à retourner',
        },
      },
      required: ['intervention_type'],
    },
  },
  {
    name: 'search_knowledge_base',
    description: 'Recherche dans la base de connaissances (tarifs, accès, FAQ)',
    input_schema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Question du patient',
        },
        category: {
          type: 'string',
          enum: ['tarifs', 'acces', 'faq', 'horaires', 'all'],
          description: 'Catégorie à rechercher',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'create_appointment',
    description: 'Crée un rendez-vous après confirmation du patient',
    input_schema: {
      type: 'object',
      properties: {
        patient_phone: { type: 'string' },
        patient_name: { type: 'string' },
        intervention_type: { type: 'string' },
        slot_start: { type: 'string', format: 'date-time' },
        slot_end: { type: 'string', format: 'date-time' },
      },
      required: ['patient_phone', 'patient_name', 'intervention_type', 'slot_start'],
    },
  },
]
```

### 3. System Prompt pour l'IA

```typescript
// lib/ai/system-prompt.ts

export const BOOKING_ASSISTANT_PROMPT = `Tu es l'assistant de réservation du Cabinet Dentaire Sainte-Catherine.

RÔLE :
- Aider les patients à prendre rendez-vous
- Répondre aux questions sur les tarifs, l'accessibilité, les horaires
- Être chaleureux, professionnel et efficace

PROCESSUS DE RÉSERVATION :
1. Identifier le type d'intervention (contrôle, urgence, soin, etc.)
2. Demander les préférences (jours, horaires, urgence)
3. Proposer 3-5 créneaux adaptés
4. Confirmer le créneau choisi
5. Demander les infos patient (si nouveau)
6. Créer le RDV et envoyer confirmation

PRÉFÉRENCES À EXTRAIRE :
- Jours spécifiques (lundi, mardi, etc.)
- Plage horaire (matin, après-midi, soir)
- Urgence (urgent, normal, flexible)
- Contraintes ("pas avant 10h", "seulement après 14h", etc.)

TOOLS À UTILISER :
- find_available_slots : Pour chercher créneaux
- search_knowledge_base : Pour questions tarifs/accès
- create_appointment : Pour confirmer RDV

STYLE :
- Emojis pour clarté (📅 ⏰ ✅)
- Phrases courtes
- Numérotation pour choix multiples
- Toujours confirmer les infos importantes

EXEMPLE :
Patient: "J'ai besoin d'un rdv en urgence"
Tu: "Je comprends, c'est urgent. Quel est le problème ? (douleur, dent cassée, autre)"

Patient: "Douleur forte"
Tu: "D'accord, je vais chercher les premiers créneaux disponibles. Avez-vous une préférence matin/après-midi ?"

Patient: "Peu importe, au plus vite"
Tu appelles find_available_slots({intervention_type: "URGENCE", urgency: "urgent"})
Tu: "Voici les prochains créneaux :
1️⃣ Aujourd'hui à 16h00
2️⃣ Demain à 09h00
3️⃣ Demain à 14h30

Quel créneau vous convient ?"
`
```

---

## 🌊 N8N Workflows détaillés

### Workflow 1 : WhatsApp → IA → Booking

```json
{
  "name": "WhatsApp Booking AI",
  "nodes": [
    {
      "name": "Webhook WhatsApp",
      "type": "n8n-nodes-base.webhook",
      "parameters": {
        "path": "whatsapp-incoming",
        "responseMode": "lastNode",
        "httpMethod": "POST"
      }
    },
    {
      "name": "Extract Message",
      "type": "n8n-nodes-base.set",
      "parameters": {
        "values": {
          "phone": "={{ $json.body.from }}",
          "message": "={{ $json.body.text }}",
          "timestamp": "={{ $json.body.timestamp }}"
        }
      }
    },
    {
      "name": "Get Conversation History",
      "type": "n8n-nodes-base.postgres",
      "parameters": {
        "operation": "select",
        "table": "ConversationHistory",
        "where": {
          "externalId": "={{ $json.phone }}",
          "channel": "whatsapp"
        },
        "limit": 1,
        "sort": "updatedAt DESC"
      }
    },
    {
      "name": "Call LLM API",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "url": "{{ $env.NEXTJS_APP_URL }}/api/ai/chat",
        "method": "POST",
        "body": {
          "messages": "={{ $json.messages || [] }}",
          "newMessage": "={{ $('Extract Message').item.json.message }}",
          "phone": "={{ $('Extract Message').item.json.phone }}",
          "channel": "whatsapp"
        }
      }
    },
    {
      "name": "Handle Tool Calls",
      "type": "n8n-nodes-base.switch",
      "parameters": {
        "conditions": {
          "options": [
            {
              "name": "find_slots",
              "expression": "={{ $json.tool_name === 'find_available_slots' }}"
            },
            {
              "name": "search_kb",
              "expression": "={{ $json.tool_name === 'search_knowledge_base' }}"
            },
            {
              "name": "create_appointment",
              "expression": "={{ $json.tool_name === 'create_appointment' }}"
            }
          ]
        }
      }
    },
    {
      "name": "Find Slots (Python)",
      "type": "n8n-nodes-base.code",
      "parameters": {
        "language": "python",
        "code": "# Code Python pour calculer créneaux intelligents"
      }
    },
    {
      "name": "Send WhatsApp Reply",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "url": "https://api.twilio.com/whatsapp/send",
        "method": "POST",
        "body": {
          "to": "={{ $('Extract Message').item.json.phone }}",
          "body": "={{ $json.response }}"
        }
      }
    }
  ]
}
```

---

## 📱 Interface Dashboard Dentiste

### 1. Gestion de la base de connaissances

```tsx
// app/dashboard/knowledge-base/page.tsx

'use client'

import { useState } from 'react'

export default function KnowledgeBasePage() {
  const [entries, setEntries] = useState([])
  const [editingEntry, setEditingEntry] = useState(null)

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">
        📚 Base de connaissances - IA
      </h1>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <CategoryCard title="Tarifs" count={12} icon="💰" />
        <CategoryCard title="Accessibilité" count={5} icon="🚗" />
        <CategoryCard title="FAQ" count={20} icon="❓" />
        <CategoryCard title="Horaires" count={3} icon="🕐" />
      </div>

      <button className="mb-4 px-4 py-2 bg-teal-600 text-white rounded">
        ➕ Ajouter une entrée
      </button>

      <div className="space-y-4">
        {entries.map(entry => (
          <EntryCard key={entry.id} entry={entry} />
        ))}
      </div>

      {/* Modal d'édition */}
      {editingEntry && (
        <EditModal
          entry={editingEntry}
          onSave={(updated) => {
            // API call
          }}
          onClose={() => setEditingEntry(null)}
        />
      )}
    </div>
  )
}

function EditModal({ entry, onSave, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
        <h2 className="text-xl font-bold mb-4">Modifier l'entrée</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Catégorie
            </label>
            <select className="w-full border rounded px-3 py-2">
              <option>Tarifs</option>
              <option>Accessibilité</option>
              <option>FAQ</option>
              <option>Horaires</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Titre
            </label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              placeholder="Ex: Tarif détartrage"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Contenu
            </label>
            <textarea
              rows={6}
              className="w-full border rounded px-3 py-2"
              placeholder="L'IA utilisera ce contenu pour répondre aux questions..."
            />
          </div>

          <div className="flex items-center">
            <input type="checkbox" id="active" className="mr-2" />
            <label htmlFor="active">Actif (visible pour l'IA)</label>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded"
          >
            Annuler
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 bg-teal-600 text-white rounded"
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  )
}
```

### 2. Gestion des règles personnalisées

```tsx
// app/dashboard/custom-rules/page.tsx

export default function CustomRulesPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">
        ⚙️ Règles de disponibilité
      </h1>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-900">
          💡 Ces règles seront automatiquement appliquées par l'IA lors de la
          proposition de créneaux. Elles remplacent les horaires normaux.
        </p>
      </div>

      <button className="mb-4 px-4 py-2 bg-teal-600 text-white rounded">
        ➕ Nouvelle règle
      </button>

      <div className="space-y-4">
        {/* Exemple de règle */}
        <RuleCard
          rule={{
            id: '1',
            type: 'HORAIRE',
            dayOfWeek: 'wednesday',
            timeStart: '00:00',
            timeEnd: '10:00',
            description: 'Pas de RDV le mercredi matin',
            priority: 10,
            isActive: true,
          }}
        />

        <RuleCard
          rule={{
            id: '2',
            type: 'PAUSE',
            dayOfWeek: null,
            timeStart: '12:00',
            timeEnd: '14:00',
            description: 'Pause déjeuner quotidienne',
            priority: 5,
            isActive: true,
          }}
        />
      </div>
    </div>
  )
}

function RuleCard({ rule }) {
  const icons = {
    HORAIRE: '🕐',
    JOUR: '📅',
    PAUSE: '☕',
    BLOCAGE: '🚫',
  }

  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{icons[rule.type]}</span>
          <h3 className="font-medium">{rule.description}</h3>
        </div>

        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded text-xs ${
            rule.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
          }`}>
            {rule.isActive ? 'Actif' : 'Inactif'}
          </span>
          <button className="text-blue-600">Modifier</button>
          <button className="text-red-600">Supprimer</button>
        </div>
      </div>

      <div className="text-sm text-gray-600">
        {rule.dayOfWeek && (
          <span className="mr-4">📅 {rule.dayOfWeek}</span>
        )}
        {rule.timeStart && rule.timeEnd && (
          <span>⏰ {rule.timeStart} - {rule.timeEnd}</span>
        )}
        <span className="ml-4 text-gray-400">
          Priorité: {rule.priority}
        </span>
      </div>
    </div>
  )
}
```

---

## 🚀 Plan de migration (3 phases)

### **PHASE 1 : MVP avec Claude API** (2-3 semaines)

**Stack** :
- Next.js + Prisma + Supabase
- Claude API (Anthropic)
- N8N (cloud gratuit)
- WhatsApp Business API (Twilio)

**Fonctionnalités** :
- ✅ Booking site web avec IA
- ✅ WhatsApp bot basique
- ✅ KB éditable dashboard
- ✅ Règles personnalisées
- ✅ Google Calendar sync

**Coût** :
- Claude API : ~$20/mois (estimé 1000 conversations)
- N8N cloud : Gratuit (5000 exécutions/mois)
- Twilio WhatsApp : $0.005/message
- Total : ~$25-30/mois

### **PHASE 2 : Optimisation + Telegram** (2 semaines)

**Ajouts** :
- ✅ Bot Telegram
- ✅ Analytics conversations
- ✅ A/B testing réponses
- ✅ Fine-tuning prompts

### **PHASE 3 : Migration LLM Local** (1 mois)

**Infrastructure** :
- Serveur dédié (GPU recommandé)
- Ollama ou LM Studio
- Llama 3.1 70B ou Mistral 7B

**Étapes** :
1. Setup serveur local
2. Installation Ollama
3. Téléchargement modèles
4. Tests performance
5. Migration progressive (50% local, 50% Claude)
6. 100% local

**Coût** :
- Serveur GPU : ~$50-100/mois (Hetzner, OVH)
- N8N self-hosted : Gratuit
- Total : ~$50/mois (après migration)

---

## 📦 Fichiers à créer (prochaine étape)

Je vais maintenant créer :

1. ✅ Schéma Prisma enrichi (KB + Rules)
2. ✅ API `/api/ai/chat` (LLM unifié)
3. ✅ API `/api/slots/smart-find` (avec règles)
4. ✅ Dashboard KB management
5. ✅ Dashboard Rules management
6. ✅ N8N workflow template WhatsApp
7. ✅ Guide setup complet

Voulez-vous que je commence par les fichiers techniques ou préférez-vous d'abord voir les workflows N8N en détail ?