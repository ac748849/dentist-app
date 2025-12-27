// lib/ai/tools.ts
import { prisma } from '@/lib/prisma/client'
import { addMinutes, format, startOfDay, endOfDay, addDays } from 'date-fns'

export const AI_TOOLS = [
  {
    name: 'search_knowledge_base',
    description: 'Recherche dans la base de connaissances du cabinet dentaire',
    input_schema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Mots-clés à rechercher' },
        category: {
          type: 'string',
          enum: ['TARIFS', 'ACCES', 'FAQ', 'HORAIRES', 'URGENCES', 'SERVICES', 'EQUIPE', 'AUTRE'],
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'find_available_slots',
    description: 'Trouve les créneaux disponibles pour un rendez-vous',
    input_schema: {
      type: 'object',
      properties: {
        intervention_type: {
          type: 'string',
          enum: ['CONTROLE', 'URGENCE', 'CARIE', 'DETARTRAGE', 'COURONNE', 'IMPLANT', 'AUTRE'],
        },
        preferred_date: { type: 'string', description: 'Date préférée YYYY-MM-DD' },
        preferred_time: {
          type: 'string',
          enum: ['morning', 'afternoon', 'evening', 'anytime'],
        },
        days_range: { type: 'number', description: 'Nombre de jours à vérifier' },
      },
      required: ['intervention_type'],
    },
  },
  {
    name: 'create_appointment',
    description: 'Crée un rendez-vous confirmé',
    input_schema: {
      type: 'object',
      properties: {
        patient_phone: { type: 'string' },
        patient_name: { type: 'string' },
        start_time: { type: 'string', description: 'ISO 8601 format' },
        intervention_type: { type: 'string' },
        notes: { type: 'string' },
      },
      required: ['patient_phone', 'patient_name', 'start_time', 'intervention_type'],
    },
  },
  {
    name: 'cancel_appointment',
    description: 'Annule un rendez-vous existant',
    input_schema: {
      type: 'object',
      properties: {
        patient_phone: { type: 'string' },
        appointment_id: { type: 'string' },
      },
      required: ['patient_phone'],
    },
  },
  {
    name: 'get_patient_history',
    description: 'Récupère l\'historique des rendez-vous',
    input_schema: {
      type: 'object',
      properties: {
        patient_phone: { type: 'string' },
      },
      required: ['patient_phone'],
    },
  },
]

export async function executeTool(toolName: string, input: Record<string, any>) {
  switch (toolName) {
    case 'search_knowledge_base':
      return await searchKnowledgeBase(input.query, input.category)
    case 'find_available_slots':
      return await findAvailableSlots(input)
    case 'create_appointment':
      return await createAppointment(input)
    case 'cancel_appointment':
      return await cancelAppointment(input)
    case 'get_patient_history':
      return await getPatientHistory(input.patient_phone)
    default:
      throw new Error(`Unknown tool: ${toolName}`)
  }
}

async function searchKnowledgeBase(query: string, category?: string) {
  const results = await prisma.knowledgeBase.findMany({
    where: {
      AND: [
        { isActive: true },
        category ? { category: category as any } : {},
        {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { content: { contains: query, mode: 'insensitive' } },
            { keywords: { hasSome: [query.toLowerCase()] } },
          ],
        },
      ],
    },
    take: 3,
  })

  return {
    results: results.map((r) => ({
      category: r.category,
      title: r.title,
      content: r.content,
    })),
  }
}

