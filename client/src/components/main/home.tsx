'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Vote, Trophy, CheckCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import AwardsShowcase from '@/components/main/award-showcase'
import Navbar from '@/components/main/navbar'
import { Student } from '@/@types/db'

interface HomeProps {
    user?: Student
}

const Home = ({ user }: HomeProps) => {

  const router = useRouter()

  const handleVoteClick = (href?: string) => {
    if (user) {
      router.push(href || "/positions")
    } else {
      router.push("/login")
    }
  }
  return (
    <>
      <Navbar user={user} />
      <div className="min-h-screen bg-gradient-to-br p-4 md:p-8 flex flex-col items-center justify-center py-20">

        <h1 className="text-3xl md:text-4xl font-bold text-white/80 mb-12 relative z-10 text-center">
          Ahmadu Bello {"University's"} <br />
          <span className="bg-gradient-to-r from-amber-500 to-yellow-300 text-transparent bg-clip-text">Graduate Awards.</span>
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl relative z-10">
          <motion.div 
            className="backdrop-blur-md bg-white/10 rounded-2xl p-6 border border-white/20 shadow-xl hover:bg-white/20 transition-all duration-300 flex flex-col h-full"
            whileHover={{ y: -5 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-xl font-semibold text-white mb-3">Vote top Graduands</h2>
            <p className="text-white/80 mb-6 flex-grow">Cast your votes for the most outstanding graduates and recognize their exceptional achievements.</p>
            <button 
              onClick={() => handleVoteClick("/positions")}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 backdrop-blur-sm bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/90 font-medium transition-all duration-300 mt-auto">
              <Vote className="w-4 h-4" />
              <span>{user ? 'Start Voting' : 'Login to Vote'}</span>
            </button>
          </motion.div>
          
          <motion.div 
            className="backdrop-blur-md bg-white/10 rounded-2xl p-6 border border-white/20 shadow-xl hover:bg-white/20 transition-all duration-300 flex flex-col h-full"
            whileHover={{ y: -5 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h2 className="text-xl font-semibold text-white mb-3">Explore Past Winners</h2>
            <p className="text-white/80 mb-6 flex-grow">Discover the achievements of previous award recipients and get inspired.</p>
            <button 
              onClick={() => handleVoteClick("/results")}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 backdrop-blur-sm bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/90 font-medium transition-all duration-300 mt-auto">
              <Trophy className="w-4 h-4" />
              <span>View Winners</span>
            </button>
          </motion.div>
          
          <motion.div 
            className="backdrop-blur-md bg-white/10 rounded-2xl p-6 border border-white/20 shadow-xl hover:bg-white/20 transition-all duration-300 flex flex-col h-full"
            whileHover={{ y: -5 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="text-xl font-semibold text-white mb-3">{user ? 'Ready to cast your vote?' : 'Join the voting!'}</h2>
            <p className="text-white/80 mb-6 flex-grow">{user ? 'Make your voice heard and support your favorite graduates.' : 'Sign in to participate in the graduate awards voting.'}</p>
            <button 
              onClick={() => handleVoteClick(user ? '/positions' : '/login')}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 backdrop-blur-sm bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/90 font-medium transition-all duration-300 mt-auto">
              <CheckCircle className="w-4 h-4" />
              <span>{user ? 'Cast Your Vote' : 'Get Started'}</span>
            </button>
          </motion.div>
        </div>
        
        {/* Add the Awards Showcase component */}
      </div>
      <AwardsShowcase />
    </>
  )
}

export default Home