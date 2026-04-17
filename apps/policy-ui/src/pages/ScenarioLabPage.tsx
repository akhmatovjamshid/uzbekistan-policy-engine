import { PageContainer } from '../components/layout/PageContainer'
import { PageHeader } from '../components/layout/PageHeader'

export function ScenarioLabPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Scenario Lab"
        description="Scenario authoring workspace scaffold for policy assumptions and results."
      />
      <div className="placeholder-card">Scenario Lab v1 scaffold</div>
    </PageContainer>
  )
}
