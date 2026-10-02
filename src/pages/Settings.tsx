import React, { useState } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { exportAllData, importAllData, clearAllData } from '../services/storageService';
import { ConfirmDialog } from '../components/ConfirmDialog';
import type { Settings as SettingsOptions } from '../types';

export const Settings: React.FC = () => {
  const { settings, updateSetting, updateSettings } = useSettings();
  const [importStatus, setImportStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleExport = () => {
    const data = exportAllData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stemmate-export-${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    const success = importAllData(text);

    setImportStatus({
      success,
      message: success ?
        'Settings and data imported successfully!' :
        'Failed to import data. Please check the file format.'
    });

    // Reset input
    e.target.value = '';
  };

  const handleReset = () => {
    clearAllData();
    updateSettings({
      darkMode: false,
      fontSize: 'base',
      highContrast: false,
      connectionSimulation: 'auto'
    });
    setShowResetConfirm(false);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl">
      {/* Page header */}
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">
          Customize your STEMMate Namibia experience
        </p>
      </header>

      {/* Import status */}
      {importStatus && (
        <div className={`mb-6 px-4 py-3 rounded-lg ${
          importStatus.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`} role="status" aria-live="polite">
          <p className={`${importStatus.success ? 'text-green-800' : 'text-red-800'} font-medium`}>
            {importStatus.message}
          </p>
        </div>
      )}

      {/* Settings sections */}
      <section className="space-y-8">
        {/* Appearance */}
        <div className="bg-white rounded-lg shadow-card border border-gray-100 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Appearance</h2>

          <div className="space-y-4">
            {/* Dark mode */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-lg" aria-hidden="true">🌙</span>
                <div>
                  <p className="font-medium text-gray-900">Dark mode</p>
                  <p className="text-sm text-gray-500">
                    Reduces eye strain in low-light conditions
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.darkMode}
                  onChange={(e) => {
                    updateSetting('darkMode', e.target.checked);
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-blue-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:shadow-peer-checked:bg-blue-600 after:transition">
                  <span className="peer-checked:translate-x-full w-5 h-5 bg-white rounded-full shadow ring-0 transition">
                  </span>
                </div>
              </label>
            </div>

            {/* Font size */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-lg" aria-hidden="true">🔤</span>
                <div>
                  <p className="font-medium text-gray-900">Font size</p>
                  <p className="text-sm text-gray-500">
                    Adjust text size for better readability
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const order: Array<SettingsOptions['fontSize']> = ['base', 'large', 'xl'];
                    const currentIndex = order.indexOf(settings.fontSize);
                    const nextIndex = (currentIndex + 1) % order.length;
                    updateSetting('fontSize', order[nextIndex]);
                  }}
                  className="rounded-md border border-gray-300 px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <span className="text-lg font-medium">{settings.fontSize === 'base' ? 'Default' : settings.fontSize === 'large' ? 'Large' : 'Extra Large'}</span>
                </button>
              </div>
            </div>

            {/* High contrast */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-lg" aria-hidden="true">⚫</span>
                <div>
                  <p className="font-medium text-gray-900">High contrast</p>
                  <p className="text-sm text-gray-500">
                    Improves readability for users with visual impairments
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.highContrast}
                  onChange={(e) => updateSetting('highContrast', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-blue-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:shadow-peer-checked:bg-blue-600 after:transition">
                  <span className="peer-checked:translate-x-full w-5 h-5 bg-white rounded-full shadow ring-0 transition">
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Data management */}
        <div className="bg-white rounded-lg shadow-card border border-gray-100 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Data Management</h2>

          <div className="space-y-4">
            {/* Export data */}
            <button
              onClick={handleExport}
              className="w-full flex items-center justify-start gap-3 px-4 py-3 text-left border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <span className="text-lg" aria-hidden="true">💾</span>
              <div>
                <p className="font-medium text-gray-900">Export Data</p>
                <p className="text-sm text-gray-500">
                  Download all your plans, saved activities, and settings as JSON
                </p>
              </div>
            </button>

            {/* Import data */}
            <div className="flex items-center gap-3">
              <span className="text-lg" aria-hidden="true">📥</span>
              <div>
                <p className="font-medium text-gray-900">Import Data</p>
                <p className="text-sm text-gray-500">
                  Previously exported data
                </p>
              </div>
              <input
                type="file"
                id="import-file"
                accept=".json"
                onChange={handleImport}
                className="sr-only"
              />
              <label
                htmlFor="import-file"
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 cursor-pointer"
              >
                Choose File
              </label>
            </div>

            {/* Reset data */}
            <button
              onClick={() => setShowResetConfirm(true)}
              className="w-full flex items-center justify-start gap-3 px-4 py-3 text-left border border-red-200 rounded-md hover:bg-red-50 text-red-800"
            >
              <span className="text-lg" aria-hidden="true">🗑️</span>
              <div>
                <p className="font-medium text-gray-900">Reset All Data</p>
                <p className="text-sm text-gray-500">
                  Clear all saved activities, plans, and requests
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Connection settings */}
        <div className="bg-white rounded-lg shadow-card border border-gray-100 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Connection</h2>

          <div className="space-y-4">
            {/* Connection simulation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Connection Mode
              </label>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="auto"
                    name="connection"
                    value="auto"
                    checked={settings.connectionSimulation === 'auto'}
                    onChange={(e) => updateSetting('connectionSimulation', e.target.value as SettingsOptions['connectionSimulation'])}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="auto" className="ml-2 text-sm font-medium text-gray-900">
                    Auto (use actual connection)
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="online"
                    name="connection"
                    value="online"
                    checked={settings.connectionSimulation === 'online'}
                    onChange={(e) => updateSetting('connectionSimulation', e.target.value as SettingsOptions['connectionSimulation'])}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="online" className="ml-2 text-sm font-medium text-gray-900">
                    Always Online (for testing)
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="offline"
                    name="connection"
                    value="offline"
                    checked={settings.connectionSimulation === 'offline'}
                    onChange={(e) => updateSetting('connectionSimulation', e.target.value as SettingsOptions['connectionSimulation'])}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="offline" className="ml-2 text-sm font-medium text-gray-900">
                    Always Offline (for testing)
                  </label>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Simulate different connection states for testing offline functionality
              </p>
            </div>
          </div>
        </div>

        {/* Privacy notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Privacy Notice</h2>
          <p className="text-gray-700">
            STEMMate Namibia takes student privacy seriously. No pupil names, photos, audio,
            identifiers, or profiles are ever stored or displayed in this application.
          </p>
          <p className="text-sm text-gray-600 mt-2">
            All data is stored locally on your device and never transmitted to external servers.
          </p>
        </div>
      </section>

      {/* Reset confirmation dialog */}
      <ConfirmDialog
        open={showResetConfirm}
        title="Reset all data?"
        description="This clears all saved activities, plans, kit requests and sync queue items on this device. This cannot be undone."
        confirmLabel="Reset all data"
        cancelLabel="Keep my data"
        destructive
        onConfirm={handleReset}
        onCancel={() => setShowResetConfirm(false)}
      />
    </div>
  );
};