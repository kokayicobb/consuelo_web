// lib/automations/integrations.ts - Production-ready integration definitions

import React from "react";
import {
  Webhook,
  Clock,
  FileText,
  Mail,
  MessageSquare,
  Calendar,
  Users,
  Database,
  Zap,
  Globe,
  DollarSign,
  BarChart,
  Phone,
  Video,
  Share2,
  Folder,
  CheckSquare,
  Square,
  Hexagon,
  Camera,
  Cloud,
  Cpu,
  Activity,
  ShoppingCart,
  CreditCard,
  Briefcase,
  Target,
  TrendingUp,
  UserCheck,
  Bell,
} from "lucide-react";

// Integration categories
export enum IntegrationCategory {
  CRM = "CRM",
  MARKETING = "Marketing",
  COMMUNICATION = "Communication",
  PRODUCTIVITY = "Productivity",
  ANALYTICS = "Analytics",
  SOCIAL_MEDIA = "Social Media",
  E_COMMERCE = "E-commerce",
  PAYMENT = "Payment",
  DATABASE = "Database",
  AI = "AI & Machine Learning",
  AUTOMATION = "Automation",
  CALENDAR = "Calendar & Scheduling",
  FORMS = "Forms & Surveys",
  EMAIL_MARKETING = "Email Marketing",
  CUSTOMER_SUPPORT = "Customer Support",
}

// Base integration interface
export interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: IntegrationCategory;
  color: string; // Brand color
  requiresAuth: boolean;
  authType?: 'oauth2' | 'api_key' | 'jwt' | 'basic';
  documentationUrl?: string;
  logoUrl?: string;
}

// Trigger type definition
export interface TriggerType extends Integration {
  type: 'trigger';
  triggerEvents?: string[]; // Specific events this trigger supports
  webhookSupported?: boolean;
  pollingSupported?: boolean;
  instantTrigger?: boolean;
  
}

// Action type definition
export interface ActionType extends Integration {
  type: 'action';
  actions?: string[]; // Specific actions this integration supports
  bulkOperations?: boolean;
  batchSize?: number;
}

// ============= TRIGGER DEFINITIONS =============

