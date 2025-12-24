import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma/client'

export async function GET() {
  try {
    const interventions = await prisma.interventionDuration.findMany({
      orderBy: {
        interventionType: 'asc'
      }
    })

    return NextResponse.json({
      success: true,
      count: interventions.length,
      data: interventions
    })
  } catch (error) {
    console.error('Error fetching interventions:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}