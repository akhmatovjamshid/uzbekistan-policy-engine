import type { LanguageCode } from '../../state/language-context'
import { useLanguage } from '../../state/useLanguage'

const OPTIONS: { value: LanguageCode; label: string }[] = [
  { value: 'en', label: 'EN' },
  { value: 'ru', label: 'RU' },
  { value: 'uz', label: 'UZ' },
]

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage()

  return (
    <label className="language-switcher">
      <span className="language-switcher__label">Language</span>
      <select
        value={language}
        onChange={(event) => setLanguage(event.target.value as LanguageCode)}
        aria-label="Select interface language"
      >
        {OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}
