import { LanguageProvider } from '../../state/language-provider'
import { LanguageSwitcher } from '../../components/system/LanguageSwitcher'
import { NavLink, Outlet } from 'react-router-dom'
import { PRIMARY_NAV_ITEMS } from './nav'

export function AppShell() {
  return (
    <LanguageProvider>
      <div className="app-shell">
        <a className="skip-link" href="#main-content">
          Skip to main content
        </a>

        <aside className="app-shell__sidebar" aria-label="Workspace navigation">
          <div className="app-shell__brand">
            <p className="app-shell__eyebrow">Uzbekistan Economic Policy Engine</p>
            <p className="app-shell__title">Policy Analysis Workspace</p>
          </div>

          <nav aria-label="Primary">
            <p className="app-shell__nav-title">Workspace</p>
            <ul className="app-shell__nav-list">
              {PRIMARY_NAV_ITEMS.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      isActive ? 'app-shell__nav-link active' : 'app-shell__nav-link'
                    }
                  >
                    {item.label}
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
    </LanguageProvider>
  )
}
