'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LogOut, User, Menu, X, Award } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Student } from '@/@types/db'
import { useLogout } from '@/services/client/auth'
import { cn } from '@/lib/utils'

interface NavbarProps { user?: Student }

// Small helper for truncating names gracefully
const truncate = (str: string, max = 18) => str.length > max ? str.slice(0, max - 1) + '…' : str

const Navbar = ({ user }: NavbarProps) => {
  const router = useRouter()
  const { mutate: logout, isPending } = useLogout()
  const [menu, setMenu] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [compact, setCompact] = useState(false)

  // Track scroll for subtle compacting effect
  useEffect(() => {
    let lastY = window.scrollY
    const onScroll = () => {
      const y = window.scrollY
      setScrolled(y > 4)
      setCompact(y > 80 && y > lastY) // shrink only when scrolling down past threshold
      lastY = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const initials = useCallback(() => {
    if (!user) return ''
    return user.full_name.split(/\s+/).slice(0,2).map(n => n[0]?.toUpperCase()).join('')
  }, [user])

  const handleLogout = () => logout(undefined, { onSuccess: () => router.push('/login') })
  const handleLogin = () => router.push('/login')

  const navVariants = {
    initial: { y: -40, opacity: 0 },
    enter: { y: 0, opacity: 1, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } }
  } as const

  const containerClasses = [
    'fixed inset-x-0 top-0 z-50 flex justify-center pointer-events-none',
  ].join(' ')

  return (
    <div className={containerClasses}>
      <motion.nav
        variants={navVariants}
        initial="initial"
        animate="enter"
        className={[
          'pointer-events-auto mx-2 mt-2 w-full max-w-5xl',
          'rounded-2xl border backdrop-blur-xl transition-all',
          'bg-white/10 border-white/20 shadow-lg',
          scrolled ? 'shadow-xl' : 'shadow-md',
          compact ? 'scale-[0.97] opacity-95' : 'scale-100 opacity-100'
        ].join(' ')}
      >
        <div className={[
          'flex items-center gap-3 px-4',
          'transition-all',
          compact ? 'h-12' : 'h-16'
        ].join(' ')}>
          {/* Brand */}
            <button
              onClick={() => router.push('/')}
              className="group flex items-center gap-2 rounded-lg px-1 py-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 text-white shadow-sm">
                <Award className="h-4 w-4" />
              </div>
              <span className="hidden sm:inline text-sm font-semibold tracking-wide text-white/90 group-hover:text-white transition-colors">ABU Awards</span>
            </button>
          <div className="ml-auto flex items-center gap-2">
            {/* Desktop user section */}
            {user ? (
              <div className="hidden md:flex items-center gap-3">
                <div
                  className={[
                    'flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3 py-1.5',
                    user.is_staff ? 'cursor-pointer hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 transition-colors' : ''
                  ].join(' ')}
                  {...(user.is_staff ? {
                    role: 'button',
                    tabIndex: 0,
                    onClick: () => router.push('/admin'),
                    onKeyDown: (e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); router.push('/admin') } }
                  } : {})}
                  aria-label={user.is_staff ? 'Go to admin dashboard' : undefined}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 via-blue-500 to-teal-500 text-xs font-bold text-white">
                    {initials()}
                  </div>
                  <div className="leading-tight">
                    <p className="text-[13px] font-medium text-white/90 flex items-center gap-1">
                      {truncate(user.full_name, 18)}
                      {user.is_staff && <span className="rounded bg-amber-400/20 px-1 text-[10px] font-semibold text-amber-300">ADMIN</span>}
                    </p>
                    <p className="text-[11px] text-white/50">{user.matric_number}</p>
                  </div>
                </div>
                <motion.button
                  onClick={handleLogout}
                  disabled={isPending}
                  whileTap={{ scale: 0.92 }}
                  className="rounded-lg hidden border border-red-400/30 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-300 hover:bg-red-500/20 hover:text-red-200 transition-colors"
                >
                  {isPending ? '…' : 'Logout'}
                </motion.button>
              </div>
            ) : (
              <button
                onClick={handleLogin}
                className="hidden md:inline-flex items-center gap-2 rounded-lg border border-amber-400/30 bg-amber-500/10 px-4 py-1.5 text-xs font-semibold text-amber-200 hover:bg-amber-500/20 hover:text-amber-100 transition-colors"
              >
                <User className="h-3.5 w-3.5" /> Sign In
              </button>
            )}
            {/* Mobile toggle */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setMenu(v => !v)}
              aria-label="Toggle menu"
              className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 bg-white/10 text-white"
            >
              {menu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </motion.button>
          </div>
        </div>
        {/* Mobile drawer */}
        <AnimatePresence initial={false}>
          {menu && (
            <motion.div
              key="mobile"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="overflow-hidden border-t border-white/10 px-4 pb-4"
            >
              <div className="pt-3 space-y-3">
                {user ? (
                  <>
                    <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-md bg-gradient-to-br from-purple-500 via-blue-500 to-teal-500 text-xs font-bold text-white">
                        {initials()}
                      </div>
                      <div className="min-w-0 flex-1 leading-tight">
                        <p className="truncate text-sm font-medium text-white/90 flex items-center gap-1">
                          {truncate(user.full_name, 28)}
                          {user.is_staff && <span className="rounded bg-amber-400/20 px-1 text-[10px] font-semibold text-amber-300">ADMIN</span>}
                        </p>
                        <p className="text-[11px] text-white/50">{user.matric_number}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { if (user.is_staff) router.push('/admin'); setMenu(false) }}
                        disabled={!user.is_staff}
                        className={cn("flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white/70 disabled:opacity-40 disabled:cursor-not-allowed hover:text-white hover:bg-white/10")}
                      >Admin</button>
                      <button
                        onClick={() => { handleLogout(); setMenu(false) }}
                        className={cn("flex-1 rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-300 hover:bg-red-500/20 hover:text-red-200 hidden",  user.is_staff && 'md:inline-flex')}
                      >Logout</button>
                    </div>
                  </>
                ) : (
                  <button
                    onClick={() => { handleLogin(); setMenu(false) }}
                    className="w-full rounded-lg border border-amber-400/30 bg-amber-500/10 px-4 py-2 text-sm font-semibold text-amber-200 hover:bg-amber-500/20 hover:text-amber-100"
                  >
                    <span className="inline-flex items-center gap-2"><User className="h-4 w-4" /> Sign In</span>
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </div>
  )
}

export default Navbar