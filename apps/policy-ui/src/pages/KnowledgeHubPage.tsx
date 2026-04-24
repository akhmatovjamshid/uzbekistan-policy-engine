import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PageContainer } from '../components/layout/PageContainer'
import { PageHeader } from '../components/layout/PageHeader'
import './knowledge-hub.css'

type HubTab = 'reforms' | 'briefs' | 'literature'
type HubItem = {
  id: string
  titleKey: string
  summaryKey: string
  metaKey: string
  models: string[]
  tags: string[]
}

const HUB_TABS: HubTab[] = ['reforms', 'briefs', 'literature']
const MODEL_FILTERS = ['all', 'QPM', 'DFM', 'PE', 'IO', 'CGE', 'FPP'] as const

const REFORMS: HubItem[] = [
  {
    id: 'wto-accession',
    titleKey: 'knowledgeHub.content.reforms.wto.title',
    summaryKey: 'knowledgeHub.content.reforms.wto.summary',
    metaKey: 'knowledgeHub.content.reforms.wto.meta',
    models: ['PE', 'CGE', 'IO'],
    tags: ['trade', 'structural'],
  },
  {
    id: 'inflation-targeting',
    titleKey: 'knowledgeHub.content.reforms.inflationTargeting.title',
    summaryKey: 'knowledgeHub.content.reforms.inflationTargeting.summary',
    metaKey: 'knowledgeHub.content.reforms.inflationTargeting.meta',
    models: ['QPM', 'DFM', 'FPP'],
    tags: ['monetary', 'inflation'],
  },
  {
    id: 'energy-tariff',
    titleKey: 'knowledgeHub.content.reforms.energy.title',
    summaryKey: 'knowledgeHub.content.reforms.energy.summary',
    metaKey: 'knowledgeHub.content.reforms.energy.meta',
    models: ['CGE', 'FPP', 'QPM'],
    tags: ['fiscal', 'structural'],
  },
]

const BRIEFS: HubItem[] = [
  {
    id: 'remittance-risk',
    titleKey: 'knowledgeHub.content.briefs.remittance.title',
    summaryKey: 'knowledgeHub.content.briefs.remittance.summary',
    metaKey: 'knowledgeHub.content.briefs.remittance.meta',
    models: ['QPM', 'DFM', 'FPP'],
    tags: ['external', 'growth'],
  },
  {
    id: 'tariff-package',
    titleKey: 'knowledgeHub.content.briefs.tariff.title',
    summaryKey: 'knowledgeHub.content.briefs.tariff.summary',
    metaKey: 'knowledgeHub.content.briefs.tariff.meta',
    models: ['PE', 'CGE'],
    tags: ['trade', 'prices'],
  },
]

const LITERATURE: HubItem[] = [
  {
    id: 'qpm-method',
    titleKey: 'knowledgeHub.content.literature.qpm.title',
    summaryKey: 'knowledgeHub.content.literature.qpm.summary',
    metaKey: 'knowledgeHub.content.literature.qpm.meta',
    models: ['QPM'],
    tags: ['methodology', 'monetary'],
  },
  {
    id: 'dfm-method',
    titleKey: 'knowledgeHub.content.literature.dfm.title',
    summaryKey: 'knowledgeHub.content.literature.dfm.summary',
    metaKey: 'knowledgeHub.content.literature.dfm.meta',
    models: ['DFM'],
    tags: ['nowcast', 'methodology'],
  },
  {
    id: 'io-cge-method',
    titleKey: 'knowledgeHub.content.literature.ioCge.title',
    summaryKey: 'knowledgeHub.content.literature.ioCge.summary',
    metaKey: 'knowledgeHub.content.literature.ioCge.meta',
    models: ['IO', 'CGE'],
    tags: ['structural', 'methodology'],
  },
]

function itemsForTab(tab: HubTab): HubItem[] {
  if (tab === 'briefs') return BRIEFS
  if (tab === 'literature') return LITERATURE
  return REFORMS
}

