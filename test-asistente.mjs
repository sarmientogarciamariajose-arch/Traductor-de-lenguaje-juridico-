import dotenv from 'dotenv'
dotenv.config()
dotenv.config({ path: '.env.local' })
import { ChatOpenAI } from '@langchain/openai'
import { ChatPromptTemplate } from '@langchain/core/prompts'
import { StringOutputParser } from '@langchain/core/output_parsers'

// Cargar la API key desde .env.local o .env
const apiKey = process.env.OPENROUTER_API_KEY

if (!apiKey) {
  console.error("❌ ERROR: No se encontró OPENROUTER_API_KEY en las variables de entorno.")
  process.exit(1)
}

const primaryModel = new ChatOpenAI({
  apiKey: apiKey,
  configuration: {
    baseURL: "https://openrouter.ai/api/v1",
    defaultHeaders: {
      "HTTP-Referer": "https://juristraductor.vercel.app",
      "X-Title": "JurisTraductor"
    }
  },
  modelName: "nvidia/nemotron-3-ultra-550b-a55b:free",
  temperature: 0.2
})

const fallbackModel = new ChatOpenAI({
  apiKey: apiKey,
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

// Prompt de sistema estructurado para M1
const systemTemplate = `Eres JurisTraductor, un asistente jurídico académico creado para facilitar la comprensión de textos legales colombianos a ciudadanos sin formación jurídica.

MISIÓN:
Convertir el lenguaje jurídico técnico y complejo a un lenguaje sencillo, claro y comprensible.

ALCANCE:
- ✅ Traduces y explicas términos jurídicos, cláusulas de contratos y fragmentos de normas colombianas.
- ❌ NO resuelves litigios, NO determinas quién tiene la razón, NO tomas decisiones legales y NO das asesoría profesional.
- Si una consulta excede tu alcance, explica amablemente tu límite y recomienda consultar a un abogado titulado o acudir a un consultorio jurídico.

REGLAS DE RESPUESTA:
1. Explica en lenguaje claro, usando oraciones cortas y evitando tecnicismos innecesarios.
2. Si mencionas una norma, indica su nombre oficial o artículo con precisión.
3. Si no tienes certeza sobre un concepto o norma, responde con honestidad "No tengo la certeza jurídica sobre este punto" y no inventes.
4. Toda respuesta debe estructurarse obligatoriamente con las siguientes tres secciones:
   📌 ¿Qué significa esto?: Explicación en palabras sencillas y cotidianas.
   ⚖️ Fuente o norma relacionada: Base normativa o jurídica de referencia.
   📝 ¿Qué debes tener en cuenta?: Puntos clave prácticos para el ciudadano.

ADVERTENCIA OBLIGATORIA (debe aparecer al final de cada respuesta):
"⚠️ Esta herramienta es un ejercicio académico que no constituye asesoría legal ni sustituye la consulta con un abogado."`

const promptTemplate = ChatPromptTemplate.fromMessages([
  ["system", systemTemplate],
  ["human", "{input}"]
])

const chain = promptTemplate.pipe(model).pipe(new StringOutputParser())

async function probar() {
  const consulta = process.argv[2] || "El demandado propone la excepción previa de falta de jurisdicción y caducidad de la acción."
  console.log(`\n🔍 Probando consulta:\n"${consulta}"\n`)
  try {
    const respuesta = await chain.invoke({ input: consulta })
    console.log("---------------- RESPUESTA DE JURISTRADUCTOR ----------------\n")
    console.log(respuesta)
    console.log("\n-------------------------------------------------------------")
  } catch (error) {
    console.error("❌ Error al llamar al modelo:", error.message)
  }
}

probar()
