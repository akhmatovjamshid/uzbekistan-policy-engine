import type { LanguageCode } from '../../state/language-context'
import { useLanguage } from '../../state/useLanguage'

type EconomicStateHeaderProps = {
  summary: string
  updatedAt: string
}

const LOCALE_BY_LANGUAGE: Record<LanguageCode, string> = {
  en: 'en-GB',
  ru: 'ru-RU',
  uz: 'uz-UZ',
}

function formatDateTime(value: string, locale: string) {
  const date = new Date(value)
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function EconomicStateHeader({ summary, updatedAt }: EconomicStateHeaderProps) {
  const { language } = useLanguage()
  const locale = LOCALE_BY_LANGUAGE[language]

  return (
    <section className="overview-state-header" aria-labelledby="overview-state-header-title">
      <p id="overview-state-header-title" className="overview-section-kicker">
        Economic State
      </p>
      <p className="overview-state-header__summary">{summary}</p>
      <p className="overview-state-header__meta">Updated {formatDateTime(updatedAt, locale)}</p>
    </section>
  )
}
