'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Award, Check, Users } from 'lucide-react'
import { useRouter } from 'next/navigation'

type Candidate = {
  id: string
  name: string
  picture: string
  bio: string
}

// Mock data for now
const mockPosition = {
  id: '1',
  name: 'Most Likely to Succeed',
  election: 'Graduating Class Awards 2024',
  candidates: [
    {
      id: '1',
      name: 'Aisha Mohammed',
      picture: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&h=200&fit=crop',
      bio: 'Class president for 3 years with exceptional leadership skills and academic achievements.'
    },
    {
      id: '2',
      name: 'Emmanuel Adebayo',
      picture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&h=200&fit=crop',
      bio: 'Started a successful tech startup in his sophomore year. Dean\'s list every semester.'
    },
    {
      id: '3',
      name: 'Chukwudi Okonkwo',
      picture: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=200&h=200&fit=crop',
      bio: 'Research assistant with published papers in international journals. Scholarship recipient.'
    },
    {
      id: '4',
      name: 'Fatima Ibrahim',
      picture: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=200&h=200&fit=crop',
      bio: 'Valedictorian candidate with multiple job offers from top companies before graduation.'
    }
  ]
}

const PositionDetailPage = ({ params }: { params: { id: string } }) => {
  const router = useRouter()
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isVoteSuccess, setIsVoteSuccess] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  
  // Filter candidates based on search term
  const filteredCandidates = mockPosition.candidates.filter(candidate => 
    candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.bio.toLowerCase().includes(searchTerm.toLowerCase())
  )
  
  const handleVote = () => {
    if (!selectedCandidate) return
    
    setIsSubmitting(true)
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      setIsVoteSuccess(true)
      
      // Reset after showing success message
      setTimeout(() => {
        router.push('/positions')
      }, 2000)
    }, 1500)
  }
  
  const goBack = () => {
    router.back()
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
            
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Award className="h-6 w-6 text-amber-300" />
              {mockPosition.name}
            </h1>
            <p className="text-white/70 mt-1">{mockPosition.election}</p>
          </div>
          
          <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/20 rounded-xl text-white/80">
            <Users className="h-4 w-4" />
            <span>{mockPosition.candidates.length} Candidates</span>
          </div>
        </motion.div>
        
        {/* Voting Instructions */}
        <motion.div 
          className="mb-10 p-4 rounded-xl border border-white/20 bg-white/5 backdrop-blur-sm text-white/80"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <p>Select one candidate below and click "Submit Vote" to cast your vote for this position.</p>
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
                    alt={candidate.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-4 left-4 right-4 z-20">
                    <h3 className="text-xl font-bold text-white">{candidate.name}</h3>
                  </div>
                </div>
                
                {/* Candidate Bio */}
                <div className="p-4">
                  <p className="text-white/80 text-sm mb-4 line-clamp-3">{candidate.bio}</p>
                  
                  <button
                    onClick={() => setSelectedCandidate(candidate.id)}
                    className={`w-full p-3 rounded-xl flex items-center justify-center gap-2 transition-colors
                               ${selectedCandidate === candidate.id
                                 ? 'bg-amber-500/20 border border-amber-500/30 text-white'
                                 : 'bg-white/5 border border-white/20 text-white/80 hover:bg-white/10'}`}
                  >
                    {selectedCandidate === candidate.id ? (
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
          )}
        </div>
        
        {/* Submit Button */}
        <motion.div 
          className="sticky bottom-4 max-w-6xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 p-4 rounded-xl shadow-lg">
            <button
              onClick={handleVote}
              disabled={!selectedCandidate || isSubmitting || isVoteSuccess}
              className={`w-full py-3 rounded-lg font-semibold text-white transition-all duration-200
                         ${selectedCandidate && !isVoteSuccess
                            ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 shadow-lg'
                            : 'bg-white/10 text-white/50 cursor-not-allowed'}`}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white/90 animate-spin" />
                  <span>Submitting Vote...</span>
                </div>
              ) : isVoteSuccess ? (
                <div className="flex items-center justify-center gap-2 text-green-300">
                  <Check className="h-5 w-5" />
                  <span>Vote Submitted Successfully!</span>
                </div>
              ) : (
                'Submit Vote'
              )}
            </button>
          </div>
        </motion.div>
        
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