export const TRIGGER_INTEGRATIONS: TriggerType[] = [
  // CRM Triggers
  {
    id: "salesforce_trigger",
    name: "Salesforce",
    description: "Trigger on Salesforce events like new leads, opportunities, or contacts",
    icon: <Cloud className="h-5 w-5" style={{ color: '#00A1E0' }} />,
    category: IntegrationCategory.CRM,
    color: "#00A1E0",
    type: "trigger",
    requiresAuth: true,
    authType: "oauth2",
    triggerEvents: [
      "new_lead",
      "lead_updated",
      "new_contact",
      "contact_updated",
      "new_opportunity",
      "opportunity_stage_changed",
      "new_account",
      "account_updated",
      "new_case",
      "case_updated"
    ],
    webhookSupported: true,
    instantTrigger: true,
    documentationUrl: "https://developer.salesforce.com/docs/apis"
  },
  {
    id: "hubspot_trigger",
    name: "HubSpot",
    description: "Trigger on HubSpot CRM events and marketing activities",
    icon: <Hexagon className="h-5 w-5" style={{ color: '#FF7A59' }} />,
    category: IntegrationCategory.CRM,
    color: "#FF7A59",
    type: "trigger",
    requiresAuth: true,
    authType: "oauth2",
    triggerEvents: [
      "new_contact",
      "contact_property_change",
      "new_company",
      "new_deal",
      "deal_stage_change",
      "form_submission",
      "email_opened",
      "email_clicked"
    ],
    webhookSupported: true,
    instantTrigger: true
  },
  {
    id: "pipedrive_trigger",
    name: "Pipedrive",
    description: "Monitor deals, contacts, and activities in Pipedrive",
    icon: <Target className="h-5 w-5" style={{ color: '#172733' }} />,
    category: IntegrationCategory.CRM,
    color: "#172733",
    type: "trigger",
    requiresAuth: true,
    authType: "oauth2",
    triggerEvents: [
      "new_deal",
      "deal_updated",
      "deal_stage_changed",
      "new_person",
      "new_organization",
      "activity_completed"
    ],
    webhookSupported: true
  },

  // Communication Triggers
  {
    id: "slack_trigger",
    name: "Slack",
    description: "Trigger on Slack messages, reactions, and channel events",
    icon: <MessageSquare className="h-5 w-5" style={{ color: '#4A154B' }} />,
    category: IntegrationCategory.COMMUNICATION,
    color: "#4A154B",
    type: "trigger",
    requiresAuth: true,
    authType: "oauth2",
    triggerEvents: [
      "new_message",
      "message_posted_to_channel",
      "new_channel_created",
      "user_joined_channel",
      "reaction_added",
      "file_shared",
      "app_mentioned"
    ],
    webhookSupported: true,
    instantTrigger: true
  },
  {
    id: "teams_trigger",
    name: "Microsoft Teams",
    description: "React to Teams messages, meetings, and channel activities",
    icon: <Users className="h-5 w-5" style={{ color: '#5059C9' }} />,
    category: IntegrationCategory.COMMUNICATION,
    color: "#5059C9",
    type: "trigger",
    requiresAuth: true,
    authType: "oauth2",
    triggerEvents: [
      "new_message",
      "new_channel_message",
      "meeting_started",
      "meeting_ended",
      "user_joined_team"
    ],
    webhookSupported: true
  },
  {
    id: "twilio_trigger",
    name: "Twilio",
    description: "Trigger on SMS, voice calls, and WhatsApp messages",
    icon: <Phone className="h-5 w-5" style={{ color: '#F22F46' }} />,
    category: IntegrationCategory.COMMUNICATION,
    color: "#F22F46",
    type: "trigger",
    requiresAuth: true,
    authType: "api_key",
    triggerEvents: [
      "sms_received",
      "sms_sent",
      "call_received",
      "call_completed",
      "whatsapp_message_received"
    ],
    webhookSupported: true,
    instantTrigger: true
  },

  // Calendar & Scheduling Triggers
  {
    id: "google_calendar_trigger",
    name: "Google Calendar",
    description: "Trigger on calendar events, updates, and RSVPs",
    icon: <Calendar className="h-5 w-5" style={{ color: '#4285F4' }} />,
    category: IntegrationCategory.CALENDAR,
    color: "#4285F4",
    type: "trigger",
    requiresAuth: true,
    authType: "oauth2",
    triggerEvents: [
      "event_created",
      "event_updated",
      "event_cancelled",
      "event_started",
      "event_ended",
      "attendee_responded"
    ],
    webhookSupported: true,
    pollingSupported: true
  },
  {
    id: "outlook_calendar_trigger",
    name: "Outlook Calendar",
    description: "Monitor Microsoft Outlook calendar events",
    icon: <Calendar className="h-5 w-5" style={{ color: '#0078D4' }} />,
    category: IntegrationCategory.CALENDAR,
    color: "#0078D4",
    type: "trigger",
    requiresAuth: true,
    authType: "oauth2",
    triggerEvents: [
      "event_created",
      "event_updated",
      "event_deleted",
      "meeting_request_received"
    ],
    webhookSupported: true
  },
  {
    id: "calendly_trigger",
    name: "Calendly",
    description: "Trigger when meetings are scheduled or cancelled",
    icon: <Clock className="h-5 w-5" style={{ color: '#006BFF' }} />,
    category: IntegrationCategory.CALENDAR,
    color: "#006BFF",
    type: "trigger",
    requiresAuth: true,
    authType: "oauth2",
    triggerEvents: [
      "invitee_created",
      "invitee_canceled",
      "event_type_created"
    ],
    webhookSupported: true,
    instantTrigger: true
  },

  // Marketing & Email Triggers
  {
    id: "mailchimp_trigger",
    name: "Mailchimp",
    description: "Trigger on email campaigns, subscriber changes, and list updates",
    icon: <Mail className="h-5 w-5" style={{ color: '#FFE01B' }} />,
    category: IntegrationCategory.EMAIL_MARKETING,
    color: "#FFE01B",
    type: "trigger",
    requiresAuth: true,
    authType: "oauth2",
    triggerEvents: [
      "subscriber_added",
      "subscriber_updated",
      "subscriber_unsubscribed",
      "campaign_sent",
      "email_opened",
      "link_clicked"
    ],
    webhookSupported: true
  },
  {
    id: "sendgrid_trigger",
    name: "SendGrid",
    description: "Monitor email delivery, opens, and clicks",
    icon: <Mail className="h-5 w-5" style={{ color: '#1A82E2' }} />,
    category: IntegrationCategory.EMAIL_MARKETING,
    color: "#1A82E2",
    type: "trigger",
    requiresAuth: true,
    authType: "api_key",
    triggerEvents: [
      "email_delivered",
      "email_opened",
      "email_clicked",
      "email_bounced",
      "unsubscribe"
    ],
    webhookSupported: true,
    instantTrigger: true
  },
  {
    id: "activecampaign_trigger",
    name: "ActiveCampaign",
    description: "React to marketing automation and CRM events",
    icon: <Activity className="h-5 w-5" style={{ color: '#356AE6' }} />,
    category: IntegrationCategory.MARKETING,
    color: "#356AE6",
    type: "trigger",
    requiresAuth: true,
    authType: "api_key",
    triggerEvents: [
      "contact_added",
      "contact_tag_added",
      "deal_stage_changed",
      "campaign_opened",
      "automation_started"
    ],
    webhookSupported: true
  },

  // Social Media Triggers
  {
    id: "facebook_trigger",
    name: "Facebook",
    description: "Monitor Facebook page posts, comments, and messages",
    icon: <Globe className="h-5 w-5" style={{ color: '#1877F2' }} />,
    category: IntegrationCategory.SOCIAL_MEDIA,
    color: "#1877F2",
    type: "trigger",
    requiresAuth: true,
    authType: "oauth2",
    triggerEvents: [
      "page_post_created",
      "post_comment",
      "page_message_received",
      "ad_lead_generated"
    ],
    webhookSupported: true
  },
  {
    id: "instagram_trigger",
    name: "Instagram",
    description: "React to Instagram posts, stories, and messages",
    icon: <Camera className="h-5 w-5" style={{ color: '#E4405F' }} />,
    category: IntegrationCategory.SOCIAL_MEDIA,
    color: "#E4405F",
    type: "trigger",
    requiresAuth: true,
    authType: "oauth2",
    triggerEvents: [
      "new_post",
      "new_comment",
      "new_story",
      "direct_message",
      "mention"
    ],
    webhookSupported: true
  },
  {
    id: "linkedin_trigger",
    name: "LinkedIn",
    description: "Monitor LinkedIn posts, connections, and messages",
    icon: <Briefcase className="h-5 w-5" style={{ color: '#0A66C2' }} />,
    category: IntegrationCategory.SOCIAL_MEDIA,
    color: "#0A66C2",
    type: "trigger",
    requiresAuth: true,
    authType: "oauth2",
    triggerEvents: [
      "new_connection",
      "post_liked",
      "post_commented",
      "message_received"
    ],
    pollingSupported: true
  },
  {
    id: "twitter_trigger",
    name: "X (Twitter)",
    description: "React to tweets, mentions, and direct messages",
    icon: <Share2 className="h-5 w-5" style={{ color: '#000000' }} />,
    category: IntegrationCategory.SOCIAL_MEDIA,
    color: "#000000",
    type: "trigger",
    requiresAuth: true,
    authType: "oauth2",
    triggerEvents: [
      "new_tweet",
      "mention",
      "direct_message",
      "follower_added",
      "retweet"
    ],
    webhookSupported: true
  },

  // E-commerce Triggers
  {
    id: "shopify_trigger",
    name: "Shopify",
    description: "Monitor store orders, customers, and inventory",
    icon: <ShoppingCart className="h-5 w-5" style={{ color: '#7AB55C' }} />,
    category: IntegrationCategory.E_COMMERCE,
    color: "#7AB55C",
    type: "trigger",
    requiresAuth: true,
    authType: "oauth2",
    triggerEvents: [
      "order_created",
      "order_fulfilled",
      "order_cancelled",
      "customer_created",
      "product_created",
      "inventory_level_changed"
    ],
    webhookSupported: true,
    instantTrigger: true
  },
  {
    id: "woocommerce_trigger",
    name: "WooCommerce",
    description: "React to WooCommerce store events",
    icon: <ShoppingCart className="h-5 w-5" style={{ color: '#96588A' }} />,
    category: IntegrationCategory.E_COMMERCE,
    color: "#96588A",
    type: "trigger",
    requiresAuth: true,
    authType: "api_key",
    triggerEvents: [
      "order_created",
      "order_updated",
      "customer_created",
      "product_created"
    ],
    webhookSupported: true
  },

  // Payment Triggers
  {
    id: "stripe_trigger",
    name: "Stripe",
    description: "Monitor payments, subscriptions, and customer events",
    icon: <CreditCard className="h-5 w-5" style={{ color: '#635BFF' }} />,
    category: IntegrationCategory.PAYMENT,
    color: "#635BFF",
    type: "trigger",
    requiresAuth: true,
    authType: "api_key",
    triggerEvents: [
      "payment_succeeded",
      "payment_failed",
      "subscription_created",
      "subscription_cancelled",
      "invoice_paid",
      "customer_created"
    ],
    webhookSupported: true,
    instantTrigger: true
  },
  {
    id: "paypal_trigger",
    name: "PayPal",
    description: "React to PayPal payments and disputes",
    icon: <DollarSign className="h-5 w-5" style={{ color: '#003087' }} />,
    category: IntegrationCategory.PAYMENT,
    color: "#003087",
    type: "trigger",
    requiresAuth: true,
    authType: "oauth2",
    triggerEvents: [
      "payment_completed",
      "payment_refunded",
      "dispute_created",
      "subscription_activated"
    ],
    webhookSupported: true
  },
  {
    id: "square_trigger",
    name: "Square",
    description: "Monitor Square payments and inventory",
    icon: <Square className="h-5 w-5" style={{ color: '#3E4348' }} />,
    category: IntegrationCategory.PAYMENT,
    color: "#3E4348",
    type: "trigger",
    requiresAuth: true,
    authType: "oauth2",
    triggerEvents: [
      "payment_created",
      "order_created",
      "customer_created",
      "inventory_count_updated"
    ],
    webhookSupported: true
  },

  // Productivity & Database Triggers
  {
    id: "airtable_trigger",
    name: "Airtable",
    description: "Trigger when records are created or updated in Airtable",
    icon: <Database className="h-5 w-5" style={{ color: '#FCB400' }} />,
    category: IntegrationCategory.DATABASE,
    color: "#FCB400",
    type: "trigger",
    requiresAuth: true,
    authType: "api_key",
    triggerEvents: [
      "record_created",
      "record_updated",
      "record_deleted",
      "view_updated"
    ],
    webhookSupported: true
  },
  {
    id: "google_sheets_trigger",
    name: "Google Sheets",
    description: "Monitor changes to Google Sheets",
    icon: <FileText className="h-5 w-5" style={{ color: '#0F9D58' }} />,
    category: IntegrationCategory.PRODUCTIVITY,
    color: "#0F9D58",
    type: "trigger",
    requiresAuth: true,
    authType: "oauth2",
    triggerEvents: [
      "row_added",
      "row_updated",
      "row_deleted",
      "cell_updated",
      "sheet_created"
    ],
    pollingSupported: true
  },
  {
    id: "notion_trigger",
    name: "Notion",
    description: "React to Notion database and page changes",
    icon: <Folder className="h-5 w-5" style={{ color: '#000000' }} />,
    category: IntegrationCategory.PRODUCTIVITY,
    color: "#000000",
    type: "trigger",
    requiresAuth: true,
    authType: "oauth2",
    triggerEvents: [
      "page_created",
      "page_updated",
      "database_item_created",
      "database_item_updated"
    ],
    pollingSupported: true
  },

  // Form Triggers
  {
    id: "typeform_trigger",
    name: "Typeform",
    description: "Trigger when forms are submitted",
    icon: <CheckSquare className="h-5 w-5" style={{ color: '#262627' }} />,
    category: IntegrationCategory.FORMS,
    color: "#262627",
    type: "trigger",
    requiresAuth: true,
    authType: "oauth2",
    triggerEvents: ["form_response", "quiz_completed"],
    webhookSupported: true,
    instantTrigger: true
  },
  {
    id: "google_forms_trigger",
    name: "Google Forms",
    description: "React to Google Forms submissions",
    icon: <FileText className="h-5 w-5" style={{ color: '#673AB7' }} />,
    category: IntegrationCategory.FORMS,
    color: "#673AB7",
    type: "trigger",
    requiresAuth: true,
    authType: "oauth2",
    triggerEvents: ["form_response"],
    webhookSupported: true
  },
  {
    id: "jotform_trigger",
    name: "JotForm",
    description: "Monitor JotForm submissions",
    icon: <CheckSquare className="h-5 w-5" style={{ color: '#0A1D3F' }} />,
    category: IntegrationCategory.FORMS,
    color: "#0A1D3F",
    type: "trigger",
    requiresAuth: true,
    authType: "api_key",
    triggerEvents: ["form_submission"],
    webhookSupported: true
  },

  // Customer Support Triggers
  {
    id: "zendesk_trigger",
    name: "Zendesk",
    description: "React to support tickets and customer interactions",
    icon: <UserCheck className="h-5 w-5" style={{ color: '#03363D' }} />,
    category: IntegrationCategory.CUSTOMER_SUPPORT,
    color: "#03363D",
    type: "trigger",
    requiresAuth: true,
    authType: "oauth2",
    triggerEvents: [
      "ticket_created",
      "ticket_updated",
      "ticket_solved",
      "customer_replied"
    ],
    webhookSupported: true
  },
  {
    id: "intercom_trigger",
    name: "Intercom",
    description: "Monitor conversations and user events",
    icon: <MessageSquare className="h-5 w-5" style={{ color: '#1F8FFF' }} />,
    category: IntegrationCategory.CUSTOMER_SUPPORT,
    color: "#1F8FFF",
    type: "trigger",
    requiresAuth: true,
    authType: "oauth2",
    triggerEvents: [
      "conversation_started",
      "conversation_replied",
      "user_created",
      "lead_converted"
    ],
    webhookSupported: true
  },
  {
    id: "freshdesk_trigger",
    name: "Freshdesk",
    description: "React to support ticket events",
    icon: <Bell className="h-5 w-5" style={{ color: '#12344D' }} />,
    category: IntegrationCategory.CUSTOMER_SUPPORT,
    color: "#12344D",
    type: "trigger",
    requiresAuth: true,
    authType: "api_key",
    triggerEvents: [
      "ticket_created",
      "ticket_updated",
      "contact_created",
      "agent_replied"
    ],
    webhookSupported: true
  },

  // Analytics Triggers
  {
    id: "google_analytics_trigger",
    name: "Google Analytics",
    description: "Monitor website analytics events and goals",
    icon: <BarChart className="h-5 w-5" style={{ color: '#E37400' }} />,
    category: IntegrationCategory.ANALYTICS,
    color: "#E37400",
    type: "trigger",
    requiresAuth: true,
    authType: "oauth2",
    triggerEvents: [
      "goal_completed",
      "traffic_spike",
      "conversion_event"
    ],
    pollingSupported: true
  },
  {
    id: "mixpanel_trigger",
    name: "Mixpanel",
    description: "React to user analytics events",
    icon: <TrendingUp className="h-5 w-5" style={{ color: '#7856FF' }} />,
    category: IntegrationCategory.ANALYTICS,
    color: "#7856FF",
    type: "trigger",
    requiresAuth: true,
    authType: "api_key",
    triggerEvents: [
      "event_tracked",
      "user_profile_updated",
      "funnel_completed"
    ],
    webhookSupported: true
  },

  // Basic triggers
  {
    id: "webhook",
    name: "Webhook",
    description: "Trigger when data is received via HTTP webhook",
    icon: <Webhook className="h-5 w-5 text-yellow-500" />,
    category: IntegrationCategory.AUTOMATION,
    color: "#EAB308",
    type: "trigger",
    requiresAuth: false,
    webhookSupported: true,
    instantTrigger: true
  },
  {
    id: "schedule",
    name: "Schedule",
    description: "Run on a regular schedule (hourly, daily, weekly)",
    icon: <Clock className="h-5 w-5 text-purple-500" />,
    category: IntegrationCategory.AUTOMATION,
    color: "#A855F7",
    type: "trigger",
    requiresAuth: false
  },
  {
    id: "form",
    name: "Form Submission",
    description: "Trigger when a form is submitted on your website",
    icon: <FileText className="h-5 w-5 text-indigo-500" />,
    category: IntegrationCategory.AUTOMATION,
    color: "#6366F1",
    type: "trigger",
    requiresAuth: false,
    webhookSupported: true
  },
  {
    id: "email",
    name: "Email Received",
    description: "Trigger when an email is received in a mailbox",
    icon: <Mail className="h-5 w-5 text-red-500" />,
    category: IntegrationCategory.COMMUNICATION,
    color: "#EF4444",
    type: "trigger",
    requiresAuth: true,
    authType: "api_key",
    pollingSupported: true
  },
  {
    id: "sms",
    name: "SMS Received",
    description: "Trigger when an SMS is received on your number",
    icon: <MessageSquare className="h-5 w-5 text-lime-600" />,
    category: IntegrationCategory.COMMUNICATION,
    color: "#65A30D",
    type: "trigger",
    requiresAuth: true,
    authType: "api_key",
    webhookSupported: true
  }
];

