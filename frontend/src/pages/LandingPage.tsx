import { ApiSection } from '@/components/landing/ApiSection'
import { BlocksShowcase } from '@/components/landing/BlocksShowcase'
import { FeaturesSection } from '@/components/landing/FeaturesSection'
import { LandingCta } from '@/components/landing/LandingCta'
import { LandingFooter } from '@/components/landing/LandingFooter'
import { LandingHero } from '@/components/landing/LandingHero'
import { LandingNav } from '@/components/landing/LandingNav'
import { WorkflowSection } from '@/components/landing/WorkflowSection'

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-50">
      <LandingNav />
      <main>
        <LandingHero />
        <BlocksShowcase />
        <FeaturesSection />
        <WorkflowSection />
        <ApiSection />
        <LandingCta />
      </main>
      <LandingFooter />
    </div>
  )
}
