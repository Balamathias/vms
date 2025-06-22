import React from 'react'

const Loading = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-black to-indigo-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
    </div>
  )
}

export default Loading