export function KnowledgeHubPage() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<HubTab>('reforms')
  const [modelFilter, setModelFilter] = useState<(typeof MODEL_FILTERS)[number]>('all')
  const [tagFilter, setTagFilter] = useState('all')

  const tabItems = itemsForTab(activeTab)
  const tagOptions = useMemo(() => {
    return Array.from(new Set(tabItems.flatMap((item) => item.tags))).sort()
  }, [tabItems])
  const visibleItems = tabItems.filter((item) => {
    const modelMatches = modelFilter === 'all' || item.models.includes(modelFilter)
    const tagMatches = tagFilter === 'all' || item.tags.includes(tagFilter)
    return modelMatches && tagMatches
  })

  return (
    <PageContainer className="knowledge-hub-page">
      <PageHeader title={t('pages.knowledgeHub.title')} description={t('pages.knowledgeHub.description')} />

      <section className="knowledge-hub-panel knowledge-hub-panel--pulse" aria-labelledby="knowledge-pulse-title">
        <div className="page-section-head">
          <h2 id="knowledge-pulse-title">{t('knowledgeHub.pulse.title')}</h2>
          <p>{t('knowledgeHub.pulse.description')}</p>
        </div>
        <div className="knowledge-hub-pulse-grid">
          {(['reformsTracked', 'researchBriefs', 'references', 'modelTags'] as const).map((metricKey) => (
            <article key={metricKey} className="knowledge-hub-metric">
              <span>{t(`knowledgeHub.pulse.metrics.${metricKey}.label`)}</span>
              <strong>{t(`knowledgeHub.pulse.metrics.${metricKey}.value`)}</strong>
            </article>
          ))}
        </div>
      </section>

      <section className="knowledge-hub-panel" aria-labelledby="knowledge-index-title">
        <div className="knowledge-hub-controls">
          <div className="page-section-head">
            <h2 id="knowledge-index-title">{t('knowledgeHub.index.title')}</h2>
            <p>{t('knowledgeHub.index.description')}</p>
          </div>
          <div className="knowledge-hub-filters">
            <label>
              <span>{t('knowledgeHub.filters.model')}</span>
              <select value={modelFilter} onChange={(event) => setModelFilter(event.target.value as typeof modelFilter)}>
                {MODEL_FILTERS.map((model) => (
                  <option key={model} value={model}>
                    {model === 'all' ? t('knowledgeHub.filters.allModels') : model}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>{t('knowledgeHub.filters.tag')}</span>
              <select value={tagFilter} onChange={(event) => setTagFilter(event.target.value)}>
                <option value="all">{t('knowledgeHub.filters.allTags')}</option>
                {tagOptions.map((tag) => (
                  <option key={tag} value={tag}>
                    {t(`knowledgeHub.tags.${tag}`, { defaultValue: tag })}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="segmented-control" role="tablist" aria-label={t('knowledgeHub.tabs.aria')}>
          {HUB_TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={tab === activeTab}
              className={tab === activeTab ? 'active' : ''}
              onClick={() => {
                setActiveTab(tab)
                setTagFilter('all')
              }}
            >
              {t(`knowledgeHub.tabs.${tab}`)}
            </button>
          ))}
        </div>

        {visibleItems.length === 0 ? (
          <p className="empty-state">{t('knowledgeHub.empty')}</p>
        ) : (
          <div className="knowledge-hub-list">
            {visibleItems.map((item) => (
              <article key={item.id} className="knowledge-hub-card">
                <div>
                  <p className="knowledge-hub-card__meta">{t(item.metaKey)}</p>
                  <h3>{t(item.titleKey)}</h3>
                  <p>{t(item.summaryKey)}</p>
                </div>
                <div className="knowledge-hub-card__tags">
                  {item.models.map((model) => (
                    <span key={model} className="ui-chip ui-chip--accent">
                      {model}
                    </span>
                  ))}
                  {item.tags.map((tag) => (
                    <span key={tag} className="ui-chip ui-chip--neutral">
                      {t(`knowledgeHub.tags.${tag}`, { defaultValue: tag })}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </PageContainer>
  )
}
