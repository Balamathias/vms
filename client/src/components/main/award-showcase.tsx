'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Award, ChevronLeft, ChevronRight, Crown, Medal, Trophy, Users } from 'lucide-react'
import { RecentWinner } from '@/@types/db'

type Award = {
  id: string
  title: string
  recipient: string
  year: number
  image: string
  icon: React.ReactNode
  voteCount: number
  electionName: string
}

type AwardsShowcaseProps = {
  winners?: RecentWinner[]
}

const AwardsShowcase = ({ winners = [] }: AwardsShowcaseProps) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [autoplay, setAutoplay] = useState(true)
  
  // Convert RecentWinner data to Award format
  const getPositionIcon = (positionName: string) => {
    const name = positionName.toLowerCase()
    if (name.includes('innovative') || name.includes('creative')) {
      return <Award className="w-10 h-10 text-blue-300" />
    } else if (name.includes('leader') || name.includes('best') || name.includes('top')) {
      return <Crown className="w-10 h-10 text-purple-300" />
    } else if (name.includes('academic') || name.includes('scholar') || name.includes('succeed')) {
      return <Trophy className="w-10 h-10 text-amber-300" />
    } else {
      return <Medal className="w-10 h-10 text-green-300" />
    }
  }
  
  const fallbackImages = [
    "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e",
    "https://images.unsplash.com/photo-1560250097-0b93528c311a", 
    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
    "https://images.unsplash.com/photo-1494790108755-2616b62e99a0",
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e"
  ]
    const transformedAwards: Award[] = winners.length > 0 
    ? winners.map((winner, index) => ({
        id: `${winner.position_name}-${winner.election_year}`,
        title: winner.position_name,
        recipient: winner.winner_name,
        year: winner.election_year,
        image: winner.winner_picture || `${fallbackImages[index % fallbackImages.length]}?q=80&w=800&h=800&fit=crop`,
        icon: getPositionIcon(winner.position_name),
        voteCount: winner.vote_count,
        electionName: winner.election_name
      }))
    : []
  
  useEffect(() => {
    if (!autoplay || transformedAwards.length <= 1) return
    
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % transformedAwards.length)
    }, 5000)
    
    return () => clearInterval(interval)
  }, [autoplay, transformedAwards.length])
  
  const currentAward = transformedAwards[currentIndex]
  
  const nextAward = () => {
    if (transformedAwards.length <= 1) return
    setAutoplay(false)
    setCurrentIndex((prevIndex) => (prevIndex + 1) % transformedAwards.length)
  }
  
  const prevAward = () => {
    if (transformedAwards.length <= 1) return
    setAutoplay(false)
    setCurrentIndex((prevIndex) => (prevIndex - 1 + transformedAwards.length) % transformedAwards.length)
  }

  return (
    <div className="w-full max-w-6xl mx-auto mt-8 sm:mt-12 md:mt-16 mb-4 sm:mb-6 md:mb-8 relative px-4 sm:px-6 md:px-0">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-teal-500/10 rounded-xl sm:rounded-2xl md:rounded-3xl blur-xl sm:blur-2xl md:blur-3xl -z-10" />
      
      <div className="text-center mb-6 sm:mb-8 md:mb-10">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold inline-block bg-gradient-to-r from-amber-200 to-yellow-400 bg-clip-text text-transparent">
          Award Winners Showcase
        </h2>
        <p className="text-white/70 mt-1 sm:mt-2 text-sm sm:text-base">Celebrating excellence and achievements</p>
      </div>

      <div className="relative h-auto sm:h-[380px] md:h-[450px] overflow-hidden rounded-xl sm:rounded-2xl md:rounded-3xl backdrop-blur-md border border-white/20 bg-white/5">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div 
            className="absolute -inset-[50px] sm:-inset-[75px] md:-inset-[100px] opacity-30"
            animate={{ 
              background: [
                'radial-gradient(circle at 30% 30%, rgba(156, 39, 176, 0.3) 0%, transparent 70%)',
                'radial-gradient(circle at 70% 70%, rgba(33, 150, 243, 0.3) 0%, transparent 70%)',
                'radial-gradient(circle at 30% 70%, rgba(76, 175, 80, 0.3) 0%, transparent 70%)',
                'radial-gradient(circle at 70% 30%, rgba(255, 193, 7, 0.3) 0%, transparent 70%)',
                'radial-gradient(circle at 30% 30%, rgba(156, 39, 176, 0.3) 0%, transparent 70%)',
              ]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          />
        </div>

        <div className="relative h-full flex flex-col md:flex-row">
          {/* Image side */}
          <div className="w-full md:w-1/2 h-[250px] sm:h-2/5 md:h-full relative overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentAward.id}
                className="absolute inset-0 p-3 sm:p-4 md:p-6"
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.7 }}
              >
                <div className="relative h-full w-full overflow-hidden rounded-lg sm:rounded-xl md:rounded-2xl">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
                  <img 
                    src={currentAward.image} 
                    alt={currentAward.recipient} 
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      // Fallback to a random fallback image if the current one fails
                      const target = e.target as HTMLImageElement;
                      const randomIndex = Math.floor(Math.random() * fallbackImages.length);
                      target.src = `${fallbackImages[randomIndex]}?q=80&w=800&h=800&fit=crop`;
                    }}
                  />
                  <div className="absolute bottom-6 left-6 z-20 text-white">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, duration: 0.5 }}
                    >
                      <h3 className="text-2xl font-bold">{currentAward.recipient}</h3>
                      <p className="text-white/80">{currentAward.year}</p>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Content side */}
          <div className="w-full md:w-1/2 h-1/2 md:h-full p-5 md:p-10 flex flex-col justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentAward.id}
                className="flex flex-col h-full justify-center"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
              >
                <div className="mb-6">
                  {currentAward.icon}
                </div>                <h3 className="text-3xl font-bold text-white mb-4">{currentAward.title}</h3>
                <div className="h-[1px] w-16 bg-gradient-to-r from-white/60 to-transparent mb-6" />
                <p className="text-white/70 mb-4">
                  Awarded to <span className="text-white font-semibold">{currentAward.recipient}</span> for 
                  exemplary achievements and contributions to the university community.
                </p>
                <div className="text-white/60 text-sm mb-8">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>{currentAward.voteCount} votes</span>
                    </div>
                    <div>
                      <span>{currentAward.electionName}</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-auto flex justify-between items-center">
                  <div className="text-white/60 text-sm">
                    {currentIndex + 1} of {transformedAwards.length}
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={prevAward}
                      className="w-10 h-10 rounded-full flex items-center justify-center border border-white/20 bg-white/5 text-white/80 hover:bg-white/10 transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={nextAward}
                      className="w-10 h-10 rounded-full flex items-center justify-center border border-white/20 bg-white/5 text-white/80 hover:bg-white/10 transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>      {/* Navigation dots */}
      <div className="flex justify-center mt-6 gap-2">
        {transformedAwards.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setAutoplay(false)
              setCurrentIndex(index)
            }}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              currentIndex === index 
                ? "w-8 bg-white" 
                : "bg-white/30 hover:bg-white/50"
            }`}
            aria-label={`Go to award ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

export default AwardsShowcase
