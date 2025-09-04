'use client'

import React, { useMemo } from 'react'
import { motion } from 'framer-motion'

const Particles = () => {
    const particles = useMemo(() => Array.from({ length: 30 }).map((_, i) => ({
        id: i,
        delay: Math.random() * 6,
        size: Math.random() * 4 + 2,
        left: Math.random() * 100,
        top: Math.random() * 100,
        duration: Math.random() * 10 + 6,
        opacity: Math.random() * 0.4 + 0.2
    })), [])

    return (
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            {particles.map(p => (
                <motion.span
                    key={p.id}
                    className="absolute block rounded-full bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 shadow-[0_0_6px_rgba(255,140,0,0.6)]"
                    style={{
                        width: p.size,
                        height: p.size,
                        left: `${p.left}%`,
                        top: `${p.top}%`,
                        opacity: p.opacity
                    }}
                    animate={{
                        y: [0, -40 - Math.random() * 60, 0],
                        x: [0, (Math.random() - 0.5) * 40, 0],
                        opacity: [p.opacity, p.opacity * 0.2, p.opacity]
                    }}
                    transition={{
                        duration: p.duration,
                        delay: p.delay,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
            ))}
        </div>
    )
}

export default Particles