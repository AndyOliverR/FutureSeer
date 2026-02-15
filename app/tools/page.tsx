"use client"

import { useCallback, useMemo, useEffect, Suspense } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { useSearchParams } from "next/navigation"
import { useTools } from "@/hooks/useTools"
import { useRouter } from 'next/navigation'
import { ContextualHelp } from '@/components/ContextualHelp'
import { navigateToTool } from '@/lib/utils/toolRouting'
import { Header } from "@/components/header"
import { ArrowLeft } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { hasRequiredProfileSetup, PROFILE_SETUP_PATH } from "@/lib/authRouting"

// Fixed category order for consistent section ordering (matches dropdown)
const CATEGORY_ORDER = ['Astrology', 'Divination', 'Numerology', 'Reading', 'Chinese', 'Indian', 'Remedies', 'Analysis', 'Energy'] as const;
const VALID_CATEGORIES = new Set<string>(CATEGORY_ORDER);

function ToolsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');
  const isDrillDown = Boolean(categoryParam && VALID_CATEGORIES.has(categoryParam));
  const { user, userProfile, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && user && !hasRequiredProfileSetup(userProfile)) {
      router.replace(PROFILE_SETUP_PATH);
    }
  }, [authLoading, user, userProfile, router]);

  if (user && !hasRequiredProfileSetup(userProfile)) {
    return null;
  }

  const {
    tools,
    filteredTools,
    categories,
    selectedCategory,
    setSelectedCategory,
    searchTerm,
    setSearchTerm,
    getCategoryIcon,
  } = useTools()

  // Category cards: categories that have at least one tool, with tool count
  const categoryCardsData = useMemo(() => {
    const countByCategory: Record<string, number> = {};
    tools.forEach((t) => {
      countByCategory[t.category] = (countByCategory[t.category] || 0) + 1;
    });
    return CATEGORY_ORDER.filter((cat) => (countByCategory[cat] || 0) > 0).map((category) => ({
      category,
      toolCount: countByCategory[category] ?? 0,
    }));
  }, [tools]);

  // Drill-down: tools in the selected category, optionally filtered by search
  const toolsInCategory = useMemo(() => {
    if (!isDrillDown || !categoryParam) return [];
    let list = tools.filter((t) => t.category === categoryParam);
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q)
      );
    }
    return list;
  }, [tools, isDrillDown, categoryParam, searchTerm]);

  // Memoized tool exploration handler using routing utility
  const handleToolExplore = useCallback((toolId: string) => {
    navigateToTool(toolId, router);
  }, [router]);

  return (
    <div className="starfield-ultra-sharp min-h-screen overflow-hidden">
      <Header />
      <div className="p-4 sm:p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Enhanced Header with Cosmic Elements */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center mb-12 sm:mb-16 pt-20 sm:pt-24 md:pt-28"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mb-6"
            >
              <div className="text-6xl mb-4 animate-float">🔮</div>
              <div className="flex items-center justify-center gap-3 mb-4">
                <h1 className="m3-headline-large sm:m3-display-small font-serif text-amber-400">
                  Divination Tools
                </h1>
                <ContextualHelp
                  title="About Our Tools"
                  content="FutureSeer offers 60+ divination tools combining ancient occult wisdom with AI forecasting. Each tool provides unique insights into your future using hidden data patterns and predictive analytics. Explore different tools to get varied perspectives on your life path."
                  placement="right"
                />
              </div>
              <h2 className="text-white/80 leading-relaxed m3-title-large max-w-2xl mx-auto">
                Choose your path to cosmic wisdom through ancient mystical traditions
              </h2>
            </motion.div>
          </motion.div>

          {/* Drill-down: back link and optional search */}
          {isDrillDown && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mb-6 sm:mb-8"
            >
              <Link
                href="/tools"
                className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 m3-body-medium m3-transition-standard"
              >
                <ArrowLeft className="w-5 h-5" />
                All categories
              </Link>
            </motion.div>
          )}

          {isDrillDown && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 }}
              className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 rounded-3xl p-4 sm:p-6 mb-8"
            >
              <div className="flex items-center bg-[var(--m3-surface-container)] border border-[var(--m3-outline-variant)] rounded-2xl overflow-hidden focus-within:border-[var(--m3-primary)]/50 m3-transition-standard">
                <span className="pl-4 flex-shrink-0 text-amber-400 text-xl" aria-hidden>🔍</span>
                <input
                  type="text"
                  placeholder="Search within this category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 min-w-0 bg-transparent border-0 py-4 pr-4 pl-2 text-[var(--m3-on-surface)] placeholder-[var(--m3-on-surface-variant)]/60 focus:outline-none focus:ring-0 m3-transition-standard"
                />
              </div>
            </motion.div>
          )}

          {/* Category-cards mode: grid of category cards only */}
          {!isDrillDown && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mb-12"
            >
              {categoryCardsData.map(({ category, toolCount }, index) => (
                <CategoryCard
                  key={category}
                  category={category}
                  icon={getCategoryIcon(category)}
                  toolCount={toolCount}
                  index={index}
                />
              ))}
            </motion.div>
          )}

          {/* Drill-down: tool grid for selected category */}
          {isDrillDown && (
            <AnimatePresence>
              {toolsInCategory.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="text-center py-20"
                >
                  <p className="text-amber-400 m3-title-large mb-3">No tools found</p>
                  <p className="text-white/80 m3-body-medium">
                    {searchTerm.trim() ? "Try adjusting your search." : "No tools in this category."}
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8"
                >
                  {toolsInCategory.map((tool, index) => (
                    <ToolCard key={tool.slug} tool={tool} index={index} onExplore={handleToolExplore} />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          )}

          {/* Enhanced Quick Access Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 transition-all duration-300 hover:scale-105 rounded-3xl p-6 sm:p-8 md:p-10 text-center mt-12 sm:mt-16 md:mt-20"
          >
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="text-4xl mb-6"
            >
              💫
            </motion.div>
            <h3 className="m3-headline-small font-serif text-amber-400 mb-6">
              Need Quick Cosmic Guidance?
            </h3>
            <p className="text-white/80 m3-body-large mb-8 max-w-2xl mx-auto">
              Get instant mystical insights with our AI-powered Ask the Seer feature, drawing from ancient wisdom and cosmic patterns
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href="/ask-the-seer"
                className="group relative inline-flex items-center gap-3 px-8 sm:px-10 py-4 sm:py-5 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 transition-all duration-300 hover:scale-105 text-amber-400 rounded-2xl font-bold m3-label-large m3-ripple m3-button-bounce min-h-[48px]"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <span className="text-2xl">🧿</span>
                  <span>Ask the Seer</span>
                  <motion.span
                    animate={{ x: [0, 5] }}
                    transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
                    className="group-hover:translate-x-1 transition-transform duration-300"
                  >
                    →
                  </motion.span>
                </span>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

// Category card: links to drill-down view for that category
function CategoryCard({
  category,
  icon,
  toolCount,
  index,
}: {
  category: string;
  icon: string;
  toolCount: number;
  index: number;
}) {
  const href = `/tools?category=${encodeURIComponent(category)}`;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      whileHover={{ scale: 1.03, y: -6 }}
      whileTap={{ scale: 0.98 }}
    >
      <Link href={href} className="block h-full">
        <div className="group relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 transition-all duration-300 hover:scale-105 rounded-2xl p-6 sm:p-8 h-full min-h-[200px] flex flex-col items-center justify-center text-center cursor-pointer">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[var(--m3-primary-container)] to-[var(--m3-primary-container)] opacity-0 group-hover:opacity-100 m3-transition-standard blur-xl pointer-events-none" />
          <div className="relative z-10">
            <div className="text-5xl mb-4 m3-transition-standard group-hover:scale-110" aria-hidden>
              {icon}
            </div>
            <h3 className="text-amber-400 font-bold m3-title-large mb-2">{category}</h3>
            <p className="text-white/70 m3-body-small mb-4">
              {toolCount} {toolCount === 1 ? "tool" : "tools"}
            </p>
            <span className="text-amber-400 m3-label-medium font-semibold inline-flex items-center gap-1 group-hover:gap-2 transition-all">
              Explore more
              <span className="group-hover:translate-x-0.5 transition-transform">→</span>
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// Enhanced Tool Card Component
function ToolCard({ tool, index, onExplore }: { tool: any; index: number; onExplore: (toolId: string) => void }) {
  // Determine tier based on index (Top 5 = Tier 1) - only for badge display
  const isTopTier = index < 5;
  // Special handling for runes icon visibility
  const isRunes = tool.slug === 'runes';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, delay: index * 0.05 }}
      whileHover={{ scale: 1.03, y: -8 }}
      whileTap={{ scale: 0.98 }}
      className="group relative"
      onClick={() => !tool.isComingSoon && onExplore(tool.slug)}
    >
      {tool.isComingSoon && (
        <div className="absolute inset-0 bg-[var(--m3-surface)]/80 backdrop-blur-sm rounded-2xl flex items-center justify-center z-10">
          <div className="text-center">
            <motion.div 
              animate={{ rotate: [0, 15] }}
              transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
              className="text-3xl mb-3"
            >
              🚧
            </motion.div>
            <p className="text-amber-400 m3-label-medium font-semibold">Coming Soon</p>
          </div>
        </div>
      )}
      
      <div className={`group relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 transition-all duration-300 hover:scale-105 rounded-2xl p-6 sm:p-8 cursor-pointer h-[280px] flex flex-col ${
        tool.isComingSoon ? 'opacity-60' : ''
      }`}>
        {/* Consistent glow effect for ALL cards - only visible on hover */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[var(--m3-primary-container)] to-[var(--m3-primary-container)] opacity-0 group-hover:opacity-100 m3-transition-standard blur-xl pointer-events-none" />
        <div className="relative z-10 text-center flex flex-col h-full">
          {/* Most Popular Badge for Top 5 - but no visual glow difference */}
          {isTopTier && index === 0 && tool.slug !== 'western-astrology' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
              className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-[var(--m3-primary)] to-[var(--m3-tertiary)] text-[var(--m3-on-primary)] m3-label-small font-bold rounded-full m3-elevation-2 z-20"
            >
              ⭐ Most Popular
            </motion.div>
          )}
          
          <motion.div 
            className={`text-5xl mb-6 flex-shrink-0 m3-transition-standard ${
              isRunes 
                ? 'text-[var(--m3-primary)] group-hover:text-[var(--m3-on-primary)]' 
                : ''
            }`}
            whileHover={{ 
              scale: 1.15, 
              rotate: [0, 10],
              filter: "brightness(1.2)"
            }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            {tool.icon}
          </motion.div>
          
          <div className="flex items-center justify-center mb-4 flex-shrink-0">
            <h3 className="text-amber-400 font-bold m3-title-large">{tool.name}</h3>
          </div>
          
          <p className="text-white/80 m3-body-medium mb-6 leading-relaxed flex-grow flex items-center justify-center px-2">{tool.description}</p>
          
          {!tool.isComingSoon && (
            <motion.div 
              className="text-amber-400 m3-label-medium font-semibold flex items-center justify-center group-hover:text-amber-400/80 m3-transition-standard flex-shrink-0"
              whileHover={{ x: 8 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <span>Explore</span>
              <motion.span 
                className="ml-2 group-hover:translate-x-1 transition-transform duration-300"
              >
                →
              </motion.span>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default function ToolsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-950"><div className="text-amber-400">Loading...</div></div>}>
      <ToolsPageContent />
    </Suspense>
  )
}
