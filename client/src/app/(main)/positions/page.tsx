'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Clock, BarChart } from 'lucide-react'
import PositionList from '@/components/positions/position-list'
import { useActiveElection } from '@/services/client/api'
import { useRouter } from 'next/navigation'


const PositionsPage = () => {
  const [timeLeft, setTimeLeft] = useState('')
  const [timeProgress, setTimeProgress] = useState<number | null>(null) // percentage of remaining time
  const router = useRouter()

  const { data: activeElection, isPending } = useActiveElection()
  const election = activeElection?.data

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date()
      const endDate = election?.end_date ? new Date(election.end_date) : null
      if (!endDate) {
        setTimeLeft('')
        setTimeProgress(null)
        return
      }

      const diff = endDate.getTime() - now.getTime()
      if (diff <= 0) {
        setTimeLeft('Voting closed')
        setTimeProgress(0)
        return
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      setTimeLeft(`${days}d ${hours}h ${minutes}m left`)

      // Progress (if start_date exists)
      if (election?.start_date) {
        const startDate = new Date(election.start_date)
        const total = endDate.getTime() - startDate.getTime()
        if (total > 0) {
          const remainingPct = (diff / total) * 100
            setTimeProgress(Math.min(100, Math.max(0, remainingPct)))
        } else setTimeProgress(null)
      } else {
        setTimeProgress(null)
      }
    }

    calculateTimeLeft()
    const interval = setInterval(calculateTimeLeft, 60000) // Update every minute
    return () => clearInterval(interval)
  }, [election])
  
  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-12 text-center shadow-2xl"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div 
            className="h-12 w-12 mx-auto mb-6 rounded-full border-4 border-white/10 border-t-amber-400 shadow-lg"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <motion.p
            className="text-white/80 text-lg font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Loading election details...
          </motion.p>
          <motion.p
            className="text-white/60 text-sm mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Please wait while we prepare your voting experience
          </motion.p>
        </motion.div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-8 my-8 sm:my-10">
      {/* Light, less intrusive background accents */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-32 left-10 w-56 h-56 bg-gradient-to-br from-purple-400/15 to-pink-400/15 rounded-full blur-3xl" />
        <div className="absolute bottom-24 right-10 w-64 h-64 bg-gradient-to-br from-blue-400/15 to-cyan-400/15 rounded-full blur-3xl" />
      </div>

      {/* Header - simplified */}
      <div className="relative z-10 mb-10 text-center">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl sm:text-4xl font-bold tracking-tight"
        >
          <span className="bg-gradient-to-r from-amber-300 via-yellow-400 to-orange-400 bg-clip-text text-transparent">Cast Your Vote</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mt-4 text-sm sm:text-base text-white/70 max-w-2xl mx-auto"
        >
          Select a position and support outstanding candidates in the <span className="text-white font-medium">{election?.name}</span>
        </motion.p>
      </div>

      {/* Slim Election Info Bar (less clutter) */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.2 }}
        className="relative z-10 mx-auto mb-10 w-full max-w-5xl"
      >
        <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl px-5 py-4 shadow-lg">
          <div className="flex flex-wrap items-center gap-3">
            {/* Time chip */}
            <div className="flex items-center gap-2 rounded-lg border border-amber-400/25 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-200">
              <Clock className="h-4 w-4" />
              <span aria-live="polite">{timeLeft || 'Calculating…'}</span>
            </div>
            {/* Positions chip */}
            <div className="flex items-center gap-2 rounded-lg border border-blue-400/25 bg-blue-500/10 px-3 py-1.5 text-xs font-medium text-blue-200">
              <BarChart className="h-4 w-4" />
              <span>{election?.positions.length || 0} Positions</span>
            </div>
            <div className="ml-auto flex items-center gap-3">
              <button
                onClick={() => router.push('/results')}
                className="group relative overflow-hidden rounded-lg border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold text-white/80 hover:text-white hover:bg-white/15 transition-colors"
              >
                View Results
              </button>
            </div>
          </div>
          {/* Progress bar (hidden if no start_date) */}
          {timeProgress !== null && (
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 transition-[width] duration-700"
                  style={{ width: `${timeProgress}%` }}
                  aria-label="Time remaining"
                />
              </div>
              <span className="text-[10px] font-medium text-white/50 w-10 text-right">{Math.round(timeProgress)}%</span>
            </div>
          )}
        </div>
      </motion.div>
      
      {/* Positions List */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="relative z-10"
      >
        <PositionList 
          positions={election?.positions || []}
          electionName={election?.name || 'Current Election'}
        />
      </motion.div>
    </div>
  )
}

export default PositionsPage
