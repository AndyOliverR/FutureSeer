interface RemedyCardProps {
  icon: string
  title: string
  description: string
  type: string
}

export function RemedyCard({ icon, title, description, type }: RemedyCardProps) {
  return (
    <div className="bg-purple-900/20 rounded-xl p-6 backdrop-blur-sm border border-purple-800/30 hover:border-gold/30 transition-colors">
      <div className="flex items-start space-x-4">
        <div className="text-2xl">{icon}</div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-gray-200 font-medium">{title}</h4>
            <span className="text-xs text-purple-400 bg-purple-800/30 px-2 py-1 rounded-full">{type}</span>
          </div>
          <p className="text-purple-400 text-sm font-light leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  )
}
