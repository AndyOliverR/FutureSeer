interface Remedy {
  icon: string
  title: string
  desc: string
  type: string
}

interface RemedyCardsProps {
  remedies: Remedy[]
}

export function RemedyCards({ remedies }: RemedyCardsProps) {

  return (
    <div className="mb-12">
      <h3 className="text-xl text-gold font-light text-center mb-8">🌟 Prescribed Remedies</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {remedies.map((remedy, i) => (
          <div
            key={i}
            className="bg-purple-900/20 rounded-xl p-6 backdrop-blur-sm border border-purple-800/30 hover:border-gold/30 transition-colors"
          >
            <div className="flex items-start space-x-4">
              <div className="text-2xl">{remedy.icon}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-purple-200 font-medium">{remedy.title}</h4>
                  <span className="text-xs text-purple-400 bg-purple-800/30 px-2 py-1 rounded-full">{remedy.type}</span>
                </div>
                <p className="text-purple-400 text-sm font-light leading-relaxed">{remedy.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
