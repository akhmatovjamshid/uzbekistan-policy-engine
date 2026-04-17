import { PageContainer } from '../components/layout/PageContainer'
import { PageHeader } from '../components/layout/PageHeader'

export function ModelExplorerPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Model Explorer"
        description="Technical model assumptions, equations, parameters, and caveats scaffold."
      />
      <div className="placeholder-card">Model Explorer v1 scaffold</div>
    </PageContainer>
  )
}
