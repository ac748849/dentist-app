// prisma/seed-v3.ts
import { PrismaClient, InterventionType, KBCategory, RuleType, RuleAction } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seed started...')

  // 1. Créer un dentiste par défaut
  const dentist = await prisma.dentist.upsert({
    where: { email: 'dentiste@cabinet-ste-catherine.be' },
    update: {},
    create: {
      email: 'dentiste@cabinet-ste-catherine.be',
      name: 'Dr. Catherine',
      phone: '+32471234567',
      specialties: ['Dentisterie générale', 'Esthétique'],
    },
  })

  console.log(`✅ Dentist created: ${dentist.name}`)

  // 2. Créer les durées d'intervention
  const interventionDurations = [
    // Consultations
    { type: InterventionType.CONTROLE, duration: 30, min: 20, max: 45, price: 50 },
    { type: InterventionType.URGENCE, duration: 45, min: 30, max: 60, price: 80 },
    { type: InterventionType.PREMIERE_VISITE, duration: 45, min: 30, max: 60, price: 60 },
    
    // Soins
    { type: InterventionType.CARIE, duration: 60, min: 45, max: 90, price: 120 },
    { type: InterventionType.DEVITALISATION, duration: 90, min: 60, max: 120, price: 250 },
    { type: InterventionType.EXTRACTION, duration: 45, min: 30, max: 60, price: 100 },
    { type: InterventionType.DETARTRAGE, duration: 45, min: 30, max: 60, price: 80 },
    { type: InterventionType.BLANCHIMENT, duration: 90, min: 60, max: 120, price: 300 },
    
    // Prothèses
    { type: InterventionType.COURONNE, duration: 60, min: 45, max: 90, price: 400 },
    { type: InterventionType.BRIDGE, duration: 90, min: 60, max: 120, price: 800 },
    { type: InterventionType.IMPLANT, duration: 120, min: 90, max: 180, price: 1500 },
    { type: InterventionType.PROTHESE_COMPLETE, duration: 90, min: 60, max: 120, price: 1200 },
    { type: InterventionType.PROTHESE_PARTIELLE, duration: 60, min: 45, max: 90, price: 600 },
    
    // Orthodontie
    { type: InterventionType.ORTHODONTIE_CONSULTATION, duration: 45, min: 30, max: 60, price: 80 },
    { type: InterventionType.ORTHODONTIE_SUIVI, duration: 30, min: 20, max: 45, price: 60 },
    { type: InterventionType.ORTHODONTIE_POSE, duration: 120, min: 90, max: 180, price: 2000 },
    { type: InterventionType.ORTHODONTIE_RETRAIT, duration: 60, min: 45, max: 90, price: 200 },
    
    // Pédiatrie
    { type: InterventionType.PEDIATRIE_CONTROLE, duration: 30, min: 20, max: 45, price: 50 },
    { type: InterventionType.PEDIATRIE_SOIN, duration: 45, min: 30, max: 60, price: 80 },
    { type: InterventionType.PEDIATRIE_PREVENTION, duration: 30, min: 20, max: 45, price: 60 },
    
    // Chirurgie
    { type: InterventionType.CHIRURGIE_SIMPLE, duration: 60, min: 45, max: 90, price: 200 },
    { type: InterventionType.CHIRURGIE_COMPLEXE, duration: 120, min: 90, max: 180, price: 500 },
    { type: InterventionType.GREFFE_OSSEUSE, duration: 120, min: 90, max: 180, price: 800 },
    
    // Autre
    { type: InterventionType.AUTRE, duration: 45, min: 30, max: 60, price: 100 },
  ]

  for (const data of interventionDurations) {
    await prisma.interventionDuration.upsert({
      where: { interventionType: data.type },
      update: {},
      create: {
        interventionType: data.type,
        defaultDuration: data.duration,
        minDuration: data.min,
        maxDuration: data.max,
        estimatedPrice: data.price,
      },
    })
  }

  console.log(`✅ InterventionDuration created: ${interventionDurations.length} types`)

  // 3. Créer la base de connaissances
  const knowledgeBaseEntries = [
    {
      category: KBCategory.TARIFS,
      title: 'Tarifs des consultations et soins',
      content: `**Consultations :**
- Contrôle de routine : 50€
- Première visite : 60€
- Urgence : 80€

**Soins courants :**
- Détartrage : 80€
- Carie (composite) : 120€
- Dévitalisation : 250€
- Extraction simple : 100€`,
      keywords: ['tarif', 'prix', 'coût'],
    },
    {
      category: KBCategory.HORAIRES,
      title: 'Horaires d\'ouverture',
      content: `**Lundi - Vendredi :** 9h00 - 18h00
**Samedi :** 9h00 - 13h00
**Dimanche :** Fermé`,
      keywords: ['horaire', 'ouverture'],
    },
  ]

  for (const entry of knowledgeBaseEntries) {
    await prisma.knowledgeBase.create({
      data: {
        dentistId: dentist.id,
        category: entry.category,
        title: entry.title,
        content: entry.content,
        keywords: entry.keywords,
      },
    })
  }

  console.log(`✅ KnowledgeBase created: ${knowledgeBaseEntries.length} entries`)

  // 4. Créer des règles personnalisées
  await prisma.customRule.create({
    data: {
      dentistId: dentist.id,
      ruleType: RuleType.PAUSE,
      priority: 5,
      timeStart: '12:30',
      timeEnd: '14:00',
      description: 'Pause déjeuner',
      action: RuleAction.BLOCK,
    },
  })

  console.log(`✅ CustomRules created`)
  console.log('🌱 Seed finished!')
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })