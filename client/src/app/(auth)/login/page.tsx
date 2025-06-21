"use client"


import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Eye, EyeOff, User, Lock, LogIn } from 'lucide-react'
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useLogin } from '@/services/client/auth'
import { useRouter } from 'next/navigation'

const loginSchema = z.object({
    matricNumber: z
        .string()
        .min(6, 'Matric number must be at least 6 characters')
        .regex(/^[A-Z0-9\/]+$/i, 'Invalid matric number format'),
    password: z
        .string()
        .min(3, 'Password must be at least 3 characters'),
})

type LoginFormData = z.infer<typeof loginSchema>

const LoginPage = () => {
    const [showPassword, setShowPassword] = React.useState(false)
    const { mutate: login, isPending } = useLogin()

    const router = useRouter()

    const form = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            matricNumber: '',
            password: '',
        },
    })

    const onSubmit = (data: LoginFormData) => {
        login({ matric_number: data.matricNumber, password: data.password }, {
            onSuccess: (data) => {
                if (data.error) {
                    form.setError('root', { message: data.message })
                    return
                }
                router.replace('/')
            },
            onError: (error) => {
                form.setError('root', { message: error.message })
            },
        })
    }

    return (
        <div className="flex min-h-screen items-center justify-center p-4 md:p-6">
            <div className="w-full max-w-md">
                <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-white/5 p-4 md:p-8 shadow-2xl backdrop-blur-xl backdrop-saturate-150">
                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/10 via-transparent to-transparent" />
                    
                    <div className="relative z-10">
                        <div className="mb-8 text-center">
                            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
                                <LogIn className="h-8 w-8 text-white" />
                            </div>
                            <h1 className="text-3xl font-bold text-white">Welcome Back</h1>
                            <p className="mt-2 text-white/70">Sign in to your account</p>
                        </div>

                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="matricNumber"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-white/90 font-medium">
                                                Matric Number
                                            </FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
                                                    <Input
                                                        placeholder="e.g., U20CL1141"
                                                        className={cn(
                                                            "pl-10 border-white/20 bg-white/5 text-white placeholder:text-white/40",
                                                            "focus-visible:border-white/40 focus-visible:ring-white/20",
                                                            "backdrop-blur-sm h-10"
                                                        )}
                                                        {...field}
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormDescription className="text-white/60">
                                                Enter your student matric number
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-white/90 font-medium">
                                                Password
                                            </FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
                                                    <Input
                                                        type={showPassword ? "text" : "password"}
                                                        placeholder="Enter your password"
                                                        className={cn(
                                                            "pl-10 pr-10 border-white/20 bg-white/5 text-white placeholder:text-white/40",
                                                            "focus-visible:border-white/40 focus-visible:ring-white/20",
                                                            "backdrop-blur-sm h-10"
                                                        )}
                                                        {...field}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/70 transition-colors"
                                                    >
                                                        {showPassword ? (
                                                            <EyeOff className="h-4 w-4" />
                                                        ) : (
                                                            <Eye className="h-4 w-4" />
                                                        )}
                                                    </button>
                                                </div>
                                            </FormControl>
                                            <FormDescription className="text-white/60">
                                                Enter Your Password (most likely your state)
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <button
                                    type="submit"
                                    className={cn(
                                        "w-full h-11 rounded-lg font-semibold text-white transition-all duration-200",
                                        "bg-gradient-to-r from-white/20 to-white/10 border border-white/30",
                                        "hover:from-white/30 hover:to-white/20 hover:border-white/40",
                                        "backdrop-blur-sm shadow-lg hover:shadow-xl",
                                        "active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                                    )}
                                    disabled={(form.formState.isSubmitting || isPending)}
                                >
                                    {(form.formState.isSubmitting || isPending) ? (
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                            Signing in...
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center gap-2">
                                            <LogIn className="h-4 w-4" />
                                            Sign In
                                        </div>
                                    )}
                                </button>
                            </form>
                        </Form>

                        <div className="mt-6 text-center">
                            <p className="text-sm text-white/60">
                                Forgot your password?{' '}
                                <button className="text-white/80 hover:text-white underline transition-colors">
                                    Reset here
                                </button>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LoginPage