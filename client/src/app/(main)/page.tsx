import Home from '@/components/main/home'
import { getUser } from '@/services/server/auth'
import { getRecentWinners } from '@/services/server/api'
import React from 'react'

const Page = async () => {
  const [userResponse, winnersResponse] = await Promise.all([
    getUser(),
    getRecentWinners()
  ])
  
  const user = userResponse?.data
  const winners = winnersResponse?.data || []
  
  console.log("User data:", user)
  console.log("Winners data:", winners)
  
  return (
    <div>
      <Home user={user} winners={winners} />
    </div>
  )
}

export default Page