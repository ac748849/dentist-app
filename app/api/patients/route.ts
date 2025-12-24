import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma/client'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, phone, email, ageCategory } = body

    // Vérifier si le patient existe déjà
    let patient = await prisma.patient.findUnique({
      where: { phone },
    })

    if (patient) {
      // 🆕 Mettre à jour avec ageCategory si fourni
      patient = await prisma.patient.update({
        where: { phone },
        data: {
          name,
          email: email || null,
          ageCategory: ageCategory || patient.ageCategory,
        },
      })
    } else {
      // Créer un nouveau patient
      patient = await prisma.patient.create({
        data: {
          name,
          phone,
          email: email || null,
          ageCategory: ageCategory || 'ADULTE', // 🆕
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
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}