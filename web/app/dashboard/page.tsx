'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/dashboard-layout'
import { DashboardView } from '@/components/views/dashboard-view'
import { PorView } from '@/components/views/por-view'
import { ZakatView } from '@/components/views/zakat-view'
import { RedemptionView } from '@/components/views/redemption-view'
import { ShariaView } from '@/components/views/sharia-view'
import { useAPAXStore } from '@/lib/store'
import { getHoldings } from '@/lib/services/holdings.api'

export default function DashboardPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const { activeView, addAuditLog, setUserHoldings, setHoldingsState } = useAPAXStore()

  useEffect(() => {
    const token = localStorage.getItem('apax_token')
    if (!token) {
      router.replace('/login')
      return
    }

    setIsAuthenticated(true)
    setHoldingsState('loading')
    getHoldings(token)
      .then(({ holdings }) => {
        setUserHoldings({
          goldGrams: holdings.gold.amount,
          silverGrams: holdings.silver.amount,
          platinumGrams: holdings.platinum.amount,
          apxiTokens: 0,
        })
        setHoldingsState('success')
      })
      .catch((error: unknown) => {
        setHoldingsState('error', error instanceof Error ? error.message : 'Unable to load holdings')
      })
  }, [router, setHoldingsState, setUserHoldings])

  // Simulate live price updates
  useEffect(() => {
    const interval = setInterval(() => {
      useAPAXStore.setState((state) => ({
        metalPrices: {
          gold: state.metalPrices.gold + (Math.random() - 0.5) * 2,
          silver: state.metalPrices.silver + (Math.random() - 0.5) * 0.1,
          platinum: state.metalPrices.platinum + (Math.random() - 0.5) * 1,
          lastUpdated: new Date()
        }
      }))
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  // Simulate occasional audit log events
  useEffect(() => {
    const events = [
      'Vault Verification',
      'Token Mint',
      'Reserve Audit',
      'Price Oracle Update',
      'Compliance Check'
    ]
    
    const interval = setInterval(() => {
      const event = events[Math.floor(Math.random() * events.length)]
      addAuditLog({
        id: Date.now().toString(),
        timestamp: new Date(),
        event,
        details: `Automated ${event.toLowerCase()} completed`,
        txHash: `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`
      })
    }, 30000) // Every 30 seconds

    return () => clearInterval(interval)
  }, [addAuditLog])

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardView />
      case 'por':
        return <PorView />
      case 'zakat':
        return <ZakatView />
      case 'redemption':
        return <RedemptionView />
      case 'sharia':
        return <ShariaView />
      default:
        return <DashboardView />
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0A0A0A] text-sm text-[#888888]">
        Verifying session…
      </div>
    )
  }

  return (
    <DashboardLayout>
      {renderView()}
    </DashboardLayout>
  )
}
