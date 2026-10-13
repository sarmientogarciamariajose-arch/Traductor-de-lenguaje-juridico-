import { NextResponse } from 'next/server'
import { ChatOpenAI } from '@langchain/openai'
import { ChatPromptTemplate } from '@langchain/core/prompts'
import { StringOutputParser } from '@langchain/core/output_parsers'

export async function POST(req: Request) {
  try {
    let text = ""
    
    try {
      const body = await req.json()
      if (typeof body === 'string') {
        text = body
      } else if (body && typeof body === 'object') {
        // Extrae el texto de cualquier propiedad común del payload
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
      return NextResponse.json({ error: "La clave OPENROUTER_API_KEY no está configurada." }, { status: 500 })
    }

    // Configuración de LangChain con OpenRouter y modelos gratuitos activos con fallback
    const primaryModel = new ChatOpenAI({
      apiKey: apiKey.trim(),
      configuration: {
        baseURL: "https://openrouter.ai/api/v1",
        defaultHeaders: {
          "HTTP-Referer": "https://juristraductor.vercel.app",
          "X-Title": "JurisTraductor"
        }
      },
      modelName: "nvidia/nemotron-3-super-120b-a12b:free",
      temperature: 0.2
    })

    const fallbackModel = new ChatOpenAI({
      apiKey: apiKey.trim(),
      configuration: {
        baseURL: "https://openrouter.ai/api/v1",
        defaultHeaders: {
          "HTTP-Referer": "https://juristraductor.vercel.app",
          "X-Title": "JurisTraductor"
        }
      },
      modelName: "nvidia/nemotron-3.5-lightning:free",
      temperature: 0.2
    })

    const model = primaryModel.withFallbacks([fallbackModel])

    const systemPrompt = `Eres JurisTraductor, un asistente jurídico académico creado por Maria Jose Sarmiento Garcia para el curso Derecho e IA de la Pontificia Universidad Javeriana.

MISIÓN:
Facilitar la comprensión de textos legales colombianos traduciendo el lenguaje jurídico técnico y complejo a un lenguaje sencillo, claro y accesible para ciudadanos sin formación jurídica.

ALCANCE:
- ✅ Traduces y explicas conceptos jurídicos, cláusulas de contratos y fragmentos de normas colombianas en lenguaje cotidiano.
- ❌ NO resuelves litigios ni determinas quién tiene la razón en un proceso judicial.
- ❌ NO das asesoría jurídica profesional ni tomas decisiones legales.
- Si una consulta te pide resolver un conflicto específico o decir quién gana un juicio, aclara con amabilidad que no tienes esa facultad y sugiere acudir a un consultorio jurídico o consultar a un abogado titulado.

REGLAS DE ACTUACIÓN:
1. Responde en español claro, usando oraciones cortas, vocabulario común y eliminando arcaísmos o latinazgos innecesarios.
2. Si citas o te refieres a una norma o concepto, indica expresamente la fuente o norma colombiana de referencia.
3. Regla anti-alucinaciones: Si no tienes base o certeza jurídica para responder, di claramente "No tengo la certeza jurídica sobre este punto" — NUNCA inventes artículos, leyes ni jurisprudencia.
4. Toda traducción debe estructurarse obligatoriamente con los siguientes tres bloques:
   📌 ¿Qué significa esto?: Explicación en palabras sencillas de la vida diaria.
   ⚖️ Fuente o norma de referencia: Norma, código o concepto legal en Colombia.
   📝 ¿Qué debes tener en cuenta?: Advertencias prácticas y qué implica para una persona del común.

ADVERTENCIA OBLIGATORIA (debe incluirse siempre al final de cada respuesta):
"⚠️ Esta herramienta es un ejercicio académico que no constituye asesoría legal ni sustituye la consulta con un abogado."`

    const prompt = ChatPromptTemplate.fromMessages([
      ["system", systemPrompt],
      ["human", "{input}"]
    ])

    const chain = prompt.pipe(model).pipe(new StringOutputParser())

    const translation = await chain.invoke({ input: String(text) })

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
