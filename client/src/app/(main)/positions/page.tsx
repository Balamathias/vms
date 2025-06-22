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
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-12 w-12 rounded-full border-4 border-white/10 border-t-white/80 animate-spin" />
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br p-4 md:p-8 py-10">
      {/* Header section */}
      <div className="mb-12 text-center relative">
        <motion.div
          className="absolute inset-0 -z-10 opacity-30"
          animate={{ 
            background: [
              'radial-gradient(circle at 30% 30%, rgba(156, 39, 176, 0.3) 0%, transparent 70%)',
              'radial-gradient(circle at 70% 70%, rgba(33, 150, 243, 0.3) 0%, transparent 70%)',
              'radial-gradient(circle at 30% 70%, rgba(76, 175, 80, 0.3) 0%, transparent 70%)',
            ]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        />
        
        <motion.h1 
          className="text-3xl md:text-4xl font-bold text-white mb-2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="bg-gradient-to-r from-amber-300 to-yellow-500 text-transparent bg-clip-text">
            Cast Your Vote
          </span>
        </motion.h1>
        
        <motion.p 
          className="text-white/70 text-lg max-w-2xl mx-auto"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Select a position below to vote for your favorite candidates in the {election?.name}
        </motion.p>
      </div>
      
      {/* Election Info Bar */}
      <motion.div 
        className="mb-10 backdrop-blur-md bg-white/5 border border-white/20 rounded-2xl p-4 max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="flex items-center gap-2 text-white/90">
          <Clock className="h-5 w-5 text-amber-300" />
          <span>{timeLeft}</span>
        </div>
        
        <div className="h-10 w-px bg-white/10 hidden md:block" />
        
        <div className="flex items-center gap-2 text-white/90">
          <BarChart className="h-5 w-5 text-blue-300" />
          <span>{election?.positions.length} Positions Available</span>
        </div>
        
        <div className="h-10 w-px bg-white/10 hidden md:block" />
        
        <button onClick={() => router.push(`/results`)} className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white transition-colors cursor-pointer">
          View Results
        </button>
      </motion.div>
      
      {/* Positions List */}
      <PositionList 
        positions={election?.positions || []}
        electionName={election?.name!}
      />
    </div>
  )
}

export default PositionsPage
