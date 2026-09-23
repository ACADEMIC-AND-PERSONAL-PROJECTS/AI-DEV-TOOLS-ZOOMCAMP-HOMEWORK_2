import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import axios from 'axios'
import { Blocks } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/useAuth'
import type { ProblemDetail } from '@/types'

function extractError(error: unknown): string {
  if (axios.isAxiosError<ProblemDetail>(error)) {
    const detail = error.response?.data?.detail
    if (detail) return detail
    const errors = error.response?.data?.errors
    if (errors && errors.length > 0) return errors[0]
    if (error.response?.status === 401) return 'Identifiants invalides'
  }
  return 'Une erreur est survenue, réessayez'
}

export function AuthPage() {
  const { login, register } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      if (mode === 'login') {
        await login(email, password)
      } else {
        await register(email, password, fullName)
      }
      navigate('/')
    } catch (err) {
      setError(extractError(err))
    } finally {
      setSubmitting(false)
    }
  }

  const switchMode = (next: 'login' | 'register') => {
    setMode(next)
    setError(null)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#09090b] p-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-sm rounded-xl border border-zinc-800 bg-[#18181b]/70 p-8 shadow-2xl backdrop-blur-xl"
      >
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900">
            <Blocks className="size-5 text-zinc-200" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-semibold tracking-tight text-zinc-50">TechBlocks</h1>
            <p className="mt-1 text-sm text-zinc-500">
              {mode === 'login' ? 'Connectez-vous à votre espace' : 'Créez votre compte'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          {mode === 'register' && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="fullName">Nom complet</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ada Lovelace"
                required
              />
            </div>
          )}
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ada@techblocks.dev"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <p role="alert" className="rounded-md border border-red-900/60 bg-red-950/40 px-3 py-2 text-sm text-red-300">
              {error}
            </p>
          )}

          <Button type="submit" disabled={submitting} className="mt-2 w-full">
            {submitting ? 'Chargement…' : mode === 'login' ? 'Se connecter' : 'Créer le compte'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-500">
          {mode === 'login' ? 'Pas encore de compte ?' : 'Déjà un compte ?'}{' '}
          <button
            type="button"
            onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
            className="font-medium text-zinc-300 underline-offset-4 hover:underline"
          >
            {mode === 'login' ? 'S’inscrire' : 'Se connecter'}
          </button>
        </p>
      </motion.div>
    </div>
  )
}
