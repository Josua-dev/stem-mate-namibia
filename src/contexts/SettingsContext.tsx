import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Settings } from '../types';
import { getSettings, saveSettings as saveSettingsUtil } from '../services/storageService';

export const SettingsContext = createContext<{
  settings: Settings;
  updateSetting: (key: keyof Settings, value: Settings[keyof Settings]) => void;
  updateSettings: (settings: Partial<Settings>) => void;
  darkMode: boolean;
  fontSize: 'base' | 'large' | 'xl';
  highContrast: boolean;
  connectionSimulation: 'auto' | 'online' | 'offline';
} | undefined>(undefined);

const DEFAULT_SETTINGS: Settings = {
  darkMode: false,
  fontSize: 'base',
  highContrast: false,
  connectionSimulation: 'auto'
};

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>(() => {
    const stored = getSettings();
    return stored || DEFAULT_SETTINGS;
  });

  useEffect(() => {
    const root = document.documentElement;

    if (settings.darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    if (settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    root.dataset.fontSize = settings.fontSize;
  }, [settings]);

  const updateSetting = (key: keyof Settings, value: Settings[keyof Settings]) => {
    setSettings(prev => {
      const newSettings = { ...prev, [key]: value };
      saveSettingsUtil(newSettings);
      return newSettings;
    });
  };

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings(prev => {
      const merged = { ...prev, ...newSettings };
      saveSettingsUtil(merged);
      return merged;
    });
  };

  return (
    <SettingsContext.Provider value={{
      settings,
      updateSetting,
      updateSettings,
      darkMode: settings.darkMode,
      fontSize: settings.fontSize,
      highContrast: settings.highContrast,
      connectionSimulation: settings.connectionSimulation
    }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};