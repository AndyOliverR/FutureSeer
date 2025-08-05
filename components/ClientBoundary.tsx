"use client"

import { ReactNode } from 'react'

interface ClientBoundaryProps {
  children: ReactNode
}

export function ClientBoundary({ children }: ClientBoundaryProps) {
  return <>{children}</>
} 