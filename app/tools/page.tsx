"use client"

import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { useTools } from "@/hooks/useTools"

export default function ToolsPage() {
  const {
    filteredTools,
    toolsByCategory,
    categories,
    selectedCategory,
    setSelectedCategory,
    searchTerm,
    setSearchTerm,
    getCategoryIcon,
    getCategoryColor,
  } = useTools()

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 pt-8"
        >
          <Link href="/dashboard" className="text-soft hover:gold-glow mb-4 inline-block transition-all duration-300">
            ← Back to Dashboard
          </Link>
          <h1 className="text-4xl font-semibold gold-glow mb-4">Divination Tools</h1>
          <h2 className="text-soft leading-relaxed">Choose your path to cosmic wisdom</h2>
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="glass-card rounded-3xl p-6 mb-8 border border-white/10"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <motion.input
                whileFocus={{ scale: 1.02 }}
                type="text"
                placeholder="Search tools..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/5 border border-white/20 rounded-2xl p-4 pl-12 text-soft placeholder-white/50 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all duration-300"
              />
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-soft/50">🔍</span>
            </div>
            <motion.select
              whileFocus={{ scale: 1.02 }}
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-white/5 border border-white/20 rounded-2xl p-4 text-soft focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all duration-300"
            >
              {categories.map((category) => (
                <option key={category} value={category} className="bg-gray-800">
                  {category === "all" ? "All Categories" : category}
                </option>
              ))}
            </motion.select>
        </div>
        </motion.div>

        {/* Tools Display */}
        <AnimatePresence>
          {filteredTools.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center py-16"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-6xl mb-6"
              >
                🔮
              </motion.div>
              <p className="text-soft/70 text-lg mb-2">No tools found</p>
              <p className="text-soft/50">Try adjusting your search or filter criteria</p>
            </motion.div>
          ) : (
            <div className="space-y-12">
              {/* Show tools by category when "all" is selected */}
              {selectedCategory === "all" ? (
                Object.entries(toolsByCategory).map(([category, categoryTools]) => (
                  <motion.div
                    key={category}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                  >
                    <div className="flex items-center justify-center mb-8">
                      <div className={`px-6 py-3 rounded-2xl bg-gradient-to-r ${getCategoryColor(category)} border border-white/10`}>
                        <h2 className="text-2xl gold-glow flex items-center">
                          <span className="mr-3">{getCategoryIcon(category)}</span>
                          {category}
                        </h2>
                </div>
              </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {categoryTools.map((tool, index) => (
                        <ToolCard key={tool.slug} tool={tool} index={index} />
                      ))}
                    </div>
                  </motion.div>
                ))
              ) : (
                // Show filtered tools in a single grid
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTools.map((tool, index) => (
                      <ToolCard key={tool.slug} tool={tool} index={index} />
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </AnimatePresence>

        {/* Quick Access */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="glass-card rounded-3xl p-8 text-center mt-12 border border-white/10"
        >
          <h3 className="text-2xl gold-glow mb-4">Need Quick Guidance?</h3>
          <p className="text-soft/70 mb-6">Get instant insights with our AI-powered Ask the Seer feature</p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              href="/ask"
              className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black rounded-2xl font-semibold hover:shadow-xl transition-all duration-300 inline-block"
            >
              🔮 Ask the Seer
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

// Tool Card Component
function ToolCard({ tool, index }: { tool: any; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ scale: 1.02, y: -5 }}
      whileTap={{ scale: 0.98 }}
      className="group relative"
    >
      {tool.isComingSoon && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-2xl flex items-center justify-center z-10">
          <div className="text-center">
            <div className="text-2xl mb-2">🚧</div>
            <p className="text-soft text-sm font-medium">Coming Soon</p>
          </div>
        </div>
      )}
      
      <div className={`glass-card rounded-2xl p-6 cursor-pointer border transition-all duration-300 ${
        tool.isComingSoon ? 'opacity-60' : 'hover:shadow-2xl'
      } ${tool.isPremium ? 'border-yellow-500/30' : 'border-white/10'}`}>
        <div className="text-center">
          <motion.div 
            className="text-4xl mb-4"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            {tool.icon}
          </motion.div>
          <div className="flex items-center justify-center mb-2">
            <h3 className="text-soft font-semibold text-lg">{tool.name}</h3>
            {tool.isPremium && (
              <span className="ml-2 px-2 py-1 bg-yellow-500/20 text-yellow-300 text-xs rounded-full">
                ✨ Premium
              </span>
            )}
          </div>
          <p className="text-soft/70 text-sm mb-4 leading-relaxed">{tool.description}</p>
          
          {!tool.isComingSoon && (
            <motion.div 
              className="text-yellow-400 text-sm font-medium flex items-center justify-center"
              whileHover={{ x: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <span>Explore</span>
              <span className="ml-1">→</span>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
