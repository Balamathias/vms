'use client'

import React, { useRef, useCallback, useState } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Crown, Star, Sparkles, Download, Award, Loader2 } from 'lucide-react'
// Prefer html-to-image for more robust rendering; keep html2canvas as fallback
// Lazy import within handler to avoid SSR issues

type CertificateProps = {
  winnerName: string
  positionName: string
  electionName: string
  voteCount: number
  winnerImage?: string
  rank?: number
  onDownload?: () => void
}

const ConfettiPiece = ({ delay = 0, color = '#FFD700' }: { delay?: number; color?: string }) => (
  <motion.div
    className="absolute w-2 h-2 rounded-sm"
    style={{ backgroundColor: color }}
    initial={{ y: -10, x: Math.random() * 400, opacity: 1, rotate: 0 }}
    animate={{
      y: [null, 600],
      x: [null, Math.random() * 400 + (Math.random() - 0.5) * 100],
      rotate: [0, 360],
      opacity: [1, 0]
    }}
    transition={{
      duration: 3,
      delay,
      ease: "easeOut"
    }}
  />
)

const SparkleElement = ({ className = "" }: { className?: string }) => (
  <motion.div
    className={`absolute ${className}`}
    animate={{
      scale: [1, 1.2, 1],
      rotate: [0, 180, 360],
      opacity: [0.6, 1, 0.6]
    }}
    transition={{
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }}
  >
    <Sparkles className="h-4 w-4 text-yellow-300" />
  </motion.div>
)

const StarElement = ({ className = "", size = "h-3 w-3" }: { className?: string; size?: string }) => (
  <motion.div
    className={`absolute ${className}`}
    animate={{
      scale: [1, 1.3, 1],
      opacity: [0.4, 1, 0.4]
    }}
    transition={{
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut",
      delay: Math.random() * 2
    }}
  >
    <Star className={`${size} text-yellow-400 fill-current`} />
  </motion.div>
)

