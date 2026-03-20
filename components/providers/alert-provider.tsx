'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'

type AlertType = 'info' | 'warn' | 'error' | 'success' | 'danger'

interface AlertOptions {
  title: string
  message: string
  type?: AlertType
  confirmText?: string
  cancelText?: string
  isConfirm?: boolean
}

interface AlertContextType {
  alert: (options: AlertOptions) => Promise<void>
  confirm: (options: AlertOptions) => Promise<boolean>
}

const AlertContext = createContext<AlertContextType | undefined>(undefined)

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [options, setOptions] = useState<AlertOptions>({ title: '', message: '' })
  const [resolvePromise, setResolvePromise] = useState<(value: any) => void>(() => {})

  const showAlert = useCallback((opts: AlertOptions): Promise<void> => {
    setOptions({ ...opts, isConfirm: false })
    setIsOpen(true)
    return new Promise((resolve) => {
      setResolvePromise(() => resolve)
    })
  }, [])

  const showConfirm = useCallback((opts: AlertOptions): Promise<boolean> => {
    setOptions({ ...opts, isConfirm: true })
    setIsOpen(true)
    return new Promise((resolve) => {
      setResolvePromise(() => resolve)
    })
  }, [])

  const handleClose = (result: boolean) => {
    setIsOpen(false)
    resolvePromise(result)
  }

  const getIcon = () => {
    switch (options.type) {
      case 'warn':
      case 'danger':
        return (
          <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 mb-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        )
      case 'error':
        return (
          <div className="w-12 h-12 bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-500 mb-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        )
      case 'success':
        return (
          <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 mb-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )
      default:
        return (
          <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400 mb-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        )
    }
  }

  return (
    <AlertContext.Provider value={{ alert: showAlert, confirm: showConfirm }}>
      {children}
      <Modal 
        isOpen={isOpen} 
        onClose={() => handleClose(false)} 
        title={options.title}
      >
        <div className="space-y-6">
          <div className="flex flex-col items-center text-center space-y-4">
            {getIcon()}
            <p className="text-sm text-gray-300 leading-relaxed font-medium whitespace-pre-wrap">
              {options.message}
            </p>
          </div>
          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
            {options.isConfirm && (
              <Button 
                variant="secondary" 
                onClick={() => handleClose(false)}
                className="w-full sm:flex-1 py-3"
              >
                {options.cancelText || 'キャンセル'}
              </Button>
            )}
            <Button 
              variant={options.type === 'error' || options.type === 'warn' || options.type === 'danger' ? 'danger' : 'primary'}
              onClick={() => handleClose(true)}
              className="w-full sm:flex-1 py-3"
            >
              {options.confirmText || 'OK'}
            </Button>
          </div>
        </div>
      </Modal>
    </AlertContext.Provider>
  )
}

export function useAlert() {
  const context = useContext(AlertContext)
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider')
  }
  return context
}
