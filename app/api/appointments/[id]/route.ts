import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma/client'

// GET /api/appointments/[id] - Récupérer un rendez-vous spécifique
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  
  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        dentist: true,
        patient: true,
      },
    })

    if (!appointment) {
      return NextResponse.json(
        { success: false, error: 'Rendez-vous non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: appointment,
    })
  } catch (error) {
    console.error('Error fetching appointment:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// DELETE /api/appointments/[id] - Supprimer un rendez-vous
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  
  try {
    await prisma.appointment.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: 'Rendez-vous supprimé',
    })
  } catch (error) {
    console.error('Error deleting appointment:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la suppression' },
      { status: 500 }
    )
  }
}

// PUT /api/appointments/[id] - Modifier un rendez-vous
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  
  try {
    const body = await request.json()
    
    const appointment = await prisma.appointment.update({
      where: { id },
      data: {
        dentistId: body.dentistId,
        patientId: body.patientId,
        startTime: new Date(body.startTime),
        endTime: new Date(body.endTime),
        status: body.status,
        notes: body.notes || null,
      },
      include: {
        dentist: true,
        patient: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: appointment,
    })
  } catch (error) {
    console.error('Error updating appointment:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la modification' },
      { status: 500 }
    )
  }
}