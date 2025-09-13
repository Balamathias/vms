import { getUser } from '@/services/server/auth'
import React, { PropsWithChildren } from 'react'

const Layout = async ({ children }: PropsWithChildren) => {
  const { data: user } = await getUser()

  if (!user?.is_staff) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center px-4">
        <div>
          <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
          <p className="text-lg">You do not have permission to access this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div>{children}</div>
  )
}

export default Layout