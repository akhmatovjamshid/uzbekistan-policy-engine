import { LanguageProvider } from '../../state/language'
import { LanguageSwitcher } from '../../components/system/LanguageSwitcher'
import { NavLink, Outlet } from 'react-router-dom'
import { PRIMARY_NAV_ITEMS } from './nav'

export function AppShell() {
  return (
    <LanguageProvider>
      <div className="app-shell">
        <aside className="app-shell__sidebar">
          <div>
            <p className="app-shell__eyebrow">Uzbekistan Economic Policy Engine</p>
            <p className="app-shell__title">Policy Analysis Workspace</p>
          </div>

          <nav aria-label="Primary">
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
          <header className="app-shell__topbar">
            <LanguageSwitcher />
          </header>
          <main>
            <Outlet />
          </main>
        </div>
      </div>
    </LanguageProvider>
  )
}
