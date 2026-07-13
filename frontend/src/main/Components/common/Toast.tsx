// Components/common/Toast.tsx
import React from 'react'
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react'
import type { ToastMessage } from '../../hooks/useToast'

interface ToastProps {
  toast: ToastMessage | null
}

const CONFIG = {
  success: {
    icon: CheckCircle,
    classes: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-950 dark:border-green-800 dark:text-green-200',
    iconClass: 'text-green-500 dark:text-green-400',
  },
  error: {
    icon: XCircle,
    classes: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-950 dark:border-red-800 dark:text-red-200',
    iconClass: 'text-red-500 dark:text-red-400',
  },
  warning: {
    icon: AlertTriangle,
    classes: 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-950 dark:border-yellow-800 dark:text-yellow-200',
    iconClass: 'text-yellow-500 dark:text-yellow-400',
  },
  info: {
    icon: Info,
    classes: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-200',
    iconClass: 'text-blue-500 dark:text-blue-400',
  },
} as const

export const Toast: React.FC<ToastProps> = ({ toast }) => {
  if (!toast) return null

  const { icon: Icon, classes, iconClass } = CONFIG[toast.type]

  return (
    <div
      data-testid="toast"
      className={`
        fixed bottom-6 right-6 z-[9999]
        flex items-start gap-3
        min-w-[280px] max-w-[420px]
        px-4 py-3
        border rounded-lg shadow-lg
        text-sm font-medium
        animate-in slide-in-from-bottom-4 fade-in
        duration-300
        ${classes}
      `}
    >
      <Icon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${iconClass}`} />
      <span className="flex-1 leading-snug">{toast.message}</span>
    </div>
  )
}