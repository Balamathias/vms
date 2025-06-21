'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Award, ChevronRight, Users, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

type PositionCardProps = {
  id: string
  name: string
  candidateCount?: number
  electionName?: string
  index: number,
  hasVoted?: boolean
}

const PositionCard = ({ id, name, candidateCount = 0, electionName, index, hasVoted }: PositionCardProps) => {
  const router = useRouter()
  
  const handleViewPosition = () => {
    router.push(`/positions/${id}`)
  }
  
  return (
    <motion.div
      className={cn(
        "relative backdrop-blur-md rounded-2xl p-6 border shadow-xl transition-all duration-300",
        hasVoted 
          ? "bg-green-500/20 border-green-400/40 hover:bg-green-500/25" 
          : "bg-white/10 border-white/20 hover:bg-white/15"
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -5, scale: 1.02 }}
    >
      {/* Gradient accent - different for voted */}
      <div className={cn(
        "absolute -top-1 -right-1 -left-1 h-2 rounded-t-2xl blur-sm",
        hasVoted 
          ? "bg-gradient-to-r from-green-400/60 via-emerald-500/60 to-teal-500/60" 
          : "bg-gradient-to-r from-purple-500/50 via-blue-500/50 to-teal-500/50"
      )} />
      
      {/* Voted badge */}
      {hasVoted && (
        <motion.div 
          className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1.5 shadow-lg"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: index * 0.1 + 0.3, type: "spring", stiffness: 200 }}
        >
          <CheckCircle className="h-4 w-4" />
        </motion.div>
      )}
      
      <div className="flex justify-between items-start mb-4">
        <div className={cn(
          "p-2.5 rounded-xl border",
          hasVoted 
            ? "bg-green-500/20 border-green-400/30" 
            : "bg-white/10 border-white/10"
        )}>
          <Award className={cn("h-6 w-6", hasVoted ? "text-green-300" : "text-white")} />
        </div>
        <div className={cn(
          "text-xs px-2 py-1 rounded-full border",
          hasVoted 
            ? "text-green-200 bg-green-500/10 border-green-400/20" 
            : "text-white/60 bg-white/5 border-white/10"
        )}>
          {electionName}
        </div>
      </div>
      
      <h3 className={cn("text-xl font-bold mb-2", hasVoted ? "text-green-100" : "text-white")}>
        {name}
      </h3>
      
      <div className={cn(
        "flex items-center text-sm mb-6",
        hasVoted ? "text-green-200" : "text-white/70"
      )}>
        <Users className="h-4 w-4 mr-1" />
        <span>{candidateCount} Candidates</span>
      </div>
      
      <button
        onClick={handleViewPosition}
        className={cn(
          "w-full mt-auto flex items-center justify-between p-3 border rounded-xl font-medium transition-all duration-300",
          hasVoted 
            ? "bg-green-500/15 hover:bg-green-500/25 border-green-400/30 text-green-200" 
            : "bg-white/5 hover:bg-white/10 border-white/10 text-white/90"
        )}
      >
        <span>{hasVoted ? 'Voted ✓' : 'View & Vote'}</span>
        <ChevronRight className="h-4 w-4" />
      </button>
    </motion.div>
  )
}

export default PositionCard
