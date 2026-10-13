import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const text = body.text || body.prompt || body.query || body.input || body.message

    if (!text) {
      return NextResponse.json({ error: "No se proporcionó ningún texto." }, { status: 400 })
    }

    const apiKey = process.env.OPENROUTER_API_KEY

    if (!apiKey) {
      return NextResponse.json({ error: "La clave de API no está configurada en Vercel." }, { status: 500 })
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey.trim()}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://juristraductor.vercel.app",
        "X-Title": "JurisTraductor"
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3.3-70b-instruct:free",
        messages: [
          {
            role: "system",
            content: "Eres JurisTraductor. Traduce textos legales colombianos a lenguaje claro para ciudadanos sin conocimientos en Derecho. Usa oraciones cortas, elimina arcaísmos y estructura la respuesta obligatoriamente con estos encabezados: 📌 ¿Qué significa esto?, ⚖️ Fuente o norma, y 📝 ¿Qué debes tener en cuenta?"
          },
          {
            role: "user",
            content: String(text)
          }
        ]
      })
    })

    const data = await response.json()

    if (!response.ok || data.error) {
      return NextResponse.json(
        { error: data?.error?.message || "Error al comunicarse con OpenRouter." },
        { status: response.status || 400 }
      )
    }

    const translation = data.choices?.[0]?.message?.content || "No se pudo generar la traducción."
    return NextResponse.json({ result: translation, translation: translation })

  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Error interno del servidor" }, { status: 500 })
  }
}