const WinnerCertificate: React.FC<CertificateProps> = ({
  winnerName,
  positionName,
  electionName,
  voteCount,
  winnerImage,
  rank = 1,
  onDownload
}) => {
  const certificateRef = useRef<HTMLDivElement>(null)
  const [isDownloading, setIsDownloading] = useState(false)

  // Simplified download using html-to-image with a temporary CSS class to avoid OKLCH
  const handleDownload = useCallback(async () => {
    if (!certificateRef.current || isDownloading) return

    setIsDownloading(true)

    try {
    console.log('Starting certificate download...')
    await new Promise(resolve => setTimeout(resolve, 150))
    const target = certificateRef.current
    if (!target) throw new Error('Missing certificate node')
    // Temporarily neutralize OKLCH-driven styles
    target.classList.add('export-safe')
    const prevAnim = target.style.animation
    const prevTrans = target.style.transition
    target.style.animation = 'none'
    target.style.transition = 'none'

    const { toPng,  } = await import('html-to-image')
    const dataUrl = await toPng(target, {
        cacheBust: true,
        backgroundColor: '#ffffff',
        pixelRatio: 2,
        skipFonts: false,
        style: {
          backgroundColor: '#ffffff',
          overflow: 'visible'
        },
        filter: (node: any) => {
          const el = node as HTMLElement
          const isButton = el.tagName === 'BUTTON' || el.classList?.contains('download-btn')
          const isIgnored = el.getAttribute?.('data-ignore-export') === 'true'
      return !isButton && !isIgnored
        }
      })

      const link = document.createElement('a')
      const fileName = `${winnerName.replace(/[^a-zA-Z0-9]/g, '_')}_${positionName.replace(/[^a-zA-Z0-9]/g, '_')}_Certificate.png`
      link.download = fileName
      link.href = dataUrl
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      console.log(`Download triggered successfully: ${fileName}`)
      onDownload?.()
    // Restore styles
    target.style.animation = prevAnim
    target.style.transition = prevTrans
    target.classList.remove('export-safe')
    } catch (error) {
      console.error('Failed to generate certificate:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    alert(`Failed to generate certificate: ${errorMessage}. Please try again.`)
    } finally {
    // Ensure any temporary class is removed
    try { certificateRef.current?.classList.remove('export-safe') } catch {}
      setIsDownloading(false)
    }
  }, [winnerName, positionName, onDownload, isDownloading])

  const getRankColor = () => {
    switch (rank) {
      case 1: return 'from-yellow-400 to-yellow-600'
      case 2: return 'from-gray-400 to-gray-600'
      case 3: return 'from-amber-600 to-amber-800'
      default: return 'from-blue-400 to-blue-600'
    }
  }

  const getRankIcon = () => {
    switch (rank) {
      case 1: return <Crown className="h-8 w-8 text-yellow-300" />
      case 2: return <Trophy className="h-8 w-8 text-gray-300" />
      case 3: return <Trophy className="h-8 w-8 text-amber-600" />
      default: return <Award className="h-8 w-8 text-blue-400" />
    }
  }

  return (
    <div className="relative">
      {/* Certificate Container */}
      <div
        ref={certificateRef}
        className="relative w-[1000px] h-[700px] mx-auto rounded-xl overflow-hidden p-12"
        style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #fef7cd 25%, #ffffff 50%, #fef3c7 75%, #ffffff 100%)',
          border: '8px solid #f59e0b',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.6)'
        }}
      >
        {/* Confetti Animation */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 50 }).map((_, i) => (
            <ConfettiPiece
              key={i}
              delay={i * 0.08}
              color={['#FFD700', '#FFA500', '#FF6347', '#32CD32', '#1E90FF', '#FF69B4', '#8A2BE2'][i % 7]}
            />
          ))}
        </div>

        {/* Golden Corner Decorations */}
        <div className="absolute top-0 left-0 w-24 h-24 opacity-20">
          <div className="w-full h-full bg-gradient-to-br from-yellow-400 to-transparent rounded-br-full"></div>
        </div>
        <div className="absolute top-0 right-0 w-24 h-24 opacity-20">
          <div className="w-full h-full bg-gradient-to-bl from-yellow-400 to-transparent rounded-bl-full"></div>
        </div>
        <div className="absolute bottom-0 left-0 w-24 h-24 opacity-20">
          <div className="w-full h-full bg-gradient-to-tr from-yellow-400 to-transparent rounded-tr-full"></div>
        </div>
        <div className="absolute bottom-0 right-0 w-24 h-24 opacity-20">
          <div className="w-full h-full bg-gradient-to-tl from-yellow-400 to-transparent rounded-tl-full"></div>
        </div>

        {/* Decorative Elements */}
        <SparkleElement className="top-8 left-8" />
        <SparkleElement className="top-12 right-12" />
        <SparkleElement className="bottom-8 left-12" />
        <SparkleElement className="bottom-12 right-8" />
        <SparkleElement className="top-1/3 left-4" />
        <SparkleElement className="top-1/3 right-4" />
        <SparkleElement className="bottom-1/3 left-6" />
        <SparkleElement className="bottom-1/3 right-6" />
        
        <StarElement className="top-16 left-1/4" />
        <StarElement className="top-20 right-1/4" size="h-4 w-4" />
        <StarElement className="bottom-16 left-1/3" size="h-3 w-3" />
        <StarElement className="bottom-20 right-1/3" size="h-5 w-5" />
        <StarElement className="top-32 left-12" size="h-3 w-3" />
        <StarElement className="top-32 right-12" size="h-4 w-4" />
        <StarElement className="bottom-32 left-16" size="h-3 w-3" />
        <StarElement className="bottom-32 right-16" size="h-4 w-4" />

        {/* Main Content */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center">
          {/* Header */}
          <div className="mb-8">
            <motion.div
              className={`inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-r ${getRankColor()} shadow-xl mb-6 border-4 border-white`}
              animate={{ 
                scale: [1, 1.1, 1],
                boxShadow: [
                  '0 10px 25px -3px rgba(0, 0, 0, 0.1)',
                  '0 20px 40px -3px rgba(251, 191, 36, 0.4)',
                  '0 10px 25px -3px rgba(0, 0, 0, 0.1)'
                ]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              {getRankIcon()}
            </motion.div>
            
            <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 mb-3">
              CERTIFICATE OF EXCELLENCE
            </h1>
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-16 h-1 bg-gradient-to-r from-transparent via-yellow-500 to-yellow-400 rounded-full"></div>
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
              <div className="w-16 h-1 bg-gradient-to-r from-yellow-400 via-yellow-500 to-transparent rounded-full"></div>
            </div>
            <p className="text-lg text-gray-600 italic font-medium">Outstanding Achievement Recognition</p>
          </div>

          {/* Award Text */}
          <div className="mb-10 space-y-6">
            <p className="text-xl text-gray-600 italic font-medium">This is to proudly certify that</p>
            
            <div className="flex items-center justify-center gap-8 mb-8">
              {winnerImage && (
                <div className="relative">
                  <div className="absolute -inset-2 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full opacity-20 animate-pulse"></div>
                  <img
                    src={winnerImage}
                    alt={winnerName}
                    className="relative w-32 h-32 rounded-full object-cover shadow-2xl"
                    style={{
                      border: '6px solid #f59e0b'
                    }}
                    onError={(e) => {
                      // Fallback to a placeholder if image fails to load
                      const target = e.target as HTMLImageElement
                      target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDEyOCAxMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjgiIGhlaWdodD0iMTI4IiBmaWxsPSIjRjNGNEY2Ii8+CjxjaXJjbGUgY3g9IjY0IiBjeT0iNTIiIHI9IjE2IiBmaWxsPSIjOUNBM0FGIi8+CjxwYXRoIGQ9Ik0zMiA5NmMwLTE3LjY3MyAxNC4zMjctMzIgMzItMzJzMzIgMTQuMzI3IDMyIDMydjE2SDMyVjk2eiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K'
                    }}
                  />
                  <motion.div 
                    className="absolute -top-3 -right-3 w-12 h-12 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center shadow-lg"
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Crown className="h-6 w-6 text-white" />
                  </motion.div>
                </div>
              )}
              
              <div className="text-center">
                <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 mb-3">
                  {winnerName}
                </h2>
                <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-6 py-3 rounded-full shadow-lg">
                  <p className="text-lg font-bold">
                    {rank === 1 ? '🥇 FIRST PLACE' : rank === 2 ? '🥈 SECOND PLACE' : rank === 3 ? '🥉 THIRD PLACE' : `#${rank} PLACE`}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4 bg-gradient-to-r from-yellow-50 via-white to-yellow-50 p-6 rounded-2xl border border-yellow-200">
              <p className="text-2xl text-gray-800 font-semibold">
                has achieved excellence in the position of
              </p>
              <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-yellow-800 mb-2">
                {positionName}
              </p>
              <p className="text-xl text-gray-700">
                during the <span className="font-bold text-gray-800">{electionName}</span>
              </p>
              <div className="flex items-center justify-center gap-2 mt-4">
                <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-4 py-2 rounded-lg">
                  <span className="font-bold text-lg">{voteCount}</span> {voteCount === 1 ? 'Vote' : 'Votes'}
                </div>
                <Star className="h-5 w-5 text-yellow-500 fill-current" />
                <div className="text-gray-600 text-sm">Received</div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-auto flex items-center justify-between w-full pt-8">
            <div className="text-left">
              <div className="w-40 h-px bg-gradient-to-r from-gray-400 to-transparent mb-3"></div>
              <p className="text-sm text-gray-600 font-medium">Election Supervisor</p>
              <p className="text-xs text-gray-500">Voting Management System</p>
            </div>
            
            <motion.div 
              className="flex items-center gap-3 bg-gradient-to-r from-yellow-100 to-yellow-200 px-6 py-3 rounded-full border-2 border-yellow-300 shadow-lg"
              animate={{ 
                boxShadow: [
                  '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  '0 10px 15px -3px rgba(251, 191, 36, 0.3)',
                  '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Award className="h-5 w-5 text-yellow-700" />
              <span className="text-sm font-bold text-yellow-800">OFFICIALLY CERTIFIED</span>
              <Star className="h-4 w-4 text-yellow-600 fill-current" />
            </motion.div>
            
            <div className="text-right">
              <div className="w-40 h-px bg-gradient-to-l from-gray-400 to-transparent mb-3"></div>
              <p className="text-sm text-gray-600 font-medium">{new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</p>
              <p className="text-xs text-gray-500">Date of Issue</p>
            </div>
          </div>
        </div>

        {/* Decorative Border Pattern */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Top border with pattern */}
          <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400"></div>
          <div className="absolute top-3 left-0 w-full h-1 bg-gradient-to-r from-yellow-600 via-yellow-700 to-yellow-600"></div>
          
          {/* Bottom border with pattern */}
          <div className="absolute bottom-0 left-0 w-full h-3 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400"></div>
          <div className="absolute bottom-3 left-0 w-full h-1 bg-gradient-to-r from-yellow-600 via-yellow-700 to-yellow-600"></div>
          
          {/* Left border with pattern */}
          <div className="absolute left-0 top-0 w-3 h-full bg-gradient-to-b from-yellow-400 via-yellow-500 to-yellow-400"></div>
          <div className="absolute left-3 top-0 w-1 h-full bg-gradient-to-b from-yellow-600 via-yellow-700 to-yellow-600"></div>
          
          {/* Right border with pattern */}
          <div className="absolute right-0 top-0 w-3 h-full bg-gradient-to-b from-yellow-400 via-yellow-500 to-yellow-400"></div>
          <div className="absolute right-3 top-0 w-1 h-full bg-gradient-to-b from-yellow-600 via-yellow-700 to-yellow-600"></div>
        </div>
      </div>

    {/* Download Button - Positioned outside certificate for clean capture */}
      <div className="flex justify-center mt-6">
        <motion.button
          className="download-btn flex items-center gap-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-3 rounded-xl shadow-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 border border-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleDownload}
          disabled={isDownloading}
          whileHover={!isDownloading ? { 
            scale: 1.05,
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          } : {}}
          whileTap={!isDownloading ? { scale: 0.95 } : {}}
        >
          {isDownloading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-base font-semibold">Generating...</span>
            </>
          ) : (
            <>
              <Download className="h-5 w-5" />
              <span className="text-base font-semibold">Download Certificate</span>
              <Star className="h-4 w-4 fill-current" />
            </>
          )}
        </motion.button>
      </div>
    </div>
  )
}

export default WinnerCertificate
