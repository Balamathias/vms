'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Award, ChevronRight, Users } from 'lucide-react'

type PositionCardProps = {
  id: string
  name: string
  candidateCount?: number
  electionName?: string
  index: number
}

const PositionCard = ({ id, name, candidateCount = 0, electionName, index }: PositionCardProps) => {
  const router = useRouter()
  
  const handleViewPosition = () => {
    router.push(`/positions/${id}`)
  }
  
  return (
    <motion.div
      className="relative backdrop-blur-md bg-white/10 rounded-2xl p-6 border border-white/20 
                shadow-xl hover:bg-white/15 transition-all duration-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -5, scale: 1.02 }}
    >
      {/* Gradient accent */}
      <div className="absolute -top-1 -right-1 -left-1 h-2 rounded-t-2xl bg-gradient-to-r 
                    from-purple-500/50 via-blue-500/50 to-teal-500/50 blur-sm" />
      
      <div className="flex justify-between items-start mb-4">
        <div className="p-2.5 rounded-xl bg-white/10 border border-white/10">
          <Award className="h-6 w-6 text-white" />
        </div>
        <div className="text-xs text-white/60 px-2 py-1 rounded-full bg-white/5 border border-white/10">
          {electionName}
        </div>
      </div>
      
      <h3 className="text-xl font-bold text-white mb-2">{name}</h3>
      
      <div className="flex items-center text-white/70 text-sm mb-6">
        <Users className="h-4 w-4 mr-1" />
        <span>{candidateCount} Candidates</span>
      </div>
      
      <button
        onClick={handleViewPosition}
        className="w-full mt-auto flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 
                 border border-white/10 rounded-xl text-white/90 font-medium transition-all duration-300"
      >
        <span>View & Vote</span>
        <ChevronRight className="h-4 w-4" />
      </button>
    </motion.div>
  )
}

export default PositionCard
