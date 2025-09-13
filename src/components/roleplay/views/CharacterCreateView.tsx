import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Scenario, Character } from '../types';

interface CharacterCreateViewProps {
  scenarios: Scenario[];
  onBackClick: () => void;
  onSaveAndStart: (character: Omit<Character, 'id' | 'created_at'>, scenario: Scenario) => Promise<void>;
  onClose: () => void;
  currentUser: string;
}

export const CharacterCreateView: React.FC<CharacterCreateViewProps> = ({
  scenarios,
  onBackClick,
  onSaveAndStart,
  onClose,
  currentUser
}) => {
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    personality: '',
    background: '',
    objections: [''],
    voice_id: '',
    scenario_ids: [scenarios[0]?.id || '']
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleObjectionChange = (index: number, value: string) => {
    const newObjections = [...formData.objections];
    newObjections[index] = value;
    setFormData(prev => ({
      ...prev,
      objections: newObjections
    }));
  };

  const addObjection = () => {
    setFormData(prev => ({
      ...prev,
      objections: [...prev.objections, '']
    }));
  };

  const removeObjection = (index: number) => {
    if (formData.objections.length > 1) {
      const newObjections = formData.objections.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        objections: newObjections
      }));
    }
  };

  const handleSaveAndStart = async () => {
    if (!formData.name.trim() || !formData.role.trim() || !formData.personality.trim() || !formData.background.trim()) {
      return;
    }

    setIsSaving(true);
    try {
      const character: Omit<Character, 'id' | 'created_at'> = {
        ...formData,
        objections: formData.objections.filter(obj => obj.trim() !== '')
      };

      const selectedScenario = scenarios.find(s => s.id === formData.scenario_ids[0]) || scenarios[0];
      await onSaveAndStart(character, selectedScenario);
      onClose();
    } catch (error) {
      console.error('Failed to save character:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const isFormValid = formData.name.trim() && formData.role.trim() && formData.personality.trim() && formData.background.trim();

  return (
    <>
      <div className="flex items-center border-b border-gray-200 dark:border-gray-700 px-3">
        <button
          onClick={onBackClick}
          className="mr-2 p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded text-white dark:text-gray-100"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex h-14 w-full items-center py-4 text-base font-medium text-white dark:text-gray-100">
          Create Custom Character
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto p-6">
        <div className="space-y-6">
          {/* Character Basic Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 dark:bg-gray-700 flex-shrink-0">
                <svg className="h-6 w-6 text-white/70 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <h2 className="text-lg font-semibold text-white dark:text-gray-100">Character Details</h2>
                <Badge className="w-fit px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  Custom Character
                </Badge>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-white/90 dark:text-gray-200 mb-1 block">
                  Character Name *
                </label>
                <Input
                  type="text"
                  placeholder="e.g., Alex Thompson"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-white/90 dark:text-gray-200 mb-1 block">
                  Role *
                </label>
                <Input
                  type="text"
                  placeholder="e.g., CEO, Procurement Manager, IT Director"
                  value={formData.role}
                  onChange={(e) => handleInputChange('role', e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-white/90 dark:text-gray-200 mb-1 block">
                  Personality *
                </label>
                <Textarea
                  placeholder="e.g., Direct, time-conscious, results-focused"
                  value={formData.personality}
                  onChange={(e) => handleInputChange('personality', e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50 min-h-[60px]"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-white/90 dark:text-gray-200 mb-1 block">
                  Background *
                </label>
                <Textarea
                  placeholder="e.g., Runs a 50-person tech startup, previously worked at Google"
                  value={formData.background}
                  onChange={(e) => handleInputChange('background', e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50 min-h-[80px]"
                />
              </div>
            </div>
          </div>

          {/* Objections Section */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <div>
              <label className="text-sm font-medium text-white/90 dark:text-gray-200 mb-2 block">
                Common Objections
              </label>
              <div className="space-y-2">
                {formData.objections.map((objection, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      type="text"
                      placeholder={`Objection ${index + 1} (e.g., "Too expensive", "Need to think about it")`}
                      value={objection}
                      onChange={(e) => handleObjectionChange(index, e.target.value)}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50 flex-1"
                    />
                    {formData.objections.length > 1 && (
                      <button
                        onClick={() => removeObjection(index)}
                        className="p-2 text-white/60 hover:text-white/90"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={addObjection}
                  className="text-xs text-white/70 hover:text-white/90 flex items-center space-x-1"
                >
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Add Objection</span>
                </button>
              </div>
            </div>
          </div>

          {/* Scenario Selection */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <div>
              <label className="text-sm font-medium text-white/90 dark:text-gray-200 mb-2 block">
                Primary Scenario
              </label>
              <select
                value={formData.scenario_ids[0]}
                onChange={(e) => handleInputChange('scenario_ids', [e.target.value])}
                className="w-full bg-white/10 border border-white/20 rounded-md px-3 py-2 text-white"
              >
                {scenarios.map((scenario) => (
                  <option key={scenario.id} value={scenario.id} className="bg-gray-800 text-white">
                    {scenario.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Session Info */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <div className="bg-white/10 dark:bg-gray-800/50 rounded-lg p-4 space-y-2">
              <h4 className="text-sm font-medium text-white/90 dark:text-gray-200">Ready to Start?</h4>
              <div className="text-xs text-white/70 dark:text-gray-400 space-y-1">
                <p>• Your character will be saved to your account</p>
                <p>• You can reuse this character in future sessions</p>
                <p>• The roleplay will start immediately after saving</p>
              </div>
            </div>
          </div>

          {/* Save and Start Button */}
          <div className="pt-4">
            <Button
              onClick={handleSaveAndStart}
              disabled={!isFormValid || isSaving}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-3 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  Save & Start Conversation
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};