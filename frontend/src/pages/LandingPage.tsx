import { LandingHero } from '@/components/landing/LandingHero'
import { LandingNav } from '@/components/landing/LandingNav'

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-50">
      <LandingNav />
      <main>
        <LandingHero />
      </main>
    </div>
  )
}
