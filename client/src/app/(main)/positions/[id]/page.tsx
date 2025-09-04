'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Award, Check, Users, Maximize2, X } from 'lucide-react'
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
  const [fullImageCandidate, setFullImageCandidate] = useState<any | null>(null)
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)

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
    if (position?.has_voted) return
    setSelectedCandidate(candidateId)
    setShowConfirmModal(true)
  }

  const openFullImage = useCallback((candidate: any) => {
    setFullImageCandidate(candidate)
  }, [])

  const closeFullImage = useCallback(() => setFullImageCandidate(null), [])
  
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

  // Keyboard accessibility for selecting focused candidate card
  const onKeySelect = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleCandidateSelect(id)
    }
  }

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-12 w-12 rounded-full border-4 border-white/10 border-t-amber-400 animate-spin" />
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br p-4 md:p-8 my-10 relative overflow-hidden">
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
            {!!searchTerm && (
              <div className="absolute -bottom-6 left-1 text-[11px] text-white/40">{filteredCandidates.length} match{filteredCandidates.length!==1 && 'es'}</div>
            )}
          </div>
        </motion.div>
        
        {/* Candidates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {filteredCandidates.length > 0 ? (
            filteredCandidates.map((candidate, index) => (
              <motion.div
                key={candidate.id}
                className={`group relative backdrop-blur-md rounded-2xl border overflow-hidden shadow-lg transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 cursor-pointer 
                          ${selectedCandidate === candidate.id 
                            ? 'border-amber-400/50 bg-white/15 ring-2 ring-amber-300/40' 
                            : 'border-white/15 bg-white/5 hover:bg-white/10'} ${position?.has_voted ? 'opacity-60 cursor-not-allowed' : ''}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
                whileHover={!position?.has_voted ? { y: -5 } : {}}
                onClick={() => handleCandidateSelect(candidate.id)}
                tabIndex={position?.has_voted ? -1 : 0}
                onKeyDown={(e) => onKeySelect(e, candidate.id)}
                onMouseEnter={() => setHoveredCard(candidate.id)}
                onMouseLeave={() => setHoveredCard(c => c === candidate.id ? null : c)}
              >
                {/* Candidate Image */}
                <div className="relative h-52 overflow-hidden">
                  {/* Fiery shimmer overlay */}
                  <div className="absolute inset-0 z-10 mix-blend-screen opacity-0 group-hover:opacity-70 transition-opacity duration-700 pointer-events-none">
                    <div className="absolute -inset-[40%] animate-[spin_12s_linear_infinite] bg-[conic-gradient(from_0deg,var(--tw-gradient-stops))] from-transparent via-orange-400/30 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  </div>
                  <img 
                    src={candidate.picture} 
                    alt={candidate?.full_name}
                    className={`w-full h-full object-cover object-center transition-transform duration-700 ${hoveredCard===candidate.id ? 'scale-105' : 'scale-100'}`}
                  />
                  {/* Name + subtle underline flame */}
                  <div className="absolute bottom-4 left-4 right-4 z-20">
                    <h3 className="text-lg font-semibold text-white tracking-wide flex items-center gap-2">
                      {candidate?.full_name}
                      {selectedCandidate === candidate.id && (
                        <span className="inline-flex h-2 w-2 rounded-full bg-amber-400 animate-ping" />
                      )}
                    </h3>
                    <div className="mt-1 h-px w-1/3 bg-gradient-to-r from-amber-400 via-orange-500 to-transparent" />
                  </div>
                  {/* Floating ember particles (lightweight) */}
                  <div className="pointer-events-none absolute inset-0">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <span
                        key={i}
                        className="absolute block h-1 w-1 rounded-full bg-amber-400/50 animate-ember"
                        style={{
                          top: `${Math.random()*90}%`,
                          left: `${Math.random()*90}%`,
                          animationDelay: `${Math.random()*6}s`,
                          animationDuration: `${4 + Math.random()*6}s`
                        }}
                      />
                    ))}
                  </div>
                  {/* View image button */}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); openFullImage(candidate) }}
                    className="absolute top-3 right-3 z-30 inline-flex items-center gap-1 rounded-md bg-black/40 backdrop-blur px-2 py-1 text-[10px] font-medium text-white/80 hover:text-white hover:bg-black/50 border border-white/10"
                  >
                    <Maximize2 className="h-3 w-3" />
                    View
                  </button>
                </div>
                
                {/* Candidate Bio */}
                <div className="p-4 space-y-4">
                  <p className="text-white/70 text-sm leading-relaxed line-clamp-3 relative">
                    {candidate?.bio}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleCandidateSelect(candidate.id) }}
                      className={`flex-1 p-3 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-all
                                 ${position?.has_voted 
                                   ? 'bg-white/5 border border-white/10 text-white/40 cursor-not-allowed'
                                   : selectedCandidate === candidate.id
                                   ? 'bg-gradient-to-r from-amber-500/30 to-orange-500/30 border border-amber-400/40 text-white shadow-inner'
                                   : 'bg-white/5 border border-white/15 text-white/80 hover:bg-white/10 hover:border-white/25'}`}
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
                        <span>Select</span>
                      )}
                    </button>
                  </div>
                </div>
                {/* Animated fiery border when selected */}
                {selectedCandidate === candidate.id && (
                  <motion.div
                    layoutId="selected-ring"
                    className="pointer-events-none absolute inset-0 rounded-2xl border-2 border-amber-400/40"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4 }}
                  >
                    <div className="absolute -inset-[2px] rounded-2xl bg-[conic-gradient(from_0deg,rgba(255,200,0,0.25),rgba(255,80,0,0.35),rgba(255,160,0,0.25),rgba(255,200,0,0.25))] animate-[spin_7s_linear_infinite] mix-blend-screen opacity-60" />
                  </motion.div>
                )}
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
                className="relative bg-gradient-to-b from-white/10 via-white/5 to-white/10 backdrop-blur-2xl border border-white/15 rounded-2xl p-8 max-w-lg w-full mx-4 shadow-2xl overflow-hidden"
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Dynamic animated aurora background */}
                <div className="pointer-events-none absolute -inset-[40%] opacity-40">
                  <motion.div
                    className="absolute inset-0 bg-[conic-gradient(from_0deg,rgba(255,180,0,0.15),rgba(255,90,0,0.15),rgba(255,150,0,0.15),rgba(255,180,0,0.15))]"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
                  />
                </div>
                <button
                  onClick={handleCancelVote}
                  className="absolute right-3 top-3 text-white/50 hover:text-white transition-colors p-1 rounded-md bg-white/5 hover:bg-white/10"
                  aria-label="Close confirmation dialog"
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="relative z-10">
                  <div className="text-center mb-6">
                    <div className="mx-auto w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mb-4 shadow-inner shadow-amber-400/30">
                      <Award className="h-8 w-8 text-amber-300" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-1">Confirm Your Vote</h2>
                    <p className="text-white/60 text-sm">Final step • Please verify your selection</p>
                  </div>
                  {getSelectedCandidateInfo() && (
                    <motion.div
                      className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10 flex gap-4 items-center"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <div className="relative group/image">
                        <img
                          src={getSelectedCandidateInfo()?.picture}
                          alt={getSelectedCandidateInfo()?.full_name}
                          className="w-16 h-16 rounded-lg object-cover ring-1 ring-white/20"
                        />
                        <button
                          type="button"
                          onClick={() => openFullImage(getSelectedCandidateInfo())}
                          className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/60 opacity-0 group-hover/image:opacity-100 transition-opacity text-[10px] font-medium text-white gap-1"
                        >
                          <Maximize2 className="h-3.5 w-3.5" /> View
                        </button>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-semibold truncate">{getSelectedCandidateInfo()?.full_name}</h3>
                        <p className="text-white/50 text-xs">Position: {position?.name}</p>
                        <p className="mt-2 text-[11px] text-white/50 line-clamp-2">{getSelectedCandidateInfo()?.bio}</p>
                      </div>
                    </motion.div>
                  )}
                  <div className="flex gap-3">
                    <motion.button
                      onClick={handleCancelVote}
                      className="flex-1 py-3 px-4 rounded-xl bg-white/5 border border-white/15 text-white/80 hover:bg-white/10 transition-colors text-sm font-medium"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      onClick={handleConfirmVote}
                      disabled={voting}
                      className="relative flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                      whileHover={{ scale: voting ? 1 : 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <span className="relative z-10">
                        {voting ? (
                          <span className="inline-flex items-center gap-2"><span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Voting...</span>
                        ) : 'Confirm Vote'}
                      </span>
                      <div className="absolute inset-0 rounded-xl opacity-0 hover:opacity-20 bg-[radial-gradient(circle_at_center,white,transparent_70%)] transition-opacity" />
                    </motion.button>
                  </div>
                  <p className="text-white/40 text-[11px] text-center mt-4 leading-relaxed">
                    Submitting is irreversible. Your selection is anonymized & securely recorded.
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Full Image Lightbox */}
        <AnimatePresence>
          {fullImageCandidate && (
            <motion.div
              className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeFullImage}
            >
              <motion.div
                className="relative max-w-3xl w-full mx-4"
                initial={{ scale: 0.92, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.92, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={closeFullImage}
                  className="absolute right-3 top-3 z-20 rounded-full bg-black/60 p-2 text-white/70 hover:text-white hover:bg-black/70"
                  aria-label="Close image preview"
                >
                  <X className="h-5 w-5" />
                </button>
                <div className="rounded-2xl overflow-hidden border border-white/15 bg-black/40">
                  <img
                    src={fullImageCandidate.picture}
                    alt={fullImageCandidate.full_name}
                    className="w-full h-[70vh] object-contain bg-black/50"
                  />
                </div>
                <div className="mt-3 text-center">
                  <h3 className="text-white font-semibold text-lg">{fullImageCandidate.full_name}</h3>
                  <p className="text-white/50 text-sm max-w-xl mx-auto line-clamp-3">{fullImageCandidate.bio}</p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Loading Overlay */}
        <AnimatePresence>
          {voting && (
            <motion.div
              className="fixed inset-0 z-[70] flex items-center justify-center bg-black/75 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-red-500/10 backdrop-blur-xl border border-white/15 rounded-2xl p-8 max-w-sm w-full text-center shadow-xl"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
              >
                <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-gradient-to-br from-amber-400/30 to-orange-500/30">
                  <div className="h-8 w-8 rounded-full border-4 border-white/30 border-t-white animate-spin" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Submitting Your Vote</h2>
                <p className="text-white/60 text-sm">Securing & recording on the ledger...</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Success Overlay */}
        <AnimatePresence>
          {isVoteSuccess && (
            <motion.div
              className="fixed inset-0 z-[80] flex items-center justify-center bg-black/75 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="relative bg-gradient-to-br from-green-500/10 via-emerald-500/10 to-green-400/10 backdrop-blur-xl border border-white/10 rounded-2xl p-8 max-w-md w-full text-center overflow-hidden"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
              >
                <div className="pointer-events-none absolute -inset-[30%] opacity-40">
                  <motion.div
                    className="absolute inset-0 bg-[conic-gradient(from_0deg,rgba(0,200,120,0.25),rgba(0,160,100,0.2),rgba(0,220,140,0.25),rgba(0,200,120,0.25))]"
                    animate={{ rotate: -360 }}
                    transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
                  />
                </div>
                <div className="mx-auto w-16 h-16 bg-green-500/25 rounded-full flex items-center justify-center mb-4 shadow-inner shadow-green-300/30">
                  <Check className="h-8 w-8 text-green-300" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Vote Submitted!</h2>
                <p className="text-white/70 mb-6 text-sm">Your vote has been securely recorded.</p>
                <p className="text-white/50 text-xs">Redirecting to positions...</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default PositionDetailPage

// Extra animations
declare global {
  // eslint-disable-next-line no-var
  var __emberCSSInjected: boolean | undefined
}

if (typeof window !== 'undefined' && !globalThis.__emberCSSInjected) {
  const style = document.createElement('style')
  style.innerHTML = `@keyframes emberFloat {0%{transform:translateY(0) scale(1);opacity:.6}50%{transform:translateY(-18px) scale(.8);opacity:.3}100%{transform:translateY(0) scale(1);opacity:.6}}
  .animate-ember{animation:emberFloat 5s ease-in-out infinite}
  @media (prefers-reduced-motion: reduce){.animate-ember{animation:none}}
  `
  document.head.appendChild(style)
  globalThis.__emberCSSInjected = true
}
