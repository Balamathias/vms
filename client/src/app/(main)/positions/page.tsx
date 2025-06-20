'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Clock, BarChart } from 'lucide-react'
import PositionList from '@/components/positions/PositionList'

// Temporary mock data until API integration
const mockElection = {
  id: '1',
  name: 'Graduating Class Awards 2024',
  startDate: new Date('2024-06-01T00:00:00Z'),
  endDate: new Date('2024-06-15T23:59:59Z'),
  positions: [
    { id: '1', name: 'Most Likely to Succeed', candidateCount: 5 },
    { id: '2', name: 'Best Dressed', candidateCount: 7 },
    { id: '3', name: 'Most Innovative', candidateCount: 4 },
    { id: '4', name: 'Best Smile', candidateCount: 6 },
    { id: '5', name: 'Most Athletic', candidateCount: 3 },
    { id: '6', name: 'Most Likely to Change the World', candidateCount: 5 },
  ]
}

const PositionsPage = () => {
  const [timeLeft, setTimeLeft] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    // Simulate API loading
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)
    
    return () => clearTimeout(timer)
  }, [])
  
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date()
      const difference = mockElection.endDate.getTime() - now.getTime()
      
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
  }, [])
  
  if (isLoading) {
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
          Select a position below to vote for your favorite candidates in the {mockElection.name}
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
          <span>{mockElection.positions.length} Positions Available</span>
        </div>
        
        <div className="h-10 w-px bg-white/10 hidden md:block" />
        
        <button className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white transition-colors">
          View Results
        </button>
      </motion.div>
      
      {/* Positions List */}
      <PositionList 
        positions={mockElection.positions} 
        electionName={mockElection.name}
      />
    </div>
  )
}

export default PositionsPage
