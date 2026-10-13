import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    let text = ""
    
    try {
      const body = await req.json()
      if (typeof body === 'string') {
        text = body
      } else if (body && typeof body === 'object') {
        // Intenta extraer el texto de cualquier propiedad común o toma el primer valor del objeto
        text = body.text || body.prompt || body.query || body.input || body.message || body.term || body.concept || Object.values(body)[0]
      }
    } catch {
      text = await req.text()
    }

    if (!text || String(text).trim() === '' || String(text) === '[object Object]') {
      return NextResponse.json({ error: "No se proporcionó ningún texto válido." }, { status: 400 })
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
    
    // Retorna la traducción bajo múltiples nombres de clave para asegurar compatibilidad con el frontend
    return NextResponse.json({ 
      result: translation, 
      translation: translation, 
      text: translation,
      response: translation 
    })

  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Error interno del servidor" }, { status: 500 })
  }
}
