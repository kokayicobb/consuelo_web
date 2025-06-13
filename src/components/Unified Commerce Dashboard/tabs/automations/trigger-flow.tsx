// File: src/components/Unified Commerce Dashboard/tabs/automations/triggerConfigs.tsx
// Trigger configuration components for the automation editor

import React from "react";
import { Copy, CheckCircle } from "lucide-react";

interface TriggerConfigProps {
  triggerType: string;
  flowId: string;
  onUpdate: (config: any) => void;
}

export const TriggerConfig: React.FC<TriggerConfigProps> = ({
  triggerType,
  flowId,
  onUpdate,
}) => {
  // Select the appropriate configuration component based on trigger type
  switch (triggerType) {
    case "webhook":
      return <WebhookTriggerConfig flowId={flowId} onUpdate={onUpdate} />;
    case "schedule":
      return <ScheduleTriggerConfig flowId={flowId} onUpdate={onUpdate} />;
    case "form":
      return <FormTriggerConfig flowId={flowId} onUpdate={onUpdate} />;
    case "email":
      return <EmailTriggerConfig flowId={flowId} onUpdate={onUpdate} />;
    case "sms":
      return <SmsTriggerConfig flowId={flowId} onUpdate={onUpdate} />;
    default:
      return (
        <div className="p-4 text-gray-600">
          No configuration available for this trigger type.
        </div>
      );
  }
};

