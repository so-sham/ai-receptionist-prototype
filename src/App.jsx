import { useState } from 'react'
import { DEFAULT_SETTINGS } from './lib/decide.js'
import { EXTRACTION_PROMPT } from './lib/extract.js'
import CallScreen from './screens/CallScreen.jsx'
import SettingsScreen from './screens/SettingsScreen.jsx'
import EvalScreen from './screens/EvalScreen.jsx'

const TABS = [
  { id: 'call', label: 'Call' },
  { id: 'settings', label: 'Settings' },
  { id: 'tests', label: 'Tests' },
]

export default function App() {
  const [activeTab, setActiveTab] = useState('call')
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [prompt, setPrompt] = useState(EXTRACTION_PROMPT)

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-title">AI Receptionist</div>
        <nav className="tabs">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`tab${activeTab === tab.id ? ' tab--active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="app-main">
        {activeTab === 'call' && <CallScreen settings={settings} />}
        {activeTab === 'settings' && (
          <SettingsScreen
            settings={settings}
            onChange={setSettings}
            prompt={prompt}
            onPromptChange={setPrompt}
          />
        )}
        {activeTab === 'tests' && <EvalScreen />}
      </main>
    </div>
  )
}
