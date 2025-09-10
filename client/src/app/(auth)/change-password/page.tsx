"use client"

import React, { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { AnimatePresence, motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { CalendarIcon, ChevronDown, Eye, EyeOff, KeyRound, Lock, RefreshCw, ShieldCheck, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react'

import { useChangePassword } from '@/services/client/auth'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'

const changePasswordSchema = z.object({
  matricNumber: z.string().min(6, 'Matric number must be at least 6 characters').regex(/^[A-Z0-9\/]+$/i, 'Invalid matric number format'),
  oldPassword: z.string().min(3, 'Old password must be at least 3 characters'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Please confirm your new password'),
  dateOfBirth: z.date({ required_error: 'Date of birth is required' })
}).refine(d => d.newPassword === d.confirmPassword, {
  path: ['confirmPassword'],
  message: 'Passwords do not match'
})

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>

// Format date using local components to avoid UTC timezone shift (off-by-one day)
const formatDate = (date: Date) => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}` // YYYY-MM-DD (local)
}

const ChangePasswordPage = () => {
  const router = useRouter()
  const { mutate: changePassword, isPending } = useChangePassword()

  const [showOld, setShowOld] = React.useState(false)
  const [showNew, setShowNew] = React.useState(false)
  const [showConfirm, setShowConfirm] = React.useState(false)
  const [step, setStep] = React.useState(0)

  const TOTAL_STEPS = 3

  const stepTitles = [
    'Verify Identity',
    'Authenticate',
    'Set New Password'
  ]

  const form = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      matricNumber: '',
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
      dateOfBirth: undefined as unknown as Date,
    }
  })

  const doSubmit = (data: ChangePasswordFormData) => {
    changePassword({
      matric_number: data.matricNumber.trim(),
      old_password: data.oldPassword,
      new_password: data.newPassword,
      date_of_birth: formatDate(data.dateOfBirth)
    }, {
      onSuccess: (resp: any) => {
        if (resp?.error) {
          form.setError('root', { message: (resp.message.replace('non_field_errors:', '')).trim() || 'Failed to change password' })
          toast.error((resp.message.replace('non_field_errors:', '')).trim() || 'Failed to change password')
          return
        }
        toast.success(resp?.message || 'Password changed successfully')
        router.replace('/login')
      },
      onError: (err: any) => {
        form.setError('root', { message: (err.message.replace('non_field_errors:', '')).trim() })
        toast.error(err.message)
      }
    })
  }

  const handleNext = async () => {
    const fieldsPerStep: (keyof ChangePasswordFormData)[][] = [
      ['matricNumber', 'dateOfBirth'],
      ['oldPassword'],
      ['newPassword', 'confirmPassword']
    ]
    const currentFields = fieldsPerStep[step]
    const valid = await form.trigger(currentFields, { shouldFocus: true })
    if (!valid) return
    if (step < TOTAL_STEPS - 1) setStep(s => s + 1)
  }

  const handlePrev = () => setStep(s => Math.max(0, s - 1))

  const onSubmit = (data: ChangePasswordFormData) => {
    if (step < TOTAL_STEPS - 1) {
      handleNext()
      return
    }
    doSubmit(data)
  }

  const particles = useMemo(() => Array.from({ length: 25 }).map((_, i) => ({
    id: i,
    delay: Math.random() * 6,
    size: Math.random() * 4 + 2,
    left: Math.random() * 100,
    top: Math.random() * 100,
    duration: Math.random() * 10 + 6,
    opacity: Math.random() * 0.4 + 0.2
  })), [])

  // Password strength (simple heuristic)
  const passwordStrength = React.useMemo(() => {
    const p = form.watch('newPassword') || ''
    let score = 0
    if (p.length >= 6) score++
    if (/[A-Z]/.test(p)) score++
    if (/[0-9]/.test(p)) score++
    if (/[^A-Za-z0-9]/.test(p)) score++
    if (p.length >= 12) score++
    return score // 0 - 5
  }, [form.watch('newPassword')])

  const strengthLabels = ['Too Weak','Weak','Fair','Good','Strong','Elite']
  const strengthColors = ['bg-red-500','bg-orange-500','bg-amber-500','bg-yellow-400','bg-lime-400','bg-emerald-500']

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-12 sm:px-8 lg:px-12 overflow-hidden">
      {/* Background */}
      {/* <div className="pointer-events-none absolute inset-0 -z-20">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900" />
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-red-500/10 blur-3xl" />
        <div className="absolute bottom-0 -right-20 w-[32rem] h-[32rem] rounded-full bg-gradient-to-tr from-purple-500/15 via-pink-500/10 to-cyan-500/10 blur-3xl" />
      </div> */}

      {/* Particles */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        {particles.map(p => (
          <motion.span
            key={p.id}
            className="absolute block rounded-full bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 shadow-[0_0_6px_rgba(255,140,0,0.6)]"
            style={{ width: p.size, height: p.size, left: `${p.left}%`, top: `${p.top}%`, opacity: p.opacity }}
            animate={{ y: [0, -40 - Math.random() * 60, 0], x: [0, (Math.random() - 0.5) * 40, 0], opacity: [p.opacity, p.opacity * 0.2, p.opacity] }}
            transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </div>

      <div className="w-full max-w-4xl relative">
        {/* Top progress indicator */}
        <div className="mx-auto mb-10 w-full max-w-2xl">
          <div className="flex items-center justify-between mb-4">
            {stepTitles.map((title, i) => {
              const active = i === step
              const completed = i < step
              return (
                <div key={title} className="flex flex-col items-center flex-1">
                  <motion.div
                    className={cn('relative flex items-center justify-center rounded-full border backdrop-blur-sm',
                      'h-14 w-14 text-sm font-semibold',
                      active ? 'border-amber-400/60 bg-gradient-to-br from-amber-500/30 to-red-500/30 text-white shadow-lg shadow-amber-500/20' :
                      completed ? 'border-emerald-400/60 bg-emerald-500/20 text-emerald-100' : 'border-white/15 bg-white/5 text-white/50'
                    )}
                    initial={false}
                    animate={{ scale: active ? 1.08 : 1, boxShadow: active ? '0 0 25px -5px rgba(255,180,80,0.4)' : 'none' }}
                    transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                  >
                    {completed ? <ShieldCheck className="h-7 w-7" /> : i + 1}
                    {active && (
                      <motion.span
                        layoutId="glow"
                        className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-br from-amber-400/30 via-orange-500/30 to-red-500/30 blur-md" />
                    )}
                  </motion.div>
                  <div className="mt-3 text-xs font-medium tracking-wide text-center w-24 text-white/70 leading-snug">
                    {title}
                  </div>
                </div>
              )
            })}
          </div>
          <div className="h-2 rounded-full bg-white/10 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-amber-400 via-orange-500 to-red-500"
              initial={false}
              animate={{ width: `${((step) / (TOTAL_STEPS - 1)) * 100}%` }}
              transition={{ type: 'spring', stiffness: 120, damping: 20 }}
            />
          </div>
        </div>

        <motion.div
          className="relative overflow-hidden rounded-3xl border border-white/15 bg-white/[0.08] p-4 sm:p-14 shadow-2xl backdrop-blur-2xl"
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          {/* Animated overlay */}
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
            <div className="mb-10 text-center space-y-5">
              <motion.div
                className="mx-auto h-24 w-24 rounded-3xl bg-gradient-to-br flex items-center justify-center shadow-xl shadow-amber-500/30 relative"
                initial={{ rotate: -15, scale: 0.6, opacity: 0 }}
                animate={{ rotate: 0, scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 120, damping: 14 }}
              >
                <RefreshCw className="h-12 w-12 text-white" />
                <motion.span
                  className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-amber-400/40 via-transparent to-red-500/40 blur-xl"
                  animate={{ opacity: [0.4, 0.8, 0.4], rotate: 360 }}
                  transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
                />
              </motion.div>
              <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center justify-center gap-3">
                <Sparkles className="h-7 w-7 text-amber-300" />
                Change Password
                <Sparkles className="h-7 w-7 text-amber-300" />
              </h1>
              <p className="text-white/60 text-base font-medium">Change your password, and please try not to forget it.</p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12">
                <AnimatePresence mode="wait" initial={false}>
                  {step === 0 && (
                    <motion.div
                      key="step-0"
                      initial={{ opacity: 0, x: -60 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 60 }}
                      transition={{ duration: 0.55, ease: 'easeOut' }}
                      className="grid gap-10 md:grid-cols-2"
                    >
                      <FormField
                        control={form.control}
                        name="matricNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white/90 font-semibold text-sm tracking-wide">Matric Number</FormLabel>
                            <FormControl>
                              <div className="relative group">
                                <Input placeholder="U21CL2024" className="bg-white/5 border-white/25 text-white placeholder:text-white/40 h-14 text-base pr-12 group-hover:border-amber-400/50 transition" {...field} />
                                <KeyRound className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40 group-hover:text-amber-300 transition" />
                              </div>
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="dateOfBirth"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel className="text-white/90 font-semibold text-sm tracking-wide">Date of Birth</FormLabel>
                            <FormControl>
                              <DatePicker value={field.value} onChange={d => field.onChange(d)} large />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                    </motion.div>
                  )}
                  {step === 1 && (
                    <motion.div
                      key="step-1"
                      initial={{ opacity: 0, x: -60 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 60 }}
                      transition={{ duration: 0.55, ease: 'easeOut' }}
                      className="space-y-10"
                    >
                      <FormField
                        control={form.control}
                        name="oldPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white/90 font-semibold text-sm tracking-wide">Old Password (Probably your State)</FormLabel>
                            <FormControl>
                              <div className="relative group">
                                <Input type={showOld ? 'text' : 'password'} className="bg-white/5 border-white/25 text-white placeholder:text-white/40 h-14 text-base pr-14 group-hover:border-amber-400/50 transition" placeholder="Current password" {...field} />
                                <button type="button" onClick={() => setShowOld(o => !o)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-amber-200 transition" tabIndex={-1}>
                                  {showOld ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                              </div>
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                    </motion.div>
                  )}
                  {step === 2 && (
                    <motion.div
                      key="step-2"
                      initial={{ opacity: 0, x: -60 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 60 }}
                      transition={{ duration: 0.55, ease: 'easeOut' }}
                      className="grid gap-10 md:grid-cols-2"
                    >
                      <FormField
                        control={form.control}
                        name="newPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white/90 font-semibold text-sm tracking-wide">New Password</FormLabel>
                            <FormControl>
                              <div className="relative group">
                                <Input type={showNew ? 'text' : 'password'} className="bg-white/5 border-white/25 text-white placeholder:text-white/40 h-14 text-base pr-14 group-hover:border-amber-400/50 transition" placeholder="Create strong password" {...field} />
                                <button type="button" onClick={() => setShowNew(o => !o)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-amber-200 transition" tabIndex={-1}>
                                  {showNew ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                              </div>
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white/90 font-semibold text-sm tracking-wide">Confirm Password</FormLabel>
                            <FormControl>
                              <div className="relative group">
                                <Input type={showConfirm ? 'text' : 'password'} className="bg-white/5 border-white/25 text-white placeholder:text-white/40 h-14 text-base pr-14 group-hover:border-amber-400/50 transition" placeholder="Repeat new password" {...field} />
                                <button type="button" onClick={() => setShowConfirm(o => !o)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-amber-200 transition" tabIndex={-1}>
                                  {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                              </div>
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                      <div className="md:col-span-2 space-y-3">
                        <div className="flex items-center justify-between text-xs text-white/60 font-medium">
                          <span>Password Strength</span>
                          <span className="text-amber-300/80">{strengthLabels[passwordStrength]}</span>
                        </div>
                        <div className="h-3 w-full rounded-full bg-white/10 overflow-hidden flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <motion.div
                              key={i}
                              className={cn('flex-1 mx-[1px] rounded-sm', i <= passwordStrength - 1 ? strengthColors[passwordStrength] : 'bg-white/10')}
                              initial={false}
                              animate={{ scaleY: i <= passwordStrength - 1 ? 1 : 0.85, opacity: i <= passwordStrength - 1 ? 1 : 0.4 }}
                              transition={{ type: 'spring', stiffness: 120, damping: 14 }}
                            />
                          ))}
                        </div>
                        <p className="text-[11px] text-white/40 leading-relaxed">Use a mix of upper & lower case letters, numbers, special symbols and at least 12 characters for an elite password.</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex flex-col gap-6 pt-4">
                  {form.formState.errors.root && (
                    <p className="text-center text-sm text-red-400">{form.formState.errors.root.message}</p>
                  )}
                  <div className={cn("flex flex-col md:flex-row md:items-center gap-5")}>
                    <motion.button
                      type="button"
                      onClick={handlePrev}
                      disabled={step === 0 || isPending}
                      className={cn('relative md:w-40 h-14 rounded-2xl font-semibold text-white tracking-wide overflow-hidden border',
                        'border-white/15 bg-white/5 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed', step === 0 && 'hidden')}
                      whileHover={step !== 0 ? { scale: 1.03 } : undefined}
                      whileTap={step !== 0 ? { scale: 0.96 } : undefined}
                    >
                      <span className="flex items-center justify-center gap-2"><ArrowLeft className="h-5 w-5" /> Back</span>
                    </motion.button>
                    <motion.button
                      type={step === TOTAL_STEPS - 1 ? 'submit' : 'button'}
                      onClick={step === TOTAL_STEPS - 1 ? undefined : handleNext}
                      disabled={isPending}
                      className={cn(
                        'group relative flex-1 h-14 rounded-2xl font-semibold text-white text-lg tracking-wide overflow-hidden',
                        'bg-gradient-to-r from-amber-500/40 via-orange-500/40 to-red-500/40 border border-amber-400/50',
                        'hover:from-amber-500/50 hover:via-orange-500/50 hover:to-red-500/50 hover:border-amber-300/70',
                        'backdrop-blur-sm shadow-xl hover:shadow-amber-500/30 transition-all',
                        'active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed p-4'
                      )}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <span className="relative z-10 flex items-center justify-center gap-3">
                        {step === TOTAL_STEPS - 1 ? (isPending ? 'Updating...' : 'Finalize Change') : 'Continue'}
                        {step === TOTAL_STEPS - 1 ? <Lock className="h-5 w-5" /> : <ArrowRight className="h-5 w-5" />}
                      </span>
                      <motion.span
                        className="pointer-events-none absolute inset-0 -translate-x-full bg-[linear-gradient(110deg,transparent,rgba(255,255,255,0.35),transparent)]"
                        animate={{ translate: '100%' }}
                        transition={{ duration: 2.2, repeat: Infinity, ease: 'linear' }}
                      />
                    </motion.button>
                  </div>
                </div>
              </form>
            </Form>
            <div className="mt-8 text-center">
              <p className="text-sm text-white/50">
                Remembered your password?{' '}
                <button onClick={() => router.push('/login')} className="text-amber-300/90 hover:text-amber-200 underline underline-offset-4 transition-colors">
                  Go back to login
                </button>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

// DatePicker component (integrated version of provided example)
const DatePicker = ({ value, onChange, large }: { value?: Date; onChange: (d?: Date) => void; large?: boolean }) => {
  const [open, setOpen] = React.useState(false)
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          type="button"
          className={cn('justify-between font-medium bg-white/5 border-white/25 text-white hover:bg-white/10 rounded-2xl',
            large ? 'h-14 text-base px-6 w-full' : 'h-11 px-4 w-full md:w-64',
            !value && 'text-white/40')}
          onClick={() => setOpen(o => !o)}
        >
          <span className="flex items-center gap-3">
            <CalendarIcon className="h-5 w-5" />
            {value ? value.toLocaleDateString() : 'Select date'}
          </span>
          <ChevronDown className="h-5 w-5 opacity-70" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto overflow-hidden p-0 rounded-2xl border border-white/20 backdrop-blur-xl bg-slate-900/70" align="start">
        <Calendar
          mode="single"
          selected={value}
          // @ts-ignore: depends on implementation
          captionLayout="dropdown"
          onSelect={(date: Date | undefined) => {
            onChange(date)
            setOpen(false)
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}

export default ChangePasswordPage
