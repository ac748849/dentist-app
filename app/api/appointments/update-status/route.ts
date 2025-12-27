import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma/client'

export async function POST(request: Request) {
  try {
    const { appointmentId, status } = await request.json()

    // Valider le statut
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