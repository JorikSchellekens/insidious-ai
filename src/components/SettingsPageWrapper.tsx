import React, { useState } from 'react';
import { Button, View, Flex } from '@aws-amplify/ui-react';
import './SettingsPageWrapper.css';

interface SettingsPageWrapperProps {
  children: React.ReactNode;
  settingsPage: React.ReactNode;
}

export default function SettingsPageWrapper({ children, settingsPage }: SettingsPageWrapperProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <View className="settings-wrapper">
      {isSettingsOpen ? (
        <View className="settings-overlay">
          <Flex direction="column" padding="1rem">
            <Button
              variation="link"
              onClick={() => setIsSettingsOpen(false)}
              className="back-button"
            >
              ← Back
            </Button>
            {settingsPage}
          </Flex>
        </View>
      ) : (
        <>
          {children}
          <Button
            className="settings-button"
            onClick={() => setIsSettingsOpen(true)}
          >
            ⚙️
            <span className="sr-only">Open Settings</span>
          </Button>
        </>
      )}
    </View>
  );
}