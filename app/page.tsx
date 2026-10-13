'use client'

import React, { useState } from 'react'

export default function HomePage() {
  const [text, setText] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const ejemplos = [
    {
      titulo: 'Excepción previa y caducidad',
      texto: 'El demandado propone la excepción previa de falta de jurisdicción y caducidad de la acción en los términos del CGP.'
    },
    {
      titulo: 'Cláusula penal en contrato',
      texto: 'El incumplimiento de cualquiera de las obligaciones causará una sanción penal correspondiente al 20% del valor total, exigible ejecutivamente sin necesidad de requerimiento judicial ni constitución en mora.'
    },
    {
      titulo: 'Suspensión de términos judiciales',
      texto: 'Se ordena la suspensión de términos procesales de conformidad con el acuerdo emitido por el Consejo Superior de la Judicatura.'
    }
  ]

  const handleTranslate = async (textToTranslate?: string) => {
    const consulta = textToTranslate || text
    if (!consulta.trim()) {
      setError('Por favor escribe o pega un texto jurídico antes de traducir.')
      return
    }

    setLoading(true)
    setError(null)
    setResult('')

    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: consulta })
      })

      const data = await response.json()

      if (!response.ok || data.error) {
        throw new Error(data.error || 'Ocurrió un error al procesar la traducción.')
      }

      setResult(data.result || data.translation || data.response || 'No se obtuvo traducción.')
    } catch (err: any) {
      setError(err.message || 'No fue posible conectarse con el asistente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      
      {/* Banner de advertencia ética obligatoria */}
      <div style={{
        width: '100%',
        backgroundColor: '#fef3c7',
        borderBottom: '1px solid #f59e0b',
        padding: '12px 20px',
        textAlign: 'center',
        fontSize: '14px',
        color: '#92400e',
        fontWeight: '500'
      }}>
        ⚠️ <strong>Aviso legal importante:</strong> Esta herramienta es un ejercicio académico del curso <em>Derecho e IA</em> (PUJ 2026-II) que no constituye asesoría legal ni sustituye la consulta con un abogado titulado.
      </div>

      <main style={{ maxWidth: '860px', width: '92%', margin: '40px auto 60px' }}>
        
        {/* Cabecera */}
        <header style={{ textAlign: 'center', marginBottom: '35px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', backgroundColor: '#e0e7ff', padding: '8px 18px', borderRadius: '30px', color: '#3730a3', fontSize: '13px', fontWeight: '600', marginBottom: '15px' }}>
            <span>⚖️ Pontificia Universidad Javeriana</span>
            <span>·</span>
            <span>2026-II</span>
          </div>
          <h1 style={{ fontSize: '36px', fontWeight: '800', margin: '0 0 10px', color: '#1e293b' }}>
            JurisTraductor
          </h1>
          <p style={{ fontSize: '18px', color: '#64748b', margin: 0 }}>
            <em>"Entender tus derechos también es un derecho."</em>
          </p>
          <p style={{ fontSize: '14px', color: '#94a3b8', marginTop: '6px' }}>
            Convierte el lenguaje jurídico técnico y complejo a un lenguaje sencillo, claro y estructurado.
          </p>
        </header>

        {/* Sección de ejemplos rápidos */}
        <div style={{ marginBottom: '20px' }}>
          <span style={{ fontSize: '13px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '8px' }}>
            💡 Prueba con un ejemplo legal frecuente:
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {ejemplos.map((ej, index) => (
              <button
                key={index}
                onClick={() => {
                  setText(ej.texto)
                  handleTranslate(ej.texto)
                }}
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '7px 14px',
                  fontSize: '12px',
                  color: '#334155',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                }}
              >
                {ej.titulo}
              </button>
            ))}
          </div>
        </div>

        {/* Caja de texto principal */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
          border: '1px solid #e2e8f0'
        }}>
          <label htmlFor="texto" style={{ display: 'block', fontWeight: '600', fontSize: '15px', marginBottom: '8px', color: '#1e293b' }}>
            Texto legal o cláusula que deseas traducir:
          </label>
          <textarea
            id="texto"
            rows={5}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Pega aquí el fragmento de la ley, auto judicial, notificación, contrato o término técnico que no entiendas..."
            style={{
              width: '100%',
              boxSizing: 'border-box',
              padding: '14px',
              fontSize: '15px',
              borderRadius: '10px',
              border: '1px solid #cbd5e1',
              fontFamily: 'inherit',
              resize: 'vertical',
              outline: 'none',
              lineHeight: '1.5'
            }}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>
              Motor: LangChain + OpenRouter Free Tier
            </span>
            <button
              onClick={() => handleTranslate()}
              disabled={loading}
              style={{
                backgroundColor: loading ? '#94a3b8' : '#2563eb',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                padding: '12px 24px',
                fontSize: '15px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)'
              }}
            >
              {loading ? 'Traduciendo en lenguaje claro...' : 'Traducir a lenguaje claro ⚡'}
            </button>
          </div>
        </div>

        {/* Mensaje de error */}
        {error && (
          <div style={{
            marginTop: '24px',
            backgroundColor: '#fee2e2',
            border: '1px solid #ef4444',
            borderRadius: '12px',
            padding: '16px',
            color: '#b91c1c',
            fontSize: '14px'
          }}>
            <strong>❌ Error:</strong> {error}
            <div style={{ marginTop: '8px', fontSize: '13px', color: '#7f1d1d' }}>
              💡 Si el error menciona la clave de API, asegúrate de haber configurado <code>OPENROUTER_API_KEY</code> en las Variables de Entorno de Vercel.
            </div>
          </div>
        )}

        {/* Caja de resultados */}
        {result && (
          <div style={{
            marginTop: '28px',
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '28px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0, color: '#1e293b' }}>
                📖 Traducción en Lenguaje Claro
              </h2>
              <button
                onClick={() => navigator.clipboard.writeText(result)}
                style={{
                  backgroundColor: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  fontWeight: '500',
                  color: '#475569'
                }}
              >
                📋 Copiar texto
              </button>
            </div>

            <div style={{
              whiteSpace: 'pre-wrap',
              fontSize: '15px',
              lineHeight: '1.7',
              color: '#334155'
            }}>
              {result}
            </div>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer style={{ marginTop: 'auto', width: '100%', borderTop: '1px solid #e2e8f0', padding: '20px', textAlign: 'center', fontSize: '13px', color: '#64748b' }}>
        <strong>JurisTraductor</strong> · Desarrollado por Maria Jose Sarmiento Garcia · Asesoría de IA (Vibe Coding) · Pontificia Universidad Javeriana 2026-II
      </footer>
    </div>
  )
}
