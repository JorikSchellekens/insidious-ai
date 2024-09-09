import { useState } from 'react'
import { Settings, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SettingsPageWrapperProps {
  children: React.ReactNode
  settingsPage: React.ReactNode
}

export default function SettingsPageWrapper({ children, settingsPage }: SettingsPageWrapperProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  return (
    <div className="relative min-h-screen">
      {isSettingsOpen ? (
        <div className="fixed inset-0 bg-background z-50">
          <div className="p-4">
            <Button
              variant="ghost"
              onClick={() => setIsSettingsOpen(false)}
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            {settingsPage}
          </div>
        </div>
      ) : (
        <>
          <Button
            className="fixed top-4 left-4 rounded-full p-3 z-10"
            onClick={() => setIsSettingsOpen(true)}
          >
            <Settings className="h-6 w-6" />
            <span className="sr-only">Open Settings</span>
          </Button>
          {children}
        </>
      )}
    </div>
  )
}