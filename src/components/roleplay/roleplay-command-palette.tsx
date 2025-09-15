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
import { ScenarioView } from './views/ScenarioView';
import { CharacterView } from './views/CharacterView';
import { SessionHistoryView } from './views/SessionHistoryView';
import { AnalyticsView } from './views/AnalyticsView';
import { TipsView } from './views/TipsView';
import { RoleplaySessionView } from './views/RoleplaySessionView';
import { CharacterCreateView } from './views/CharacterCreateView';

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
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);

  // Reset view when palette opens
  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setCurrentView('main');
      setSelectedSession(null);
      setSelectedAnalytics(null);
      setSelectedScenario(null);
      setSelectedCharacter(null);
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
      const response = await fetch('/api/roleplay/scenarios');
      
      if (!response.ok) {
        console.warn('Scenarios API not available, using mock data');
        setScenarios([]);
        setCurrentView('scenarios');
        return;
      }
      
      const data = await response.json();
      // Map MongoDB scenarios to our Scenario type
      const mappedScenarios = (data.scenarios || []).map((scenario: any) => ({
        id: scenario._id || scenario.id || scenario.scenario_id,
        title: scenario.title,
        description: scenario.description,
        llmPrompt: scenario.llmPrompt
      }));
      setScenarios(mappedScenarios);
      setCurrentView('scenarios');
    } catch (error) {
      console.error('Failed to load scenarios:', error);
      setScenarios([]);
    } finally {
      setLoading(false);
    }
  };

  const loadCharacters = async () => {
    try {
      setLoading(true);

      // Load both characters and scenarios concurrently
      const [charactersResponse, scenariosResponse] = await Promise.all([
        fetch('/api/roleplay/characters'),
        fetch('/api/roleplay/scenarios')
      ]);

      // Handle characters
      if (!charactersResponse.ok) {
        console.warn('Characters API error:', charactersResponse.status, charactersResponse.statusText);
        setCharacters([]);
      } else {
        const charactersData = await charactersResponse.json();
        if (!charactersData.success) {
          console.warn('Characters API returned error:', charactersData.error);
          setCharacters([]);
        } else {
          // Map MongoDB characters to our Character type
          const mappedCharacters = (charactersData.characters || []).map((char: any) => ({
            id: char._id || char.id,
            name: char.name,
            role: char.role,
            personality: char.personality,
            background: char.background,
            objections: char.objections || [],
            voice_id: char.voice_id || '',
            scenario_ids: char.scenario_ids || [],
            created_at: char.createdAt || char.created_at || new Date().toISOString()
          }));
          setCharacters(mappedCharacters);
        }
      }

      // Handle scenarios
      if (!scenariosResponse.ok) {
        console.warn('Scenarios API not available, using empty scenarios');
        setScenarios([]);
      } else {
        const scenariosData = await scenariosResponse.json();
        // Map MongoDB scenarios to our Scenario type
        const mappedScenarios = (scenariosData.scenarios || []).map((scenario: any) => ({
          id: scenario._id || scenario.id || scenario.scenario_id,
          title: scenario.title,
          description: scenario.description,
          llmPrompt: scenario.llmPrompt
        }));
        setScenarios(mappedScenarios);
      }

      setCurrentView('characters');
    } catch (error) {
      console.error('Failed to load characters:', error);
      setCharacters([]);
      setScenarios([]);
      setCurrentView('characters');
    } finally {
      setLoading(false);
    }
  };

  const loadSessionHistory = async () => {
    try {
      setLoading(true);
      const url = currentUser 
        ? `/api/roleplay/sessions?user_id=${currentUser}`
        : '/api/roleplay/sessions';
      
      const response = await fetch(url);
      
      if (!response.ok) {
        console.warn('Session history API not available');
        setSessions([]);
        setCurrentView('sessions');
        return;
      }
      
      const data = await response.json();
      setSessions(data.sessions || []);
      setCurrentView('sessions');
    } catch (error) {
      console.error('Failed to load session history:', error);
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  const loadRecentTips = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/roleplay/tips/recent?limit=10');
      
      if (!response.ok) {
        console.warn('Recent tips API not available');
        setRecentTips([]);
        setCurrentView('recent_tips');
        return;
      }
      
      const data = await response.json();
      setRecentTips(data.tips || []);
      setCurrentView('recent_tips');
    } catch (error) {
      console.error('Failed to load recent tips:', error);
      setRecentTips([]);
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const url = currentUser 
        ? `/api/roleplay/analytics/summary?user_id=${currentUser}`
        : '/api/roleplay/analytics/summary';
      
      const response = await fetch(url);
      
      if (!response.ok) {
        console.warn('Analytics summary API not available');
        setAnalytics([]);
        setCurrentView('analytics');
        return;
      }
      
      const data = await response.json();
      setAnalytics(data.analytics || []);
      setCurrentView('analytics');
    } catch (error) {
      console.error('Failed to load analytics:', error);
      setAnalytics([]);
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
      <div className="flex items-center border-b border-gray-200 dark:border-gray-700 px-4">
        <HugeiconsIcon
          icon={AiSearchIcon}
          className="mr-3 h-6 w-6 shrink-0 opacity-50 text-white dark:text-gray-400"
        />
        <Command.Input
          placeholder="Search roleplay tools..."
          className="flex h-16 w-full rounded-md bg-transparent py-5 text-lg outline-none placeholder:text-white/70 dark:placeholder:text-gray-400 disabled:cursor-not-allowed disabled:opacity-50 text-white dark:text-gray-100"
          value={search}
          onValueChange={setSearch}
          autoFocus
        />
      </div>
      {/* Palette height can be edited here. Example: max-h-[500px], max-h-[700px] */}
      <Command.List className="max-h-[700px] overflow-y-auto p-4">
        <Command.Empty className="py-6 text-center text-base text-white/70 dark:text-gray-400">
          No menu items found.
        </Command.Empty>
        
        <Command.Group className="text-sm font-medium text-white/70 dark:text-gray-400 px-2 py-1.5">
          <Command.Item
            value="scenarios"
            onSelect={loadScenarios}
            className="
              relative flex cursor-pointer select-none items-center rounded-md px-4 py-5 text-lg outline-none 
              data-[selected=true]:bg-gray-200/30 data-[selected=true]:dark:bg-gray-600 data-[selected=true]:text-white data-[selected=true]:dark:text-gray-100
              hover:bg-gray-200/30 hover:dark:bg-gray-600
            "
          >
            <div className="flex items-center space-x-4">
              <HugeiconsIcon icon={AiFileIcon} className="h-6 w-6 mr-2" />
              <span className="font-medium text-white dark:text-gray-300">Scenarios</span>
            </div>
          </Command.Item>

          <Command.Item
            value="characters"
            onSelect={loadCharacters}
            className="
              relative flex cursor-pointer select-none items-center rounded-md px-4 py-5 text-lg outline-none 
              data-[selected=true]:bg-gray-200/30 data-[selected=true]:dark:bg-gray-600 data-[selected=true]:text-white data-[selected=true]:dark:text-gray-100
              hover:bg-gray-200/30 hover:dark:bg-gray-600
            "
          >
            <div className="flex items-center space-x-4">
              <HugeiconsIcon icon={AiUserIcon} className="h-6 w-6 mr-2" />
              <span className="font-medium text-white dark:text-gray-300">Characters</span>
            </div>
          </Command.Item>

          <Command.Item
            value="session history"
            onSelect={loadSessionHistory}
            className="
              relative flex cursor-pointer select-none items-center rounded-md px-4 py-5 text-lg outline-none 
              data-[selected=true]:bg-gray-200/30 data-[selected=true]:dark:bg-gray-600 data-[selected=true]:text-white data-[selected=true]:dark:text-gray-100
              hover:bg-gray-200/30 hover:dark:bg-gray-600
            "
          >
            <div className="flex items-center space-x-4">
              <HugeiconsIcon icon={AlarmClockIcon} className="h-6 w-6 mr-2" />
              <span className="font-medium text-white dark:text-gray-300">Session History</span>
            </div>
          </Command.Item>

          <Command.Item
            value="performance analytics"
            onSelect={loadAnalytics}
            className="
              relative flex cursor-pointer select-none items-center rounded-md px-4 py-5 text-lg outline-none 
              data-[selected=true]:bg-gray-200/30 data-[selected=true]:dark:bg-gray-600 data-[selected=true]:text-white data-[selected=true]:dark:text-gray-100
              hover:bg-gray-200/30 hover:dark:bg-gray-600
            "
          >
            <div className="flex items-center space-x-4">
              <HugeiconsIcon icon={AnalyticsUpIcon} className="h-6 w-6 mr-2" />
              <span className="font-medium text-white dark:text-gray-300">Performance Analytics</span>
            </div>
          </Command.Item>

          <Command.Item
            value="recent tips"
            onSelect={loadRecentTips}
            className="
              relative flex cursor-pointer select-none items-center rounded-md px-4 py-5 text-lg outline-none 
              data-[selected=true]:bg-gray-200/30 data-[selected=true]:dark:bg-gray-600 data-[selected=true]:text-white data-[selected=true]:dark:text-gray-100
              hover:bg-gray-200/30 hover:dark:bg-gray-600
            "
          >
            <div className="flex items-center space-x-4">
              <HugeiconsIcon icon={BulbIcon} className="h-6 w-6 mr-2" />
              <span className="font-medium text-white dark:text-gray-300">Recent Tips</span>
            </div>
          </Command.Item>

          <Command.Item
            value="keyboard shortcuts"
            onSelect={() => setCurrentView('shortcuts')}
            className="
              relative flex cursor-pointer select-none items-center rounded-md px-4 py-5 text-lg outline-none 
              data-[selected=true]:bg-gray-200/30 data-[selected=true]:dark:bg-gray-600 data-[selected=true]:text-white data-[selected=true]:dark:text-gray-100
              hover:bg-gray-200/30 hover:dark:bg-gray-600
            "
          >
            <div className="flex items-center space-x-4">
              <HugeiconsIcon icon={KeyboardIcon} className="h-6 w-6 mr-2" />
              <span className="font-medium text-white dark:text-gray-300">Keyboard Shortcuts</span>
            </div>
          </Command.Item>

          <Command.Item
            value="settings"
            onSelect={() => setCurrentView('settings')}
            className="
              relative flex cursor-pointer select-none items-center rounded-md px-4 py-5 text-lg outline-none 
              data-[selected=true]:bg-gray-200/30 data-[selected=true]:dark:bg-gray-600 data-[selected=true]:text-white data-[selected=true]:dark:text-gray-100
              hover:bg-gray-200/30 hover:dark:bg-gray-600
            "
          >
            <div className="flex items-center space-x-4">
              <HugeiconsIcon icon={SettingsIcon} className="h-6 w-6 mr-2" />
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
      <div className="flex items-center border-b border-gray-200 dark:border-gray-700 px-4">
        <button
          onClick={() => setCurrentView('main')}
          className="mr-2 p-1 hover:bg-gray-200/30 dark:hover:bg-gray-600 rounded text-white dark:text-gray-300"
        >
          <HugeiconsIcon icon={ArrowLeftDoubleIcon} className="h-6 w-6" />
        </button>
        <div className="flex h-16 w-full items-center py-5 text-lg font-medium text-white dark:text-gray-100">
          Keyboard Shortcuts
        </div>
      </div>
      {/* Palette height can be edited here. Example: max-h-[500px], max-h-[700px] */}
      <Command.List className="max-h-[700px] overflow-y-auto p-4">
        <Command.Group heading="Shortcuts" className="text-sm font-medium text-white/70 dark:text-gray-400 px-2 py-1.5">
          <Command.Item className="relative flex cursor-pointer select-none justify-between items-center rounded-md px-4 py-4 text-lg outline-none text-white dark:text-gray-100">
            <span>Open command palette</span>
            <kbd className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 rounded text-base text-gray-900 dark:text-gray-100">/</kbd>
          </Command.Item>
          <Command.Item className="relative flex cursor-pointer select-none justify-between items-center rounded-md px-4 py-4 text-lg outline-none text-white dark:text-gray-100">
            <span>Close command palette</span>
            <kbd className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 rounded text-base text-gray-900 dark:text-gray-100">Esc</kbd>
          </Command.Item>
          <Command.Item className="relative flex cursor-pointer select-none justify-between items-center rounded-md px-4 py-4 text-lg outline-none text-white dark:text-gray-100">
            <span>Navigate and select</span>
            <div className="flex space-x-1">
              <kbd className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 rounded text-base text-gray-900 dark:text-gray-100">↑↓</kbd>
              <span className="text-sm text-white/70 dark:text-gray-400">+</span>
              <kbd className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 rounded text-base text-gray-900 dark:text-gray-100">Enter</kbd>
            </div>
          </Command.Item>
        </Command.Group>
      </Command.List>
    </>
  );

  // Settings view
  const renderSettings = () => (
    <>
      <div className="flex items-center border-b border-gray-200 dark:border-gray-700 px-4">
        <button
          onClick={() => setCurrentView('main')}
          className="mr-2 p-1 hover:bg-gray-200/30 dark:hover:bg-gray-600 rounded text-white dark:text-gray-300"
        >
          <HugeiconsIcon icon={ArrowLeftDoubleIcon} className="h-6 w-6" />
        </button>
        <div className="flex h-16 w-full items-center py-5 text-lg font-medium text-white dark:text-gray-100">
          Settings
        </div>
      </div>
      {/* Palette height can be edited here. Example: max-h-[500px], max-h-[700px] */}
      <div className="max-h-[700px] overflow-y-auto p-6">
        <div className="space-y-8">
          {/* Voice Toggle */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <HugeiconsIcon icon={AiMicIcon} className="h-6 w-6 text-white/70 dark:text-gray-400" />
                <div className="flex flex-col">
                  <span className="font-medium text-lg text-white dark:text-gray-100">Voice Mode</span>
                  <span className="text-sm text-white/70 dark:text-gray-400">
                    {voiceEnabled ? 'Voice enabled' : 'Voice disabled'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => onVoiceToggle(!voiceEnabled)}
                className={`
                  relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent 
                  transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                  ${voiceEnabled ? 'bg-blue-600' : 'bg-gray-200'}
                `}
              >
                <span
                  className={`
                    pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 
                    transition duration-200 ease-in-out
                    ${voiceEnabled ? 'translate-x-5' : 'translate-x-0'}
                  `}
                />
              </button>
            </div>
          </div>

          {/* Theme Toggle */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {theme === 'light' ? (
                  <HugeiconsIcon icon={SunIcon} className="h-6 w-6 text-yellow-500" />
                ) : (
                  <HugeiconsIcon icon={MoonIcon} className="h-6 w-6 text-white/70 dark:text-gray-400" />
                )}
                <div className="flex flex-col">
                  <span className="font-medium text-lg text-white dark:text-gray-100">Theme</span>
                  <span className="text-sm text-white/70 dark:text-gray-400 capitalize">{theme} mode</span>
                </div>
              </div>
              <button
                onClick={toggleTheme}
                className={`
                  relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent 
                  transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                  ${theme === 'dark' ? 'bg-blue-600' : 'bg-gray-200'}
                `}
              >
                <span
                  className={`
                    pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 
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
      {/* Palette width can be edited here. Example: max-w-2xl, max-w-3xl, max-w-4xl */}
      <div className="bg-white/20 dark:bg-gray-900/20 backdrop-blur-xl rounded-lg shadow-2xl border border-white/20 dark:border-gray-700/50 w-full max-w-4xl mx-4 overflow-hidden">
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
              onNavigateToSession={(scenario) => {
                setSelectedScenario(scenario);
                setSelectedCharacter(undefined);
                setCurrentView('session_setup');
              }}
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
              onNavigateToSession={(scenario, character) => {
                setSelectedScenario(scenario);
                setSelectedCharacter(character);
                setCurrentView('session_setup');
              }}
              onCreateCharacter={() => setCurrentView('character_create')}
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
          {currentView === 'session_setup' && selectedScenario && (
            <RoleplaySessionView
              scenario={selectedScenario}
              character={selectedCharacter}
              onBackClick={() => {
                const previousView = selectedCharacter ? 'characters' : 'scenarios';
                setCurrentView(previousView);
              }}
              onStartSession={onStartSession}
              onClose={onClose}
            />
          )}
          {currentView === 'character_create' && (
            <CharacterCreateView
              scenarios={scenarios}
              onBackClick={() => setCurrentView('characters')}
              onSaveAndStart={async (character, scenario) => {
                try {
                  // Save the character to the database via API
                  const response = await fetch('/api/roleplay/characters', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(character),
                  });

                  if (!response.ok) {
                    throw new Error('Failed to save character');
                  }

                  const data = await response.json();
                  const savedCharacter = data.character;

                  // Convert MongoDB character to our Character type
                  const newCharacter: Character = {
                    id: savedCharacter._id || savedCharacter.id,
                    name: savedCharacter.name,
                    role: savedCharacter.role,
                    personality: savedCharacter.personality,
                    background: savedCharacter.background,
                    objections: savedCharacter.objections || [],
                    voice_id: savedCharacter.voice_id || '',
                    scenario_ids: savedCharacter.scenario_ids || [],
                    created_at: savedCharacter.createdAt || savedCharacter.created_at || new Date().toISOString()
                  };

                  // Add to characters list for this session
                  setCharacters(prev => [...prev, newCharacter]);

                  // Start the session with the new character
                  onStartSession(scenario, newCharacter);
                } catch (error) {
                  console.error('Failed to save character:', error);
                  throw error; // Re-throw so the component can handle it
                }
              }}
              onClose={onClose}
              currentUser={currentUser}
            />
          )}
        </Command>
      </div>
    </div>
  ) : null;
};


export default RoleplayCommandPalette;