// ============= ACTION DEFINITIONS =============

export const ACTION_INTEGRATIONS: ActionType[] = [
  // CRM Actions
  {
    id: "salesforce_action",
    name: "Salesforce",
    description: "Create, update, or delete Salesforce records",
    icon: <Cloud className="h-5 w-5" style={{ color: '#00A1E0' }} />,
    category: IntegrationCategory.CRM,
    color: "#00A1E0",
    type: "action",
    requiresAuth: true,
    authType: "oauth2",
    actions: [
      "create_lead",
      "update_lead",
      "convert_lead",
      "create_contact",
      "update_contact",
      "create_opportunity",
      "update_opportunity_stage",
      "create_account",
      "update_account",
      "create_case",
      "add_note",
      "create_task"
    ],
    bulkOperations: true,
    batchSize: 200
  },
  {
    id: "hubspot_action",
    name: "HubSpot",
    description: "Manage HubSpot contacts, deals, and marketing activities",
    icon: <Hexagon className="h-5 w-5" style={{ color: '#FF7A59' }} />,
    category: IntegrationCategory.CRM,
    color: "#FF7A59",
    type: "action",
    requiresAuth: true,
    authType: "oauth2",
    actions: [
      "create_contact",
      "update_contact",
      "create_company",
      "create_deal",
      "update_deal_stage",
      "send_email",
      "add_to_list",
      "remove_from_list",
      "create_task",
      "log_activity"
    ],
    bulkOperations: true
  },
  {
    id: "pipedrive_action",
    name: "Pipedrive",
    description: "Manage deals, contacts, and activities in Pipedrive",
    icon: <Target className="h-5 w-5" style={{ color: '#172733' }} />,
    category: IntegrationCategory.CRM,
    color: "#172733",
    type: "action",
    requiresAuth: true,
    authType: "oauth2",
    actions: [
      "create_deal",
      "update_deal",
      "move_deal_stage",
      "create_person",
      "create_organization",
      "create_activity",
      "mark_activity_done"
    ]
  },

  // Communication Actions
  {
    id: "slack_action",
    name: "Slack",
    description: "Send messages, create channels, and manage Slack workspace",
    icon: <MessageSquare className="h-5 w-5" style={{ color: '#4A154B' }} />,
    category: IntegrationCategory.COMMUNICATION,
    color: "#4A154B",
    type: "action",
    requiresAuth: true,
    authType: "oauth2",
    actions: [
      "send_message",
      "send_direct_message",
      "create_channel",
      "invite_to_channel",
      "set_topic",
      "upload_file",
      "add_reaction"
    ]
  },
  {
    id: "teams_action",
    name: "Microsoft Teams",
    description: "Send messages and manage Teams channels",
    icon: <Users className="h-5 w-5" style={{ color: '#5059C9' }} />,
    category: IntegrationCategory.COMMUNICATION,
    color: "#5059C9",
    type: "action",
    requiresAuth: true,
    authType: "oauth2",
    actions: [
      "send_message",
      "create_channel",
      "schedule_meeting",
      "create_team",
      "add_member"
    ]
  },
  {
    id: "twilio_action",
    name: "Twilio",
    description: "Send SMS, make calls, and send WhatsApp messages",
    icon: <Phone className="h-5 w-5" style={{ color: '#F22F46' }} />,
    category: IntegrationCategory.COMMUNICATION,
    color: "#F22F46",
    type: "action",
    requiresAuth: true,
    authType: "api_key",
    actions: [
      "send_sms",
      "send_mms",
      "make_call",
      "send_whatsapp",
      "send_verification_code"
    ]
  },
  {
    id: "zoom_action",
    name: "Zoom",
    description: "Create and manage Zoom meetings",
    icon: <Video className="h-5 w-5" style={{ color: '#2D8CFF' }} />,
    category: IntegrationCategory.COMMUNICATION,
    color: "#2D8CFF",
    type: "action",
    requiresAuth: true,
    authType: "oauth2",
    actions: [
      "create_meeting",
      "update_meeting",
      "delete_meeting",
      "add_registrant",
      "create_webinar"
    ]
  },

  // Calendar & Scheduling Actions
  {
    id: "google_calendar_action",
    name: "Google Calendar",
    description: "Create and manage calendar events",
    icon: <Calendar className="h-5 w-5" style={{ color: '#4285F4' }} />,
    category: IntegrationCategory.CALENDAR,
    color: "#4285F4",
    type: "action",
    requiresAuth: true,
    authType: "oauth2",
    actions: [
      "create_event",
      "update_event",
      "delete_event",
      "invite_attendees",
      "create_recurring_event",
      "check_availability"
    ]
  },
  {
    id: "outlook_calendar_action",
    name: "Outlook Calendar",
    description: "Manage Microsoft Outlook calendar events",
    icon: <Calendar className="h-5 w-5" style={{ color: '#0078D4' }} />,
    category: IntegrationCategory.CALENDAR,
    color: "#0078D4",
    type: "action",
    requiresAuth: true,
    authType: "oauth2",
    actions: [
      "create_event",
      "update_event",
      "send_meeting_invite",
      "check_availability",
      "book_room"
    ]
  },
  {
    id: "calendly_action",
    name: "Calendly",
    description: "Manage Calendly scheduling links and events",
    icon: <Clock className="h-5 w-5" style={{ color: '#006BFF' }} />,
    category: IntegrationCategory.CALENDAR,
    color: "#006BFF",
    type: "action",
    requiresAuth: true,
    authType: "oauth2",
    actions: [
      "create_event_type",
      "update_availability",
      "cancel_event",
      "reschedule_event"
    ]
  },

  // Email Marketing Actions
  {
    id: "mailchimp_action",
    name: "Mailchimp",
    description: "Manage email lists, campaigns, and subscribers",
    icon: <Mail className="h-5 w-5" style={{ color: '#FFE01B' }} />,
    category: IntegrationCategory.EMAIL_MARKETING,
    color: "#FFE01B",
    type: "action",
    requiresAuth: true,
    authType: "oauth2",
    actions: [
      "add_subscriber",
      "update_subscriber",
      "remove_subscriber",
      "add_tag",
      "create_campaign",
      "send_campaign",
      "create_segment"
    ],
    bulkOperations: true,
    batchSize: 500
  },
  {
    id: "sendgrid_action",
    name: "SendGrid",
    description: "Send transactional and marketing emails",
    icon: <Mail className="h-5 w-5" style={{ color: '#1A82E2' }} />,
    category: IntegrationCategory.EMAIL_MARKETING,
    color: "#1A82E2",
    type: "action",
    requiresAuth: true,
    authType: "api_key",
    actions: [
      "send_email",
      "send_template_email",
      "add_contact",
      "update_contact",
      "add_to_list",
      "create_list"
    ],
    bulkOperations: true,
    batchSize: 1000
  },
  {
    id: "activecampaign_action",
    name: "ActiveCampaign",
    description: "Automate marketing and CRM actions",
    icon: <Activity className="h-5 w-5" style={{ color: '#356AE6' }} />,
    category: IntegrationCategory.MARKETING,
    color: "#356AE6",
    type: "action",
    requiresAuth: true,
    authType: "api_key",
    actions: [
      "create_contact",
      "update_contact",
      "add_tag",
      "start_automation",
      "create_deal",
      "send_campaign"
    ]
  },

  // Social Media Actions
  {
    id: "facebook_action",
    name: "Facebook",
    description: "Post to Facebook pages and manage ads",
    icon: <Globe className="h-5 w-5" style={{ color: '#1877F2' }} />,
    category: IntegrationCategory.SOCIAL_MEDIA,
    color: "#1877F2",
    type: "action",
    requiresAuth: true,
    authType: "oauth2",
    actions: [
      "create_post",
      "schedule_post",
      "reply_to_comment",
      "send_message",
      "create_ad",
      "update_ad_budget"
    ]
  },
  {
    id: "instagram_action",
    name: "Instagram",
    description: "Post content and manage Instagram business accounts",
    icon: <Camera className="h-5 w-5" style={{ color: '#E4405F' }} />,
    category: IntegrationCategory.SOCIAL_MEDIA,
    color: "#E4405F",
    type: "action",
    requiresAuth: true,
    authType: "oauth2",
    actions: [
      "create_post",
      "create_story",
      "reply_to_comment",
      "send_direct_message"
    ]
  },
  {
    id: "linkedin_action",
    name: "LinkedIn",
    description: "Share posts and manage LinkedIn presence",
    icon: <Briefcase className="h-5 w-5" style={{ color: '#0A66C2' }} />,
    category: IntegrationCategory.SOCIAL_MEDIA,
    color: "#0A66C2",
    type: "action",
    requiresAuth: true,
    authType: "oauth2",
    actions: [
      "share_post",
      "send_message",
      "send_connection_request",
      "update_profile"
    ]
  },
  {
    id: "twitter_action",
    name: "X (Twitter)",
    description: "Post tweets and manage Twitter account",
    icon: <Share2 className="h-5 w-5" style={{ color: '#000000' }} />,
    category: IntegrationCategory.SOCIAL_MEDIA,
    color: "#000000",
    type: "action",
    requiresAuth: true,
    authType: "oauth2",
    actions: [
      "post_tweet",
      "reply_to_tweet",
      "send_direct_message",
      "follow_user",
      "like_tweet"
    ]
  },

  // E-commerce Actions
  {
    id: "shopify_action",
    name: "Shopify",
    description: "Manage products, orders, and customers in Shopify",
    icon: <ShoppingCart className="h-5 w-5" style={{ color: '#7AB55C' }} />,
    category: IntegrationCategory.E_COMMERCE,
    color: "#7AB55C",
    type: "action",
    requiresAuth: true,
    authType: "oauth2",
    actions: [
      "create_product",
      "update_inventory",
      "fulfill_order",
      "cancel_order",
      "create_discount",
      "add_customer",
      "send_invoice"
    ],
    bulkOperations: true
  },
  {
    id: "woocommerce_action",
    name: "WooCommerce",
    description: "Manage WooCommerce store operations",
    icon: <ShoppingCart className="h-5 w-5" style={{ color: '#96588A' }} />,
    category: IntegrationCategory.E_COMMERCE,
    color: "#96588A",
    type: "action",
    requiresAuth: true,
    authType: "api_key",
    actions: [
      "create_product",
      "update_product",
      "create_order",
      "update_order_status",
      "create_coupon"
    ]
  },

  // Payment Actions
  {
    id: "stripe_action",
    name: "Stripe",
    description: "Process payments and manage subscriptions",
    icon: <CreditCard className="h-5 w-5" style={{ color: '#635BFF' }} />,
    category: IntegrationCategory.PAYMENT,
    color: "#635BFF",
    type: "action",
    requiresAuth: true,
    authType: "api_key",
    actions: [
      "create_payment",
      "create_subscription",
      "cancel_subscription",
      "issue_refund",
      "create_invoice",
      "create_customer"
    ]
  },
  {
    id: "paypal_action",
    name: "PayPal",
    description: "Process PayPal payments and manage transactions",
    icon: <DollarSign className="h-5 w-5" style={{ color: '#003087' }} />,
    category: IntegrationCategory.PAYMENT,
    color: "#003087",
    type: "action",
    requiresAuth: true,
    authType: "oauth2",
    actions: [
      "create_payment",
      "issue_refund",
      "create_subscription",
      "send_invoice"
    ]
  },
  {
    id: "square_action",
    name: "Square",
    description: "Process Square payments and manage inventory",
    icon: <Square className="h-5 w-5" style={{ color: '#3E4348' }} />,
    category: IntegrationCategory.PAYMENT,
    color: "#3E4348",
    type: "action",
    requiresAuth: true,
    authType: "oauth2",
    actions: [
      "create_payment",
      "create_invoice",
      "update_inventory",
      "create_customer"
    ]
  },

  // Productivity & Database Actions
  {
    id: "airtable_action",
    name: "Airtable",
    description: "Create and update records in Airtable bases",
    icon: <Database className="h-5 w-5" style={{ color: '#FCB400' }} />,
    category: IntegrationCategory.DATABASE,
    color: "#FCB400",
    type: "action",
    requiresAuth: true,
    authType: "api_key",
    actions: [
      "create_record",
      "update_record",
      "delete_record",
      "find_records",
      "create_table"
    ],
    bulkOperations: true,
    batchSize: 10
  },
  {
    id: "google_sheets_action",
    name: "Google Sheets",
    description: "Read and write data to Google Sheets",
    icon: <FileText className="h-5 w-5" style={{ color: '#0F9D58' }} />,
    category: IntegrationCategory.PRODUCTIVITY,
    color: "#0F9D58",
    type: "action",
    requiresAuth: true,
    authType: "oauth2",
    actions: [
      "add_row",
      "update_row",
      "delete_row",
      "find_row",
      "create_sheet",
      "format_cells"
    ],
    bulkOperations: true
  },
  {
    id: "notion_action",
    name: "Notion",
    description: "Create and update Notion pages and databases",
    icon: <Folder className="h-5 w-5" style={{ color: '#000000' }} />,
    category: IntegrationCategory.PRODUCTIVITY,
    color: "#000000",
    type: "action",
    requiresAuth: true,
    authType: "oauth2",
    actions: [
      "create_page",
      "update_page",
      "create_database_item",
      "update_database_item",
      "add_comment"
    ]
  },
  {
    id: "google_drive_action",
    name: "Google Drive",
    description: "Manage files and folders in Google Drive",
    icon: <Folder className="h-5 w-5" style={{ color: '#4285F4' }} />,
    category: IntegrationCategory.PRODUCTIVITY,
    color: "#4285F4",
    type: "action",
    requiresAuth: true,
    authType: "oauth2",
    actions: [
      "upload_file",
      "create_folder",
      "move_file",
      "share_file",
      "create_document"
    ]
  },
  {
    id: "dropbox_action",
    name: "Dropbox",
    description: "Upload and manage files in Dropbox",
    icon: <Cloud className="h-5 w-5" style={{ color: '#0061FF' }} />,
    category: IntegrationCategory.PRODUCTIVITY,
    color: "#0061FF",
    type: "action",
    requiresAuth: true,
    authType: "oauth2",
    actions: [
      "upload_file",
      "create_folder",
      "move_file",
      "share_link",
      "delete_file"
    ]
  },

  // Customer Support Actions
  {
    id: "zendesk_action",
    name: "Zendesk",
    description: "Create and manage support tickets",
    icon: <UserCheck className="h-5 w-5" style={{ color: '#03363D' }} />,
    category: IntegrationCategory.CUSTOMER_SUPPORT,
    color: "#03363D",
    type: "action",
    requiresAuth: true,
    authType: "oauth2",
    actions: [
      "create_ticket",
      "update_ticket",
      "add_comment",
      "assign_ticket",
      "change_status"
    ]
  },
  {
    id: "intercom_action",
    name: "Intercom",
    description: "Manage conversations and user data",
    icon: <MessageSquare className="h-5 w-5" style={{ color: '#1F8FFF' }} />,
    category: IntegrationCategory.CUSTOMER_SUPPORT,
    color: "#1F8FFF",
    type: "action",
    requiresAuth: true,
    authType: "oauth2",
    actions: [
      "send_message",
      "create_user",
      "update_user",
      "add_tag",
      "create_note"
    ]
  },
  {
    id: "freshdesk_action",
    name: "Freshdesk",
    description: "Manage support tickets and contacts",
    icon: <Bell className="h-5 w-5" style={{ color: '#12344D' }} />,
    category: IntegrationCategory.CUSTOMER_SUPPORT,
    color: "#12344D",
    type: "action",
    requiresAuth: true,
    authType: "api_key",
    actions: [
      "create_ticket",
      "update_ticket",
      "add_note",
      "create_contact"
    ]
  },

  // Analytics Actions
  {
    id: "google_analytics_action",
    name: "Google Analytics",
    description: "Send events and e-commerce data to Google Analytics",
    icon: <BarChart className="h-5 w-5" style={{ color: '#E37400' }} />,
    category: IntegrationCategory.ANALYTICS,
    color: "#E37400",
    type: "action",
    requiresAuth: true,
    authType: "oauth2",
    actions: [
      "send_event",
      "send_page_view",
      "send_transaction",
      "set_user_property"
    ]
  },
  {
    id: "mixpanel_action",
    name: "Mixpanel",
    description: "Track events and update user profiles",
    icon: <TrendingUp className="h-5 w-5" style={{ color: '#7856FF' }} />,
    category: IntegrationCategory.ANALYTICS,
    color: "#7856FF",
    type: "action",
    requiresAuth: true,
    authType: "api_key",
    actions: [
      "track_event",
      "set_user_profile",
      "increment_property",
      "create_funnel"
    ]
  },
  {
    id: "segment_action",
    name: "Segment",
    description: "Send tracking data to Segment",
    icon: <Activity className="h-5 w-5" style={{ color: '#63E19C' }} />,
    category: IntegrationCategory.ANALYTICS,
    color: "#63E19C",
    type: "action",
    requiresAuth: true,
    authType: "api_key",
    actions: [
      "track_event",
      "identify_user",
      "group_user",
      "send_page_view"
    ]
  },

  // AI & Machine Learning Actions
  {
    id: "openai_action",
    name: "OpenAI",
    description: "Generate text, analyze content, and create embeddings",
    icon: <Cpu className="h-5 w-5" style={{ color: '#10A37F' }} />,
    category: IntegrationCategory.AI,
    color: "#10A37F",
    type: "action",
    requiresAuth: true,
    authType: "api_key",
    actions: [
      "generate_text",
      "analyze_sentiment",
      "create_embedding",
      "moderate_content",
      "generate_image"
    ]
  },
  {
    id: "anthropic_action",
    name: "Anthropic (Claude)",
    description: "Generate and analyze text with Claude AI",
    icon: <Cpu className="h-5 w-5" style={{ color: '#D4AA00' }} />,
    category: IntegrationCategory.AI,
    color: "#D4AA00",
    type: "action",
    requiresAuth: true,
    authType: "api_key",
    actions: [
      "generate_text",
      "analyze_text",
      "summarize_content",
      "answer_question"
    ]
  },

  // Basic Actions
  {
    id: "webhook",
    name: "Send Webhook",
    description: "Send data to another service via HTTP",
    icon: <Webhook className="h-5 w-5 text-blue-500" />,
    category: IntegrationCategory.AUTOMATION,
    color: "#3B82F6",
    type: "action",
    requiresAuth: false,
    actions: ["send_request"]
  },
  {
    id: "email",
    name: "Send Email",
    description: "Send an email to specified recipients",
    icon: <Mail className="h-5 w-5 text-red-500" />,
    category: IntegrationCategory.COMMUNICATION,
    color: "#EF4444",
    type: "action",
    requiresAuth: true,
    authType: "api_key",
    actions: ["send_email", "send_template"]
  },
  {
    id: "sms",
    name: "Send SMS",
    description: "Send an SMS message",
    icon: <MessageSquare className="h-5 w-5 text-green-500" />,
    category: IntegrationCategory.COMMUNICATION,
    color: "#10B981",
    type: "action",
    requiresAuth: true,
    authType: "api_key",
    actions: ["send_sms"]
  },
  {
    id: "delay",
    name: "Delay",
    description: "Wait for a specified amount of time",
    icon: <Clock className="h-5 w-5 text-orange-500" />,
    category: IntegrationCategory.AUTOMATION,
    color: "#F97316",
    type: "action",
    requiresAuth: false,
    actions: ["wait"]
  },
  {
    id: "branch",
    name: "Conditional Branch",
    description: "Split the workflow based on conditions",
    icon: <Zap className="h-5 w-5 text-purple-500" />,
    category: IntegrationCategory.AUTOMATION,
    color: "#A855F7",
    type: "action",
    requiresAuth: false,
    actions: ["evaluate_condition"]
  },
  {
    id: "code",
    name: "Run Code",
    description: "Execute custom JavaScript code",
    icon: <Cpu className="h-5 w-5 text-gray-600" />,
    category: IntegrationCategory.AUTOMATION,
    color: "#4B5563",
    type: "action",
    requiresAuth: false,
    actions: ["execute_code"]
  }
];

// ============= HELPER FUNCTIONS & MAPPINGS =============

// Helper function to get all integrations
export function getAllIntegrations(): Integration[] {
  // Combine unique integrations by ID, preferring triggers if duplicates exist
  const integrationMap = new Map<string, Integration>();
  [...TRIGGER_INTEGRATIONS, ...ACTION_INTEGRATIONS].forEach(integration => {
    if (!integrationMap.has(integration.id)) {
      integrationMap.set(integration.id, integration);
    }
  });
  return Array.from(integrationMap.values());
}

// Helper function to get integrations by category
export function getIntegrationsByCategory(category: IntegrationCategory): Integration[] {
  return getAllIntegrations().filter(i => i.category === category);
}

// Helper function to search integrations
export function searchIntegrations(query: string): Integration[] {
  const lowercaseQuery = query.toLowerCase();
  return getAllIntegrations().filter(i =>
    i.name.toLowerCase().includes(lowercaseQuery) ||
    i.description.toLowerCase().includes(lowercaseQuery)
  );
}

// Map integration IDs to n8n node types
export const INTEGRATION_TO_N8N_NODE_MAP: Record<string, string> = {
  // Triggers
  'salesforce_trigger': 'n8n-nodes-base.salesforceTrigger',
  'hubspot_trigger': 'n8n-nodes-base.hubspotTrigger',
  'slack_trigger': 'n8n-nodes-base.slackTrigger',
  'google_calendar_trigger': 'n8n-nodes-base.googleCalendarTrigger',
  'shopify_trigger': 'n8n-nodes-base.shopifyTrigger',
  'stripe_trigger': 'n8n-nodes-base.stripeTrigger',
  'airtable_trigger': 'n8n-nodes-base.airtableTrigger',
  'typeform_trigger': 'n8n-nodes-base.typeformTrigger',

  // Actions
  'salesforce_action': 'n8n-nodes-base.salesforce',
  'hubspot_action': 'n8n-nodes-base.hubspot',
  'slack_action': 'n8n-nodes-base.slack',
  'google_calendar_action': 'n8n-nodes-base.googleCalendar',
  'shopify_action': 'n8n-nodes-base.shopify',
  'stripe_action': 'n8n-nodes-base.stripe',
  'airtable_action': 'n8n-nodes-base.airtable',
  'openai_action': 'n8n-nodes-base.openAi',

  // Add more mappings as needed
  // Note: Some integrations might require custom n8n nodes or community nodes
};