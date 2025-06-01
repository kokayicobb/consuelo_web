
// src/data/detailed-contacts.tsx (or your actual path)

// ****** ADD THESE INTERFACE DEFINITIONS BACK ******
export interface FileAttachment {
  id: string;
  name: string;
  type: 'pdf' | 'doc' | 'docx' | 'xls' | 'xlsx' | 'img' | 'png' | 'jpg' | 'jpeg' | 'generic'; // Expanded types
  size: string; // e.g., "2.3 MB"
  uploadedDate: string; // ISO date string
  url?: string; // Optional URL for download
}

export interface RecentActivityItem {
  id: string; // Unique ID for each activity
  date: string; // ISO date string
  type: 'Call' | 'Email' | 'Meeting' | 'Note' | 'Task' | 'File Upload'; // Expanded types
  description: string;
  sentiment?: 'Positive' | 'Negative' | 'Neutral'; // Optional sentiment
  user?: string; // User who performed/logged the activity (e.g., Relationship Manager)
  details?: { [key: string]: any }; // For type-specific details: e.g., call duration, email subject, task due date
}
// *****************************************************

export interface Deal {
  id: string;
  name: string;
  stage: 'Prospecting' | 'Qualification' | 'Proposal' | 'Negotiation' | 'Closed Won' | 'Closed Lost';
  amount: number;
  closeDate: string; // ISO date string
  owner: string;
}

export interface Ticket {
  id: string;
  subject: string;
  status: 'Open' | 'In Progress' | 'Pending Customer' | 'Resolved' | 'Closed';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  lastUpdated: string; // ISO date string
  assignedTo?: string;
}

export interface DetailedContact {
  id: number;
  name: string;
  title: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  linkedin: string;
  priority: 'High' | 'Medium' | 'Low'; // Made priority more specific
  status: string; // e.g., "Active Client", "Prospect", "Former Client"
  segment: string; // e.g., "Corporate Banking", "Private Wealth"
  relationshipManager: string;
  financialOverview?: {
    totalAssetsUnderManagement: number;
    recentDealValue: number;
    productInterests: string[];
    lastReviewDate: string | null;
  };
  recentActivity?: RecentActivityItem[];
  notes?: string; // General notes field
  aiTalkingTips?: string[];
  files?: FileAttachment[];
  deals?: Deal[];
  tickets?: Ticket[];
}

