import { EconomicStateHeader } from '../components/overview/EconomicStateHeader'
import { KpiStrip } from '../components/overview/KpiStrip'
import { NowcastForecastBlock } from '../components/overview/NowcastForecastBlock'
import { QuickActions } from '../components/overview/QuickActions'
import { RiskPanel } from '../components/overview/RiskPanel'
import { PageContainer } from '../components/layout/PageContainer'
import { PageHeader } from '../components/layout/PageHeader'
import { getOverviewSnapshot } from '../data/overview/source'
import './overview.css'

export function OverviewPage() {
  const overviewData = getOverviewSnapshot()

  const {
    summary,
    generated_at,
    headline_metrics,
    nowcast_forecast,
    top_risks,
    analysis_actions,
    output_action,
  } = overviewData

  return (
    <PageContainer className="overview-page">
      <PageHeader
        title="Overview"
        description="Decision-first macro snapshot designed to show what changed, why it matters, and where to test next."
      />

      <EconomicStateHeader summary={summary} updatedAt={generated_at} outputAction={output_action} />

      <KpiStrip metrics={headline_metrics} />

      {nowcast_forecast ? (
        <div className="overview-two-column">
          <NowcastForecastBlock chart={nowcast_forecast} />
          <RiskPanel risks={top_risks} />
        </div>
      ) : null}

      <QuickActions actions={analysis_actions} />
    </PageContainer>
  )
}
