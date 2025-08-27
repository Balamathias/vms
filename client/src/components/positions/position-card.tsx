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
  hasVoted?: boolean,
  genderRestriction?: string
}

const PositionCard = ({ id, name, candidateCount = 0, electionName, index, hasVoted, genderRestriction }: PositionCardProps) => {
  const router = useRouter()
  
  const handleViewPosition = () => {
    router.push(`/positions/${id}`)
  }
  
  return (
    <motion.div
      className={cn(
        "group relative overflow-hidden backdrop-blur-2xl rounded-3xl p-6 sm:p-8 border shadow-2xl transition-all duration-500 cursor-pointer",
        hasVoted 
          ? "bg-gradient-to-br from-green-500/15 via-emerald-500/10 to-teal-500/15 border-green-400/30 hover:border-green-400/50" 
          : "bg-gradient-to-br from-white/[0.08] via-white/[0.05] to-white/[0.08] border-white/[0.15] hover:border-white/[0.25]"
      )}
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleViewPosition}
    >
      {/* Enhanced floating background elements */}
      <div className="absolute inset-0 overflow-hidden rounded-3xl">
        {hasVoted ? (
          <>
            <div className="absolute top-4 right-4 w-16 h-16 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-full blur-2xl animate-pulse" />
            <div className="absolute bottom-4 left-4 w-12 h-12 bg-gradient-to-br from-teal-400/20 to-green-400/20 rounded-full blur-xl animate-pulse delay-1000" />
          </>
        ) : (
          <>
            <div className="absolute top-4 right-4 w-16 h-16 bg-gradient-to-br from-purple-400/15 to-pink-400/15 rounded-full blur-2xl animate-pulse" />
            <div className="absolute bottom-4 left-4 w-12 h-12 bg-gradient-to-br from-blue-400/15 to-cyan-400/15 rounded-full blur-xl animate-pulse delay-1000" />
          </>
        )}
        
        {/* Animated gradient overlay */}
        <motion.div 
          className={cn(
            "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500",
            hasVoted 
              ? "bg-gradient-to-br from-green-400/10 via-emerald-400/5 to-teal-400/10" 
              : "bg-gradient-to-br from-purple-400/10 via-blue-400/5 to-cyan-400/10"
          )}
        />
      </div>

      {/* Enhanced gradient accent bar */}
      <motion.div 
        className={cn(
          "absolute -top-0.5 -right-0.5 -left-0.5 h-1 rounded-t-3xl",
          hasVoted 
            ? "bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500" 
            : "bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500"
        )}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: index * 0.1 + 0.3, duration: 0.8, ease: "easeOut" }}
      />
      
      {/* Enhanced voted badge */}
      {hasVoted && (
        <motion.div 
          className="absolute -top-3 -right-3 z-20"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: index * 0.1 + 0.5, type: "spring", stiffness: 200, damping: 15 }}
        >
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-2xl">
              <CheckCircle className="h-5 w-5" />
            </div>
            {/* Glow effect */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-green-400/50 to-emerald-500/50 blur-lg opacity-75 animate-pulse" />
          </div>
        </motion.div>
      )}
      
      {/* Enhanced header section */}
      <div className="relative z-10 flex justify-between items-start mb-6">
        {/* Enhanced icon container */}
        <motion.div 
          className={cn(
            "relative p-4 rounded-2xl border backdrop-blur-xl shadow-lg",
            hasVoted 
              ? "bg-green-500/20 border-green-400/40" 
              : "bg-white/[0.08] border-white/[0.15]"
          )}
          whileHover={{ rotate: [0, -5, 5, 0], scale: 1.1 }}
          transition={{ duration: 0.5 }}
        >
          <Award className={cn(
            "h-7 w-7 drop-shadow-sm", 
            hasVoted ? "text-green-300" : "text-white"
          )} />
          
          {/* Icon glow effect */}
          <div className={cn(
            "absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-60 blur-lg transition-opacity duration-300",
            hasVoted 
              ? "bg-gradient-to-br from-green-400/30 to-emerald-400/30" 
              : "bg-gradient-to-br from-purple-400/30 to-blue-400/30"
          )} />
        </motion.div>
        
        {/* Enhanced election badge */}
        <motion.div 
          className={cn(
            "px-3 py-2 rounded-xl border backdrop-blur-xl shadow-sm text-xs font-medium",
            hasVoted 
              ? "text-green-200 bg-green-500/15 border-green-400/30" 
              : "text-white/80 bg-white/[0.08] border-white/[0.15]"
          )}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 + 0.2 }}
          whileHover={{ scale: 1.05 }}
        >
          {electionName}
        </motion.div>
      </div>
      
      {/* Enhanced position title */}
      <motion.div
        className="relative z-10 mb-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 + 0.3 }}
      >
        <h3 className={cn(
          "text-xl sm:text-2xl font-bold mb-2 leading-tight",
          hasVoted ? "text-green-100" : "text-white"
        )}>
          {name}
        </h3>
        
        {/* Gender restriction badge */}
        {genderRestriction && genderRestriction !== 'any' && (
          <motion.div
            className={cn(
              "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border",
              hasVoted 
                ? "bg-green-500/10 border-green-400/20 text-green-300" 
                : "bg-white/[0.08] border-white/[0.15] text-white/70"
            )}
            whileHover={{ scale: 1.05 }}
          >
            {genderRestriction.charAt(0).toUpperCase() + genderRestriction.slice(1)} Only
          </motion.div>
        )}
      </motion.div>
      
      {/* Enhanced candidate count */}
      <motion.div 
        className="relative z-10 mb-8"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.1 + 0.4 }}
      >
        <div className={cn(
          "flex items-center gap-3 p-3 rounded-xl border backdrop-blur-xl",
          hasVoted 
            ? "bg-green-500/10 border-green-400/20" 
            : "bg-white/[0.05] border-white/[0.1]"
        )}>
          <div className={cn(
            "p-2 rounded-lg",
            hasVoted 
              ? "bg-green-500/20 text-green-300" 
              : "bg-white/[0.08] text-white/70"
          )}>
            <Users className="h-4 w-4" />
          </div>
          <div>
            <div className={cn(
              "text-sm font-medium",
              hasVoted ? "text-green-200" : "text-white/90"
            )}>
              {candidateCount} Candidates
            </div>
            <div className={cn(
              "text-xs",
              hasVoted ? "text-green-300/70" : "text-white/60"
            )}>
              Available to vote for
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Enhanced action button */}
      <motion.button
        onClick={handleViewPosition}
        className={cn(
          "group/btn relative z-10 w-full overflow-hidden flex items-center justify-between p-4 border rounded-2xl font-semibold transition-all duration-300 backdrop-blur-xl shadow-lg",
          hasVoted 
            ? "bg-green-500/15 hover:bg-green-500/25 border-green-400/40 hover:border-green-400/60 text-green-200" 
            : "bg-white/[0.08] hover:bg-white/[0.12] border-white/[0.15] hover:border-white/[0.25] text-white/90"
        )}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 + 0.6 }}
      >
        {/* Button background gradient */}
        <div className={cn(
          "absolute inset-0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300",
          hasVoted 
            ? "bg-gradient-to-r from-green-400/10 via-emerald-400/5 to-teal-400/10" 
            : "bg-gradient-to-r from-purple-400/10 via-blue-400/5 to-cyan-400/10"
        )} />
        
        <div className="relative z-10 flex items-center gap-3">
          <div className={cn(
            "p-2 rounded-lg transition-colors",
            hasVoted 
              ? "bg-green-500/20 group-hover/btn:bg-green-500/30" 
              : "bg-white/10 group-hover/btn:bg-white/15"
          )}>
            {hasVoted ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <Award className="h-4 w-4" />
            )}
          </div>
          <span className="text-sm sm:text-base">
            {hasVoted ? 'Vote Submitted' : 'View Candidates & Vote'}
          </span>
        </div>
        
        <motion.div
          className="relative z-10"
          whileHover={{ x: 5 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <ChevronRight className="h-5 w-5" />
        </motion.div>
      </motion.button>
    </motion.div>
  )
}

export default PositionCard
