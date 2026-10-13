import React from 'react'

export const metadata = {
  title: 'JurisTraductor — Traductor de Lenguaje Jurídico',
  description: 'Convierte textos legales y técnicos colombianos a lenguaje claro y sencillo para todos los ciudadanos.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body style={{ margin: 0, padding: 0, fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', backgroundColor: '#f8fafc', color: '#0f172a' }}>
        {children}
      </body>
    </html>
  )
}
