'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
  fallbackTitle?: string
  fallbackMessage?: string
}

interface State {
  hasError: boolean
  error: Error | null
}

export class DashboardErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Dashboard Error Boundary caught an error:', error, errorInfo)
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <Card className="backdrop-blur-md bg-slate-900/40 border-red-500/30 shadow-xl">
          <CardHeader className="border-b border-red-500/20">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-red-400" />
              <CardTitle className="text-xl font-serif text-red-300">
                {this.props.fallbackTitle || 'Something went wrong'}
              </CardTitle>
            </div>
          </CardHeader>
          
          <CardContent className="p-6">
            <p className="text-sm text-slate-300 mb-4 font-light">
              {this.props.fallbackMessage || 'We encountered an error loading this section. Please try refreshing.'}
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <p className="text-xs text-red-300 font-mono break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <button
              onClick={this.handleReset}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-300 text-sm font-light hover:from-amber-500/30 hover:to-orange-500/30 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          </CardContent>
        </Card>
      )
    }

    return this.props.children
  }
}
