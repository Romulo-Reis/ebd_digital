import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  fullScreen?: boolean
  className?: string
}

export function LoadingSpinner({ fullScreen, className }: LoadingSpinnerProps) {
  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return <Loader2 className={cn('h-5 w-5 animate-spin text-primary', className)} />
}
