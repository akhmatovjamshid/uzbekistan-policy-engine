import { useTranslation } from 'react-i18next'
import type { ComparisonScenarioMeta } from '../../contracts/data-contract'
import { ScenarioChip } from './ScenarioChip.js'

type ComparisonSelectorProps = {
  scenarios: ComparisonScenarioMeta[]
  onRemove?: (scenarioId: string) => void
  onAddSavedScenario: () => void
}

// Prompt §4.3: chip-rail selector. Replaces the former full-panel
// ScenarioSelectorPanel. Baseline switcher is not re-introduced in this slice —
// baseline is driven by the scenario with role === 'baseline' and changes via
// the Add-saved-scenario / chip removal affordances.
export function ComparisonSelector({ scenarios, onRemove, onAddSavedScenario }: ComparisonSelectorProps) {
  const { t } = useTranslation()
  return (
    <div className="cmp-selector" aria-labelledby="comparison-selector-label">
      <span id="comparison-selector-label" className="label">
        {t('comparison.selector.inView')}
      </span>
      {scenarios.map((scenario) => (
        <ScenarioChip
          key={scenario.id}
          name={scenario.name}
          role={scenario.role}
          onRemove={onRemove ? () => onRemove(scenario.id) : undefined}
          removable={scenario.role !== 'baseline' && scenarios.length > 2}
        />
      ))}
      <button type="button" className="btn-ghost cmp-selector__add" onClick={onAddSavedScenario}>
        {t('comparison.selector.addSaved')}
      </button>
    </div>
  )
}
