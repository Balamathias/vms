'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Award, Check, Users } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { usePosition, useVoteCandidate } from '@/services/client/api'
import { toast } from 'sonner'

const PositionDetailPage = () => {
  const router = useRouter()

  const params = useParams()
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [isVoteSuccess, setIsVoteSuccess] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const { data: positionData, isPending } = usePosition(params?.id as any)
  const { mutate: vote, isPending: voting } = useVoteCandidate()

  const position = positionData?.data
  const candidates = position?.candidates || []
  // Filter candidates based on search term
  const filteredCandidates = candidates?.filter(candidate => 
    candidate?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate?.bio?.toLowerCase().includes(searchTerm.toLowerCase())
  )
  
  const handleCandidateSelect = (candidateId: string) => {
    setSelectedCandidate(candidateId)
    setShowConfirmModal(true)
  }
  
  const handleConfirmVote = () => {
    if (!selectedCandidate) return
    
    vote({position: params?.id as any, student_voted_for: selectedCandidate}, {
      onSuccess: (data) => {
        if (data?.error) {
          console.error("Vote submission failed:", data.error)
          toast.error("An error occurred while submitting your vote, please try again.")
          return
        }
        setIsVoteSuccess(true)
        setTimeout(() => {
          setIsVoteSuccess(false)
          router.replace('/positions')
        }, 2000)
      },
      onError: (error) => {
        console.error("Vote submission error:", error)
        toast.error("An error occurred while submitting your vote, please try again.")
      },
    })
  }
  
  const handleCancelVote = () => {
    setShowConfirmModal(false)
    setSelectedCandidate(null)
  }
  
  const getSelectedCandidateInfo = () => {
    return candidates?.find(candidate => candidate.id === selectedCandidate)
  }
  
  const goBack = () => {
    router.back()
  }

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-12 w-12 rounded-full border-4 border-white/10 border-t-white/80 animate-spin" />
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br p-4 md:p-8 py-10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div 
          className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <button 
              onClick={goBack}
              className="mb-4 flex items-center text-white/70 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              <span>Back to Positions</span>
            </button>
            
            <h1 className="text-xl sm:text-3xl font-bold text-white flex items-center gap-3">
              <Award className="h-6 w-6 text-amber-300" />
                {position?.name}{position?.gender_restriction === 'any' ? '' : (' | ' + position?.gender_restriction?.charAt(0).toUpperCase() + position?.gender_restriction?.slice(1))}
            </h1>
            <p className="text-white/70 mt-1">{position?.election_name}</p>
          </div>
            <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/20 rounded-xl text-white/80">
              <Users className="h-4 w-4" />
              <span>{position?.candidates.length} Candidates</span>
            </div>
            
            {/* Vote Status Indicator */}
            {position?.has_voted && (
              <motion.div 
                className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-xl text-green-300"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Check className="h-4 w-4" />
                <span className="text-sm font-medium">Vote Cast</span>
              </motion.div>
            )}
          </div>
        </motion.div>
          {/* Voting Instructions */}
        <motion.div 
          className="mb-10 p-4 rounded-xl border border-white/20 bg-white/5 backdrop-blur-sm text-white/80"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {position?.has_voted ? (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                <Check className="h-4 w-4 text-green-300" />
              </div>
              <div>
                <p className="text-green-300 font-medium">You have already voted for this position</p>
                <p className="text-white/60 text-sm">Thank you for participating in the election!</p>
              </div>
            </div>
          ) : (
            <p>Select one candidate below to cast your vote for this position.</p>
          )}
        </motion.div>
        
        {/* Search bar */}
        <motion.div 
          className="mb-6 relative"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="relative max-w-md mx-auto">
            <input
              type="text"
              placeholder="Search candidates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-3 pl-10 pr-4 rounded-xl border border-white/20 
                       bg-white/5 backdrop-blur-md text-white placeholder:text-white/50
                       focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30"
            />
            {searchTerm ? (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </button>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            )}
          </div>
        </motion.div>
        
        {/* Candidates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {filteredCandidates.length > 0 ? (
            filteredCandidates.map((candidate, index) => (
              <motion.div
                key={candidate.id}
                className={`relative backdrop-blur-md rounded-2xl border overflow-hidden shadow-lg transition-all duration-300 
                          ${selectedCandidate === candidate.id 
                            ? 'border-amber-400/50 bg-white/15 ring-2 ring-amber-300/50' 
                            : 'border-white/20 bg-white/10 hover:bg-white/15'}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                {/* Candidate Image */}
                <div className="relative h-48 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10" />
                  <img 
                    src={candidate.picture} 
                    alt={candidate?.full_name}
                    className="w-full h-full object-cover object-center"
                  />
                  <div className="absolute bottom-4 left-4 right-4 z-20">
                    <h3 className="text-xl font-bold text-white">{candidate?.full_name}</h3>
                  </div>
                </div>
                
                {/* Candidate Bio */}
                <div className="p-4">
                  <p className="text-white/80 text-sm mb-4 line-clamp-3">{candidate?.bio}</p>                    <button
                    onClick={() => handleCandidateSelect(candidate.id)}
                    className={`w-full p-3 rounded-xl flex items-center justify-center gap-2 transition-colors
                               ${position?.has_voted 
                                 ? 'bg-white/5 border border-white/10 text-white/40 cursor-not-allowed'
                                 : selectedCandidate === candidate.id
                                 ? 'bg-amber-500/20 border border-amber-500/30 text-white'
                                 : 'bg-white/5 border border-white/20 text-white/80 hover:bg-white/10'}`}
                    disabled={position?.has_voted}
                  >
                    {position?.has_voted ? (
                      <span>Voting Closed</span>
                    ) : selectedCandidate === candidate.id ? (
                      <>
                        <Check className="h-4 w-4" />
                        <span>Selected</span>
                      </>
                    ) : (
                      <span>Select Candidate</span>
                    )}
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div 
              className="col-span-full text-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 backdrop-blur-md mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No candidates found</h3>
              <p className="text-white/70">Try adjusting your search terms</p>
            </motion.div>
          )}        </div>
        
        {/* Confirmation Modal */}
        <AnimatePresence>
          {showConfirmModal && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCancelVote}
            >
              <motion.div
                className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl"
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Animated gradient background */}
                <div className="absolute inset-0 rounded-2xl overflow-hidden">
                  <motion.div 
                    className="absolute inset-0 opacity-30"
                    animate={{ 
                      background: [
                        'linear-gradient(135deg, rgba(156, 39, 176, 0.1) 0%, rgba(33, 150, 243, 0.1) 100%)',
                        'linear-gradient(135deg, rgba(33, 150, 243, 0.1) 0%, rgba(76, 175, 80, 0.1) 100%)',
                        'linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(255, 193, 7, 0.1) 100%)',
                      ]
                    }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  />
                </div>
                
                <div className="relative z-10">
                  {/* Header */}
                  <div className="text-center mb-6">
                    <div className="mx-auto w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mb-4">
                      <Award className="h-8 w-8 text-amber-300" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Confirm Your Vote</h2>
                    <p className="text-white/70">Are you sure you want to vote for this candidate?</p>
                  </div>
                  
                  {/* Selected Candidate Info */}
                  {getSelectedCandidateInfo() && (
                    <motion.div 
                      className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <div className="flex items-center gap-4">
                        <img 
                          src={getSelectedCandidateInfo()?.picture} 
                          alt={getSelectedCandidateInfo()?.full_name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div>
                          <h3 className="text-white font-semibold">{getSelectedCandidateInfo()?.full_name}</h3>
                          <p className="text-white/60 text-sm">For {position?.name}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  
                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <motion.button
                      onClick={handleCancelVote}
                      className="flex-1 py-3 px-4 rounded-xl bg-white/5 border border-white/20 text-white/80 hover:bg-white/10 transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      onClick={handleConfirmVote}
                      disabled={voting}
                      className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500/80 to-yellow-500/80 hover:from-amber-500 hover:to-yellow-500 text-white font-semibold transition-all shadow-lg disabled:opacity-50"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {voting ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white/90 animate-spin" />
                          <span>Voting...</span>
                        </div>
                      ) : (
                        'Confirm Vote'
                      )}
                    </motion.button>
                  </div>
                  
                  {/* Fine print */}
                  <p className="text-white/50 text-xs text-center mt-4">
                    This action cannot be undone. Your vote will be recorded permanently.
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Loading Overlay */}
        <AnimatePresence>
          {voting && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 max-w-sm w-full text-center"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
              >
                <div className="mx-auto w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mb-4">
                  <div className="h-8 w-8 rounded-full border-4 border-white/30 border-t-white/90 animate-spin" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Submitting Your Vote</h2>
                <p className="text-white/70">Please wait while we process your vote...</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Success Overlay */}
        <AnimatePresence>
          {isVoteSuccess && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 max-w-md w-full text-center"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
              >
                <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                  <Check className="h-8 w-8 text-green-300" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Vote Submitted!</h2>
                <p className="text-white/70 mb-6">Your vote has been recorded successfully.</p>
                <p className="text-white/60 text-sm">Redirecting you back to positions...</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default PositionDetailPage
