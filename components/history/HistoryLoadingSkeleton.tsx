"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function HistoryLoadingSkeleton() {
  return (
    <div className="relative min-h-screen overflow-hidden starfield-ultra-sharp">
      <div className="relative z-10 p-4 max-w-7xl mx-auto">
        {/* Header Skeleton */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 text-center"
        >
          <Skeleton className="h-10 w-64 mx-auto mb-4" />
          <Skeleton className="h-6 w-96 mx-auto" />
        </motion.div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} elevation={1} className="backdrop-blur-sm bg-[var(--m3-surface-container)] border border-[var(--m3-outline-variant)] rounded-2xl">
              <CardContent className="p-4 text-center">
                <Skeleton className="h-8 w-8 mx-auto mb-2 rounded-full" />
                <Skeleton className="h-6 w-16 mx-auto mb-2" />
                <Skeleton className="h-4 w-24 mx-auto" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search and Filter Skeleton */}
        <Card elevation={2} className="backdrop-blur-sm bg-[var(--m3-surface-container)] border border-[var(--m3-outline-variant)] rounded-2xl mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <Skeleton className="flex-1 h-10 rounded-xl" />
              <div className="flex gap-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-10 w-32 rounded-xl" />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reading Cards Skeleton */}
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} elevation={2} className="backdrop-blur-sm bg-[var(--m3-surface-container)] border border-[var(--m3-outline-variant)] rounded-2xl">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-6 w-24 rounded-full" />
                      <Skeleton className="h-4 w-12" />
                    </div>
                    <Skeleton className="h-6 w-3/4" />
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-9 w-32 rounded-md" />
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-5/6" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
