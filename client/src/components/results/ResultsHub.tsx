'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Calendar, Trophy } from 'lucide-react'
import ElectionResults from './ElectionResults'
import PastElections from './PastElections'
import { ElectionPositions } from '@/@types/db'
import { useRouter } from 'next/navigation'

type ResultsHubProps = {
  latestResults: any
  pastElections: ElectionPositions[]
}

const ResultsHub = ({ latestResults, pastElections }: ResultsHubProps) => {  const [currentView, setCurrentView] = useState<'latest' | 'past'>('latest')
  const router = useRouter()
  
  const handleViewPastElections = () => {
    setCurrentView('past')
  }
    const handleSelectElection = (election: ElectionPositions) => {
    // Navigate to the detailed results page
    router.push(`/results/${election.id}`)
  }
    const handleBackToLatest = () => {
    setCurrentView('latest')
  }
    // If viewing past elections
  if (currentView === 'past') {
    return (
      <PastElections 
        elections={pastElections}
        onSelectElection={handleSelectElection}
        onBack={handleBackToLatest}
      />
    )
  }
  
  // Default view - latest results
  if (!latestResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br p-4 md:p-8 flex flex-col items-center justify-center">
        <div className="backdrop-blur-md bg-white/5 rounded-2xl border border-white/20 p-8 max-w-md mx-auto text-center">
          <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
            <Trophy className="h-8 w-8 text-white/50" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">No Recent Results</h2>
          <p className="text-white/70 mb-6">No concluded elections found at this time.</p>
          
          {pastElections.length > 0 && (
            <button
              onClick={handleViewPastElections}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 text-white font-medium hover:from-purple-500/30 hover:to-blue-500/30 transition-all"
            >
              View Past Elections
            </button>
          )}
        </div>
      </div>
    )
  }
  
  return (
    <div className="relative">
      {/* <ElectionResults data={latestResults} /> */}
      
      {/* Past Elections Button */}
      {pastElections.length > 0 && (
        <motion.div 
          className="fixed bottom-8 right-8 z-40 hidden"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
        >
            <button
              onClick={handleViewPastElections}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500/20 to-blue-500/20 hover:from-purple-500/30 hover:to-blue-500/30 text-white font-medium transition-all duration-300 shadow-2xl backdrop-blur-xl border border-white/20 hover:border-white/30 hover:shadow-purple-500/25 hover:shadow-xl relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent rounded-xl" />
              <span className="relative z-10 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                View Past Elections
              </span>
            </button>
        </motion.div>
      )}
    </div>
  )
}

export default ResultsHub