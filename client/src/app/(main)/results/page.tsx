import { getJustConcludedElectionResults, getElections } from '@/services/server/api'
import ElectionResults from '@/components/results/ElectionResults'
import React from 'react'
import ResultsHub from '@/components/results/ResultsHub'

const Page = async () => {
  const [latestResultsResponse, electionsResponse] = await Promise.all([
    getJustConcludedElectionResults(),
    getElections()
  ])
  
  const latestResults = latestResultsResponse?.data
  const pastElections = electionsResponse?.data || []
  
  return (
    <ResultsHub 
      latestResults={latestResults} 
      pastElections={pastElections}
    />
  )
}

export default Page