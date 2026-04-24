import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ComparisonSelector } from '../components/comparison/ComparisonSelector'
import { DeltaTable } from '../components/comparison/DeltaTable'
import { ScenarioSummaryCards } from '../components/comparison/ScenarioSummaryCards'
import { TradeoffSummaryPanel } from '../components/comparison/TradeoffSummaryPanel'
import { PageContainer } from '../components/layout/PageContainer'
import { PageHeader } from '../components/layout/PageHeader'
import type { ComparisonContent } from '../contracts/data-contract'
import { comparisonContentMock } from '../data/mock/comparison-content'
import './comparison.css'

const COMPARISON_SLOT_LIMIT = 3

export function ComparisonPage() {
  const { t } = useTranslation()
  const [content, setContent] = useState<ComparisonContent>(comparisonContentMock)

  const visibleScenarios = useMemo(
    () => content.scenarios.slice(0, COMPARISON_SLOT_LIMIT),
    [content.scenarios],
  )

  const pageHeaderMeta = (
    <>
      <span className="page-header__eyebrow">{t('comparison.header.eyebrow')}</span>
      <span>
        {t('comparison.header.meta.comparing')} {t('overview.common.middleDot')}{' '}
        <strong>{t('comparison.header.meta.scenarioCount', { count: visibleScenarios.length })}</strong>
      </span>
      <span>
        {t('comparison.header.meta.horizon')} {t('overview.common.middleDot')}{' '}
        <strong>{content.horizon_label}</strong>
      </span>
      <span>
        {t('comparison.header.meta.mode')} {t('overview.common.middleDot')}{' '}
        <strong>{t('comparison.header.meta.deltasVsBaseline')}</strong>
      </span>
    </>
  )

  function handleRemove(scenarioId: string) {
    setContent((prev) => ({
      ...prev,
      scenarios: prev.scenarios.filter((scenario) => scenario.id !== scenarioId),
    }))
  }

  function handleAddSavedScenario() {
    // Shot 1 stub — spec §4.3 accepts a logging stub until the saved-scenario
    // picker modal lands. A real picker would source from scenarioStore and
    // merge into content.scenarios (subject to COMPARISON_SLOT_LIMIT).
    console.info('[Comparison] Add-saved-scenario modal not yet wired (Shot 2).')
  }

  return (
    <PageContainer className="comparison-page">
      <PageHeader
        title={t('pages.comparison.title')}
        description={t('pages.comparison.description')}
        meta={pageHeaderMeta}
      />

      <ComparisonSelector
        scenarios={visibleScenarios}
        onRemove={handleRemove}
        onAddSavedScenario={handleAddSavedScenario}
      />

      <ScenarioSummaryCards scenarios={visibleScenarios} metrics={content.metrics} />

      <DeltaTable
        scenarios={visibleScenarios}
        metrics={content.metrics}
        baselineScenarioId={content.baseline_scenario_id}
      />

      <TradeoffSummaryPanel tradeoff={content.tradeoff} scenarios={visibleScenarios} />
    </PageContainer>
  )
}
