"use client"

import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
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
import { toast } from 'sonner'

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
                    toast.error(data.message)
                    return
                }
                router.replace('/')
            },
            onError: (error) => {
                form.setError('root', { message: error.message })
                toast.error(error.message)
            },
        })
    }

    // Ember particle configuration
    const particles = useMemo(() => Array.from({ length: 30 }).map((_, i) => ({
        id: i,
        delay: Math.random() * 6,
        size: Math.random() * 4 + 2,
        left: Math.random() * 100,
        top: Math.random() * 100,
        duration: Math.random() * 10 + 6,
        opacity: Math.random() * 0.4 + 0.2
    })), [])

    return (
        <div className="relative flex min-h-screen items-center justify-center px-4 py-10 sm:px-6 lg:px-8 overflow-hidden">
            {/* Ambient gradient background */}
            <div className="pointer-events-none absolute inset-0 -z-20">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900" />
                <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-red-500/10 blur-3xl" />
                <div className="absolute bottom-0 -right-20 w-[32rem] h-[32rem] rounded-full bg-gradient-to-tr from-purple-500/15 via-pink-500/10 to-cyan-500/10 blur-3xl" />
            </div>

            {/* Floating ember particles */}
            <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
                {particles.map(p => (
                    <motion.span
                        key={p.id}
                        className="absolute block rounded-full bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 shadow-[0_0_6px_rgba(255,140,0,0.6)]"
                        style={{
                            width: p.size,
                            height: p.size,
                            left: `${p.left}%`,
                            top: `${p.top}%`,
                            opacity: p.opacity
                        }}
                        animate={{
                            y: [0, -40 - Math.random() * 60, 0],
                            x: [0, (Math.random() - 0.5) * 40, 0],
                            opacity: [p.opacity, p.opacity * 0.2, p.opacity]
                        }}
                        transition={{
                            duration: p.duration,
                            delay: p.delay,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />
                ))}
            </div>

            <div className="w-full max-w-5xl relative">
                <div className="grid md:grid-cols-2 gap-10 items-stretch">
                    {/* Left showcase panel */}
                    <motion.div
                        className="relative hidden md:flex flex-col justify-between rounded-3xl overflow-hidden backdrop-blur-2xl border border-white/10 bg-white/5 p-8 shadow-2xl"
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10" />
                        <div className="relative z-10 space-y-6">
                            <motion.h2
                                className="text-4xl font-extrabold tracking-tight leading-tight bg-gradient-to-br from-white via-white/90 to-white/70 bg-clip-text text-transparent"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                Secure Student Voting
                            </motion.h2>
                            <motion.p
                                className="text-white/70 text-lg leading-relaxed"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.35 }}
                            >
                                Participate in a modern, transparent and secure academic award voting platform. Your identity is protected and your vote counts.
                            </motion.p>
                            <motion.ul
                                className="space-y-3 text-white/70 text-sm"
                                initial="hidden"
                                animate="visible"
                                variants={{
                                    hidden: { opacity: 0 },
                                    visible: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.45 } }
                                }}
                            >
                                {[
                                    'Encrypted authentication & smart security',
                                    'Real-time integrity & fraud prevention',
                                    'Optimized performance and accessibility'
                                ].map(item => (
                                    <motion.li
                                        key={item}
                                        className="flex items-start gap-3"
                                        variants={{ hidden: { opacity: 0, x: -15 }, visible: { opacity: 1, x: 0 } }}
                                    >
                                        <span className="mt-1 h-2 w-2 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-[0_0_8px_rgba(255,155,0,0.6)]" />
                                        <span>{item}</span>
                                    </motion.li>
                                ))}
                            </motion.ul>
                        </div>
                        <div className="relative z-10">
                            <div className="mt-10 h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                            <p className="pt-6 text-xs uppercase tracking-wider text-white/40">© {new Date().getFullYear()} ABU Awards Platform</p>
                        </div>
                        {/* Decorative orbs */}
                        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-gradient-to-br from-amber-400/30 via-orange-500/30 to-red-500/30 blur-3xl opacity-50" />
                        <div className="absolute bottom-[-3rem] left-[-3rem] w-56 h-56 rounded-full bg-gradient-to-tr from-purple-500/30 via-blue-500/30 to-cyan-500/30 blur-3xl opacity-40" />
                    </motion.div>

                    {/* Form panel with fiery ring */}
                    <div className="relative">
                        {/* Fiery rotating ring container */}
                        <motion.div
                            className="pointer-events-none absolute -inset-[3px] rounded-[1.6rem] hidden"
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 18, ease: "linear" }}
                            style={{
                                background: 'conic-gradient(from 0deg, rgba(255,150,0,0.0) 0deg, rgba(255,180,60,0.6) 60deg, rgba(255,90,0,0.85) 120deg, rgba(255,140,0,0.4) 180deg, rgba(255,0,0,0.0) 240deg, rgba(255,140,0,0.55) 300deg, rgba(255,150,0,0.0) 360deg)'
                            }}
                        >
                            {/* Inner mask to create ring thickness */}
                            <div className="absolute inset-[2.5px] rounded-[1.45rem] bg-slate-950" />
                            {/* Soft glow */}
                            <div className="absolute inset-0 rounded-[1.6rem] blur-xl opacity-60 bg-[radial-gradient(circle_at_50%_50%,rgba(255,120,0,0.35),transparent_70%)]" />
                        </motion.div>

                        <motion.div
                            className="relative overflow-hidden rounded-3xl border border-white/15 bg-white/[0.07] p-6 sm:p-8 shadow-2xl backdrop-blur-2xl"
                            initial={{ opacity: 0, y: 40, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                        >
                            {/* Animated subtle gradient overlay */}
                            <motion.div
                                className="pointer-events-none absolute inset-0 opacity-40"
                                animate={{
                                    background: [
                                        'radial-gradient(circle at 30% 30%, rgba(255,180,0,0.15), transparent 70%)',
                                        'radial-gradient(circle at 70% 60%, rgba(255,90,0,0.18), transparent 75%)',
                                        'radial-gradient(circle at 50% 50%, rgba(255,140,0,0.20), transparent 80%)'
                                    ]
                                }}
                                transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                            />

                            <div className="relative z-10">
                                <div className="mb-8 text-center space-y-3">
                                    <motion.div
                                        className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 flex items-center justify-center shadow-lg shadow-amber-500/30"
                                        initial={{ scale: 0.6, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ type: 'spring', stiffness: 140, damping: 14 }}
                                    >
                                        <LogIn className="h-8 w-8 text-white" />
                                    </motion.div>
                                    <h1 className="text-3xl font-bold tracking-tight text-white">
                                        Welcome Back
                                    </h1>
                                    <p className="text-white/60 text-sm font-medium">
                                        Sign in to continue to the awards platform
                                    </p>
                                </div>

                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-7">
                                        <FormField
                                            control={form.control}
                                            name="matricNumber"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <div className="flex items-center justify-between">
                                                        <FormLabel className="text-white/90 font-medium text-sm tracking-wide">
                                                            Matric Number
                                                        </FormLabel>
                                                        {form.formState.errors.matricNumber && (
                                                            <span className="text-xs text-red-400">Required</span>
                                                        )}
                                                    </div>
                                                    <FormControl>
                                                        <div className="relative group/input">
                                                            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40 group-focus-within/input:text-amber-300 transition-colors" />
                                                            <Input
                                                                placeholder="e.g., U20CL1141"
                                                                className={cn(
                                                                    'pl-10 border-white/15 bg-white/5 text-white placeholder:text-white/35',
                                                                    'focus-visible:border-amber-400/50 focus-visible:ring-amber-400/30 focus-visible:ring',
                                                                    'backdrop-blur-sm h-11 rounded-xl transition-all'
                                                                )}
                                                                {...field}
                                                            />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage className="text-xs" />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="password"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <div className="flex items-center justify-between">
                                                        <FormLabel className="text-white/90 font-medium text-sm tracking-wide">
                                                            Password
                                                        </FormLabel>
                                                        {form.formState.errors.password && (
                                                            <span className="text-xs text-red-400">Required</span>
                                                        )}
                                                    </div>
                                                    <FormControl>
                                                        <div className="relative group/input">
                                                            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40 group-focus-within/input:text-amber-300 transition-colors" />
                                                            <Input
                                                                type={showPassword ? 'text' : 'password'}
                                                                placeholder="Enter your password"
                                                                className={cn(
                                                                    'pl-10 pr-10 border-white/15 bg-white/5 text-white placeholder:text-white/35',
                                                                    'focus-visible:border-amber-400/50 focus-visible:ring-amber-400/30 focus-visible:ring',
                                                                    'backdrop-blur-sm h-11 rounded-xl transition-all'
                                                                )}
                                                                {...field}
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => setShowPassword(!showPassword)}
                                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                                                            >
                                                                {showPassword ? (
                                                                    <EyeOff className="h-4 w-4" />
                                                                ) : (
                                                                    <Eye className="h-4 w-4" />
                                                                )}
                                                            </button>
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage className="text-xs" />
                                                </FormItem>
                                            )}
                                        />

                                        <div className="pt-2">
                                            <motion.button
                                                type="submit"
                                                className={cn(
                                                    'group relative w-full h-12 rounded-xl font-semibold text-white tracking-wide overflow-hidden',
                                                    'bg-gradient-to-r from-amber-500/30 via-orange-500/30 to-red-500/30 border border-amber-400/40',
                                                    'hover:from-amber-500/40 hover:via-orange-500/40 hover:to-red-500/40 hover:border-amber-400/60',
                                                    'backdrop-blur-sm shadow-lg hover:shadow-amber-500/20 transition-all',
                                                    'active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed'
                                                )}
                                                disabled={(form.formState.isSubmitting || isPending)}
                                                whileHover={{ scale: 1.015 }}
                                                whileTap={{ scale: 0.97 }}
                                            >
                                                {/* Animated gradient sheen */}
                                                <motion.span
                                                    className="pointer-events-none absolute inset-0 -translate-x-full bg-[linear-gradient(110deg,transparent,rgba(255,255,255,0.25),transparent)]"
                                                    animate={{ translate: '100%' }}
                                                    transition={{ duration: 2.8, repeat: Infinity, ease: 'linear' }}
                                                />
                                                {(form.formState.isSubmitting || isPending) ? (
                                                    <div className="flex items-center justify-center gap-2">
                                                        <motion.div
                                                            className="h-5 w-5 rounded-full border-2 border-white/30 border-t-transparent"
                                                            animate={{ rotate: 360 }}
                                                            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                                                        />
                                                        <span className="text-sm">Authenticating...</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center justify-center gap-2">
                                                        <LogIn className="h-4 w-4" />
                                                        <span>Sign In</span>
                                                    </div>
                                                )}
                                            </motion.button>
                                        </div>
                                    </form>
                                </Form>

                                <div className="mt-8 text-center">
                                    <p className="text-xs text-white/50">
                                        Forgot your password?{' '}
                                        <button className="text-amber-300/90 hover:text-amber-200 underline underline-offset-4 transition-colors">
                                            Reset here
                                        </button>
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LoginPage