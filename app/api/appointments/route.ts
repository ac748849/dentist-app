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