async function findAvailableSlots(input: any) {
  const { intervention_type, preferred_date, preferred_time = 'anytime', days_range = 14 } = input

  const interventionDuration = await prisma.interventionDuration.findUnique({
    where: { interventionType: intervention_type },
  })

  if (!interventionDuration) {
    return { error: 'Type d\'intervention non trouvé', slots: [] }
  }

  const dentist = await prisma.dentist.findFirst()
  if (!dentist) {
    return { error: 'Aucun dentiste disponible', slots: [] }
  }

  const startDate = preferred_date ? new Date(preferred_date) : new Date()
  const endDate = addDays(startDate, days_range)

  const existingAppointments = await prisma.appointment.findMany({
    where: {
      dentistId: dentist.id,
      startTime: { gte: startDate, lte: endDate },
      status: { in: ['PENDING', 'CONFIRMED'] },
    },
  })

  const slots = []
  let currentDate = startOfDay(startDate)

  while (currentDate <= endDate) {
    const dayName = format(currentDate, 'EEEE').toLowerCase()
    
    if (dayName === 'sunday') {
      currentDate = addDays(currentDate, 1)
      continue
    }

    const timeRanges = getTimeRanges(preferred_time)

    for (const { start, end } of timeRanges) {
      let slotTime = new Date(currentDate)
      slotTime.setHours(parseInt(start.split(':')[0]), parseInt(start.split(':')[1]), 0)

      const endTime = new Date(currentDate)
      endTime.setHours(parseInt(end.split(':')[0]), parseInt(end.split(':')[1]), 0)

      while (slotTime < endTime) {
        const slotEnd = addMinutes(slotTime, interventionDuration.defaultDuration)

        const isAvailable = !existingAppointments.some((apt) => {
          return slotTime < apt.endTime && slotEnd > apt.startTime
        })

        if (isAvailable && slotTime > new Date()) {
          slots.push({
            start: slotTime.toISOString(),
            end: slotEnd.toISOString(),
            duration: interventionDuration.defaultDuration,
          })
        }

        slotTime = addMinutes(slotTime, 30)

        if (slots.length >= 5) break
      }
      if (slots.length >= 5) break
    }

    if (slots.length >= 5) break
    currentDate = addDays(currentDate, 1)
  }

  return { slots: slots.slice(0, 5) }
}

function getTimeRanges(preferredTime: string) {
  switch (preferredTime) {
    case 'morning':
      return [{ start: '09:00', end: '12:00' }]
    case 'afternoon':
      return [{ start: '14:00', end: '18:00' }]
    case 'evening':
      return [{ start: '16:00', end: '18:00' }]
    default:
      return [
        { start: '09:00', end: '12:00' },
        { start: '14:00', end: '18:00' },
      ]
  }
}

async function createAppointment(input: any) {
  const { patient_phone, patient_name, start_time, intervention_type, notes } = input

  let patient = await prisma.patient.findUnique({
    where: { phone: patient_phone },
  })

  if (!patient) {
    patient = await prisma.patient.create({
      data: {
        phone: patient_phone,
        name: patient_name,
      },
    })
  }

  const dentist = await prisma.dentist.findFirst()
  if (!dentist) {
    return { error: 'Aucun dentiste disponible' }
  }

  const interventionDuration = await prisma.interventionDuration.findUnique({
    where: { interventionType: intervention_type },
  })

  if (!interventionDuration) {
    return { error: 'Type d\'intervention non trouvé' }
  }

  const startTime = new Date(start_time)
  const endTime = addMinutes(startTime, interventionDuration.defaultDuration)

  const appointment = await prisma.appointment.create({
    data: {
      dentistId: dentist.id,
      patientId: patient.id,
      startTime,
      endTime,
      interventionType: intervention_type,
      duration: interventionDuration.defaultDuration,
      status: 'CONFIRMED',
      source: 'ai_assistant',
      notes,
    },
  })

  return {
    success: true,
    appointment: {
      id: appointment.id,
      start: appointment.startTime.toISOString(),
      end: appointment.endTime.toISOString(),
      type: appointment.interventionType,
    },
  }
}

async function cancelAppointment(input: any) {
  const { patient_phone, appointment_id } = input

  const patient = await prisma.patient.findUnique({
    where: { phone: patient_phone },
  })

  if (!patient) {
    return { error: 'Patient non trouvé' }
  }

  const appointment = await prisma.appointment.findFirst({
    where: {
      patientId: patient.id,
      id: appointment_id || undefined,
      startTime: { gte: new Date() },
      status: { in: ['PENDING', 'CONFIRMED'] },
    },
    orderBy: { startTime: 'asc' },
  })

  if (!appointment) {
    return { error: 'Aucun rendez-vous trouvé' }
  }

  await prisma.appointment.update({
    where: { id: appointment.id },
    data: { status: 'CANCELLED' },
  })

  return {
    success: true,
    cancelled_appointment: {
      id: appointment.id,
      date: appointment.startTime.toISOString(),
    },
  }
}

async function getPatientHistory(phone: string) {
  const patient = await prisma.patient.findUnique({
    where: { phone },
    include: {
      appointments: {
        orderBy: { startTime: 'desc' },
        take: 5,
      },
    },
  })

  if (!patient) {
    return { appointments: [] }
  }

  return {
    appointments: patient.appointments.map((apt) => ({
      id: apt.id,
      date: apt.startTime.toISOString(),
      type: apt.interventionType,
      status: apt.status,
    })),
  }
}