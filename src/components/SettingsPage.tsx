import React from 'react'
import './SettingsPage.css'

interface SettingsPageProps {
    theme: string
    setTheme: (theme: 'light' | 'dark') => void
}

const SettingsPage: React.FC<SettingsPageProps> = ({ theme, setTheme}) => {

  return (
    <div className="settings-page">
      <div className="settings-page__header">
        <h1 className="settings-page__title">Ustawienia</h1>
      </div>

      <div className="settings-list">
        <div className="settings-list__item">
          <div>
            <h3>Wygląd aplikacji</h3>
            <p>Wybierz motyw, który Ci odpowiada.</p>
          </div>

          <div className="theme-switch">
            <button
              className={theme === 'dark' ? 'active-theme' : ''}
              onClick={() => setTheme('dark')}
            >
              🌙 Ciemny
            </button>

            <button
              className={theme === 'light' ? 'active-theme' : ''}
              onClick={() => setTheme('light')}
            >
              ☀️ Jasny
            </button>
          </div>  
        </div>
      </div>
      
      
    </div>
  )
}

export default SettingsPage