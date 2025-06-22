import { getElectionResults } from '@/services/server/api'
import ElectionResults from '@/components/results/ElectionResults'
import React from 'react'

type PageProps = {
  params: Promise<{
    id: string
  }>
}

const ElectionResultsPage = async ({ params }: PageProps) => {
  const { data: results } = await getElectionResults((await params)?.id)
  
  if (!results) {
    return (
      <div className="min-h-screen bg-gradient-to-br flex items-center justify-center p-4">
        <div className="backdrop-blur-md bg-white/5 rounded-2xl border border-white/20 p-8 max-w-md mx-auto text-center">
          <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/20 backdrop-blur-sm">
            <svg className="h-8 w-8 text-red-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Results Not Found</h2>
          <p className="text-white/70">
            The election results you're looking for could not be found or are not yet available.
          </p>
        </div>
      </div>
    )
  }
  
  return <ElectionResults data={results as any} showBackButton={true} />
}

export default ElectionResultsPage