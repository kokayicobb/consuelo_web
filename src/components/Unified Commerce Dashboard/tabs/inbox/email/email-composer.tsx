import React, { useState, useEffect, useRef } from 'react';
import {
  X, Send, Paperclip, Image, Link, Bold, Italic, Underline,
  List, ListOrdered, Quote, Code, Smile, Clock, ChevronDown,
  Users, Sparkles, AlertCircle, CheckCircle, Loader2, Save,
  FileText, Variable, Eye, Zap
} from 'lucide-react';
import { format } from 'date-fns';

// --- FIX START: Debounce Hook ---
// We create this reusable hook to delay an action until the user stops typing.
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set a timeout to update the debounced value after the specified delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // This is the cleanup function. It runs if the value changes before the
    // timeout is complete, effectively resetting the timer.
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // Only re-run if value or delay changes

  return debouncedValue;
}
// --- FIX END: Debounce Hook ---

interface EmailComposerProps {
  initialTo?: string | string[];
  initialSubject?: string;
  initialBody?: string;
  replyTo?: any;
  campaign?: any;
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  variables: string[];
}

interface DeliverabilityCheck {
  passed: boolean;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

export default function EmailComposer({
  initialTo = '',
  initialSubject = '',
  initialBody = '',
  replyTo,
  campaign,
  onSuccess,
  onCancel
}: EmailComposerProps) {
  const [to, setTo] = useState<string[]>(Array.isArray(initialTo) ? initialTo : initialTo ? [initialTo] : []);
  const [toInput, setToInput] = useState('');
  const [cc, setCc] = useState<string[]>([]);
  const [ccInput, setCcInput] = useState('');
  const [bcc, setBcc] = useState<string[]>([]);
  const [bccInput, setBccInput] = useState('');
  const [subject, setSubject] = useState(initialSubject);
  const [body, setBody] = useState(initialBody);
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [sending, setSending] = useState(false);
  const [scheduling, setScheduling] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [showTemplates, setShowTemplates] = useState(false);
  const [showDeliverability, setShowDeliverability] = useState(false);
  const [deliverabilityChecks, setDeliverabilityChecks] = useState<Record<string, DeliverabilityCheck>>({});
  const [personalizationTokens, setPersonalizationTokens] = useState<string[]>([]);
  const [showPersonalization, setShowPersonalization] = useState(false);
  const [isDraft, setIsDraft] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // --- FIX START: Apply the debounce hook ---
  // We create debounced versions of the state that changes frequently.
  // These values will only update 500ms after the user stops typing.
  const debouncedSubject = useDebounce(subject, 500);
  const debouncedBody = useDebounce(body, 500);
  const debouncedTo = useDebounce(to, 500);
  // --- FIX END: Apply the debounce hook ---

  // Mock templates - replace with API call
  const templates: EmailTemplate[] = [
    {
      id: '1',
      name: 'Initial Outreach',
      subject: 'Quick question about {{company}}',
      body: 'Hi {{firstName}},\n\nI noticed {{company}} is growing rapidly. We help similar companies streamline their sales process.\n\nWould you be open to a brief call next week?\n\nBest,\n{{senderName}}',
      variables: ['firstName', 'company', 'senderName']
    },
    {
      id: '2',
      name: 'Follow Up',
      subject: 'Following up on my previous email',
      body: 'Hi {{firstName}},\n\nI wanted to follow up on my previous email about helping {{company}} with sales automation.\n\nIs this something that might be valuable for your team?\n\nBest,\n{{senderName}}',
      variables: ['firstName', 'company', 'senderName']
    }
  ];

  // --- FIX START: Use debounced values for the effect ---
  // This useEffect now runs only when the debounced values change,
  // NOT on every single keystroke.
  useEffect(() => {
    const runDeliverabilityChecks = () => {
      const checks: Record<string, DeliverabilityCheck> = {};

      if (debouncedSubject.length > 60) {
        checks.subjectLength = { passed: false, message: 'Subject line is too long (>60 characters)', severity: 'warning' };
      } else {
        checks.subjectLength = { passed: true, message: 'Subject length is optimal', severity: 'info' };
      }

      const spamWords = ['free', 'guarantee', 'click here', 'buy now', 'limited time'];
      const foundSpamWords = spamWords.filter(word => 
        debouncedBody.toLowerCase().includes(word) || debouncedSubject.toLowerCase().includes(word)
      );
      if (foundSpamWords.length > 0) {
        checks.spamWords = { passed: false, message: `Contains spam trigger words: ${foundSpamWords.join(', ')}`, severity: 'warning' };
      } else {
        checks.spamWords = { passed: true, message: 'No spam trigger words detected', severity: 'info' };
      }

      const hasPersonalization = debouncedBody.includes('{{') || debouncedSubject.includes('{{');
      if (!hasPersonalization && debouncedTo.length > 1) {
        checks.personalization = { passed: false, message: 'Consider adding personalization for bulk emails', severity: 'warning' };
      } else {
        checks.personalization = { passed: true, message: 'Email includes personalization', severity: 'info' };
      }
      
      if (!debouncedBody.includes('unsubscribe') && debouncedTo.length > 10) {
        checks.unsubscribe = { passed: false, message: 'Missing unsubscribe link for bulk email', severity: 'error' };
      } else {
        checks.unsubscribe = { passed: true, message: 'Unsubscribe option included', severity: 'info' };
      }

      setDeliverabilityChecks(checks);
    };

    runDeliverabilityChecks();
  }, [debouncedSubject, debouncedBody, debouncedTo]); // Dependency array now uses the debounced values
  // --- FIX END: Use debounced values for the effect ---


  const handleAddEmail = (input: string, setter: (emails: string[]) => void, current: string[]) => {
    const emails = input.split(/[,\s]+/).filter(email => email.trim());
    const validEmails = emails.filter(email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
    setter([...current, ...validEmails]);
  };

  const handleRemoveEmail = (index: number, setter: (emails: string[]) => void, current: string[]) => {
    setter(current.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, input: string, setInput: (val: string) => void, setter: (emails: string[]) => void, current: string[]) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (input.trim()) {
        handleAddEmail(input, setter, current);
        setInput('');
      }
    }
  };

  const insertAtCursor = (text: string) => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newText = body.substring(0, start) + text + body.substring(end);
      setBody(newText);
      
      setTimeout(() => {
        textarea.setSelectionRange(start + text.length, start + text.length);
        textarea.focus();
      }, 0);
    } else {
      setBody(body + text);
    }
  };

  const handleTemplateSelect = (template: EmailTemplate) => {
    setSubject(template.subject);
    setBody(template.body);
    setPersonalizationTokens(template.variables);
    setSelectedTemplate(template.id);
    setActivePanel(null);
  };

  const [activePanel, setActivePanel] = useState<'templates' | 'personalization' | 'deliverability' | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments([...attachments, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleSend = async () => {
    if (to.length === 0 || !subject || !body) {
      alert('Please fill in all required fields');
      return;
    }

    setSending(true);
    try {
      const response = await fetch('/api/emails/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to, cc, bcc, subject, text: body,
          html: `<p>${body.replace(/\n/g, '<br>')}</p>`,
          replyTo: replyTo?.from_address,
          campaignId: campaign?.id,
          scheduleFor: scheduling ? scheduleDate : null
        })
      });

      if (!response.ok) throw new Error('Failed to send email');
      onSuccess?.();
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Failed to send email. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleSaveDraft = async () => {
    setIsDraft(true);
    setTimeout(() => setIsDraft(false), 2000);
  };

  const failedChecks = Object.values(deliverabilityChecks).filter(check => !check.passed).length;

  return (
    // The rest of your JSX remains unchanged...
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b">
        <h2 className="text-lg font-semibold text-gray-900">
          {replyTo ? `Reply to ${replyTo.display_name}` : 'Compose Email'}
        </h2>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 px-6 py-3 border-b bg-gray-50">
        <button
          onClick={() => setActivePanel(activePanel === 'templates' ? null : 'templates')}
          className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          <FileText className="w-4 h-4 mr-2" />
          Templates
        </button>
        <button
          onClick={() => setActivePanel(activePanel === 'personalization' ? null : 'personalization')}
          className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          <Variable className="w-4 h-4 mr-2" />
          Personalize
        </button>
        <button
          onClick={() => setActivePanel(activePanel === 'deliverability' ? null : 'deliverability')}
          className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          <Zap className="w-4 h-4 mr-2" />
          Deliverability
          {failedChecks > 0 && (
            <span className="ml-2 px-2 py-0.5 text-xs bg-yellow-100 text-yellow-800 rounded-full">
              {failedChecks}
            </span>
          )}
        </button>
        <button
          onClick={() => setScheduling(!scheduling)}
          className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md ${
            scheduling
              ? 'text-blue-700 bg-blue-50 border border-blue-300'
              : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
          }`}
        >
          <Clock className="w-4 h-4 mr-2" />
          Schedule
        </button>
        <div className="flex-1" />
        <button
          onClick={handleSaveDraft}
          className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          {isDraft ? (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Saved
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Draft
            </>
          )}
        </button>
      </div>

      {/* Templates Dropdown */}
      {activePanel === 'templates' && (
        <div className="absolute top-24 left-6 z-50 w-80 bg-white rounded-lg shadow-lg border border-gray-200">
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Email Templates</h3>
            <div className="space-y-2">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleTemplateSelect(template)}
                  className="w-full text-left p-3 rounded-md border border-gray-200 hover:bg-gray-50"
                >
                  <div className="font-medium text-sm text-gray-900">{template.name}</div>
                  <div className="text-xs text-gray-500 mt-1 truncate">{template.subject}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Personalization Panel */}
      {activePanel === 'personalization' && (
        <div className="absolute top-24 left-6 z-50 w-64 bg-white rounded-lg shadow-lg border border-gray-200">
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Insert Variable</h3>
            <div className="space-y-2">
              {['firstName', 'lastName', 'company', 'title', 'email'].map((token) => (
                <button
                  key={token}
                  onClick={() => insertAtCursor(`{{${token}}}`)}
                  className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-100"
                >
                  <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">
                    {`{{${token}}}`}
                  </code>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Deliverability Panel */}
      {activePanel === 'deliverability' && (
        <div className="absolute top-24 left-6 z-50 w-80 bg-white rounded-lg shadow-lg border border-gray-200">
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Deliverability Insights</h3>
            <div className="space-y-2">
              {Object.entries(deliverabilityChecks).map(([key, check]) => (
                <div key={key} className="flex items-start gap-2">
                  {check.passed ? (
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                  ) : check.severity === 'error' ? (
                    <AlertCircle className="w-4 h-4 text-red-500 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="text-xs text-gray-700">{check.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-4">
          {/* To Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
            <div className="flex flex-wrap gap-2 p-2 border border-gray-300 rounded-md min-h-[42px]">
              {to.map((email, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 text-sm bg-gray-100 text-gray-700 rounded-md"
                >
                  {email}
                  <button
                    onClick={() => handleRemoveEmail(index, setTo, to)}
                    className="ml-1 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={toInput}
                onChange={(e) => setToInput(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, toInput, setToInput, setTo, to)}
                onBlur={() => {
                  if (toInput.trim()) {
                    handleAddEmail(toInput, setTo, to);
                    setToInput('');
                  }
                }}
                placeholder={to.length === 0 ? "Enter recipients..." : "Add more..."}
                className="flex-1 min-w-[200px] outline-none"
              />
            </div>
          </div>

          {/* CC/BCC */}
          <div className="flex gap-4 text-sm">
            <button
              onClick={() => setShowCc(!showCc)}
              className="text-gray-600 hover:text-gray-900"
            >
              Cc
            </button>
            <button
              onClick={() => setShowBcc(!showBcc)}
              className="text-gray-600 hover:text-gray-900"
            >
              Bcc
            </button>
          </div>

          {/* CC Field */}
          {showCc && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cc</label>
              <div className="flex flex-wrap gap-2 p-2 border border-gray-300 rounded-md min-h-[42px]">
                {cc.map((email, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 text-sm bg-gray-100 text-gray-700 rounded-md"
                  >
                    {email}
                    <button
                      onClick={() => handleRemoveEmail(index, setCc, cc)}
                      className="ml-1 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value={ccInput}
                  onChange={(e) => setCcInput(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, ccInput, setCcInput, setCc, cc)}
                  onBlur={() => {
                    if (ccInput.trim()) {
                      handleAddEmail(ccInput, setCc, cc);
                      setCcInput('');
                    }
                  }}
                  placeholder="Enter Cc recipients..."
                  className="flex-1 min-w-[200px] outline-none"
                />
              </div>
            </div>
          )}

          {/* BCC Field */}
          {showBcc && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bcc</label>
              <div className="flex flex-wrap gap-2 p-2 border border-gray-300 rounded-md min-h-[42px]">
                {bcc.map((email, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 text-sm bg-gray-100 text-gray-700 rounded-md"
                  >
                    {email}
                    <button
                      onClick={() => handleRemoveEmail(index, setBcc, bcc)}
                      className="ml-1 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value={bccInput}
                  onChange={(e) => setBccInput(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, bccInput, setBccInput, setBcc, bcc)}
                  onBlur={() => {
                    if (bccInput.trim()) {
                      handleAddEmail(bccInput, setBcc, bcc);
                      setBccInput('');
                    }
                  }}
                  placeholder="Enter Bcc recipients..."
                  className="flex-1 min-w-[200px] outline-none"
                />
              </div>
            </div>
          )}

          {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              placeholder="Enter subject..."
            />
          </div>

          {/* Schedule Date */}
          {scheduling && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Schedule for</label>
              <input
                type="datetime-local"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                min={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>
          )}

          {/* Editor Toolbar */}
          <div className="flex items-center gap-1 p-2 border border-gray-300 rounded-t-md bg-gray-50">
            <button className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded">
              <Bold className="w-4 h-4" />
            </button>
            <button className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded">
              <Italic className="w-4 h-4" />
            </button>
            <button className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded">
              <Underline className="w-4 h-4" />
            </button>
            <div className="w-px h-6 bg-gray-300 mx-1" />
            <button className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded">
              <List className="w-4 h-4" />
            </button>
            <button className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded">
              <ListOrdered className="w-4 h-4" />
            </button>
            <button className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded">
              <Quote className="w-4 h-4" />
            </button>
            <div className="w-px h-6 bg-gray-300 mx-1" />
            <button className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded">
              <Link className="w-4 h-4" />
            </button>
            <button className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded">
              <Image className="w-4 h-4" />
            </button>
            <button className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded">
              <Code className="w-4 h-4" />
            </button>
            <button className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded">
              <Smile className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <textarea
            ref={textareaRef}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="min-h-[300px] p-4 border border-t-0 border-gray-300 rounded-b-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-vertical w-full"
            placeholder="Write your message..."
          />

          {/* Attachments */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">Attachments</label>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <Paperclip className="w-4 h-4 mr-2" />
                Attach File
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
            {attachments.length > 0 && (
              <div className="space-y-2">
                {attachments.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                  >
                    <div className="flex items-center gap-2">
                      <Paperclip className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700">{file.name}</span>
                      <span className="text-xs text-gray-500">({formatFileSize(file.size)})</span>
                    </div>
                    <button
                      onClick={() => removeAttachment(index)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50">
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">
            {to.length} recipient{to.length !== 1 ? 's' : ''}
          </span>
          {failedChecks > 0 && (
            <span className="text-sm text-yellow-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {failedChecks} deliverability issue{failedChecks !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={sending || to.length === 0 || !subject || !body}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {sending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : scheduling ? (
              <>
                <Clock className="w-4 h-4 mr-2" />
                Schedule Send
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send Email
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}