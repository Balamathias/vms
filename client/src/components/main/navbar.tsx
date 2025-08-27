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
      className="fixed top-4 left-4 right-4 z-50 backdrop-blur-2xl bg-white/[0.08] border border-white/[0.15] rounded-3xl shadow-2xl max-w-6xl mx-auto"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      {/* Enhanced glassmorphic background with floating elements */}
      <div className="absolute inset-0 rounded-3xl overflow-hidden">
        {/* Primary gradient overlay */}
        <motion.div 
          className="absolute inset-0 opacity-40"
          animate={{ 
            background: [
              'linear-gradient(135deg, rgba(156, 39, 176, 0.15) 0%, rgba(33, 150, 243, 0.1) 50%, rgba(76, 175, 80, 0.05) 100%)',
              'linear-gradient(135deg, rgba(33, 150, 243, 0.15) 0%, rgba(76, 175, 80, 0.1) 50%, rgba(255, 193, 7, 0.05) 100%)',
              'linear-gradient(135deg, rgba(76, 175, 80, 0.15) 0%, rgba(255, 193, 7, 0.1) 50%, rgba(156, 39, 176, 0.05) 100%)',
              'linear-gradient(135deg, rgba(255, 193, 7, 0.15) 0%, rgba(156, 39, 176, 0.1) 50%, rgba(33, 150, 243, 0.05) 100%)',
            ]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Floating orbs for depth */}
        <div className="absolute top-2 right-8 w-16 h-16 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-2xl animate-pulse" />
        <div className="absolute bottom-2 left-8 w-12 h-12 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-gradient-to-br from-yellow-400/10 to-orange-400/10 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>
      
      <div className="relative px-6 sm:px-8 py-5">
        <div className="flex items-center justify-between">
          {/* Enhanced Logo/Brand */}
          <motion.div 
            className="flex items-center gap-3 cursor-pointer group"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            onClick={() => router.push('/')}
          >
            <motion.div 
              className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 flex items-center justify-center shadow-lg"
              whileHover={{ rotate: [0, -5, 5, 0], scale: 1.1 }}
              transition={{ duration: 0.5 }}
            >
              <Award className="w-6 h-6 text-white drop-shadow-sm" />
              {/* Glow effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-400/50 via-orange-500/50 to-red-500/50 blur-lg opacity-0 group-hover:opacity-70 transition-opacity duration-300" />
            </motion.div>
            <div className="hidden md:block">
              <motion.h1 
                className="font-bold text-xl bg-gradient-to-r from-white via-white to-white/90 bg-clip-text text-transparent drop-shadow-sm"
                initial={{ opacity: 0.8 }}
                whileHover={{ opacity: 1 }}
              >
                ABU Awards
              </motion.h1>
              <motion.p 
                className="text-white/70 text-xs font-medium tracking-wide"
                initial={{ opacity: 0.6 }}
                whileHover={{ opacity: 0.9 }}
              >
                Graduate Excellence Platform
              </motion.p>
            </div>
          </motion.div>
          
          {/* Enhanced Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                {/* Enhanced User Profile Card */}
                <motion.div 
                  className="group relative overflow-hidden flex items-center gap-4 px-5 py-3 rounded-2xl bg-white/[0.08] hover:bg-white/[0.12] border border-white/[0.15] hover:border-white/[0.25] backdrop-blur-xl shadow-lg transition-all duration-300"
                  whileHover={{ scale: 1.02, y: -1 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  {/* Animated background gradient */}
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <motion.div 
                    className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400 via-blue-400 to-teal-400 flex items-center justify-center text-white font-bold text-sm shadow-lg"
                    whileHover={{ rotate: [0, -3, 3, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    {getInitials(user.full_name)}
                    {/* Avatar glow effect */}
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-purple-400/50 via-blue-400/50 to-teal-400/50 blur-lg opacity-0 group-hover:opacity-60 transition-opacity duration-300" />
                  </motion.div>
                  
                  <motion.button 
                    className="relative z-10 flex flex-col text-left cursor-pointer"
                    onClick={user?.is_staff ? () => router.push('/admin') : undefined}
                    disabled={!user?.is_staff}
                    whileHover={user?.is_staff ? { x: 2 } : {}}
                    transition={{ duration: 0.2 }}
                  >
                    <p className="text-white text-sm font-semibold group-hover:text-white/95 transition-colors">
                      {user.full_name}
                      {user?.is_staff && <span className="ml-2 text-xs text-amber-400">• Admin</span>}
                    </p>
                    <p className="text-white/70 text-xs font-medium group-hover:text-white/80 transition-colors">
                      {user.matric_number}
                    </p>
                  </motion.button>
                  
                  {/* Hover indicator */}
                  {user?.is_staff && (
                    <div className="absolute right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    </div>
                  )}
                </motion.div>
                
                {/* Enhanced Logout Button */}
                <motion.button
                  onClick={handleLogout}
                  className="group relative p-3 rounded-2xl bg-red-500/[0.08] hover:bg-red-500/[0.15] border border-red-400/20 hover:border-red-400/40 text-red-300 hover:text-red-200 transition-all duration-300 cursor-pointer shadow-lg"
                  whileHover={{ scale: 1.08, y: -1 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={isPending}
                >
                  <motion.div
                    animate={isPending ? { rotate: 360 } : {}}
                    transition={{ duration: 1, repeat: isPending ? Infinity : 0, ease: "linear" }}
                  >
                    <LogOut className="w-5 h-5" />
                  </motion.div>
                  
                  {/* Tooltip */}
                  <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 px-3 py-1.5 bg-black/80 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                    {isPending ? 'Logging out...' : 'Logout'}
                    <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-black/80 rotate-45" />
                  </div>
                </motion.button>
              </div>
            ) : (
              <motion.button
                onClick={handleLogin}
                className="group relative overflow-hidden px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-red-500/20 hover:from-amber-500/30 hover:via-orange-500/30 hover:to-red-500/30 border border-amber-400/30 hover:border-amber-400/50 text-white font-semibold transition-all duration-300 cursor-pointer shadow-lg"
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Button glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-amber-400/20 via-orange-400/20 to-red-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <span className="relative z-10 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Sign In
                </span>
              </motion.button>
            )}
          </div>
          
          {/* Enhanced Mobile Menu Button */}
          <motion.button
            onClick={toggleMenu}
            className="md:hidden relative p-3 rounded-2xl bg-white/[0.08] hover:bg-white/[0.12] border border-white/[0.15] hover:border-white/[0.25] text-white cursor-pointer backdrop-blur-xl shadow-lg"
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
          >
            <motion.div
              animate={{ rotate: isMenuOpen ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </motion.div>
          </motion.button>
        </div>
        
        {/* Enhanced Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              className="md:hidden mt-6 pt-6 border-t border-white/[0.15]"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              {user ? (
                <div className="space-y-4">
                  {/* Enhanced Mobile User Profile */}
                  <motion.div 
                    className="group relative overflow-hidden flex items-center gap-4 p-4 rounded-2xl bg-white/[0.08] border border-white/[0.15] backdrop-blur-xl"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-teal-500/10 opacity-50" />
                    
                    <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 via-blue-400 to-teal-400 flex items-center justify-center text-white font-bold shadow-lg">
                      {getInitials(user.full_name)}
                    </div>
                    <button 
                      className="relative z-10 flex flex-col text-left flex-1"
                      onClick={user?.is_staff ? () => router.push('/admin') : undefined}
                      disabled={!user?.is_staff}
                    >
                      <p className="text-white font-semibold text-base">
                        {user.full_name}
                        {user?.is_staff && <span className="ml-2 text-xs text-amber-400">• Admin</span>}
                      </p>
                      <p className="text-white/70 text-sm font-medium">{user.matric_number}</p>
                    </button>
                  </motion.div>
                  
                  {/* Enhanced Mobile Logout Button */}
                  <motion.button
                    onClick={handleLogout}
                    className="group relative overflow-hidden cursor-pointer w-full flex items-center justify-center gap-3 p-4 rounded-2xl bg-red-500/[0.08] hover:bg-red-500/[0.15] border border-red-400/20 text-red-300 backdrop-blur-xl shadow-lg"
                    whileTap={{ scale: 0.98 }}
                    disabled={isPending}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <motion.div
                      animate={isPending ? { rotate: 360 } : {}}
                      transition={{ duration: 1, repeat: isPending ? Infinity : 0, ease: "linear" }}
                    >
                      <LogOut className="w-5 h-5" />
                    </motion.div>
                    <span className="font-semibold">
                      {isPending ? 'Logging out...' : 'Logout'}
                    </span>
                  </motion.button>
                </div>
              ) : (
                <motion.button
                  onClick={handleLogin}
                  className="group relative overflow-hidden cursor-pointer w-full flex items-center justify-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-red-500/20 border border-amber-400/30 text-white font-semibold backdrop-blur-xl shadow-lg"
                  whileTap={{ scale: 0.98 }}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-400/20 via-orange-400/20 to-red-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <User className="w-5 h-5 relative z-10" />
                  <span className="relative z-10">Sign In</span>
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