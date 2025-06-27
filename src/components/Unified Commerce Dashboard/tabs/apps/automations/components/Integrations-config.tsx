// components/IntegrationConfigs.tsx - Configuration UI for each integration

import React from 'react';
import { AlertCircle, Info } from 'lucide-react';

interface ConfigProps {
  config: Record<string, any>;
  onChange: (config: Record<string, any>) => void;
}

// Salesforce Configuration
export function SalesforceTriggerConfig({ config, onChange }: ConfigProps) {
  const objects = ['Lead', 'Contact', 'Account', 'Opportunity', 'Case', 'Task'];
  const events = ['created', 'updated', 'deleted'];

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Salesforce Object
        </label>
        <select
          value={config.object || 'Lead'}
          onChange={(e) => onChange({ ...config, object: e.target.value })}
          className="w-full rounded-lg border border-gray-300 px-3 py-2"
        >
          {objects.map(obj => (
            <option key={obj} value={obj}>{obj}</option>
          ))}
        </select>
      </div>

      {(config.event === 'message' || config.event === 'reaction_added') && (
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Channel
          </label>
          <input
            type="text"
            value={config.channelId || ''}
            onChange={(e) => onChange({ ...config, channelId: e.target.value })}
            placeholder="#general or C1234567890"
            className="w-full rounded-lg border border-gray-300 px-3 py-2"
          />
          <p className="mt-1 text-xs text-gray-500">
            Enter channel name or ID. Leave empty to monitor all channels.
          </p>
        </div>
      )}

      {config.event === 'app_mention' && (
        <div className="rounded-lg bg-blue-50 p-3">
          <p className="text-sm text-blue-800">
            This will trigger whenever your app is mentioned with @yourapp
          </p>
        </div>
      )}
    </div>
  );
}

