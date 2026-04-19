import { LanguageSwitcher } from '../../components/system/LanguageSwitcher'
import { NavLink, Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PRIMARY_NAV_ITEMS } from './nav'

export function AppShell() {
  const { t } = useTranslation()

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        {t('shell.skipToMainContent')}
      </a>

      <aside className="app-shell__sidebar" aria-label={t('shell.workspaceNavigationAria')}>
        <div className="app-shell__brand">
          <p className="app-shell__eyebrow">{t('shell.brandEyebrow')}</p>
          <p className="app-shell__title">{t('shell.brandTitle')}</p>
        </div>

        <nav aria-label={t('shell.primaryNavigationAria')}>
          <p className="app-shell__nav-title">{t('shell.workspaceLabel')}</p>
          <ul className="app-shell__nav-list">
            {PRIMARY_NAV_ITEMS.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    isActive ? 'app-shell__nav-link active' : 'app-shell__nav-link'
                  }
                >
                  {t(item.labelKey)}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <div className="app-shell__main">
        <header className="app-shell__topbar" aria-label="Global utilities">
          <div className="app-shell__topbar-inner">
            <LanguageSwitcher />
          </div>
        </header>
        <main id="main-content" tabIndex={-1} className="app-shell__content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
