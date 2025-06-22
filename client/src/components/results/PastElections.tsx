'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, ChevronRight, Clock, Trophy, Users, Vote, ArrowLeft } from 'lucide-react'
import { ElectionPositions } from '@/@types/db'

type PastElectionsProps = {
  elections: ElectionPositions[]
  onSelectElection: (election: ElectionPositions) => void
  onBack: () => void
}

const PastElections = ({ elections, onSelectElection, onBack }: PastElectionsProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
  
  const getElectionStatus = (election: ElectionPositions) => {
    const now = new Date()
    const startDate = new Date(election.start_date)
    const endDate = new Date(election.end_date)
    
    if (now < startDate) return { status: 'upcoming', color: 'blue' }
    if (now > endDate) return { status: 'concluded', color: 'green' }
    return { status: 'active', color: 'amber' }
  }
  
  const getStatusBadge = (status: string, color: string) => {
    const colors = {
      blue: 'bg-blue-500/20 border-blue-500/30 text-blue-300',
      green: 'bg-green-500/20 border-green-500/30 text-green-300',
      amber: 'bg-amber-500/20 border-amber-500/30 text-amber-300'
    }
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${colors[color as keyof typeof colors]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br p-4 md:p-8 py-10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div 
          className="mb-12 text-center relative"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <button 
            onClick={onBack}
            className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center text-white/70 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            <span>Back to Latest Results</span>
          </button>
          
          <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-purple-400/20 to-blue-500/20 backdrop-blur-sm border border-purple-500/30">
            <Vote className="h-10 w-10 text-purple-300" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-purple-300 to-blue-500 text-transparent bg-clip-text">
              Election History
            </span>
          </h1>
          
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Explore past elections and their results. Click on any election to view detailed results.
          </p>
        </motion.div>
        
        {/* Elections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {elections.map((election, index) => {
            const { status, color } = getElectionStatus(election)
            
            return (
              <motion.div
                key={election.id}
                className="backdrop-blur-md bg-white/5 rounded-2xl border border-white/20 overflow-hidden shadow-xl hover:bg-white/10 transition-all duration-300 cursor-pointer group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                onClick={() => onSelectElection(election)}
              >
                {/* Card Header */}
                <div className="p-6 pb-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 rounded-xl bg-white/10 border border-white/10">
                      <Trophy className="h-6 w-6 text-amber-300" />
                    </div>
                    {getStatusBadge(status, color)}
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-amber-300 transition-colors">
                    {election.name}
                  </h3>
                  
                  <div className="space-y-2 text-sm text-white/70">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>Started: {formatDate(election.start_date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>Ended: {formatDate(election.end_date)}</span>
                    </div>
                  </div>
                </div>
                
                {/* Card Stats */}
                <div className="px-6 pb-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 rounded-xl bg-white/5">
                      <div className="flex items-center justify-center mb-1">
                        <Users className="h-4 w-4 text-blue-300" />
                      </div>
                      <p className="text-lg font-bold text-white">{election.positions.length}</p>
                      <p className="text-xs text-white/60">Positions</p>
                    </div>
                    
                    <div className="text-center p-3 rounded-xl bg-white/5">
                      <div className="flex items-center justify-center mb-1">
                        <Vote className="h-4 w-4 text-green-300" />
                      </div>
                      <p className="text-lg font-bold text-white">
                        {election.positions.reduce((acc, pos) => acc + (pos.candidate_count || 0), 0)}
                      </p>
                      <p className="text-xs text-white/60">Candidates</p>
                    </div>
                  </div>
                </div>
                
                {/* View Results Button */}
                <div className="px-6 pb-6">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 group-hover:bg-white/10 transition-colors">
                    <span className="text-white/80 font-medium">View Results</span>
                    <ChevronRight className="h-4 w-4 text-white/60 group-hover:text-white/80 transition-colors" />
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
        
        {/* Empty State */}
        {elections.length === 0 && (
          <motion.div 
            className="text-center py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/5 backdrop-blur-md mb-6">
              <Vote className="h-10 w-10 text-white/50" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">No Past Elections</h3>
            <p className="text-white/70 max-w-md mx-auto">
              There are no previous elections to display at this time. Check back later for historical election data.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default PastElections