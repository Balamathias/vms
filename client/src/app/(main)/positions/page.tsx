'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Clock, BarChart } from 'lucide-react'
import PositionList from '@/components/positions/position-list'
import { useActiveElection } from '@/services/client/api'
import { useRouter } from 'next/navigation'


const PositionsPage = () => {
  const [timeLeft, setTimeLeft] = useState('')
  const router = useRouter()

  const { data: activeElection, isPending } = useActiveElection()
  const election = activeElection?.data

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date()
      const endDate = election?.end_date ? new Date(election.end_date) : null
      if (!endDate) {
        setTimeLeft('')
        return
      }
      
      const difference = endDate.getTime() - now.getTime()
      if (difference <= 0) {
        setTimeLeft('Voting closed')
        return
      }
      
      const days = Math.floor(difference / (1000 * 60 * 60 * 24))
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
      
      setTimeLeft(`${days}d ${hours}h ${minutes}m remaining`)
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
    <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Floating background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-br from-yellow-400/10 to-orange-400/10 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      {/* Header section */}
      <div className="relative z-10 mb-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 sm:p-12 mx-auto max-w-4xl shadow-2xl"
        >
          <motion.h1 
            className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <span className="bg-gradient-to-r from-amber-300 via-yellow-400 to-orange-400 text-transparent bg-clip-text">
              Cast Your Vote
            </span>
          </motion.h1>
          
          <motion.p 
            className="text-white/80 text-base sm:text-lg lg:text-xl max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Your voice matters! Select a position below to vote for exceptional candidates in the{' '}
            <span className="font-semibold text-white">{election?.name}</span>
          </motion.p>

          {/* Decorative elements */}
          <div className="absolute top-4 right-4 w-12 h-12 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-xl" />
          <div className="absolute bottom-4 left-4 w-8 h-8 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-lg" />
        </motion.div>
      </div>
      
      {/* Election Info Bar */}
      <motion.div 
        className="relative z-10 mb-12 max-w-6xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-center">
            {/* Time remaining */}
            <motion.div 
              className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-yellow-500/20 border border-amber-400/20">
                <Clock className="h-6 w-6 text-amber-300" />
              </div>
              <div>
                <div className="text-xs text-white/60 uppercase tracking-wide font-medium">Time Left</div>
                <div className="text-white font-semibold text-sm sm:text-base">{timeLeft || 'Calculating...'}</div>
              </div>
            </motion.div>

            {/* Vertical divider */}
            <div className="hidden lg:flex justify-center">
              <div className="w-px h-12 bg-gradient-to-b from-transparent via-white/20 to-transparent" />
            </div>

            {/* Positions count */}
            <motion.div 
              className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-400/20">
                <BarChart className="h-6 w-6 text-blue-300" />
              </div>
              <div>
                <div className="text-xs text-white/60 uppercase tracking-wide font-medium">Positions</div>
                <div className="text-white font-semibold text-sm sm:text-base">
                  {election?.positions.length || 0} Available
                </div>
              </div>
            </motion.div>

            {/* Vertical divider */}
            <div className="hidden lg:flex justify-center">
              <div className="w-px h-12 bg-gradient-to-b from-transparent via-white/20 to-transparent" />
            </div>

            {/* View results button */}
            <motion.button 
              onClick={() => router.push('/results')} 
              className="group relative overflow-hidden px-6 py-3 bg-gradient-to-r from-white/10 to-white/5 hover:from-white/20 hover:to-white/10 border border-white/20 hover:border-white/30 rounded-xl text-white font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <span className="relative z-10">View Results</span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </motion.button>
          </div>

          {/* Decorative background elements */}
          <div className="absolute top-2 right-2 w-8 h-8 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-sm" />
          <div className="absolute bottom-2 left-2 w-6 h-6 bg-gradient-to-br from-blue-400/10 to-cyan-400/10 rounded-full blur-sm" />
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
