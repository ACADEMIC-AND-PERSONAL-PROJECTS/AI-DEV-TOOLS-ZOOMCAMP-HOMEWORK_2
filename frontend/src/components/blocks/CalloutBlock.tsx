import { CircleCheck, CircleX, Info, TriangleAlert } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { asString } from './helpers'
import type { BlockViewProps } from './types'

type CalloutVariant = 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR'

const VARIANTS: CalloutVariant[] = ['INFO', 'WARNING', 'SUCCESS', 'ERROR']

const VARIANT_STYLES: Record<CalloutVariant, { container: string; icon: string }> = {
  INFO: { container: 'border-blue-900/60 bg-blue-950/40', icon: 'text-blue-400' },
  WARNING: { container: 'border-amber-900/60 bg-amber-950/40', icon: 'text-amber-400' },
  SUCCESS: { container: 'border-emerald-900/60 bg-emerald-950/40', icon: 'text-emerald-400' },
  ERROR: { container: 'border-red-900/60 bg-red-950/40', icon: 'text-red-400' },
}

const VARIANT_ICONS: Record<CalloutVariant, typeof Info> = {
  INFO: Info,
  WARNING: TriangleAlert,
  SUCCESS: CircleCheck,
  ERROR: CircleX,
}

function variantOf(value: unknown): CalloutVariant {
  const raw = asString(value).toUpperCase()
  return (VARIANTS as string[]).includes(raw) ? (raw as CalloutVariant) : 'INFO'
}

export function CalloutBlock({ block, selected, onSelect, onChange }: BlockViewProps) {
  const variant = variantOf(block.content.variant)
  const title = asString(block.content.title)
  const message = asString(block.content.message)

  const patch = (partial: Record<string, unknown>) => onChange({ ...block.content, ...partial })

  if (selected) {
    return (
      <div onClick={onSelect} className="flex flex-col gap-3 rounded-lg border border-zinc-600 p-3">
        <div className="w-40">
          <Select
            value={variant}
            onValueChange={(value) => patch({ variant: value as CalloutVariant })}
          >
            <SelectTrigger aria-label="Variante du callout" className="border-zinc-800 bg-zinc-900">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-zinc-800 bg-[#18181b]">
              {VARIANTS.map((v) => (
                <SelectItem key={v} value={v}>
                  {v}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Input
          value={title}
          onChange={(e) => patch({ title: e.target.value })}
          onClick={(e) => e.stopPropagation()}
          placeholder="Titre du callout"
          aria-label="Titre"
          className="border-zinc-800 bg-zinc-900"
        />
        <Textarea
          value={message}
          onChange={(e) => patch({ message: e.target.value })}
          onClick={(e) => e.stopPropagation()}
          placeholder="Message…"
          aria-label="Message"
          rows={3}
          className="min-h-14 resize-y border-zinc-800 bg-zinc-900 text-sm"
        />
      </div>
    )
  }

  const styles = VARIANT_STYLES[variant]
  const Icon = VARIANT_ICONS[variant]

  return (
    <div
      onClick={onSelect}
      className={`cursor-text rounded-lg border px-3 py-2.5 ${styles.container}`}
    >
      <div className="flex items-start gap-2">
        <Icon className={`mt-0.5 size-4 shrink-0 ${styles.icon}`} />
        <div className="min-w-0">
          {title && <p className="text-sm font-semibold text-zinc-100">{title}</p>}
          {message && <p className="text-sm leading-relaxed text-zinc-300">{message}</p>}
          {!title && !message && <p className="text-sm text-zinc-500">Callout vide — cliquez pour éditer</p>}
        </div>
      </div>
    </div>
  )
}
