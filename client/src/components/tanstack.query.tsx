'use client'

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { PropsWithChildren } from "react"
import { Toaster } from "./ui/sonner"

const client = new QueryClient()

export const TanstackQueryProvider = ({ children }: PropsWithChildren) => {
    return (
        <QueryClientProvider client={client}>
            {children}
            <Toaster 
                position="top-right"
                toastOptions={{
                    duration: 3000,
                }}
                richColors
            />
        </QueryClientProvider>
    )
}
