import "./globals.css"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <title>FutureSeer - AI-Powered Mystical Insights</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="bg-slate-950">
        <div
          className="relative min-h-screen bg-cover bg-center bg-no-repeat bg-fixed"
          style={{ backgroundImage: "url('/images/starfield-bg.png')" }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/20 via-transparent to-slate-950/40" />
          <div className="relative z-10">
            {children}
          </div>
        </div>
      </body>
    </html>
  )
}