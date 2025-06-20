'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, X } from 'lucide-react'
import PositionCard from './PositionCard'

type Position = {
  id: string
  name: string
  candidateCount?: number
}

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
    <div className="w-full max-w-6xl mx-auto">
      {/* Search bar */}
      <motion.div 
        className="relative mb-8 w-full max-w-lg mx-auto"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
          <input
            type="text"
            placeholder="Search positions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full py-3 pl-10 pr-10 bg-white/5 border border-white/20 rounded-xl backdrop-blur-md
                     text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/50 
                        hover:text-white/80 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </motion.div>
      
      {/* Position grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPositions.length > 0 ? (
          filteredPositions.map((position, index) => (
            <PositionCard
              key={position.id}
              id={position.id}
              name={position.name}
              candidateCount={position.candidateCount}
              electionName={electionName}
              index={index}
            />
          ))
        ) : (
          <div className="col-span-full py-10 text-center text-white/70">
            <p>No positions found matching &quot;{searchTerm}&quot;</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default PositionList
