'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LogOut, User, Menu, X, Award } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Student } from '@/@types/db'
import { useLogout } from '@/services/client/auth'

interface NavbarProps {
  user?: Student
}

const Navbar = ({ user }: NavbarProps) => {
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { mutate: logout, isPending } = useLogout()
  
  const getInitials = (fullName: string) => {
    return fullName
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }
  
  const handleLogout = () => {
    // Add logout logic here
    logout(undefined, {
      onSuccess: () => {
        router.push('/login')
      },
      onError: (error) => {
        console.error("Logout failed:", error)
      }
    })
  }

  const handleLogin = () => {
    router.push('/login')
  }
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }
  
  return (
    <motion.nav 
      className="fixed top-4 left-4 right-4 z-50 backdrop-blur-xl bg-white/5 border border-white/20 rounded-2xl shadow-2xl"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      {/* Animated gradient background */}
      <div className="absolute inset-0 rounded-2xl overflow-hidden">
        <motion.div 
          className="absolute inset-0 opacity-30"
          animate={{ 
            background: [
              'linear-gradient(135deg, rgba(156, 39, 176, 0.1) 0%, rgba(33, 150, 243, 0.1) 100%)',
              'linear-gradient(135deg, rgba(33, 150, 243, 0.1) 0%, rgba(76, 175, 80, 0.1) 100%)',
              'linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(255, 193, 7, 0.1) 100%)',
              'linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(156, 39, 176, 0.1) 100%)',
              'linear-gradient(135deg, rgba(156, 39, 176, 0.1) 0%, rgba(33, 150, 243, 0.1) 100%)',
            ]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />
      </div>
      
      <div className="relative px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo/Brand */}
            <motion.div 
              className="flex items-center gap-3 cursor-pointer"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
              onClick={() => router.push('/')}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div className="hidden md:block">
                <h1 className="font-bold text-lg bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                ABU Awards
                </h1>
                <p className="text-white/60 text-xs">Graduate Excellence</p>
              </div>
            </motion.div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                {/* User Avatar */}
                <motion.div 
                  className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/5 border border-white/10"
                  whileHover={{ scale: 1.02, backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-400 via-blue-400 to-teal-400 flex items-center justify-center text-white font-semibold text-sm">
                    {getInitials(user.full_name)}
                  </div>
                  <button className="flex flex-col text-left"
                    onClick={user?.is_staff ? () => router.push('/profile') : undefined}
                    disabled={!user?.is_staff}
                  >
                    <p className="text-white text-sm font-medium">{user.full_name}</p>
                    <p className="text-white/60 text-xs">{user.matric_number}</p>
                  </button>
                </motion.div>
                
                {/* Logout Button */}
                <motion.button
                  onClick={handleLogout}
                  className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 hover:bg-red-500/20 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={isPending}
                >
                  <LogOut className="w-5 h-5" />
                </motion.button>
              </div>
            ) : (
              <motion.button
                onClick={handleLogin}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-white font-medium hover:from-amber-500/30 hover:to-orange-500/30 transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Login
                </span>
              </motion.button>
            )}
          </div>
          
          {/* Mobile Menu Button */}
          <motion.button
            onClick={toggleMenu}
            className="md:hidden p-2 rounded-lg bg-white/5 border border-white/10 text-white"
            whileTap={{ scale: 0.95 }}
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </motion.button>
        </div>
        
        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              className="md:hidden mt-4 pt-4 border-t border-white/10"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {user ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-400 via-blue-400 to-teal-400 flex items-center justify-center text-white font-semibold">
                      {getInitials(user.full_name)}
                    </div>
                    <button className="flex flex-col text-left"
                      onClick={user?.is_staff ? () => router.push('/profile') : undefined}
                      disabled={!user?.is_staff}
                    >
                      <p className="text-white font-medium">{user.full_name}</p>
                      <p className="text-white/60 text-sm">{user.matric_number}</p>
                    </button>
                  </div>
                  <motion.button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300"
                    whileTap={{ scale: 0.98 }}
                    disabled={isPending}
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </motion.button>
                </div>
              ) : (
                <motion.button
                  onClick={handleLogin}
                  className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-white font-medium"
                  whileTap={{ scale: 0.98 }}
                >
                  <User className="w-4 h-4" />
                  Login
                </motion.button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  )
}

export default Navbar