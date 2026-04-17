import { PageContainer } from '../components/layout/PageContainer'
import { PageHeader } from '../components/layout/PageHeader'

export function OverviewPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Overview"
        description="Macro snapshot entry point for decision-makers. Content scaffolding only."
      />
      <div className="placeholder-card">Overview v1 scaffold</div>
    </PageContainer>
  )
}
