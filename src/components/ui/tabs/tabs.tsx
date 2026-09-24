import { useId, useRef, type KeyboardEvent, type ReactNode } from 'react'

export type Tab<T extends string> = {
  id: T
  label: string
  shortLabel?: string
}

type TabsProps<T extends string> = {
  label: string
  tabs: readonly Tab<T>[]
  selectedId: T
  onSelect: (id: T) => void
  children: ReactNode
}

export function Tabs<T extends string>({
  label,
  tabs,
  selectedId,
  onSelect,
  children,
}: TabsProps<T>) {
  const baseId = useId()
  const panelId = `${baseId}-panel`
  const tabId = (id: T) => `${baseId}-tab-${id}`
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])

  function handleKeyDown(event: KeyboardEvent, index: number) {
    const last = tabs.length - 1
    const nextIndex: Record<string, number> = {
      ArrowRight: index === last ? 0 : index + 1,
      ArrowLeft: index === 0 ? last : index - 1,
      Home: 0,
      End: last,
    }
    const next = nextIndex[event.key]
    if (next === undefined) return

    event.preventDefault()
    onSelect(tabs[next].id)
    tabRefs.current[next]?.focus()
  }

  return (
    <div className="space-y-4">
      <div role="tablist" aria-label={label} className="flex gap-1">
        {tabs.map((tab, index) => {
          const selected = tab.id === selectedId
          return (
            <button
              key={tab.id}
              ref={(element) => {
                tabRefs.current[index] = element
              }}
              type="button"
              role="tab"
              id={tabId(tab.id)}
              aria-controls={panelId}
              aria-selected={selected}
              aria-label={tab.shortLabel ? tab.label : undefined}
              tabIndex={selected ? 0 : -1}
              onClick={() => onSelect(tab.id)}
              onKeyDown={(event) => handleKeyDown(event, index)}
              className={`min-h-11 flex-1 rounded-control px-2 text-sm font-semibold ${
                selected ? 'bg-brand text-on-brand' : 'text-ink hover:bg-brand-soft'
              }`}
            >
              {tab.shortLabel ?? tab.label}
            </button>
          )
        })}
      </div>

      <div role="tabpanel" id={panelId} aria-labelledby={tabId(selectedId)}>
        {children}
      </div>
    </div>
  )
}
