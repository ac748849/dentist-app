import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma/client'

export async function GET() {
  try {
    const dentists = await prisma.dentist.findMany({
      select: {
        id: true,
        name: true,
        specialties: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: dentists,
    })
  } catch (error) {
    console.error('Error fetching dentists:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}