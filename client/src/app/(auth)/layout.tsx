import React, { PropsWithChildren } from 'react'

const Layout = ({ children }: PropsWithChildren) => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-black to-indigo-950 z-0"></div>
      
      <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-blue-500/20 blur-[120px] z-0"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-purple-500/20 blur-[120px] z-0"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-cyan-500/20 blur-[120px] z-0"></div>
      
      <main className="relative z-10">{children}</main>
    </div>
  )
}

export default Layout