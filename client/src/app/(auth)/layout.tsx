import { getUser } from '@/services/server/auth'
import { redirect } from 'next/navigation'
import React, { PropsWithChildren } from 'react'

const Layout = async ({ children }: PropsWithChildren) => {
  const { data: user } = await getUser()

  if (user) return redirect('/')
    
  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-20">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-black to-slate-900" />
          <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-red-500/10 blur-3xl" />
          <div className="absolute bottom-0 -right-20 w-[32rem] h-[32rem] rounded-full bg-gradient-to-tr from-purple-500/15 via-pink-500/10 to-cyan-500/10 blur-3xl" />
      </div>
      
      <main className="relative z-10">{children}</main>
    </div>
  )
}

export default Layout