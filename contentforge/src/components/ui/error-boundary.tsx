'use client'

import React from 'react'
import { AlertOctagon, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  detailsOpen: boolean
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null, detailsOpen: false }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error }
  }

  resetErrorBoundary = () => {
    this.setState({ hasError: false, error: null, detailsOpen: false })
  }

  toggleDetails = () => {
    this.setState((state) => ({ detailsOpen: !state.detailsOpen }))
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex min-h-[400px] items-center justify-center p-8">
          <div className="w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-900 p-8 text-center shadow-lg">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10">
              <AlertOctagon className="h-7 w-7 text-red-400" />
            </div>

            <h2 className="mb-2 text-xl font-semibold text-zinc-100">
              Something went wrong
            </h2>
            <p className="mb-6 text-sm text-zinc-400">
              An unexpected error occurred. Please try again.
            </p>

            <button
              onClick={this.resetErrorBoundary}
              className={cn(
                'inline-flex items-center gap-2 rounded-lg px-5 py-2.5',
                'bg-indigo-600 text-sm font-medium text-white',
                'transition-colors hover:bg-indigo-500',
                'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-zinc-900'
              )}
            >
              <RotateCcw className="h-4 w-4" />
              Try again
            </button>

            {this.state.error && (
              <div className="mt-6">
                <button
                  onClick={this.toggleDetails}
                  className="inline-flex items-center gap-1 text-xs text-zinc-500 transition-colors hover:text-zinc-300"
                >
                  Error details
                  {this.state.detailsOpen ? (
                    <ChevronUp className="h-3 w-3" />
                  ) : (
                    <ChevronDown className="h-3 w-3" />
                  )}
                </button>

                {this.state.detailsOpen && (
                  <pre className="mt-3 max-h-48 overflow-auto rounded-lg bg-zinc-950 p-4 text-left text-xs text-red-300">
                    {this.state.error.message}
                    {this.state.error.stack && (
                      <>
                        {'\n\n'}
                        {this.state.error.stack}
                      </>
                    )}
                  </pre>
                )}
              </div>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
