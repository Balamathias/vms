import { getUser } from '@/services/server/auth'
import { redirect } from 'next/navigation'
import React, { PropsWithChildren } from 'react'

const Layout = async ({ children }: PropsWithChildren) => {
  const { data: user } = await getUser()

  if (!user) 
    return redirect('/login?next=/positions')

  return (
    <>{children}</>
  )
}

export default Layout