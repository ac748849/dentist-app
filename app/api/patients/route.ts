import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma/client'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, phone, email } = body

    let patient = await prisma.patient.findUnique({
      where: { phone },
    })

    if (patient) {
      patient = await prisma.patient.update({
        where: { phone },
        data: {
          name,
          email: email || patient.email,
          consentGDPR: true,
          consentDate: new Date(),
        },
      })
    } else {
      patient = await prisma.patient.create({
        data: {
          phone,
          name,
          email: email || null,
          consentGDPR: true,
          consentDate: new Date(),
        },
      })
    }

    return NextResponse.json({
      success: true,
      data: patient,
    })
  } catch (error) {
    console.error('Error creating/updating patient:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création du patient' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const patients = await prisma.patient.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({
      success: true,
      data: patients,
    })
  } catch (error) {
    console.error('Error fetching patients:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}