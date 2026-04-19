import { useTranslation } from 'react-i18next'
import { PageContainer } from '../components/layout/PageContainer'
import { PageHeader } from '../components/layout/PageHeader'

export function KnowledgeHubPage() {
  const { t } = useTranslation()

  return (
    <PageContainer>
      <PageHeader title={t('pages.knowledgeHub.title')} description={t('pages.knowledgeHub.description')} />
      <div className="placeholder-card">Knowledge Hub v1 scaffold</div>
    </PageContainer>
  )
}
