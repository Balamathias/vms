'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Award, ChevronLeft, ChevronRight, Crown, Medal, Trophy } from 'lucide-react'

type Award = {
  id: number
  title: string
  recipient: string
  year: number
  image: string
  icon: React.ReactNode
}

const sampleAwards: Award[] = [
  {
    id: 1,
    title: "Best Academic Performance",
    recipient: "Aisha Mohammed",
    year: 2023,
    image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e",
    icon: <Trophy className="w-10 h-10 text-amber-300" />
  },
  {
    id: 2,
    title: "Most Innovative Project",
    recipient: "Chukwudi Okonkwo",
    year: 2023,
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a",
    icon: <Award className="w-10 h-10 text-blue-300" />
  },
  {
    id: 3,
    title: "Leadership Excellence",
    recipient: "Fatima Ibrahim",
    year: 2023,
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2",
    icon: <Crown className="w-10 h-10 text-purple-300" />
  },
  {
    id: 4,
    title: "Outstanding Community Service",
    recipient: "Emmanuel Adebayo",
    year: 2023,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
    icon: <Medal className="w-10 h-10 text-green-300" />
  }
]

const AwardsShowcase = () => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [autoplay, setAutoplay] = useState(true)
  
  useEffect(() => {
    if (!autoplay) return
    
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % sampleAwards.length)
    }, 5000)
    
    return () => clearInterval(interval)
  }, [autoplay])
  
  const currentAward = sampleAwards[currentIndex]
  
  const nextAward = () => {
    setAutoplay(false)
    setCurrentIndex((prevIndex) => (prevIndex + 1) % sampleAwards.length)
  }
  
  const prevAward = () => {
    setAutoplay(false)
    setCurrentIndex((prevIndex) => (prevIndex - 1 + sampleAwards.length) % sampleAwards.length)
  }

  return (
    <div className="w-full max-w-6xl mx-auto mt-16 mb-8 relative">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-teal-500/10 rounded-3xl blur-3xl -z-10" />
      
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold inline-block bg-gradient-to-r from-amber-200 to-yellow-400 bg-clip-text text-transparent">
          Award Winners Showcase
        </h2>
        <p className="text-white/70 mt-2">Celebrating excellence and achievements</p>
      </div>

      <div className="relative h-[450px] overflow-hidden rounded-3xl backdrop-blur-md border border-white/20 bg-white/5">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div 
            className="absolute -inset-[100px] opacity-30"
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
          <div className="w-full md:w-1/2 h-1/2 md:h-full relative overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentAward.id}
                className="absolute inset-0 p-6"
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.7 }}
              >
                <div className="relative h-full w-full overflow-hidden rounded-2xl">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
                  {/* <img 
                    src={`${currentAward.image}?q=80&w=800&h=800&fit=crop`} 
                    alt={currentAward.title} 
                    className="h-full w-full object-cover"
                  /> */}
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
                </div>
                <h3 className="text-3xl font-bold text-white mb-4">{currentAward.title}</h3>
                <div className="h-[1px] w-16 bg-gradient-to-r from-white/60 to-transparent mb-6" />
                <p className="text-white/70 mb-8">
                  Awarded to <span className="text-white font-semibold">{currentAward.recipient}</span> for 
                  exemplary achievements and contributions to the university community.
                </p>
                
                <div className="mt-auto flex justify-between items-center">
                  <div className="text-white/60 text-sm">
                    {currentIndex + 1} of {sampleAwards.length}
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
      </div>

      {/* Navigation dots */}
      <div className="flex justify-center mt-6 gap-2">
        {sampleAwards.map((_, index) => (
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
