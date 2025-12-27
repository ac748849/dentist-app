import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { newMessage } = body

    if (!newMessage) {
      return NextResponse.json({ error: 'Message required' }, { status: 400 })
    }

    const ollamaUrl = process.env.OLLAMA_URL || 'http://91.99.75.199:11434'
    const model = process.env.LLM_MODEL || 'mistral:latest'

    const response = await fetch(ollamaUrl + '/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: 'Tu es un assistant dentaire virtuel du Cabinet Sainte-Catherine. Aide les patients avec leurs questions et rendez-vous.' },
          { role: 'user', content: newMessage }
        ],
        stream: false,
      }),
    })

    const data = await response.json()

    return NextResponse.json({
      success: true,
      message: data.message?.content || 'Pas de réponse',
    })
  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
