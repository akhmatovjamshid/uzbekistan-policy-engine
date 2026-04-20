import { toModelCode } from './modelCode.js'

type AttributionBadgeProps = {
  modelId: string
  active?: boolean
  title?: string
}

export function AttributionBadge({ modelId, active = false, title }: AttributionBadgeProps) {
  const normalizedModelId = toModelCode(modelId)
  const className = active ? 'attribution-badge attribution-badge--active' : 'attribution-badge'

  return (
    <span className={className} title={title}>
      {normalizedModelId}
    </span>
  )
}