// Webhook Trigger Configuration
export const WebhookTriggerConfig: React.FC<{
  flowId: string;
  onUpdate: (config: any) => void;
}> = ({ flowId, onUpdate }) => {
  const [copied, setCopied] = React.useState(false);
  const webhookUrl = `${
    typeof window !== "undefined" ? window.location.origin : ""
  }/api/webhook/${flowId}`;

  const copyWebhookUrl = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const [responseMode, setResponseMode] = React.useState("immediate");

  React.useEffect(() => {
    onUpdate({ responseMode });
  }, [responseMode, onUpdate]);

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Webhook URL
        </label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            readOnly
            value={webhookUrl}
            className="flex-1 rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-700"
          />
          <button
            onClick={copyWebhookUrl}
            className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 hover:bg-gray-50"
            title="Copy to clipboard"
          >
            {copied ? (
              <CheckCircle size={16} className="text-green-500" />
            ) : (
              <Copy size={16} />
            )}
          </button>
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Send a POST request to this URL to trigger the automation.
        </p>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Response Mode
        </label>
        <select
          value={responseMode}
          onChange={(e) => setResponseMode(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-gray-800"
        >
          <option value="immediate">Respond Immediately</option>
          <option value="wait">Wait for Workflow Completion</option>
        </select>
        <p className="mt-1 text-xs text-gray-500">
          {responseMode === "immediate"
            ? "The webhook will respond immediately with a 200 OK, while the workflow runs in the background."
            : "The webhook will wait until the entire workflow completes before responding."}
        </p>
      </div>
    </div>
  );
};

// Schedule Trigger Configuration
export const ScheduleTriggerConfig: React.FC<{
  flowId: string;
  onUpdate: (config: any) => void;
}> = ({ flowId, onUpdate }) => {
  const [scheduleType, setScheduleType] = React.useState("interval");
  const [interval, setInterval] = React.useState(1);
  const [unit, setUnit] = React.useState("hours");
  const [cronExpression, setCronExpression] = React.useState("0 * * * *");

  React.useEffect(() => {
    onUpdate({ scheduleType, interval, unit, cronExpression });
  }, [scheduleType, interval, unit, cronExpression, onUpdate]);

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Schedule Type
        </label>
        <select
          value={scheduleType}
          onChange={(e) => setScheduleType(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-gray-800"
        >
          <option value="interval">Interval</option>
          <option value="cron">Cron Expression</option>
        </select>
      </div>

      {scheduleType === "interval" ? (
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Run Every
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              value={interval}
              onChange={(e) => setInterval(parseInt(e.target.value) || 1)}
              min="1"
              className="w-24 rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-gray-800"
            />
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-gray-800"
            >
              <option value="minutes">Minutes</option>
              <option value="hours">Hours</option>
              <option value="days">Days</option>
              <option value="weeks">Weeks</option>
              <option value="months">Months</option>
            </select>
          </div>
        </div>
      ) : (
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Cron Expression
          </label>
          <input
            type="text"
            value={cronExpression}
            onChange={(e) => setCronExpression(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-gray-800"
          />
          <p className="mt-1 text-xs text-gray-500">
            Format: minute hour day month weekday (e.g., "0 * * * *" for every
            hour)
          </p>
        </div>
      )}
    </div>
  );
};

// Form Trigger Configuration
export const FormTriggerConfig: React.FC<{
  flowId: string;
  onUpdate: (config: any) => void;
}> = ({ flowId, onUpdate }) => {
  const [formId, setFormId] = React.useState("");
  const [trackAll, setTrackAll] = React.useState(true);

  React.useEffect(() => {
    onUpdate({ formId, trackAll });
  }, [formId, trackAll, onUpdate]);

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Form ID or Class
        </label>
        <input
          type="text"
          value={formId}
          onChange={(e) => setFormId(e.target.value)}
          placeholder="e.g., #contact-form or .signup-form"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-gray-800"
        />
        <p className="mt-1 text-xs text-gray-500">
          Enter the CSS selector for your form. Leave blank to track all forms.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="track-all"
          checked={trackAll}
          onChange={(e) => setTrackAll(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-gray-800 focus:ring-gray-500"
        />
        <label
          htmlFor="track-all"
          className="text-sm font-medium text-gray-700"
        >
          Track all form submissions on the website
        </label>
      </div>

      <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-700">
        <p>
          <strong>Note:</strong> You'll need to add our tracking code to your
          website to capture form submissions.
        </p>
      </div>
    </div>
  );
};

// Email Trigger Configuration
export const EmailTriggerConfig: React.FC<{
  flowId: string;
  onUpdate: (config: any) => void;
}> = ({ flowId, onUpdate }) => {
  const [emailAddress, setEmailAddress] = React.useState("");
  const [filters, setFilters] = React.useState({
    subject: "",
    from: "",
    hasAttachments: false,
  });

  React.useEffect(() => {
    onUpdate({ emailAddress, filters });
  }, [emailAddress, filters, onUpdate]);

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Monitor Email Address
        </label>
        <input
          type="email"
          value={emailAddress}
          onChange={(e) => setEmailAddress(e.target.value)}
          placeholder="e.g., support@yourdomain.com"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-gray-800"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Subject Contains
        </label>
        <input
          type="text"
          value={filters.subject}
          onChange={(e) =>
            setFilters({ ...filters, subject: e.target.value })
          }
          placeholder="e.g., Support Request"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-gray-800"
        />
        <p className="mt-1 text-xs text-gray-500">
          Only trigger for emails with this text in the subject (optional)
        </p>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          From Email Contains
        </label>
        <input
          type="text"
          value={filters.from}
          onChange={(e) => setFilters({ ...filters, from: e.target.value })}
          placeholder="e.g., @example.com"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-gray-800"
        />
        <p className="mt-1 text-xs text-gray-500">
          Only trigger for emails from addresses containing this text (optional)
        </p>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="has-attachments"
          checked={filters.hasAttachments}
          onChange={(e) =>
            setFilters({ ...filters, hasAttachments: e.target.checked })
          }
          className="h-4 w-4 rounded border-gray-300 text-gray-800 focus:ring-gray-500"
        />
        <label
          htmlFor="has-attachments"
          className="text-sm font-medium text-gray-700"
        >
          Only trigger for emails with attachments
        </label>
      </div>
    </div>
  );
};

// SMS Trigger Configuration
export const SmsTriggerConfig: React.FC<{
  flowId: string;
  onUpdate: (config: any) => void;
}> = ({ flowId, onUpdate }) => {
  const [phoneNumber, setPhoneNumber] = React.useState("");
  const [filterKeywords, setFilterKeywords] = React.useState("");
  const [provider, setProvider] = React.useState("twilio");
  const [autoReply, setAutoReply] = React.useState("");
  const [forwardUnmatched, setForwardUnmatched] = React.useState(false);

  React.useEffect(() => {
    onUpdate({ 
      phoneNumber, 
      filterKeywords, 
      provider,
      autoReply,
      forwardUnmatched
    });
  }, [phoneNumber, filterKeywords, provider, autoReply, forwardUnmatched, onUpdate]);

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          SMS Provider
        </label>
        <select
          value={provider}
          onChange={(e) => setProvider(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-gray-800"
        >
          <option value="twilio">Twilio</option>
          <option value="messagebird">MessageBird</option>
          <option value="vonage">Vonage (Nexmo)</option>
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Phone Number
        </label>
        <input
          type="tel"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          placeholder="e.g., +1 (555) 123-4567"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-gray-800"
        />
        <p className="mt-1 text-xs text-gray-500">
          The phone number that will receive SMS messages
        </p>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Filter Keywords (optional)
        </label>
        <input
          type="text"
          value={filterKeywords}
          onChange={(e) => setFilterKeywords(e.target.value)}
          placeholder="e.g., help, stop, subscribe"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-gray-800"
        />
        <p className="mt-1 text-xs text-gray-500">
          Only trigger for SMS messages containing these keywords (comma separated)
        </p>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Auto-Reply Message (optional)
        </label>
        <textarea
          value={autoReply}
          onChange={(e) => setAutoReply(e.target.value)}
          placeholder="e.g., Thanks for your message. We'll get back to you soon!"
          rows={3}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-gray-800"
        />
        <p className="mt-1 text-xs text-gray-500">
          Automatically send this reply when an SMS is received
        </p>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="forward-unmatched"
          checked={forwardUnmatched}
          onChange={(e) => setForwardUnmatched(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-gray-800 focus:ring-gray-500"
        />
        <label
          htmlFor="forward-unmatched"
          className="text-sm font-medium text-gray-700"
        >
          Forward unmatched messages to another number
        </label>
      </div>

      {forwardUnmatched && (
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Forward To Number
          </label>
          <input
            type="tel"
            placeholder="e.g., +1 (555) 987-6543"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-gray-800"
          />
        </div>
      )}

      <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-700">
        <p>
          <strong>Note:</strong> You'll need to connect a {provider === "twilio" ? "Twilio" : provider === "messagebird" ? "MessageBird" : "Vonage"} account 
          to process incoming SMS messages. Make sure your phone number is configured to handle inbound messages.
        </p>
      </div>
    </div>
  );
};

// Export all trigger configurations
export default {
  WebhookTriggerConfig,
  ScheduleTriggerConfig,
  FormTriggerConfig,
  EmailTriggerConfig,
  SmsTriggerConfig,
  TriggerConfig,
};