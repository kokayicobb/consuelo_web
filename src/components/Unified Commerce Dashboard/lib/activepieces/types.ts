// lib/automations/types.ts - Updated version with trigger support

/**
 * n8n API Type Definitions
 * Mapped to match our existing ActivePieces interface
 */

// Workflow Types (n8n workflows = our "flows")
export interface Flow {
  id: string;
  created: string;
  updated: string;
  projectId: string; // We'll fake this with "Consuelo"
  externalId: string;
  folderId?: string | null;
  status: 'ENABLED' | 'DISABLED'; // Maps to n8n's active: boolean
  schedule?: {
    type: 'CRON_EXPRESSION';
    cronExpression: string;
    timezone: string;
    failureCount?: number;
  } | null;
  publishedVersionId?: string | null;
  metadata?: Record<string, any> | null;
  version: FlowVersion;
}

export interface FlowVersion {
  id: string;
  created: string;
  updated: string;
  flowId: string;
  displayName: string;
  trigger: FlowTrigger;
  updatedBy?: string | null;
  valid: boolean;
  state: 'LOCKED';
  connectionIds: string[];
}

export interface FlowTrigger {
  name: string;
  valid: boolean;
  displayName: string;
  nextAction?: FlowAction | null;
  type: 'PIECE_TRIGGER' | 'WEBHOOK' | 'SCHEDULE';
  settings: {
    pieceName?: string;
    pieceVersion?: string;
    triggerName?: string;
    input?: Record<string, any>;
    inputUiInfo?: Record<string, any>;
  };
}

export interface FlowAction {
  name: string;
  valid: boolean;
  displayName: string;
  nextAction?: FlowAction | null;
  type: 'PIECE_ACTION' | 'CODE' | 'BRANCH';
  settings: {
    pieceName?: string;
    pieceVersion?: string;
    actionName?: string;
    input?: Record<string, any>;
    inputUiInfo?: Record<string, any>;
  };
}

// n8n Native Types
export interface N8nWorkflow {
  id: string;
  name: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  nodes: N8nNode[];
  connections: N8nConnections;
  settings?: N8nWorkflowSettings;
  staticData?: any;
  tags?: N8nTag[];
}

export interface N8nNode {
  id?: string;
  name: string;
  type: string;
  typeVersion?: number;
  position: [number, number];
  parameters: Record<string, any>;
  credentials?: Record<string, string>;
  disabled?: boolean;
}

export interface N8nConnections {
  [sourceNode: string]: {
    [sourceType: string]: Array<{
      node: string;
      type: string;
      index: number;
    }>[];
  };
}

export interface N8nWorkflowSettings {
  saveExecutionProgress?: boolean;
  saveManualExecutions?: boolean;
  saveDataErrorExecution?: 'all' | 'none';
  saveDataSuccessExecution?: 'all' | 'none';
  executionTimeout?: number;
  errorWorkflow?: string;
  timezone?: string;
  executionOrder?: 'v0' | 'v1';
}