export function SlackActionConfig({ config, onChange }: ConfigProps) {
  const actions = [
    { value: 'message', label: 'Send Message' },
    { value: 'dm', label: 'Send Direct Message' },
    { value: 'update', label: 'Update Message' },
    { value: 'react', label: 'Add Reaction' },
    { value: 'upload', label: 'Upload File' }
  ];

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Action
        </label>
        <select
          value={config.action || 'message'}
          onChange={(e) => onChange({ ...config, action: e.target.value })}
          className="w-full rounded-lg border border-gray-300 px-3 py-2"
        >
          {actions.map(action => (
            <option key={action.value} value={action.value}>
              {action.label}
            </option>
          ))}
        </select>
      </div>

      {config.action === 'message' && (
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Channel
          </label>
          <input
            type="text"
            value={config.channel || ''}
            onChange={(e) => onChange({ ...config, channel: e.target.value })}
            placeholder="#general or C1234567890"
            className="w-full rounded-lg border border-gray-300 px-3 py-2"
          />
        </div>
      )}

      {config.action === 'dm' && (
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            User
          </label>
          <input
            type="text"
            value={config.userId || ''}
            onChange={(e) => onChange({ ...config, userId: e.target.value })}
            placeholder="@username or U1234567890"
            className="w-full rounded-lg border border-gray-300 px-3 py-2"
          />
        </div>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Message
        </label>
        <textarea
          value={config.message || ''}
          onChange={(e) => onChange({ ...config, message: e.target.value })}
          placeholder="Hello {{user.name}}! Your order #{{order.id}} has been shipped."
          rows={4}
          className="w-full rounded-lg border border-gray-300 px-3 py-2"
        />
        <p className="mt-1 text-xs text-gray-500">
          Use {"{{variables}}"} from previous steps. Supports Slack markdown.
        </p>
      </div>

      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={config.blocks || false}
            onChange={(e) => onChange({ ...config, blocks: e.target.checked })}
            className="rounded border-gray-300"
          />
          <span className="text-sm font-medium text-gray-700">
            Use Block Kit for rich formatting
          </span>
        </label>
      </div>
    </div>
  );
}

// HubSpot Configuration
export function HubSpotTriggerConfig({ config, onChange }: ConfigProps) {
  const objects = ['contact', 'company', 'deal', 'ticket'];
  const events = ['creation', 'deletion', 'propertyChange'];

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Object Type
        </label>
        <select
          value={config.object || 'contact'}
          onChange={(e) => onChange({ ...config, object: e.target.value })}
          className="w-full rounded-lg border border-gray-300 px-3 py-2"
        >
          {objects.map(obj => (
            <option key={obj} value={obj}>
              {obj.charAt(0).toUpperCase() + obj.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Event Type
        </label>
        <select
          value={config.event || 'creation'}
          onChange={(e) => onChange({ ...config, event: e.target.value })}
          className="w-full rounded-lg border border-gray-300 px-3 py-2"
        >
          {events.map(event => (
            <option key={event} value={event}>
              {event === 'propertyChange' ? 'Property Changed' : 
               event.charAt(0).toUpperCase() + event.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {config.event === 'propertyChange' && (
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Property Name
          </label>
          <input
            type="text"
            value={config.propertyName || ''}
            onChange={(e) => onChange({ ...config, propertyName: e.target.value })}
            placeholder="lifecyclestage"
            className="w-full rounded-lg border border-gray-300 px-3 py-2"
          />
          <p className="mt-1 text-xs text-gray-500">
            Monitor changes to this specific property
          </p>
        </div>
      )}
    </div>
  );
}

export function HubSpotActionConfig({ config, onChange }: ConfigProps) {
  const resources = ['contact', 'company', 'deal', 'ticket', 'email'];
  const operations = {
    contact: ['create', 'update', 'delete', 'addToList', 'removeFromList'],
    company: ['create', 'update', 'delete', 'associate'],
    deal: ['create', 'update', 'delete', 'changeStage'],
    ticket: ['create', 'update', 'delete', 'changeStatus'],
    email: ['send', 'sendTemplate']
  };

  const currentOperations = operations[config.resource as keyof typeof operations] || operations.contact;

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Resource
        </label>
        <select
          value={config.resource || 'contact'}
          onChange={(e) => onChange({ ...config, resource: e.target.value, action: '' })}
          className="w-full rounded-lg border border-gray-300 px-3 py-2"
        >
          {resources.map(resource => (
            <option key={resource} value={resource}>
              {resource.charAt(0).toUpperCase() + resource.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Operation
        </label>
        <select
          value={config.action || currentOperations[0]}
          onChange={(e) => onChange({ ...config, action: e.target.value })}
          className="w-full rounded-lg border border-gray-300 px-3 py-2"
        >
          {currentOperations.map(op => (
            <option key={op} value={op}>
              {op.charAt(0).toUpperCase() + op.slice(1).replace(/([A-Z])/g, ' $1')}
            </option>
          ))}
        </select>
      </div>

      {config.resource === 'contact' && config.action === 'create' && (
        <>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={config.email || ''}
              onChange={(e) => onChange({ ...config, email: e.target.value })}
              placeholder="{{lead.email}}"
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                First Name
              </label>
              <input
                type="text"
                value={config.firstName || ''}
                onChange={(e) => onChange({ ...config, firstName: e.target.value })}
                placeholder="{{lead.first_name}}"
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Last Name
              </label>
              <input
                type="text"
                value={config.lastName || ''}
                onChange={(e) => onChange({ ...config, lastName: e.target.value })}
                placeholder="{{lead.last_name}}"
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
              />
            </div>
          </div>
        </>
      )}

      {config.resource === 'deal' && config.action === 'create' && (
        <>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Deal Name
            </label>
            <input
              type="text"
              value={config.dealName || ''}
              onChange={(e) => onChange({ ...config, dealName: e.target.value })}
              placeholder="{{company.name}} - {{product.name}}"
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Amount
            </label>
            <input
              type="number"
              value={config.amount || ''}
              onChange={(e) => onChange({ ...config, amount: e.target.value })}
              placeholder="{{quote.total}}"
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Pipeline Stage
            </label>
            <select
              value={config.stage || 'appointmentscheduled'}
              onChange={(e) => onChange({ ...config, stage: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            >
              <option value="appointmentscheduled">Appointment Scheduled</option>
              <option value="qualifiedtobuy">Qualified to Buy</option>
              <option value="presentationscheduled">Presentation Scheduled</option>
              <option value="decisionmakerboughtin">Decision Maker Bought In</option>
              <option value="contractsent">Contract Sent</option>
              <option value="closedwon">Closed Won</option>
              <option value="closedlost">Closed Lost</option>
            </select>
          </div>
        </>
      )}
    </div>
  );
}

// Google Calendar Configuration
export function GoogleCalendarTriggerConfig({ config, onChange }: ConfigProps) {
  const events = [
    'created', 'updated', 'deleted', 'started', 'ended'
  ];

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Calendar
        </label>
        <select
          value={config.calendarId || 'primary'}
          onChange={(e) => onChange({ ...config, calendarId: e.target.value })}
          className="w-full rounded-lg border border-gray-300 px-3 py-2"
        >
          <option value="primary">Primary Calendar</option>
          <option value="custom">Custom Calendar ID</option>
        </select>
      </div>

      {config.calendarId === 'custom' && (
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Calendar ID
          </label>
          <input
            type="text"
            value={config.customCalendarId || ''}
            onChange={(e) => onChange({ ...config, customCalendarId: e.target.value })}
            placeholder="calendar@group.calendar.google.com"
            className="w-full rounded-lg border border-gray-300 px-3 py-2"
          />
        </div>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Trigger When Event Is
        </label>
        <div className="space-y-2">
          {events.map(event => (
            <label key={event} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.events?.includes(event) || false}
                onChange={(e) => {
                  const currentEvents = config.events || [];
                  const newEvents = e.target.checked
                    ? [...currentEvents, event]
                    : currentEvents.filter(e => e !== event);
                  onChange({ ...config, events: newEvents });
                }}
                className="rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">
                {event.charAt(0).toUpperCase() + event.slice(1)}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Filter by Title (Optional)
        </label>
        <input
          type="text"
          value={config.matchTerm || ''}
          onChange={(e) => onChange({ ...config, matchTerm: e.target.value })}
          placeholder="e.g., Meeting, Interview"
          className="w-full rounded-lg border border-gray-300 px-3 py-2"
        />
        <p className="mt-1 text-xs text-gray-500">
          Only trigger for events containing this text
        </p>
      </div>
    </div>
  );
}

export function GoogleCalendarActionConfig({ config, onChange }: ConfigProps) {
  const operations = ['create', 'update', 'delete', 'get', 'list'];

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Operation
        </label>
        <select
          value={config.action || 'create'}
          onChange={(e) => onChange({ ...config, action: e.target.value })}
          className="w-full rounded-lg border border-gray-300 px-3 py-2"
        >
          {operations.map(op => (
            <option key={op} value={op}>
              {op.charAt(0).toUpperCase() + op.slice(1)} Event
            </option>
          ))}
        </select>
      </div>

      {(config.action === 'create' || config.action === 'update') && (
        <>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Event Title
            </label>
            <input
              type="text"
              value={config.title || ''}
              onChange={(e) => onChange({ ...config, title: e.target.value })}
              placeholder="Meeting with {{contact.name}}"
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Start Time
              </label>
              <input
                type="datetime-local"
                value={config.startTime || ''}
                onChange={(e) => onChange({ ...config, startTime: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                End Time
              </label>
              <input
                type="datetime-local"
                value={config.endTime || ''}
                onChange={(e) => onChange({ ...config, endTime: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              value={config.description || ''}
              onChange={(e) => onChange({ ...config, description: e.target.value })}
              placeholder="Discuss {{deal.name}} proposal"
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Attendees (comma-separated emails)
            </label>
            <input
              type="text"
              value={config.attendees || ''}
              onChange={(e) => onChange({ ...config, attendees: e.target.value })}
              placeholder="{{contact.email}}, team@company.com"
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            />
          </div>

          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.sendNotifications || false}
                onChange={(e) => onChange({ ...config, sendNotifications: e.target.checked })}
                className="rounded border-gray-300"
              />
              <span className="text-sm font-medium text-gray-700">
                Send email notifications to attendees
              </span>
            </label>
          </div>
        </>
      )}

      {config.action === 'update' && (
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Event ID
          </label>
          <input
            type="text"
            value={config.eventId || ''}
            onChange={(e) => onChange({ ...config, eventId: e.target.value })}
            placeholder="{{trigger.eventId}}"
            className="w-full rounded-lg border border-gray-300 px-3 py-2"
          />
        </div>
      )}
    </div>
  );
}

// Shopify Configuration
export function ShopifyTriggerConfig({ config, onChange }: ConfigProps) {
  const topics = [
    { value: 'orders/create', label: 'Order Created' },
    { value: 'orders/updated', label: 'Order Updated' },
    { value: 'orders/paid', label: 'Order Paid' },
    { value: 'orders/cancelled', label: 'Order Cancelled' },
    { value: 'orders/fulfilled', label: 'Order Fulfilled' },
    { value: 'customers/create', label: 'Customer Created' },
    { value: 'customers/update', label: 'Customer Updated' },
    { value: 'products/create', label: 'Product Created' },
    { value: 'products/update', label: 'Product Updated' },
    { value: 'inventory_levels/update', label: 'Inventory Updated' }
  ];

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Event Type
        </label>
        <select
          value={config.event || 'orders/create'}
          onChange={(e) => onChange({ ...config, event: e.target.value })}
          className="w-full rounded-lg border border-gray-300 px-3 py-2"
        >
          {topics.map(topic => (
            <option key={topic.value} value={topic.value}>
              {topic.label}
            </option>
          ))}
        </select>
      </div>

      <div className="rounded-lg bg-blue-50 p-3">
        <div className="flex items-start gap-2">
          <Info className="h-4 w-4 text-blue-600 mt-0.5" />
          <p className="text-sm text-blue-800">
            Shopify will send real-time notifications when this event occurs in your store.
          </p>
        </div>
      </div>
    </div>
  );
}

export function ShopifyActionConfig({ config, onChange }: ConfigProps) {
  const resources = ['order', 'product', 'customer', 'inventory', 'discount'];
  const operations = {
    order: ['create', 'update', 'fulfill', 'cancel', 'refund'],
    product: ['create', 'update', 'delete'],
    customer: ['create', 'update', 'delete', 'invite'],
    inventory: ['update', 'adjust'],
    discount: ['create', 'update', 'delete']
  };

  const currentOperations = operations[config.resource as keyof typeof operations] || operations.order;

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Resource
        </label>
        <select
          value={config.resource || 'order'}
          onChange={(e) => onChange({ ...config, resource: e.target.value, action: '' })}
          className="w-full rounded-lg border border-gray-300 px-3 py-2"
        >
          {resources.map(resource => (
            <option key={resource} value={resource}>
              {resource.charAt(0).toUpperCase() + resource.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Operation
        </label>
        <select
          value={config.action || currentOperations[0]}
          onChange={(e) => onChange({ ...config, action: e.target.value })}
          className="w-full rounded-lg border border-gray-300 px-3 py-2"
        >
          {currentOperations.map(op => (
            <option key={op} value={op}>
              {op.charAt(0).toUpperCase() + op.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {config.resource === 'product' && config.action === 'create' && (
        <>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Product Title
            </label>
            <input
              type="text"
              value={config.title || ''}
              onChange={(e) => onChange({ ...config, title: e.target.value })}
              placeholder="{{product.name}}"
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              value={config.productDescription || ''}
              onChange={(e) => onChange({ ...config, productDescription: e.target.value })}
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Price
              </label>
              <input
                type="number"
                value={config.price || ''}
                onChange={(e) => onChange({ ...config, price: e.target.value })}
                placeholder="19.99"
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Inventory Quantity
              </label>
              <input
                type="number"
                value={config.inventory || ''}
                onChange={(e) => onChange({ ...config, inventory: e.target.value })}
                placeholder="100"
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
              />
            </div>
          </div>
        </>
      )}

      {config.resource === 'order' && config.action === 'fulfill' && (
        <>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Order ID
            </label>
            <input
              type="text"
              value={config.orderId || ''}
              onChange={(e) => onChange({ ...config, orderId: e.target.value })}
              placeholder="{{trigger.order.id}}"
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Tracking Number
            </label>
            <input
              type="text"
              value={config.trackingNumber || ''}
              onChange={(e) => onChange({ ...config, trackingNumber: e.target.value })}
              placeholder="{{shipping.tracking_number}}"
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Tracking Company
            </label>
            <select
              value={config.trackingCompany || 'ups'}
              onChange={(e) => onChange({ ...config, trackingCompany: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            >
              <option value="ups">UPS</option>
              <option value="fedex">FedEx</option>
              <option value="usps">USPS</option>
              <option value="dhl">DHL</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.notifyCustomer || false}
                onChange={(e) => onChange({ ...config, notifyCustomer: e.target.checked })}
                className="rounded border-gray-300"
              />
              <span className="text-sm font-medium text-gray-700">
                Send shipping notification to customer
              </span>
            </label>
          </div>
        </>
      )}
    </div>
  );
}

// Stripe Configuration
export function StripeTriggerConfig({ config, onChange }: ConfigProps) {
  const events = [
    { category: 'Payments', events: [
      { value: 'payment_intent.succeeded', label: 'Payment Succeeded' },
      { value: 'payment_intent.payment_failed', label: 'Payment Failed' },
      { value: 'charge.succeeded', label: 'Charge Succeeded' },
      { value: 'charge.failed', label: 'Charge Failed' },
      { value: 'charge.refunded', label: 'Charge Refunded' }
    ]},
    { category: 'Subscriptions', events: [
      { value: 'customer.subscription.created', label: 'Subscription Created' },
      { value: 'customer.subscription.updated', label: 'Subscription Updated' },
      { value: 'customer.subscription.deleted', label: 'Subscription Cancelled' },
      { value: 'customer.subscription.trial_will_end', label: 'Trial Ending Soon' }
    ]},
    { category: 'Customers', events: [
      { value: 'customer.created', label: 'Customer Created' },
      { value: 'customer.updated', label: 'Customer Updated' },
      { value: 'customer.deleted', label: 'Customer Deleted' }
    ]},
    { category: 'Invoices', events: [
      { value: 'invoice.created', label: 'Invoice Created' },
      { value: 'invoice.paid', label: 'Invoice Paid' },
      { value: 'invoice.payment_failed', label: 'Invoice Payment Failed' }
    ]}
  ];

  const selectedEvents = config.events || [];

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Select Events to Monitor
        </label>
        <div className="space-y-4 rounded-lg border border-gray-200 p-4 max-h-64 overflow-y-auto">
          {events.map(category => (
            <div key={category.category}>
              <h4 className="font-medium text-sm text-gray-700 mb-2">{category.category}</h4>
              <div className="space-y-2 ml-4">
                {category.events.map(event => (
                  <label key={event.value} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedEvents.includes(event.value)}
                      onChange={(e) => {
                        const newEvents = e.target.checked
                          ? [...selectedEvents, event.value]
                          : selectedEvents.filter(ev => ev !== event.value);
                        onChange({ ...config, events: newEvents });
                      }}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-700">{event.label}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg bg-amber-50 p-3">
        <div className="flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
          <p className="text-sm text-amber-800">
            Make sure these events are enabled in your Stripe webhook settings.
          </p>
        </div>
      </div>
    </div>
  );
}

export function StripeActionConfig({ config, onChange }: ConfigProps) {
  const resources = ['payment', 'customer', 'subscription', 'invoice', 'product', 'price'];
  const operations = {
    payment: ['create', 'capture', 'confirm', 'cancel'],
    customer: ['create', 'update', 'delete', 'list'],
    subscription: ['create', 'update', 'cancel', 'pause', 'resume'],
    invoice: ['create', 'send', 'pay', 'void'],
    product: ['create', 'update', 'delete'],
    price: ['create', 'update']
  };

  const currentOperations = operations[config.resource as keyof typeof operations] || operations.payment;

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Resource
        </label>
        <select
          value={config.resource || 'payment'}
          onChange={(e) => onChange({ ...config, resource: e.target.value, action: '' })}
          className="w-full rounded-lg border border-gray-300 px-3 py-2"
        >
          {resources.map(resource => (
            <option key={resource} value={resource}>
              {resource.charAt(0).toUpperCase() + resource.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Operation
        </label>
        <select
          value={config.action || currentOperations[0]}
          onChange={(e) => onChange({ ...config, action: e.target.value })}
          className="w-full rounded-lg border border-gray-300 px-3 py-2"
        >
          {currentOperations.map(op => (
            <option key={op} value={op}>
              {op.charAt(0).toUpperCase() + op.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {config.resource === 'payment' && config.action === 'create' && (
        <>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Amount (in cents)
            </label>
            <input
              type="number"
              value={config.amount || ''}
              onChange={(e) => onChange({ ...config, amount: e.target.value })}
              placeholder="2000 (for $20.00)"
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Currency
            </label>
            <select
              value={config.currency || 'usd'}
              onChange={(e) => onChange({ ...config, currency: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            >
              <option value="usd">USD - US Dollar</option>
              <option value="eur">EUR - Euro</option>
              <option value="gbp">GBP - British Pound</option>
              <option value="cad">CAD - Canadian Dollar</option>
              <option value="aud">AUD - Australian Dollar</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Customer ID
            </label>
            <input
              type="text"
              value={config.customerId || ''}
              onChange={(e) => onChange({ ...config, customerId: e.target.value })}
              placeholder="{{customer.stripe_id}}"
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Description
            </label>
            <input
              type="text"
              value={config.description || ''}
              onChange={(e) => onChange({ ...config, description: e.target.value })}
              placeholder="Payment for {{order.items}}"
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            />
          </div>
        </>
      )}

      {config.resource === 'customer' && config.action === 'create' && (
        <>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={config.email || ''}
              onChange={(e) => onChange({ ...config, email: e.target.value })}
              placeholder="{{contact.email}}"
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              value={config.name || ''}
              onChange={(e) => onChange({ ...config, name: e.target.value })}
              placeholder="{{contact.full_name}}"
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Phone
            </label>
            <input
              type="tel"
              value={config.phone || ''}
              onChange={(e) => onChange({ ...config, phone: e.target.value })}
              placeholder="{{contact.phone}}"
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            />
          </div>
        </>
      )}

      {config.resource === 'subscription' && config.action === 'create' && (
        <>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Customer ID
            </label>
            <input
              type="text"
              value={config.customerId || ''}
              onChange={(e) => onChange({ ...config, customerId: e.target.value })}
              placeholder="{{customer.stripe_id}}"
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Price ID
            </label>
            <input
              type="text"
              value={config.priceId || ''}
              onChange={(e) => onChange({ ...config, priceId: e.target.value })}
              placeholder="price_1234567890"
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Trial Period (days)
            </label>
            <input
              type="number"
              value={config.trialDays || ''}
              onChange={(e) => onChange({ ...config, trialDays: e.target.value })}
              placeholder="14"
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            />
          </div>
        </>
      )}
    </div>
  );
}

// Airtable Configuration
export function AirtableTriggerConfig({ config, onChange }: ConfigProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Base ID
        </label>
        <input
          type="text"
          value={config.baseId || ''}
          onChange={(e) => onChange({ ...config, baseId: e.target.value })}
          placeholder="appXXXXXXXXXXXXXX"
          className="w-full rounded-lg border border-gray-300 px-3 py-2"
        />
        <p className="mt-1 text-xs text-gray-500">
          Find this in your Airtable base URL
        </p>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Table Name
        </label>
        <input
          type="text"
          value={config.tableId || ''}
          onChange={(e) => onChange({ ...config, tableId: e.target.value })}
          placeholder="Contacts"
          className="w-full rounded-lg border border-gray-300 px-3 py-2"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Trigger Events
        </label>
        <div className="space-y-2">
          {['created', 'updated', 'deleted'].map(event => (
            <label key={event} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.events?.includes(event) || false}
                onChange={(e) => {
                  const currentEvents = config.events || [];
                  const newEvents = e.target.checked
                    ? [...currentEvents, event]
                    : currentEvents.filter(ev => ev !== event);
                  onChange({ ...config, events: newEvents });
                }}
                className="rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">
                Record {event}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Watch Field (Optional)
        </label>
        <input
          type="text"
          value={config.triggerField || ''}
          onChange={(e) => onChange({ ...config, triggerField: e.target.value })}
          placeholder="Status"
          className="w-full rounded-lg border border-gray-300 px-3 py-2"
        />
        <p className="mt-1 text-xs text-gray-500">
          Only trigger when this specific field changes
        </p>
      </div>
    </div>
  );
}

export function AirtableActionConfig({ config, onChange }: ConfigProps) {
  const operations = ['create', 'update', 'upsert', 'delete', 'find'];

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Operation
        </label>
        <select
          value={config.action || 'create'}
          onChange={(e) => onChange({ ...config, action: e.target.value })}
          className="w-full rounded-lg border border-gray-300 px-3 py-2"
        >
          {operations.map(op => (
            <option key={op} value={op}>
              {op.charAt(0).toUpperCase() + op.slice(1)} Record
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Base ID
        </label>
        <input
          type="text"
          value={config.baseId || ''}
          onChange={(e) => onChange({ ...config, baseId: e.target.value })}
          placeholder="appXXXXXXXXXXXXXX"
          className="w-full rounded-lg border border-gray-300 px-3 py-2"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Table Name
        </label>
        <input
          type="text"
          value={config.tableId || ''}
          onChange={(e) => onChange({ ...config, tableId: e.target.value })}
          placeholder="Contacts"
          className="w-full rounded-lg border border-gray-300 px-3 py-2"
        />
      </div>

      {(config.action === 'update' || config.action === 'delete') && (
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Record ID
          </label>
          <input
            type="text"
            value={config.recordId || ''}
            onChange={(e) => onChange({ ...config, recordId: e.target.value })}
            placeholder="{{trigger.record_id}}"
            className="w-full rounded-lg border border-gray-300 px-3 py-2"
          />
        </div>
      )}

      {config.action === 'find' && (
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Filter Formula
          </label>
          <input
            type="text"
            value={config.filterFormula || ''}
            onChange={(e) => onChange({ ...config, filterFormula: e.target.value })}
            placeholder="{Email} = '{{contact.email}}'"
            className="w-full rounded-lg border border-gray-300 px-3 py-2"
          />
          <p className="mt-1 text-xs text-gray-500">
            Use Airtable formula syntax
          </p>
        </div>
      )}

      {(config.action === 'create' || config.action === 'update' || config.action === 'upsert') && (
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Field Values
          </label>
          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-sm text-gray-600 mb-3">
              Map your data to Airtable fields
            </p>
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Field Name"
                  className="rounded border border-gray-300 px-2 py-1 text-sm"
                />
                <input
                  type="text"
                  placeholder="{{value}}"
                  className="rounded border border-gray-300 px-2 py-1 text-sm"
                />
              </div>
              <button
                type="button"
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                + Add field
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Mailchimp Configuration
export function MailchimpTriggerConfig({ config, onChange }: ConfigProps) {
  const events = [
    'subscribe', 'unsubscribe', 'profile_update', 'email_changed',
    'campaign_sent', 'opened', 'clicked'
  ];

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          List/Audience ID
        </label>
        <input
          type="text"
          value={config.listId || ''}
          onChange={(e) => onChange({ ...config, listId: e.target.value })}
          placeholder="a1b2c3d4e5"
          className="w-full rounded-lg border border-gray-300 px-3 py-2"
        />
        <p className="mt-1 text-xs text-gray-500">
          Find this in your Mailchimp audience settings
        </p>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Trigger Events
        </label>
        <div className="space-y-2">
          {events.map(event => (
            <label key={event} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.events?.includes(event) || false}
                onChange={(e) => {
                  const currentEvents = config.events || [];
                  const newEvents = e.target.checked
                    ? [...currentEvents, event]
                    : currentEvents.filter(ev => ev !== event);
                  onChange({ ...config, events: newEvents });
                }}
                className="rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">
                {event.charAt(0).toUpperCase() + event.slice(1).replace(/_/g, ' ')}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

export function MailchimpActionConfig({ config, onChange }: ConfigProps) {
  const resources = ['member', 'campaign', 'segment', 'tag'];
  const operations = {
    member: ['subscribe', 'update', 'unsubscribe', 'delete', 'addTag', 'removeTag'],
    campaign: ['create', 'send', 'schedule', 'cancel'],
    segment: ['create', 'update', 'addMember', 'removeMember'],
    tag: ['create', 'update', 'delete']
  };

  const currentOperations = operations[config.resource as keyof typeof operations] || operations.member;

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Resource
        </label>
        <select
          value={config.resource || 'member'}
          onChange={(e) => onChange({ ...config, resource: e.target.value, action: '' })}
          className="w-full rounded-lg border border-gray-300 px-3 py-2"
        >
          {resources.map(resource => (
            <option key={resource} value={resource}>
              {resource.charAt(0).toUpperCase() + resource.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Operation
        </label>
        <select
          value={config.action || currentOperations[0]}
          onChange={(e) => onChange({ ...config, action: e.target.value })}
          className="w-full rounded-lg border border-gray-300 px-3 py-2"
        >
          {currentOperations.map(op => (
            <option key={op} value={op}>
              {op.charAt(0).toUpperCase() + op.slice(1).replace(/([A-Z])/g, ' $1')}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          List/Audience ID
        </label>
        <input
          type="text"
          value={config.listId || ''}
          onChange={(e) => onChange({ ...config, listId: e.target.value })}
          placeholder="a1b2c3d4e5"
          className="w-full rounded-lg border border-gray-300 px-3 py-2"
        />
      </div>

      {(config.resource === 'member' && 
        (config.action === 'subscribe' || config.action === 'update')) && (
        <>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              type="email"
              value={config.email || ''}
              onChange={(e) => onChange({ ...config, email: e.target.value })}
              placeholder="{{contact.email}}"
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                First Name
              </label>
              <input
                type="text"
                value={config.firstName || ''}
                onChange={(e) => onChange({ ...config, firstName: e.target.value })}
                placeholder="{{contact.first_name}}"
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Last Name
              </label>
              <input
                type="text"
                value={config.lastName || ''}
                onChange={(e) => onChange({ ...config, lastName: e.target.value })}
                placeholder="{{contact.last_name}}"
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
              />
            </div>
          </div>

          {config.action === 'subscribe' && (
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                value={config.status || 'subscribed'}
                onChange={(e) => onChange({ ...config, status: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
              >
                <option value="subscribed">Subscribed</option>
                <option value="pending">Pending (requires double opt-in)</option>
              </select>
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={config.tags || ''}
              onChange={(e) => onChange({ ...config, tags: e.target.value })}
              placeholder="customer, vip, newsletter"
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            />
          </div>
        </>
      )}

      {config.resource === 'campaign' && config.action === 'create' && (
        <>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Campaign Type
            </label>
            <select
              value={config.campaignType || 'regular'}
              onChange={(e) => onChange({ ...config, campaignType: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            >
              <option value="regular">Regular</option>
              <option value="plaintext">Plain Text</option>
              <option value="absplit">A/B Split</option>
              <option value="rss">RSS</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Subject Line
            </label>
            <input
              type="text"
              value={config.subject || ''}
              onChange={(e) => onChange({ ...config, subject: e.target.value })}
              placeholder="{{campaign.subject}}"
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              From Name
            </label>
            <input
              type="text"
              value={config.fromName || ''}
              onChange={(e) => onChange({ ...config, fromName: e.target.value })}
              placeholder="Your Company"
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Reply-To Email
            </label>
            <input
              type="email"
              value={config.replyTo || ''}
              onChange={(e) => onChange({ ...config, replyTo: e.target.value })}
              placeholder="hello@company.com"
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            />
          </div>
        </>
      )}
    </div>
  );
}

// Generic fallback for integrations without specific configs yet
export function GenericTriggerConfig({ config, onChange }: ConfigProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-blue-50 p-4">
        <p className="text-sm text-blue-800">
          This integration requires configuration. Please refer to the integration documentation for available options.
        </p>
      </div>
      
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Configuration (JSON)
        </label>
        <textarea
          value={JSON.stringify(config, null, 2)}
          onChange={(e) => {
            try {
              const parsed = JSON.parse(e.target.value);
              onChange(parsed);
            } catch (err) {
              // Invalid JSON, don't update
            }
          }}
          rows={8}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm"
        />
      </div>
    </div>
  );
}

export function GenericActionConfig({ config, onChange }: ConfigProps) {
  return <GenericTriggerConfig config={config} onChange={onChange} />;
}

// Export a map of all config components
export const INTEGRATION_CONFIG_COMPONENTS: Record<string, React.FC<ConfigProps>> = {
  // Triggers
  'salesforce_trigger': SalesforceTriggerConfig,
  'slack_trigger': SlackTriggerConfig,
  'hubspot_trigger': HubSpotTriggerConfig,
  'google_calendar_trigger': GoogleCalendarTriggerConfig,
  'shopify_trigger': ShopifyTriggerConfig,
  'stripe_trigger': StripeTriggerConfig,
  'airtable_trigger': AirtableTriggerConfig,
  'mailchimp_trigger': MailchimpTriggerConfig,
  
  // Actions
  'salesforce_action': SalesforceActionConfig,
  'slack_action': SlackActionConfig,
  'hubspot_action': HubSpotActionConfig,
  'google_calendar_action': GoogleCalendarActionConfig,
  'shopify_action': ShopifyActionConfig,
  'stripe_action': StripeActionConfig,
  'airtable_action': AirtableActionConfig,
  'mailchimp_action': MailchimpActionConfig,
  
  // Generic fallbacks
  'generic_trigger': GenericTriggerConfig,
  'generic_action': GenericActionConfig,
};


export function SalesforceActionConfig({ config, onChange }: ConfigProps) {
  const objects = ['Lead', 'Contact', 'Account', 'Opportunity', 'Case', 'Task'];
  const operations = ['create', 'update', 'upsert', 'delete', 'get'];

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Operation
        </label>
        <select
          value={config.action || 'create'}
          onChange={(e) => onChange({ ...config, action: e.target.value })}
          className="w-full rounded-lg border border-gray-300 px-3 py-2"
        >
          {operations.map(op => (
            <option key={op} value={op}>
              {op.charAt(0).toUpperCase() + op.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Object Type
        </label>
        <select
          value={config.object || 'Lead'}
          onChange={(e) => onChange({ ...config, object: e.target.value })}
          className="w-full rounded-lg border border-gray-300 px-3 py-2"
        >
          {objects.map(obj => (
            <option key={obj} value={obj}>{obj}</option>
          ))}
        </select>
      </div>

      {config.action === 'update' && (
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Record ID
          </label>
          <input
            type="text"
            value={config.recordId || ''}
            onChange={(e) => onChange({ ...config, recordId: e.target.value })}
            placeholder="{{previous_step.id}}"
            className="w-full rounded-lg border border-gray-300 px-3 py-2"
          />
        </div>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Field Mappings
        </label>
        <div className="rounded-lg bg-gray-50 p-3">
          <p className="text-sm text-gray-600">
            Map your data to Salesforce fields. You can use variables from previous steps.
          </p>
          {/* In production, this would be a dynamic field mapper */}
          <div className="mt-3 space-y-2">
            <input
              type="text"
              placeholder="FirstName = {{contact.first_name}}"
              className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
            />
            <input
              type="text"
              placeholder="LastName = {{contact.last_name}}"
              className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
            />
            <input
              type="text"
              placeholder="Email = {{contact.email}}"
              className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Slack Configuration
export function SlackTriggerConfig({ config, onChange }: ConfigProps) {
  const events = [
    { value: 'message', label: 'New Message' },
    { value: 'app_mention', label: 'App Mentioned' },
    { value: 'reaction_added', label: 'Reaction Added' },
    { value: 'channel_created', label: 'Channel Created' },
    { value: 'member_joined_channel', label: 'Member Joined Channel' }
  ];

  return (
    <div className="space-y-4">
      {/* <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Event Type
        </label>
        <select
          value={config.event || 'message'}
          onChange={(e) => onChange({ ...config, event: e.target.value })}
          className="w-full rounded-lg border border-gray-300 px-3 py-2"
        >
          {events.map(event => (
            <option key={event.value} value={event.value}>
              {event.label}
            </option>
          ))}
        </select> */}
      </div>
	)}