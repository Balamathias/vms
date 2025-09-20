'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Crown, Medal, Award, Users, Calendar, Clock, ChevronDown, ArrowLeft, Download, Star } from 'lucide-react'
import { useRouter } from 'next/navigation'
import WinnerCertificate from './WinnerCertificate'

type Candidate = {
  student_id: string
  student_name: string
  picture: string
  vote_count: number
  photo?: string
}

type PositionResult = {
  position_id: string
  position_name: string
  candidates: Candidate[]
}

type Position = {
  id: string
  name: string
  candidate_count: number
  election_name: string
  candidates: null
  has_voted: boolean
}

type ElectionData = {
  id: string
  name: string
  start_date: string
  end_date: string
  positions: Position[]
  results: PositionResult[]
}

type ElectionResultsProps = {
  data: ElectionData
  showBackButton?: boolean
}

const ElectionResults = ({ data, showBackButton = false }: ElectionResultsProps) => {
  const [expandedPositions, setExpandedPositions] = useState<Set<string>>(new Set())
  const [showCertificate, setShowCertificate] = useState<{
    show: boolean
    candidate?: Candidate
    position?: PositionResult
    rank?: number
  }>({ show: false })
  const router = useRouter()
  
  const togglePosition = (positionId: string) => {
    const newExpanded = new Set(expandedPositions)
    if (newExpanded.has(positionId)) {
      newExpanded.delete(positionId)
    } else {
      newExpanded.add(positionId)
    }
    setExpandedPositions(newExpanded)
  }

  const generateCertificate = (candidate: Candidate, position: PositionResult, rank: number) => {
    setShowCertificate({
      show: true,
      candidate,
      position,
      rank
    })
  }

  const closeCertificate = () => {
    setShowCertificate({ show: false })
  }
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  const getPositionIcon = (index: number) => {
    switch (index % 4) {
      case 0: return <Trophy className="h-5 w-5 text-amber-300" />
      case 1: return <Crown className="h-5 w-5 text-purple-300" />
      case 2: return <Medal className="h-5 w-5 text-blue-300" />
      default: return <Award className="h-5 w-5 text-green-300" />
    }
  }
  
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Trophy className="h-6 w-6 text-amber-400" />
      case 2: return <Medal className="h-6 w-6 text-gray-400" />
      case 3: return <Medal className="h-6 w-6 text-amber-600" />
      default: return <Award className="h-5 w-5 text-blue-400" />
    }
  }
  
  const getRankBackground = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border-amber-500/30'
      case 2: return 'bg-gradient-to-r from-gray-400/20 to-gray-500/20 border-gray-400/30'
      case 3: return 'bg-gradient-to-r from-amber-600/20 to-amber-700/20 border-amber-600/30'
      default: return 'bg-white/5 border-white/20'
    }
  }
  
  // Group results by position for easier access
  const resultsByPosition = data.results.reduce((acc, result) => {
    acc[result.position_id] = result
    return acc
  }, {} as Record<string, PositionResult>)
  
  return (
    <div className="min-h-screen bg-gradient-to-br p-4 md:p-8 py-10">
      <div className="max-w-6xl mx-auto">        {/* Header */}
        <motion.div 
          className="mb-12 text-center relative"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {showBackButton && (
            <button 
              onClick={() => router.back()}
              className="absolute left-0 -top-4 sm:top-1/2 -translate-y-1/2 flex items-center text-white/70 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              <span>Back</span>
            </button>
          )}
          {/* Animated background */}
          <div className="absolute inset-0 -z-10 opacity-30">
            <motion.div 
              className="absolute inset-0"
              animate={{ 
                background: [
                  'radial-gradient(circle at 30% 30%, rgba(156, 39, 176, 0.3) 0%, transparent 70%)',
                  'radial-gradient(circle at 70% 70%, rgba(33, 150, 243, 0.3) 0%, transparent 70%)',
                  'radial-gradient(circle at 30% 70%, rgba(76, 175, 80, 0.3) 0%, transparent 70%)',
                ]
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            />
          </div>
          
          <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-400/20 to-orange-500/20 backdrop-blur-sm border border-amber-500/30">
            <Trophy className="h-10 w-10 text-amber-300" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-amber-300 to-yellow-500 text-transparent bg-clip-text">
              Election Results
            </span>
          </h1>
          
          <h2 className="text-2xl font-semibold text-white/90 mb-6">{data.name}</h2>
          
          {/* Election Info */}
          <div className="flex flex-col md:flex-row justify-center items-center gap-6 text-white/70">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Started: {formatDate(data.start_date)}</span>
            </div>
            <div className="hidden md:block w-px h-6 bg-white/20" />
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Ended: {formatDate(data.end_date)}</span>
            </div>
            <div className="hidden md:block w-px h-6 bg-white/20" />
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>{data.positions.length} Positions</span>
            </div>
          </div>
        </motion.div>
        
        {/* Results Grid */}
        <div className="space-y-6">
          {data.positions.map((position, index) => {
            const positionResult = resultsByPosition[position.id]
            const isExpanded = expandedPositions.has(position.id)
            const hasResults = positionResult && positionResult.candidates.length > 0
            
            return (
              <motion.div
                key={position.id}
                className="backdrop-blur-md bg-white/5 rounded-2xl border border-white/20 overflow-hidden shadow-xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                {/* Position Header */}
                <div 
                  className="p-6 cursor-pointer hover:bg-white/5 transition-colors"
                  onClick={() => togglePosition(position.id)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-white/10 border border-white/10">
                        {getPositionIcon(index)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-base sm:text-xl font-bold text-white truncate">{position.name}</h3>
                        <p className="text-white/60 text-sm">
                          {hasResults 
                            ? `${positionResult.candidates.length} candidates received votes`
                            : 'No votes recorded yet'
                          }
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between sm:justify-end gap-4">
                      {hasResults && (
                        <div className="text-left sm:text-right flex-1 sm:flex-none min-w-0">
                          <p className="text-white/80 text-sm font-medium truncate">
                            Winner: {positionResult.candidates[0]?.student_name}
                          </p>
                          <p className="text-white/60 text-xs">
                            {positionResult.candidates[0]?.vote_count} votes
                          </p>
                        </div>
                      )}
                      
                      <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                        className="flex-shrink-0"
                      >
                        <ChevronDown className="h-5 w-5 text-white/60" />
                      </motion.div>
                    </div>
                  </div>
                </div>
                
                {/* Expandable Results */}
                {isExpanded && (
                  <motion.div
                    className="border-t border-white/10"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {hasResults ? (
                      <div className="p-6 space-y-4">
                        {positionResult.candidates
                          .sort((a, b) => b.vote_count - a.vote_count)
                          .map((candidate, candidateIndex) => {
                            const rank = candidateIndex + 1
                            return (
                              <motion.div
                                key={candidate.student_id}
                                className={`flex items-center gap-4 p-4 rounded-xl border ${getRankBackground(rank)}`}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.4, delay: candidateIndex * 0.1 }}
                              >
                                {/* Rank Icon */}
                                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-white/10">
                                  {getRankIcon(rank)}
                                </div>
                                
                                {/* Candidate Photo */}
                                <div className="relative">
                                  <img 
                                    src={candidate?.photo || candidate.picture} 
                                    alt={candidate.student_name}
                                    className="w-16 h-16 rounded-xl object-cover border-2 border-white/20"
                                  />
                                  {rank === 1 && (
                                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center">
                                      <Crown className="h-3 w-3 text-white" />
                                    </div>
                                  )}
                                </div>
                                
                                {/* Candidate Info */}
                                <div className="flex-1">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <h4 className="text-white font-semibold text-base sm:text-lg">
                                        {candidate.student_name}
                                      </h4>
                                      <p className="text-white/60 text-sm">
                                        Rank #{rank}
                                      </p>
                                    </div>
                                    
                                    <div className="flex items-center gap-3 relative">
                                      <div className="text-right">
                                        <p className="text-2xl font-bold text-white">
                                          {candidate.vote_count}
                                        </p>
                                        <p className="text-white/60 text-sm">
                                          {candidate.vote_count === 1 ? 'vote' : 'votes'}
                                        </p>
                                      </div>
                                      
                                      {/* Certificate Download Button */}
                                      {rank <= 3 && (
                                        <motion.button
                                          className="flex_ items-center gap-2 bg-transparent text-white p-0 rounded-lg shadow-lg hover:from-amber-600 hover:to-yellow-700 transition-all duration-200 absolute overflow-hidden group right-1 top-5 hidden"
                                          onClick={() => generateCertificate(candidate, positionResult, rank)}
                                          whileHover={{ scale: 1.05 }}
                                          whileTap={{ scale: 0.95 }}
                                          title="Download Certificate"
                                        >
                                          <Download className="h-4 w-4" />
                                          {/* <Star className="h-4 w-4" /> */}
                                        </motion.button>
                                      )}
                                    </div>
                                  </div>
                                  
                                  {/* Vote Progress Bar */}
                                  <div className="mt-3 w-full bg-white/10 rounded-full h-2">
                                    <motion.div 
                                      className="h-2 rounded-full bg-gradient-to-r from-amber-400 to-orange-500"
                                      initial={{ width: 0 }}
                                      animate={{ 
                                        width: `${(candidate.vote_count / Math.max(...positionResult.candidates.map(c => c.vote_count))) * 100}%` 
                                      }}
                                      transition={{ duration: 1, delay: candidateIndex * 0.2 }}
                                    />
                                  </div>
                                </div>
                              </motion.div>
                            )
                          })}
                      </div>
                    ) : (
                      <div className="p-6 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-4">
                          <Users className="h-8 w-8 text-white/50" />
                        </div>
                        <h4 className="text-white/80 text-lg font-medium mb-2">No Results Yet</h4>
                        <p className="text-white/60 text-sm">
                          Voting for this position hasn't concluded or no votes were cast.
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}
              </motion.div>
            )
          })}
        </div>
        
        {/* Summary Stats */}
        <motion.div 
          className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <div className="backdrop-blur-md bg-white/5 rounded-2xl border border-white/20 p-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-amber-500/20 mb-4">
              <Trophy className="h-6 w-6 text-amber-300" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">
              {data.results.length}
            </h3>
            <p className="text-white/70">Positions with Results</p>
          </div>
          
          <div className="backdrop-blur-md bg-white/5 rounded-2xl border border-white/20 p-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-500/20 mb-4">
              <Users className="h-6 w-6 text-blue-300" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">
              {data.results.reduce((acc, result) => acc + result.candidates.length, 0)}
            </h3>
            <p className="text-white/70">Total Vote Recipients</p>
          </div>
          
          <div className="backdrop-blur-md bg-white/5 rounded-2xl border border-white/20 p-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-green-500/20 mb-4">
              <Award className="h-6 w-6 text-green-300" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">
              {data.results.reduce((acc, result) => 
                acc + result.candidates.reduce((sum, candidate) => sum + candidate.vote_count, 0), 0
              )}
            </h3>
            <p className="text-white/70">Total Votes Cast</p>
          </div>
        </motion.div>
      </div>

      {/* Certificate Modal */}
      {showCertificate.show && showCertificate.candidate && showCertificate.position && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="relative max-w-6xl w-full max-h-[90vh] overflow-auto">
            <button
              onClick={closeCertificate}
              className="absolute top-4 right-4 z-10 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 transition-colors"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <WinnerCertificate
              winnerName={showCertificate.candidate.student_name}
              positionName={showCertificate.position.position_name}
              electionName={data.name}
              voteCount={showCertificate.candidate.vote_count}
              winnerImage={showCertificate.candidate.photo || showCertificate.candidate.picture}
              rank={showCertificate.rank || 1}
              onDownload={closeCertificate}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default ElectionResults