export interface N8nTag {
  id: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

// Execution Types (n8n execution = our "flow run")
export interface FlowRun {
  id: string;
  created: string;
  updated: string;
  projectId: string;
  flowId: string;
  flowVersionId: string;
  flowDisplayName: string;
  status: 'FAILED' | 'SUCCEEDED' | 'RUNNING' | 'PAUSED' | 'STOPPED';
  startTime: string;
  finishTime?: string;
  environment: 'PRODUCTION' | 'TESTING';
  steps: Record<string, any>;
  tags?: string[];
  logsFileId?: string | null;
  tasks?: number;
  duration?: number;
}

export interface N8nExecution {
  id: number;
  data?: any;
  finished: boolean;
  mode: string;
  retryOf?: number;
  retrySuccessId?: string;
  startedAt: string;
  stoppedAt?: string;
  workflowId: string;
  waitTill?: string;
  customData?: any;
}

// Credential Types (n8n credentials = our "connections")
export interface Connection {
  id: string;
  created: string;
  updated: string;
  externalId: string;
  displayName: string;
  type: string;
  pieceName: string;
  projectIds: string[];
  scope: 'PROJECT';
  status: 'ACTIVE';
  metadata?: Record<string, any> | null;
}

export interface N8nCredential {
  id: string;
  name: string;
  type: string;
  createdAt: string;
  updatedAt: string;
}

// Request Types - UPDATED WITH TRIGGER SUPPORT
export interface CreateFlowData {
  displayName: string;
  projectId?: string;
  folderId?: string;
  metadata?: Record<string, any>;
  trigger?: FlowTrigger; // Added trigger support
}

export interface UpdateFlowData {
  displayName?: string;
  active?: boolean;
  nodes?: N8nNode[];
  connections?: N8nConnections;
  settings?: N8nWorkflowSettings;
  trigger?: FlowTrigger; // Added trigger support
}

export interface CreateConnectionData {
  name: string;
  type: string;
  data: Record<string, any>;
}

export interface ListFlowsParams {
  projectId?: string;
  active?: boolean;
  tags?: string;
  name?: string;
  limit?: number;
  cursor?: string;
}

export interface ListFlowRunsParams {
  workflowId?: string;
  status?: string;
  limit?: number;
  cursor?: string;
}

// Folder Types (we'll simulate these with tags)
export interface Folder {
  id: string;
  created: string;
  updated: string;
  projectId: string;
  displayName: string;
  displayOrder: number;
}

export interface CreateFolderData {
  displayName: string;
  projectId?: string;
}

// API Response Types
export interface PaginatedResponse<T> {
  data: T[];
  nextCursor?: string | null;
  previousCursor?: string | null;
}

export interface N8nPaginatedResponse<T> {
  data: T[];
  nextCursor?: string;
}

export interface ApiError {
  error: string;
  message?: string;
  statusCode?: number;
}

export interface ActivePiecesResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

// Service Config
export interface ActivePiecesConfig {
  apiUrl: string;
  apiKey: string;
  defaultProjectId?: string;
}

// Helper function to convert n8n workflow to our Flow format
export function n8nWorkflowToFlow(workflow: N8nWorkflow): Flow {
  // Find the trigger node
  const triggerNode = workflow.nodes.find(n => 
    n.type.includes('trigger') || 
    n.type === 'n8n-nodes-base.webhook' ||
    n.type === 'n8n-nodes-base.scheduleTrigger' ||
    n.type === 'n8n-nodes-base.start'
  );

  // Build a simple flow structure
  const trigger: FlowTrigger = {
    name: triggerNode?.name || 'trigger',
    valid: !triggerNode?.disabled,
    displayName: triggerNode?.name || 'Trigger',
    type: triggerNode?.type.includes('webhook') ? 'WEBHOOK' : 
          triggerNode?.type.includes('schedule') ? 'SCHEDULE' : 'PIECE_TRIGGER',
    settings: {
      pieceName: triggerNode?.type || 'unknown',
      triggerName: triggerNode?.type || 'unknown',
      input: triggerNode?.parameters || {}
    },
    nextAction: buildNextActions(workflow, triggerNode?.name)
  };

  return {
    id: workflow.id,
    created: workflow.createdAt,
    updated: workflow.updatedAt,
    projectId: 'consuelo',
    externalId: workflow.id,
    status: workflow.active ? 'ENABLED' : 'DISABLED',
    schedule: extractSchedule(workflow),
    folderId: workflow.tags?.[0]?.id || null,
    metadata: workflow.staticData,
    version: {
      id: workflow.id,
      created: workflow.createdAt,
      updated: workflow.updatedAt,
      flowId: workflow.id,
      displayName: workflow.name,
      trigger,
      valid: true,
      state: 'LOCKED',
      connectionIds: extractConnectionIds(workflow),
      updatedBy: null
    }
  };
}

// Helper to build linked action structure
function buildNextActions(workflow: N8nWorkflow, nodeName?: string): FlowAction | null {
  if (!nodeName || !workflow.connections[nodeName]) return null;
  
  const connection = workflow.connections[nodeName];
  const mainConnection = connection.main?.[0]?.[0];
  if (!mainConnection) return null;
  
  const nextNode = workflow.nodes.find(n => n.name === mainConnection.node);
  if (!nextNode) return null;
  
  return {
    name: nextNode.name,
    valid: !nextNode.disabled,
    displayName: nextNode.name,
    type: 'PIECE_ACTION',
    settings: {
      pieceName: nextNode.type,
      actionName: nextNode.type,
      input: nextNode.parameters
    },
    nextAction: buildNextActions(workflow, nextNode.name)
  };
}

function extractSchedule(workflow: N8nWorkflow): Flow['schedule'] | null {
  const scheduleNode = workflow.nodes.find(n => n.type === 'n8n-nodes-base.scheduleTrigger');
  if (!scheduleNode) return null;
  
  return {
    type: 'CRON_EXPRESSION',
    cronExpression: scheduleNode.parameters.rule?.cronExpression || '0 * * * *',
    timezone: workflow.settings?.timezone || 'UTC'
  };
}

function extractConnectionIds(workflow: N8nWorkflow): string[] {
  const credentialIds: string[] = [];
  workflow.nodes.forEach(node => {
    if (node.credentials) {
      Object.values(node.credentials).forEach(cred => {
        if (typeof cred === 'string') credentialIds.push(cred);
      });
    }
  });
  return [...new Set(credentialIds)];
}

// Convert our format back to n8n
export function flowToN8nWorkflow(flow: Flow): Partial<N8nWorkflow> {
  const nodes: N8nNode[] = [];
  const connections: N8nConnections = {};
  
  // Convert trigger and actions to nodes
  let currentStep: FlowTrigger | FlowAction | null = flow.version.trigger;
  let previousNodeName: string | null = null;
  let yPosition = 250;
  
  while (currentStep) {
    const node: N8nNode = {
      name: currentStep.name,
      type: mapToN8nNodeType(currentStep.settings.pieceName || ''),
      position: [250, yPosition],
      parameters: currentStep.settings.input || {},
      disabled: !currentStep.valid
    };
    
    nodes.push(node);
    
    // Build connections
    if (previousNodeName) {
      connections[previousNodeName] = {
        main: [[{ node: node.name, type: 'main', index: 0 }]]
      };
    }
    
    previousNodeName = node.name;
    yPosition += 150;
    currentStep = currentStep.nextAction || null;
  }
  
  return {
    name: flow.version.displayName,
    active: flow.status === 'ENABLED',
    nodes,
    connections,
    settings: {
      timezone: flow.schedule?.timezone
    }
  };
}

function mapToN8nNodeType(pieceName: string): string {
  const mapping: Record<string, string> = {
    'webhook': 'n8n-nodes-base.webhook',
    'schedule': 'n8n-nodes-base.scheduleTrigger',
    'mailerlite': 'n8n-nodes-base.emailSend',
    'twilio': 'n8n-nodes-base.twilio',
    'delay': 'n8n-nodes-base.wait',
    'branch': 'n8n-nodes-base.if',
    'start': 'n8n-nodes-base.start',
  };
  return mapping[pieceName] || 'n8n-nodes-base.noOp';
}