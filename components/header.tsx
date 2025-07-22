import Link from "next/link"

export function Header() {
  return (
    <header className="relative z-20 p-6">
      <div className="flex items-center">
        <Link href="/" className="group cursor-pointer">
          <h1 className="text-2xl md:text-3xl font-serif font-semibold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600 tracking-wide hover:scale-105 transition-transform">
            FutureSeer
          </h1>
        </Link>
      </div>
    </header>
  )
} 