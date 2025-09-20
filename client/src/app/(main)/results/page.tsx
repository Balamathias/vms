import { getJustConcludedElectionResults, getElections } from '@/services/server/api'
import ElectionResults from '@/components/results/ElectionResults'
import React from 'react'
import ResultsHub from '@/components/results/ResultsHub'
import { getUser } from '@/services/server/auth'

const Page = async () => {
  const [latestResultsResponse, electionsResponse, user] = await Promise.all([
    getJustConcludedElectionResults(),
    getElections(),
    getUser()
  ])
  
  const latestResults = latestResultsResponse?.data
  const pastElections = electionsResponse?.data || []
  
  return (
    <ResultsHub 
      latestResults={latestResults} 
      pastElections={pastElections}
      user={user?.data}
    />
  )
}

export default Page