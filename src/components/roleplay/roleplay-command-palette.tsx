import React, { useState, useEffect } from 'react';
import { Command } from 'cmdk';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  AiSearchIcon,
  AiFileIcon,
  AiUserIcon,
  AlarmClockIcon,
  AnalyticsUpIcon,
  BulbIcon,
  KeyboardIcon,
  SettingsIcon,
  ArrowLeftDoubleIcon,
  AiMicIcon,
  SunIcon,
  MoonIcon
} from '@hugeicons/core-free-icons';
import {
  Scenario,
  Character,
  RoleplaySession,
  SessionAnalytics,
  RoleplayTip,
  RoleplayCommandPaletteProps,
  ViewType
} from './types';
import {
  fetchScenarios,
  fetchCharacters,
  fetchSessionHistory,
  fetchRecentTips,
  fetchAnalyticsSummary,
  fetchSessionAnalytics
} from './api';
import { ScenarioView } from './views/ScenarioView';
import { CharacterView } from './views/CharacterView';
import { SessionHistoryView } from './views/SessionHistoryView';
import { AnalyticsView } from './views/AnalyticsView';
import { TipsView } from './views/TipsView';

const RoleplayCommandPalette: React.FC<RoleplayCommandPaletteProps> = ({
  isOpen,
  onClose,
  onStartSession,
  onResumeSession,
  currentUser,
  theme,
  onThemeChange,
  voiceEnabled,
  onVoiceToggle
}) => {
  const [search, setSearch] = useState('');
  const [currentView, setCurrentView] = useState<ViewType>('main');
  const [loading, setLoading] = useState(false);

  // Data state
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [sessions, setSessions] = useState<RoleplaySession[]>([]);
  const [recentTips, setRecentTips] = useState<RoleplayTip[]>([]);
  const [analytics, setAnalytics] = useState<SessionAnalytics[]>([]);

  // Selected items for detail views
  const [selectedSession, setSelectedSession] = useState<RoleplaySession | null>(null);
  const [selectedAnalytics, setSelectedAnalytics] = useState<SessionAnalytics | null>(null);

  // Reset view when palette opens
  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setCurrentView('main');
      setSelectedSession(null);
      setSelectedAnalytics(null);
    }
  }, [isOpen]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  // Data fetching functions
  const loadScenarios = async () => {
    try {
      setLoading(true);
      const data = await fetchScenarios();
      setScenarios(data);
      setCurrentView('scenarios');
    } catch (error) {
      console.error('Failed to load scenarios:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCharacters = async () => {
    try {
      setLoading(true);
      const data = await fetchCharacters();
      setCharacters(data);
      setCurrentView('characters');
    } catch (error) {
      console.error('Failed to load characters:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSessionHistory = async () => {
    try {
      setLoading(true);
      const data = await fetchSessionHistory(currentUser);
      setSessions(data);
      setCurrentView('sessions');
    } catch (error) {
      console.error('Failed to load session history:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRecentTips = async () => {
    try {
      setLoading(true);
      const data = await fetchRecentTips();
      setRecentTips(data);
      setCurrentView('recent_tips');
    } catch (error) {
      console.error('Failed to load recent tips:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const data = await fetchAnalyticsSummary(currentUser);
      setAnalytics(data);
      setCurrentView('analytics');
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTheme = () => {
    onThemeChange(theme === 'light' ? 'dark' : 'light');
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Main menu render function
  const renderMainMenu = () => (
    <>
      <div className="flex items-center border-b border-gray-200 dark:border-gray-700 px-3">
        <HugeiconsIcon
          icon={AiSearchIcon}
          className="mr-2 h-5 w-5 shrink-0 opacity-50 text-white dark:text-gray-400"
        />
        <Command.Input
          placeholder="Search roleplay tools..."
          className="flex h-14 w-full rounded-md bg-transparent py-4 text-base outline-none placeholder:text-white/70 dark:placeholder:text-gray-400 disabled:cursor-not-allowed disabled:opacity-50 text-white dark:text-gray-100"
          value={search}
          onValueChange={setSearch}
          autoFocus
        />
      </div>
      <Command.List className="max-h-[500px] overflow-y-auto p-3">
        <Command.Empty className="py-6 text-center text-sm text-white/70 dark:text-gray-400">
          No menu items found.
        </Command.Empty>
        
        <Command.Group className="text-xs font-medium text-white/70 dark:text-gray-400 px-2 py-1.5">
          <Command.Item
            value="scenarios"
            onSelect={loadScenarios}
            className="
              relative flex cursor-pointer select-none items-center rounded-md px-3 py-4 text-base outline-none 
              data-[selected=true]:bg-gray-200/30 data-[selected=true]:dark:bg-gray-600 data-[selected=true]:text-white data-[selected=true]:dark:text-gray-100
              hover:bg-gray-200/30 hover:dark:bg-gray-600
            "
          >
            <div className="flex items-center space-x-3">
              <HugeiconsIcon icon={AiFileIcon} className="h-5 w-5 mr-1" />
              <span className="font-medium text-white dark:text-gray-300">Scenarios</span>
            </div>
          </Command.Item>

          <Command.Item
            value="characters"
            onSelect={loadCharacters}
            className="
              relative flex cursor-pointer select-none items-center rounded-md px-3 py-4 text-base outline-none 
              data-[selected=true]:bg-gray-200/30 data-[selected=true]:dark:bg-gray-600 data-[selected=true]:text-white data-[selected=true]:dark:text-gray-100
              hover:bg-gray-200/30 hover:dark:bg-gray-600
            "
          >
            <div className="flex items-center space-x-3">
              <HugeiconsIcon icon={AiUserIcon} className="h-5 w-5 mr-1" />
              <span className="font-medium text-white dark:text-gray-300">Characters</span>
            </div>
          </Command.Item>

          <Command.Item
            value="session history"
            onSelect={loadSessionHistory}
            className="
              relative flex cursor-pointer select-none items-center rounded-md px-3 py-4 text-base outline-none 
              data-[selected=true]:bg-gray-200/30 data-[selected=true]:dark:bg-gray-600 data-[selected=true]:text-white data-[selected=true]:dark:text-gray-100
              hover:bg-gray-200/30 hover:dark:bg-gray-600
            "
          >
            <div className="flex items-center space-x-3">
              <HugeiconsIcon icon={AlarmClockIcon} className="h-5 w-5 mr-1" />
              <span className="font-medium text-white dark:text-gray-300">Session History</span>
            </div>
          </Command.Item>

          <Command.Item
            value="performance analytics"
            onSelect={loadAnalytics}
            className="
              relative flex cursor-pointer select-none items-center rounded-md px-3 py-4 text-base outline-none 
              data-[selected=true]:bg-gray-200/30 data-[selected=true]:dark:bg-gray-600 data-[selected=true]:text-white data-[selected=true]:dark:text-gray-100
              hover:bg-gray-200/30 hover:dark:bg-gray-600
            "
          >
            <div className="flex items-center space-x-3">
              <HugeiconsIcon icon={AnalyticsUpIcon} className="h-5 w-5 mr-1" />
              <span className="font-medium text-white dark:text-gray-300">Performance Analytics</span>
            </div>
          </Command.Item>

          <Command.Item
            value="recent tips"
            onSelect={loadRecentTips}
            className="
              relative flex cursor-pointer select-none items-center rounded-md px-3 py-4 text-base outline-none 
              data-[selected=true]:bg-gray-200/30 data-[selected=true]:dark:bg-gray-600 data-[selected=true]:text-white data-[selected=true]:dark:text-gray-100
              hover:bg-gray-200/30 hover:dark:bg-gray-600
            "
          >
            <div className="flex items-center space-x-3">
              <HugeiconsIcon icon={BulbIcon} className="h-5 w-5 mr-1" />
              <span className="font-medium text-white dark:text-gray-300">Recent Tips</span>
            </div>
          </Command.Item>

          <Command.Item
            value="keyboard shortcuts"
            onSelect={() => setCurrentView('shortcuts')}
            className="
              relative flex cursor-pointer select-none items-center rounded-md px-3 py-4 text-base outline-none 
              data-[selected=true]:bg-gray-200/30 data-[selected=true]:dark:bg-gray-600 data-[selected=true]:text-white data-[selected=true]:dark:text-gray-100
              hover:bg-gray-200/30 hover:dark:bg-gray-600
            "
          >
            <div className="flex items-center space-x-3">
              <HugeiconsIcon icon={KeyboardIcon} className="h-5 w-5 mr-1" />
              <span className="font-medium text-white dark:text-gray-300">Keyboard Shortcuts</span>
            </div>
          </Command.Item>

          <Command.Item
            value="settings"
            onSelect={() => setCurrentView('settings')}
            className="
              relative flex cursor-pointer select-none items-center rounded-md px-3 py-4 text-base outline-none 
              data-[selected=true]:bg-gray-200/30 data-[selected=true]:dark:bg-gray-600 data-[selected=true]:text-white data-[selected=true]:dark:text-gray-100
              hover:bg-gray-200/30 hover:dark:bg-gray-600
            "
          >
            <div className="flex items-center space-x-3">
              <HugeiconsIcon icon={SettingsIcon} className="h-5 w-5 mr-1" />
              <span className="font-medium text-white dark:text-gray-300">Settings</span>
            </div>
          </Command.Item>
        </Command.Group>
      </Command.List>
    </>
  );

  // Shortcuts view
  const renderShortcuts = () => (
    <>
      <div className="flex items-center border-b border-gray-200 dark:border-gray-700 px-3">
        <button
          onClick={() => setCurrentView('main')}
          className="mr-2 p-1 hover:bg-gray-200/30 dark:hover:bg-gray-600 rounded text-white dark:text-gray-300"
        >
          <HugeiconsIcon icon={ArrowLeftDoubleIcon} className="h-5 w-5" />
        </button>
        <div className="flex h-14 w-full items-center py-4 text-base font-medium text-white dark:text-gray-100">
          Keyboard Shortcuts
        </div>
      </div>
      <Command.List className="max-h-[500px] overflow-y-auto p-3">
        <Command.Group heading="Shortcuts" className="text-xs font-medium text-white/70 dark:text-gray-400 px-2 py-1.5">
          <Command.Item className="relative flex cursor-pointer select-none justify-between items-center rounded-md px-3 py-3 text-base outline-none text-white dark:text-gray-100">
            <span>Open command palette</span>
            <kbd className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 rounded text-sm text-gray-900 dark:text-gray-100">/</kbd>
          </Command.Item>
          <Command.Item className="relative flex cursor-pointer select-none justify-between items-center rounded-md px-3 py-3 text-base outline-none text-white dark:text-gray-100">
            <span>Close command palette</span>
            <kbd className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 rounded text-sm text-gray-900 dark:text-gray-100">Esc</kbd>
          </Command.Item>
          <Command.Item className="relative flex cursor-pointer select-none justify-between items-center rounded-md px-3 py-3 text-base outline-none text-white dark:text-gray-100">
            <span>Navigate and select</span>
            <div className="flex space-x-1">
              <kbd className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 rounded text-sm text-gray-900 dark:text-gray-100">↑↓</kbd>
              <span className="text-xs text-white/70 dark:text-gray-400">+</span>
              <kbd className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 rounded text-sm text-gray-900 dark:text-gray-100">Enter</kbd>
            </div>
          </Command.Item>
        </Command.Group>
      </Command.List>
    </>
  );

  // Settings view
  const renderSettings = () => (
    <>
      <div className="flex items-center border-b border-gray-200 dark:border-gray-700 px-3">
        <button
          onClick={() => setCurrentView('main')}
          className="mr-2 p-1 hover:bg-gray-200/30 dark:hover:bg-gray-600 rounded text-white dark:text-gray-300"
        >
          <HugeiconsIcon icon={ArrowLeftDoubleIcon} className="h-5 w-5" />
        </button>
        <div className="flex h-14 w-full items-center py-4 text-base font-medium text-white dark:text-gray-100">
          Settings
        </div>
      </div>
      <div className="max-h-[500px] overflow-y-auto p-5">
        <div className="space-y-6">
          {/* Voice Toggle */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <HugeiconsIcon icon={AiMicIcon} className="h-5 w-5 text-white/70 dark:text-gray-400" />
                <div className="flex flex-col">
                  <span className="font-medium text-white dark:text-gray-100">Voice Mode</span>
                  <span className="text-xs text-white/70 dark:text-gray-400">
                    {voiceEnabled ? 'Voice enabled' : 'Voice disabled'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => onVoiceToggle(!voiceEnabled)}
                className={`
                  relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent 
                  transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                  ${voiceEnabled ? 'bg-blue-600' : 'bg-gray-200'}
                `}
              >
                <span
                  className={`
                    pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 
                    transition duration-200 ease-in-out
                    ${voiceEnabled ? 'translate-x-5' : 'translate-x-0'}
                  `}
                />
              </button>
            </div>
          </div>

          {/* Theme Toggle */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {theme === 'light' ? (
                  <HugeiconsIcon icon={SunIcon} className="h-5 w-5 text-yellow-500" />
                ) : (
                  <HugeiconsIcon icon={MoonIcon} className="h-5 w-5 text-white/70 dark:text-gray-400" />
                )}
                <div className="flex flex-col">
                  <span className="font-medium text-white dark:text-gray-100">Theme</span>
                  <span className="text-xs text-white/70 dark:text-gray-400 capitalize">{theme} mode</span>
                </div>
              </div>
              <button
                onClick={toggleTheme}
                className={`
                  relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent 
                  transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                  ${theme === 'dark' ? 'bg-blue-600' : 'bg-gray-200'}
                `}
              >
                <span
                  className={`
                    pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 
                    transition duration-200 ease-in-out
                    ${theme === 'dark' ? 'translate-x-5' : 'translate-x-0'}
                  `}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  // Main render - view routing will be implemented in other files
  return isOpen ? (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-start justify-center pt-[15vh]" onClick={handleBackdropClick}>
      <div className="bg-white/20 dark:bg-gray-900/20 backdrop-blur-xl rounded-lg shadow-2xl border border-white/20 dark:border-gray-700/50 w-full max-w-2xl mx-4 overflow-hidden">
        <Command className="w-full text-white dark:text-gray-100">
          {currentView === 'main' && renderMainMenu()}
          {currentView === 'shortcuts' && renderShortcuts()}
          {currentView === 'settings' && renderSettings()}
          {currentView === 'scenarios' && (
            <ScenarioView
              scenarios={scenarios}
              loading={loading}
              search={search}
              onSearchChange={setSearch}
              onBackClick={() => setCurrentView('main')}
              onStartSession={onStartSession}
              onClose={onClose}
            />
          )}
          {currentView === 'characters' && (
            <CharacterView
              characters={characters}
              scenarios={scenarios}
              loading={loading}
              search={search}
              onSearchChange={setSearch}
              onBackClick={() => setCurrentView('main')}
              onStartSession={onStartSession}
              onClose={onClose}
            />
          )}
          {currentView === 'sessions' && (
            <SessionHistoryView
              sessions={sessions}
              scenarios={scenarios}
              characters={characters}
              loading={loading}
              onNavigateBack={() => setCurrentView('main')}
              onResumeSession={onResumeSession}
              onClose={onClose}
              onSelectAnalytics={setSelectedAnalytics}
              onChangeView={setCurrentView}
            />
          )}
          {(currentView === 'analytics' || currentView === 'analytics_detail') && (
            <AnalyticsView
              analytics={analytics}
              scenarios={scenarios}
              loading={loading}
              selectedAnalytics={currentView === 'analytics_detail' ? selectedAnalytics : null}
              onSelectAnalytics={setSelectedAnalytics}
              onNavigateBack={() => setCurrentView(currentView === 'analytics_detail' ? 'analytics' : 'main')}
              onChangeView={setCurrentView}
            />
          )}
          {currentView === 'recent_tips' && (
            <TipsView
              recentTips={recentTips}
              loading={loading}
              onNavigateBack={() => setCurrentView('main')}
              onChangeView={setCurrentView}
            />
          )}
        </Command>
      </div>
    </div>
  ) : null;
};

export default RoleplayCommandPalette;