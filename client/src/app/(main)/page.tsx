import Home from '@/components/main/home'
import { getUser } from '@/services/server/auth'
import React from 'react'

const Page = async () => {
  const { data: user } = await getUser()
  console.log("User data:", user)
  return (
    <div>
      <Home user={user} />
    </div>
  )
}

export default Page