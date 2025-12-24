import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma/client'
import { createGoogleCalendarEvent } from '@/lib/google-calendar/create-event'
import { updateGoogleCalendarEvent } from '@/lib/google-calendar/update-event'
import { deleteGoogleCalendarEvent } from '@/lib/google-calendar/delete-event'

export async function GET() {
  try {
    const appointments = await prisma.appointment.findMany({
      include: {
        patient: true,
        dentist: true,
      },
      orderBy: {
        startTime: 'asc',
      },
    })

    return NextResponse.json({
      success: true,
      data: appointments,
    })
  } catch (error) {
    console.error('Error fetching appointments:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { dentistId, patientId, startTime, interventionType, notes, source } = body

    console.log('Creating appointment with:', { dentistId, patientId, startTime, interventionType })

    // 🆕 Récupérer la durée du type d'intervention
    const interventionDuration = await prisma.interventionDuration.findUnique({
      where: { interventionType },
    })

    console.log('Found intervention duration:', interventionDuration)

    if (!interventionDuration) {
      return NextResponse.json(
        { success: false, error: 'Type d\'intervention invalide' },
        { status: 400 }
      )
    }

    // 🆕 Calculer endTime automatiquement
    const start = new Date(startTime)
    const durationMs = interventionDuration.defaultDuration * 60 * 1000
    const end = new Date(start.getTime() + durationMs)

    console.log('Calculated times:', { 
      start: start.toISOString(), 
      end: end.toISOString(), 
      duration: interventionDuration.defaultDuration 
    })

    const appointment = await prisma.appointment.create({
      data: {
        dentistId,
        patientId,
        startTime: start,
        endTime: end,
        duration: interventionDuration.defaultDuration,
        interventionType,
        status: 'PENDING',
        notes: notes || null,
        source: source || 'web',
        createdVia: 'web-form',
      },
      include: {
        patient: true,
        dentist: true,
      },
    })

    // 🆕 Créer l'événement Google Calendar de manière asynchrone
    // On ne bloque pas la réponse si ça échoue
    createGoogleCalendarEvent(appointment.id).catch(err => {
      console.error('Failed to create Google Calendar event:', err)
    })

    return NextResponse.json({
      success: true,
      data: appointment,
    })
  } catch (error) {
    console.error('Error creating appointment:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création du rendez-vous' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const { appointmentId, status } = await request.json()

    // Validation statut
    const validStatuses = ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Statut invalide' },
        { status: 400 }
      )
    }

    // Récupérer l'ancien statut
    const oldAppointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
    })

    if (!oldAppointment) {
      return NextResponse.json(
        { success: false, error: 'Rendez-vous non trouvé' },
        { status: 404 }
      )
    }

    // Mettre à jour le rendez-vous
    const appointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status },
      include: {
        patient: true,
        dentist: true,
      },
    })

    // Log d'audit
    await prisma.auditLog.create({
      data: {
        userId: appointment.dentistId,
        userType: 'dentist',
        action: 'update',
        entity: 'appointment',
        entityId: appointmentId,
        changes: { 
          status: { 
            from: oldAppointment.status, 
            to: status 
          } 
        },
        source: 'web-app',
      },
    })

    // 🔄 SYNC GOOGLE CALENDAR
    if (appointment.googleCalendarEventId) {
      // Si annulé → supprimer de Google Calendar
      if (status === 'CANCELLED') {
        console.log(`🗑️ Deleting Google Calendar event for cancelled appointment...`)
        const deleteResult = await deleteGoogleCalendarEvent(appointmentId)
        
        if (!deleteResult.success) {
          console.error(`⚠️ Failed to delete Google Calendar event: ${deleteResult.error}`)
          // On continue quand même, l'appointment est mis à jour en DB
        }
      } 
      // Sinon → mettre à jour l'événement Google Calendar
      else {
        console.log(`📅 Updating Google Calendar event with new status: ${status}`)
        const updateResult = await updateGoogleCalendarEvent(appointmentId, status)
        
        if (!updateResult.success) {
          console.error(`⚠️ Failed to update Google Calendar event: ${updateResult.error}`)
          // On continue quand même, l'appointment est mis à jour en DB
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: appointment,
    })
  } catch (error) {
    console.error('Error updating appointment status:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour' },
      { status: 500 }
    )
  }
}