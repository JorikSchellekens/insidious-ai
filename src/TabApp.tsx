import React from 'react'
import { init } from '@instantdb/react'
import SettingsPageWrapper from './components/SettingsPageWrapper'
import SettingsPage from './pages/SettingsPage'
import FirstTimeFlow from './components/FirstTimeFlow'
import { DBSchema } from './types'

const APP_ID = 'c0f5375a-23e1-45ca-ae1c-18a334d4e18a'

const db = init<DBSchema>({ appId: APP_ID })

function TabApp() {
  const { isLoading, user, error } = db.useAuth()

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }
  if (error) {
    return <div className="flex items-center justify-center h-screen">Uh oh! {error.message}</div>
  }
  if (!user) return <FirstTimeFlow db={db} />

  return (
    <div className="min-h-screen bg-background">
      <SettingsPageWrapper settingsPage={<SettingsPage db={db} user={user} />}>
        <div className="p-4">
          <h1 className="text-3xl font-bold mb-4">Welcome to Insidious New Tab</h1>
          <p>This is your new tab page. You can customize it as needed.</p>
        </div>
      </SettingsPageWrapper>
    </div>
  )
}

export default TabApp