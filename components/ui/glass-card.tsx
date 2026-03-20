import React from 'react'

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  hoverable?: boolean
}

export function GlassCard({ children, className = '', onClick, hoverable = false }: GlassCardProps) {
  const baseClasses = 'bg-surface border border-glass-border rounded-2xl p-4 animate-fade-in'
  const hoverClasses = hoverable ? 'transition-all hover:bg-surface-hover hover:border-glass-border-hover cursor-pointer active:scale-[0.98]' : ''

  return (
    <div 
      className={`${baseClasses} ${hoverClasses} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
