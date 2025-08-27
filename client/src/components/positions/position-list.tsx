'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, X } from 'lucide-react'
import PositionCard from './position-card'
import { Position } from '@/@types/db'

type PositionListProps = {
  positions: Position[]
  electionName: string
}

const PositionList = ({ positions, electionName }: PositionListProps) => {
  const [searchTerm, setSearchTerm] = useState('')
  
  const filteredPositions = positions.filter(position => 
    position.name.toLowerCase().includes(searchTerm.toLowerCase())
  )
  
  return (
    <div className="w-full max-w-7xl mx-auto relative">
      {/* Floating background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-40 right-32 w-40 h-40 bg-gradient-to-br from-blue-400/10 to-cyan-400/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Enhanced Header Section */}
      <motion.div
        className="relative z-10 text-center mb-12"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <motion.h2
          className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 bg-gradient-to-r from-white via-white/95 to-white/90 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          Available Positions
        </motion.h2>
        <motion.p
          className="text-white/70 text-lg max-w-2xl mx-auto"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          Choose a position to view candidates and cast your vote
        </motion.p>
      </motion.div>
      {/* Enhanced Search bar */}
      <motion.div 
        className="relative z-10 mb-12 w-full max-w-2xl mx-auto"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <div className="relative group">
          {/* Search input container with enhanced glassmorphism */}
          <div className="relative overflow-hidden rounded-2xl backdrop-blur-2xl bg-white/[0.08] border border-white/[0.15] shadow-2xl transition-all duration-300 group-focus-within:border-white/30 group-focus-within:bg-white/[0.12]">
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-teal-500/5 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300" />
            
            {/* Search icon with enhanced styling */}
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
              <motion.div
                className="p-2 rounded-xl bg-gradient-to-br from-blue-400/20 to-purple-400/20"
                whileHover={{ scale: 1.1, rotate: 15 }}
                transition={{ duration: 0.2 }}
              >
                <Search className="h-5 w-5 text-blue-300" />
              </motion.div>
            </div>
            
            {/* Enhanced input field */}
            <input
              type="text"
              placeholder="Search for positions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="relative z-10 w-full py-4 pl-16 pr-14 bg-transparent text-white placeholder:text-white/60 focus:outline-none text-base font-medium"
            />
            
            {/* Clear button with animation */}
            {searchTerm && (
              <motion.button 
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 p-2 rounded-xl bg-red-400/20 hover:bg-red-400/30 text-red-300 hover:text-red-200 transition-all duration-200"
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 90 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="h-4 w-4" />
              </motion.button>
            )}
            
            {/* Subtle glow effect */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-400/10 via-purple-400/10 to-teal-400/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 -z-10 blur-xl" />
          </div>
          
          {/* Search results counter */}
          {searchTerm && (
            <motion.div
              className="mt-3 text-center"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <span className="text-white/70 text-sm">
                {filteredPositions.length} position{filteredPositions.length !== 1 ? 's' : ''} found
              </span>
            </motion.div>
          )}
        </div>
      </motion.div>
      
      {/* Enhanced Position grid */}
      <motion.div
        className="relative z-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.8 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
          {filteredPositions.length > 0 ? (
            filteredPositions.map((position, index) => (
              <motion.div
                key={position.id}
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ 
                  duration: 0.5, 
                  delay: 0.9 + (index * 0.1),
                  ease: "easeOut"
                }}
                whileHover={{ y: -5 }}
              >
                <PositionCard
                  id={position.id}
                  name={position.name}
                  candidateCount={position.candidate_count || 0}
                  electionName={electionName}
                  index={index}
                  hasVoted={position?.has_voted}
                  genderRestriction={position.gender_restriction}
                />
              </motion.div>
            ))
          ) : (
            <motion.div 
              className="col-span-full py-16 text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <div className="backdrop-blur-2xl bg-white/[0.05] border border-white/[0.1] rounded-3xl p-12 max-w-md mx-auto shadow-2xl">
                {/* No results illustration */}
                <motion.div
                  className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-gray-400/20 to-gray-600/20 flex items-center justify-center"
                  animate={{ 
                    rotate: [0, 5, -5, 0],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <Search className="w-10 h-10 text-white/40" />
                </motion.div>
                
                <h3 className="text-xl font-semibold text-white/90 mb-3">
                  {searchTerm ? 'No positions found' : 'No positions available'}
                </h3>
                
                <p className="text-white/60 text-base leading-relaxed">
                  {searchTerm 
                    ? (
                      <>
                        No positions match <span className="font-semibold text-white/80">"{searchTerm}"</span>
                        <br />
                        <span className="text-sm">Try adjusting your search terms</span>
                      </>
                    )
                    : 'There are currently no positions available for voting.'
                  }
                </p>
                
                {searchTerm && (
                  <motion.button
                    onClick={() => setSearchTerm('')}
                    className="mt-6 px-6 py-2.5 bg-gradient-to-r from-blue-500/20 to-purple-500/20 hover:from-blue-500/30 hover:to-purple-500/30 border border-blue-400/30 rounded-xl text-white font-medium transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Clear search
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}
        </div>
        
        {/* Results summary */}
        {filteredPositions.length > 0 && (
          <motion.div
            className="mt-12 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-6 py-3 backdrop-blur-xl bg-white/[0.05] border border-white/[0.1] rounded-2xl text-white/70">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-sm font-medium">
                Showing {filteredPositions.length} of {positions.length} positions
              </span>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}

export default PositionList
