import Link from "next/link"

export default function DashboardPage() {
  const sections = [
    { title: "Health Predictions", icon: "❤️", count: "3 insights", color: "from-red-500/20 to-pink-500/20" },
    { title: "Wealth Predictions", icon: "💰", count: "5 insights", color: "from-green-500/20 to-emerald-500/20" },
    { title: "Love Guidance", icon: "💖", count: "2 insights", color: "from-pink-500/20 to-rose-500/20" },
    { title: "Saved Remedies", icon: "✨", count: "8 remedies", color: "from-yellow-500/20 to-amber-500/20" },
    { title: "User Notes", icon: "📝", count: "12 notes", color: "from-blue-500/20 to-indigo-500/20" },
  ]

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 pt-8">
          <Link href="/" className="text-soft hover:gold-glow mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-semibold gold-glow mb-4">Your Cosmic Dashboard</h1>
          <p className="text-soft leading-relaxed">Navigate your spiritual journey with AI-powered guidance</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { label: "Total Readings", value: "47" },
            { label: "Active Remedies", value: "8" },
            { label: "Streak Days", value: "12" },
            { label: "Accuracy", value: "94%" },
          ].map((stat, i) => (
            <div key={i} className="glass-card rounded-2xl p-4 text-center">
              <div className="text-2xl gold-glow font-semibold">{stat.value}</div>
              <div className="text-soft/70 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Main Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {sections.map((section, i) => (
            <div key={i} className="glass-card rounded-2xl p-6 hover:scale-105 transition-transform cursor-pointer">
              <div
                className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${section.color} flex items-center justify-center mb-4`}
              >
                <span className="text-xl">{section.icon}</span>
              </div>
              <h3 className="text-soft font-medium mb-2">{section.title}</h3>
              <p className="text-soft/70 text-sm mb-4">{section.count}</p>
              <div className="text-yellow-400 text-sm">Explore →</div>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="glass-card rounded-3xl p-8">
          <h3 className="text-xl gold-glow mb-6">Recent Activity</h3>
          <div className="space-y-4">
            {[
              { time: "2 hours ago", action: "Asked about career change", result: "Positive alignment detected" },
              { time: "1 day ago", action: "Completed Vedic reading", result: "3 remedies prescribed" },
              { time: "2 days ago", action: "Daily symbol meditation", result: "Insight recorded" },
              { time: "3 days ago", action: "Tarot consultation", result: "Major Arcana guidance" },
            ].map((activity, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-white/10 last:border-b-0">
                <div>
                  <p className="text-soft text-sm">{activity.action}</p>
                  <p className="text-soft/50 text-xs">{activity.time}</p>
                </div>
                <div className="text-soft/70 text-xs">{activity.result}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
