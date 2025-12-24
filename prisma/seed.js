const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

console.log('Prisma client:', prisma)
console.log('InterventionDuration model:', prisma.interventionDuration)

async function main() {

  const durations = [
    // Consultations
    { type: 'CONTROLE', default: 30, min: 15, max: 45, price: 50 },
    { type: 'URGENCE', default: 30, min: 15, max: 60, price: 60 },
    { type: 'PREMIERE_VISITE', default: 45, min: 30, max: 60, price: 50 },
    
    // Soins
    { type: 'CARIE', default: 45, min: 30, max: 60, price: 80 },
    { type: 'DEVITALISATION', default: 90, min: 60, max: 120, price: 250 },
    { type: 'EXTRACTION', default: 30, min: 20, max: 45, price: 70 },
    { type: 'DETARTRAGE', default: 45, min: 30, max: 60, price: 80 },
    { type: 'BLANCHIMENT', default: 60, min: 45, max: 90, price: 300 },
    
    // Prothèses
    { type: 'COURONNE', default: 60, min: 45, max: 90, price: 500 },
    { type: 'BRIDGE', default: 90, min: 60, max: 120, price: 800 },
    { type: 'IMPLANT', default: 120, min: 90, max: 180, price: 1500 },
    { type: 'PROTHESE_COMPLETE', default: 90, min: 60, max: 120, price: 1000 },
    { type: 'PROTHESE_PARTIELLE', default: 60, min: 45, max: 90, price: 600 },
    
    // Orthodontie
    { type: 'ORTHODONTIE_CONSULTATION', default: 30, min: 20, max: 45, price: 60 },
    { type: 'ORTHODONTIE_SUIVI', default: 20, min: 15, max: 30, price: 40 },
    { type: 'ORTHODONTIE_POSE', default: 90, min: 60, max: 120, price: 500 },
    { type: 'ORTHODONTIE_RETRAIT', default: 45, min: 30, max: 60, price: 100 },
    
    // Pédiatrie
    { type: 'PEDIATRIE_CONTROLE', default: 20, min: 15, max: 30, price: 40 },
    { type: 'PEDIATRIE_SOIN', default: 30, min: 20, max: 45, price: 60 },
    { type: 'PEDIATRIE_PREVENTION', default: 15, min: 10, max: 20, price: 30 },
    
    // Chirurgie
    { type: 'CHIRURGIE_SIMPLE', default: 90, min: 60, max: 120, price: 400 },
    { type: 'CHIRURGIE_COMPLEXE', default: 150, min: 120, max: 240, price: 800 },
    { type: 'GREFFE_OSSEUSE', default: 180, min: 120, max: 240, price: 1200 },
    
    // Autre
    { type: 'AUTRE', default: 30, min: 15, max: 90, price: 50 },
  ]

  for (const d of durations) {
    await prisma.interventionDuration.upsert({
      where: { interventionType: d.type },
      update: {},
      create: {
        interventionType: d.type,
        defaultDuration: d.default,
        minDuration: d.min,
        maxDuration: d.max,
        estimatedPrice: d.price,
      },
    })
  }

  console.log('✅ Created', durations.length, 'intervention durations')

  // 2. Recréer le dentiste de test
  console.log('👨‍⚕️ Creating test dentist...')

  const dentist = await prisma.dentist.upsert({
    where: { email: 'dr.martin@dentist.com' },
    update: {},
    create: {
      email: 'dr.martin@dentist.com',
      name: 'Dr. Marie Martin',
      phone: '0123456789',
      specialties: ['Dentisterie générale', 'Orthodontie'],
    },
  })

  console.log('✅ Dentist created:', dentist.email)

  console.log('🎉 Seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })