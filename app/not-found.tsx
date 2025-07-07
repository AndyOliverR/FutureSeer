import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 cosmic-background-restored">
      <div className="text-center">
        <h1 className="text-6xl md:text-8xl font-semibold sacred-logo-restored mb-6">
          404
        </h1>
        <p className="text-xl md:text-2xl text-soft max-w-2xl leading-relaxed cosmic-text-refined mb-8">
          The cosmic path you seek does not exist in this realm
        </p>
        <Link
          href="/"
          className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black rounded-3xl font-semibold text-lg hover:scale-105 transition-transform shadow-lg cosmic-button-primary"
        >
          🔮 Return to FutureSeer
        </Link>
      </div>
    </div>
  )
} 