export const detailedContacts: DetailedContact[] = [
  {
    id: 1,
    name: "Sarah Chen",
    title: "Chief Investment Officer",
    company: "TechFlow Solutions",
    email: "sarah.chen@techflow.com",
    phone: "(555) 123-4567",
    address: "123 Innovation Drive, Fintech City, FL 33101",
    linkedin: "linkedin.com/in/sarahchen",
    priority: "High",
    status: "Active Client",
    segment: "Corporate Banking",
    relationshipManager: "Alex Miller",
    financialOverview: {
      totalAssetsUnderManagement: 45000000,
      recentDealValue: 45000,
      productInterests: ["AI Risk Assessment", "Automated Trading", "Blockchain Solutions"],
      lastReviewDate: "2023-10-15",
    },
    recentActivity: [
      {
        id: 'act1',
        date: "2024-03-10T14:00:00Z",
        type: "Meeting",
        description: "Follow-up meeting regarding Q2 AI risk assessment proposal. Confirmed budget allocation.",
        sentiment: "Positive",
        user: "Alex Miller",
        details: { location: "Client Office", attendees: ["Sarah Chen", "Alex Miller", "John Doe (Tech Lead)"] }
      },
      {
        id: 'act2',
        date: "2024-03-08T09:30:00Z",
        type: "Call",
        description: "Discussed AI-driven risk assessment proposal. Sarah expressed strong interest in Q2 implementation.",
        sentiment: "Positive",
        user: "Alex Miller",
        details: { duration: "30 mins" }
      },
      {
        id: 'act3',
        date: "2024-03-05T17:00:00Z",
        type: "Email",
        description: "Sent detailed proposal for AI risk assessment solution.",
        sentiment: "Neutral",
        user: "Alex Miller",
        details: { subject: "Proposal: AI Risk Assessment for TechFlow", to: "sarah.chen@techflow.com", from: "alex.miller@bank.com" }
      },
      {
        id: 'act4',
        date: "2024-03-01T11:00:00Z",
        type: "Task",
        description: "Prepare presentation for Sarah Chen follow-up meeting.",
        user: "Alex Miller",
        details: { status: "Completed", dueDate: "2024-03-07T00:00:00Z", assignedTo: "Alex Miller" }
      },
      {
        id: 'act5',
        date: "2024-02-28T16:00:00Z",
        type: "Note",
        description: "Sarah mentioned potential expansion into new markets in Q4. Keep this in mind for future discussions regarding global payment solutions.",
        user: "Alex Miller",
      },
       {
        id: 'act6',
        date: '2024-03-05T10:00:00Z',
        type: 'File Upload',
        description: 'Uploaded Q2_Proposal_AI_Risk.pdf related to the ongoing discussion.',
        user: 'Alex Miller',
        details: { fileName: 'Q2_Proposal_AI_Risk.pdf', fileId: 'file1' }
      },
      { // Added sample call from previous batch
        id: 'actCall1',
        date: "2024-03-12T10:00:00Z",
        type: "Call",
        description: "Quick check-in call regarding upcoming proposal review. Sarah confirmed availability.",
        sentiment: "Neutral",
        user: "Alex Miller",
        details: { duration: "10 mins", outcome: "Confirmed meeting" }
      },
    ],
    notes: "Client is highly focused on leveraging cutting-edge AI for optimizing their investment strategies. Responsive and engaged. Consider discussing blockchain solutions more in Q3.",
    aiTalkingTips: [
      "Reiterate Q2 implementation benefits for AI risk assessment.",
      "Explore if other departments could benefit from similar AI solutions.",
      "Ask about her recent thoughts on blockchain integration discussed previously."
    ],
    files: [
      { id: 'file1', name: 'Q2_Proposal_AI_Risk.pdf', type: 'pdf', size: '1.2 MB', uploadedDate: '2024-03-05T10:00:00Z', url: '#' },
      { id: 'file2', name: 'Service_Agreement_Draft.docx', type: 'doc', size: '87 KB', uploadedDate: '2024-02-20T14:30:00Z', url: '#' },
      { id: 'file3', name: 'Client_Onboarding_Checklist.xlsx', type: 'xls', size: '45 KB', uploadedDate: '2024-01-15T09:15:00Z', url: '#' },
    ],
    deals: [
      { id: 'deal1', name: 'AI Risk Assessment Platform - Phase 1', stage: 'Negotiation', amount: 45000, closeDate: '2024-04-30T00:00:00Z', owner: 'Alex Miller' },
      { id: 'deal2', name: 'Blockchain Integration Consultancy', stage: 'Prospecting', amount: 75000, closeDate: '2024-06-15T00:00:00Z', owner: 'Alex Miller' },
    ],
    tickets: [
      { id: 'tkt1', subject: 'Query on data import limits for AI Platform', status: 'In Progress', priority: 'Medium', lastUpdated: '2024-03-11T15:00:00Z', assignedTo: 'Support Team' }
    ]
  },
  {
    id: 2,
    name: "Marcus Rodriguez",
    title: "Senior Portfolio Manager",
    company: "Global Dynamics",
    email: "marcus.r@globaldyn.com",
    phone: "(555) 987-6543",
    address: "456 Capital Blvd, Wealthtown, NY 10001",
    linkedin: "linkedin.com/in/marcusrodriguez",
    priority: "Medium",
    status: "Existing Client",
    segment: "Private Wealth",
    relationshipManager: "Sophia Lee",
    financialOverview: {
      totalAssetsUnderManagement: 1200000,
      recentDealValue: 0,
      productInterests: ["Diversified Investment Funds", "Retirement Planning", "Estate Management"],
      lastReviewDate: "2023-12-01",
    },
    recentActivity: [
      {
        id: 'act7',
        date: "2024-03-01T11:00:00Z",
        type: "Email",
        description: "Sent quarterly performance report. No response yet. Will follow up next week.",
        sentiment: "Neutral",
        user: "Sophia Lee",
        details: { subject: "Q4 2023 Portfolio Performance Report", to: "marcus.r@globaldyn.com", from: "sophia.lee@bank.com" }
      },
      {
        id: 'act8',
        date: "2024-02-15T10:00:00Z",
        type: "Call",
        description: "Portfolio review call. Discussed market conditions and potential adjustments. Marcus seemed hesitant about aggressive changes.",
        sentiment: "Neutral",
        user: "Sophia Lee",
        details: { duration: "45 mins", outcome: "Scheduled follow-up" }
      },
      {
        id: 'act9',
        date: '2024-03-01T11:05:00Z',
        type: 'File Upload',
        description: 'Uploaded Quarterly_Performance_Report_Q4_2023.pdf to share with client.',
        user: 'Sophia Lee',
        details: { fileName: 'Quarterly_Performance_Report_Q4_2023.pdf', fileId: 'file4'}
      },
      { // Added sample task from previous batch
        id: 'actTask1',
        date: "2024-03-10T00:00:00Z", // Creation date of task
        type: "Task",
        description: "Prepare Q1 2024 portfolio review deck for Marcus.",
        user: "Sophia Lee",
        details: { status: "In Progress", dueDate: "2024-03-20T00:00:00Z", assignedTo: "Sophia Lee", priority: "High" }
      },
    ],
    notes: "Long-term client, prefers proactive communication on market changes and portfolio adjustments. Conservative investor.",
    aiTalkingTips: [
      "Follow up on the quarterly report; offer to walk through it.",
      "Discuss conservative strategies for current market volatility.",
      "Inquire about any upcoming life events relevant to estate planning."
    ],
    files: [
      { id: 'file4', name: 'Quarterly_Performance_Report_Q4_2023.pdf', type: 'pdf', size: '2.5 MB', uploadedDate: '2024-03-01T11:00:00Z', url: '#' },
      { id: 'file5', name: 'Investment_Strategy_Overview.pdf', type: 'pdf', size: '750 KB', uploadedDate: '2023-11-10T16:00:00Z', url: '#' },
    ],
    deals: [],
    tickets: [
      { id: 'tkt2', subject: 'Difficulty accessing online portal', status: 'Resolved', priority: 'Low', lastUpdated: '2024-03-05T10:00:00Z', assignedTo: 'Support Team' }
    ]
  },
  {
    id: 3,
    name: "Emily Watson",
    title: "Head of Operations",
    company: "StartUp Labs",
    email: "emily.w@startuplabs.io",
    phone: "(555) 234-5678",
    address: "789 Incubator Way, Innovation Hub, CA 90210",
    linkedin: "linkedin.com/in/emilywatson",
    priority: "High",
    status: "New Client",
    segment: "SME Banking",
    relationshipManager: "Chris Evans",
    financialOverview: {
      totalAssetsUnderManagement: 750000,
      recentDealValue: 25000,
      productInterests: ["Financial Analytics Platform", "Business Credit Lines", "Payroll Services"],
      lastReviewDate: "2023-09-01",
    },
    recentActivity: [
      {
        id: 'act10',
        date: "2024-03-06T14:30:00Z",
        type: "Meeting",
        description: "Discussed terms for platform contract renewal. Emily asked for a custom reporting feature. Need to check feasibility.",
        sentiment: "Neutral",
        user: "Chris Evans",
        details: { location: "Virtual Meeting", attendees: ["Emily Watson", "Chris Evans"] }
      },
      {
        id: 'act11',
        date: "2024-03-02T09:00:00Z",
        type: "Task",
        description: "Follow up with Emily on custom reporting feature request after consulting with product team.",
        user: "Chris Evans",
        details: { status: "In Progress", dueDate: "2024-03-09T00:00:00Z", assignedTo: "Chris Evans", priority: "High" }
      },
      {
        id: 'act12',
        date: "2024-02-20T11:00:00Z",
        type: "Note",
        description: "Emily is very data-driven. Ensure all proposals include clear metrics and ROI projections.",
        user: "Chris Evans",
      },
      { // Added sample note from previous batch
        id: 'actNote1',
        date: "2024-03-13T09:00:00Z",
        type: "Note",
        description: "Emily mentioned interest in attending our upcoming FinTech webinar. Send invite.",
        user: "Chris Evans",
      }
    ],
    notes: "Fast-growing startup, high potential for future growth. Focus on operational efficiency and data-driven decisions.",
    aiTalkingTips: [
      "Address the custom reporting feature request with potential solutions.",
      "Highlight how analytics platform can support their growth trajectory.",
      "Explore interest in other services that aid operational efficiency."
    ],
    files: [],
    deals: [
      { id: 'deal3', name: 'Financial Analytics Platform Renewal', stage: 'Closed Won', amount: 25000, closeDate: '2024-03-01T00:00:00Z', owner: 'Chris Evans' }
    ],
    tickets: []
  },
];