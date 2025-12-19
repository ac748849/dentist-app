import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma/client'

// GET /api/appointments - Liste tous les rendez-vous
export async function GET() {
  try {
    const appointments = await prisma.appointment.findMany({
      include: {
        dentist: true,
        patient: true,
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
      { success: false, error: 'Failed to fetch appointments' },
      { status: 500 }
    )
  }
}

// POST /api/appointments - Créer un rendez-vous
export async function POST(request: Request) {
    try {
      const body = await request.json()
      
      const appointment = await prisma.appointment.create({
        data: {
          dentistId: body.dentistId,
          patientId: body.patientId,
          startTime: new Date(body.startTime),
          endTime: new Date(body.endTime),
          status: body.status || 'PENDING',
          source: body.source || 'web',
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
      console.error('Error creating appointment:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to create appointment' },
        { status: 500 }
      )
    }
  }