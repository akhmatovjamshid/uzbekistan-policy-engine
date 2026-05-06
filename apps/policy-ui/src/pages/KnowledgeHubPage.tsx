import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { KnowledgeHubContentView } from '../components/knowledge-hub/KnowledgeHubContentView.js'
import { PageContainer } from '../components/layout/PageContainer.js'
import { PageHeader } from '../components/layout/PageHeader.js'
import { beginRetry } from '../data/source-state.js'
import {
  getInitialKnowledgeHubSourceState,
  loadKnowledgeHubSourceState,
} from '../data/knowledge-hub/source.js'
import './knowledge-hub.css'

export function KnowledgeHubPage() {
  const { t } = useTranslation()
  const [sourceState, setSourceState] = useState(getInitialKnowledgeHubSourceState)

  useEffect(() => {
    let cancelled = false
    loadKnowledgeHubSourceState().then((state) => {
      if (!cancelled) {
        setSourceState(state)
      }
    })
    return () => {
      cancelled = true
    }
  }, [])

  async function handleRetry() {
    setSourceState((previous) => beginRetry(previous))
    const nextState = await loadKnowledgeHubSourceState()
    setSourceState(nextState)
  }

  const packageCount = sourceState.content?.meta.reform_packages ?? sourceState.content?.reform_packages?.length ?? 0
  const sourcesConfigured = sourceState.content?.meta.sources_configured ?? 0
  const extractionModeLabel = sourceState.content?.extraction_mode_label ?? 'Tracker artifact'
  const pageHeaderMeta = (
    <>
      <span className="page-header__eyebrow">{t('knowledgeHub.reformTracker.header.eyebrow')}</span>
      <span>{extractionModeLabel}</span>
      <span>{t('knowledgeHub.reformTracker.header.automaticTracker')}</span>
      <span>
        {t('knowledgeHub.reformTracker.header.sources')} <strong>{sourcesConfigured}</strong>
      </span>
      <span>
        {t('knowledgeHub.reformTracker.header.packages')} <strong>{packageCount}</strong>
      </span>
      {sourceState.content?.generated_at ? (
        <span>
          {t('knowledgeHub.reformTracker.header.lastFetch')} <strong>{sourceState.content.generated_at}</strong>
        </span>
      ) : null}
    </>
  )

  if (sourceState.status === 'loading') {
    return (
      <PageContainer className="knowledge-hub-page">
        <PageHeader
          title={t('pages.knowledgeHub.title')}
          description={t('pages.knowledgeHub.description')}
          meta={pageHeaderMeta}
        />
        <p className="empty-state" role="status" aria-live="polite">
          {t('states.loading.knowledgeHub')}
        </p>
      </PageContainer>
    )
  }

  if (sourceState.status === 'error' || !sourceState.content) {
    return (
      <PageContainer className="knowledge-hub-page">
        <PageHeader
          title={t('pages.knowledgeHub.title')}
          description={t('pages.knowledgeHub.description')}
          meta={pageHeaderMeta}
        />
        <p className="empty-state" role="alert">
          {sourceState.error ?? t('knowledgeHub.reformTracker.errorUnavailable')}
        </p>
        {sourceState.canRetry ? (
          <div>
            <button type="button" className="ui-secondary-action" onClick={handleRetry}>
              {t('buttons.retry')}
            </button>
          </div>
        ) : null}
      </PageContainer>
    )
  }

  return (
    <PageContainer className="knowledge-hub-page">
      <PageHeader
        title={t('pages.knowledgeHub.title')}
        description={t('pages.knowledgeHub.description')}
        meta={pageHeaderMeta}
      />
      <KnowledgeHubContentView content={sourceState.content} />
    </PageContainer>
  )
}
