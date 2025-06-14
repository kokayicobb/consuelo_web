// lib/activepieces/helpers.ts

import { N8nNode, N8nConnections } from './types';

/**
 * Helper functions for working with n8n workflows
 */

/**
 * Create a webhook trigger node
 */
export function createWebhookTrigger(webhookId?: string): N8nNode {
  return {
    name: 'Webhook',
    type: 'n8n-nodes-base.webhook',
    typeVersion: 1,
    position: [250, 300],
    parameters: {
      path: webhookId || generateWebhookId(),
      responseMode: 'onReceived',
      responseData: 'firstEntryJson',
      responseCode: 200,
      options: {}
    }
  };
}

/**
 * Create a schedule trigger node
 */
export function createScheduleTrigger(cronExpression: string = '0 * * * *'): N8nNode {
  return {
    name: 'Schedule Trigger',
    type: 'n8n-nodes-base.scheduleTrigger',
    typeVersion: 1,
    position: [250, 300],
    parameters: {
      rule: {
        interval: [{
          field: 'cronExpression',
          expression: cronExpression
        }]
      }
    }
  };
}

/**
 * Create an email send node
 */
export function createEmailNode(name: string = 'Send Email'): N8nNode {
  return {
    name,
    type: 'n8n-nodes-base.emailSend',
    typeVersion: 2,
    position: [450, 300],
    parameters: {
      fromEmail: '={{ $json.fromEmail }}',
      toEmail: '={{ $json.toEmail }}',
      subject: '={{ $json.subject }}',
      text: '={{ $json.text }}',
      html: '={{ $json.html }}',
      options: {}
    }
  };
}

/**
 * Create an HTTP request node
 */
export function createHttpNode(name: string = 'HTTP Request'): N8nNode {
  return {
    name,
    type: 'n8n-nodes-base.httpRequest',
    typeVersion: 3,
    position: [450, 300],
    parameters: {
      method: 'POST',
      url: '',
      authentication: 'none',
      options: {}
    }
  };
}

/**
 * Create a code node
 */
export function createCodeNode(name: string = 'Code', code: string = 'return items;'): N8nNode {
  return {
    name,
    type: 'n8n-nodes-base.code',
    typeVersion: 1,
    position: [450, 300],
    parameters: {
      language: 'javaScript',
      jsCode: code
    }
  };
}

/**
 * Create an if/conditional node
 */
export function createIfNode(name: string = 'IF'): N8nNode {
  return {
    name,
    type: 'n8n-nodes-base.if',
    typeVersion: 1,
    position: [450, 300],
    parameters: {
      conditions: {
        boolean: [],
        string: [],
        number: []
      },
      combineOperation: 'all'
    }
  };
}

/**
 * Create a wait/delay node
 */
export function createWaitNode(name: string = 'Wait', amount: number = 1, unit: string = 'minutes'): N8nNode {
  return {
    name,
    type: 'n8n-nodes-base.wait',
    typeVersion: 1,
    position: [450, 300],
    parameters: {
      resume: 'timeInterval',
      amount,
      unit
    }
  };
}

/**
 * Connect two nodes
 */
export function connectNodes(
  connections: N8nConnections,
  sourceNode: string,
  targetNode: string,
  sourceOutput: number = 0,
  targetInput: number = 0
): N8nConnections {
  if (!connections[sourceNode]) {
    connections[sourceNode] = { main: [] };
  }
  
  if (!connections[sourceNode].main[sourceOutput]) {
    connections[sourceNode].main[sourceOutput] = [];
  }
  
  connections[sourceNode].main[sourceOutput].push({
    node: targetNode,
    type: 'main',
    index: targetInput
  });
  
  return connections;
}

/**
 * Generate a random webhook ID
 */
export function generateWebhookId(): string {
  return Math.random().toString(36).substring(2, 15);
}

/**
 * Calculate node position based on index
 */
export function calculateNodePosition(index: number): [number, number] {
  const x = 250 + (index % 3) * 200;
  const y = 300 + Math.floor(index / 3) * 150;
  return [x, y];
}

/**
 * Map common node types from UI names to n8n node types
 */
export const nodeTypeMapping: Record<string, string> = {
  // Triggers
  'webhook': 'n8n-nodes-base.webhook',
  'schedule': 'n8n-nodes-base.scheduleTrigger',
  'form': 'n8n-nodes-base.formTrigger',
  'email-trigger': 'n8n-nodes-base.emailReadImap',
  
  // Actions
  'email': 'n8n-nodes-base.emailSend',
  'gmail': 'n8n-nodes-base.gmail',
  'mailerlite': 'n8n-nodes-base.mailerlite',
  'sendgrid': 'n8n-nodes-base.sendGrid',
  'twilio': 'n8n-nodes-base.twilio',
  'slack': 'n8n-nodes-base.slack',
  'discord': 'n8n-nodes-base.discord',
  'telegram': 'n8n-nodes-base.telegram',
  
  // Data
  'http': 'n8n-nodes-base.httpRequest',
  'database': 'n8n-nodes-base.postgres',
  'mysql': 'n8n-nodes-base.mySql',
  'mongodb': 'n8n-nodes-base.mongoDb',
  'redis': 'n8n-nodes-base.redis',
  'airtable': 'n8n-nodes-base.airtable',
  'google-sheets': 'n8n-nodes-base.googleSheets',
  
  // Logic
  'if': 'n8n-nodes-base.if',
  'switch': 'n8n-nodes-base.switch',
  'code': 'n8n-nodes-base.code',
  'wait': 'n8n-nodes-base.wait',
  'loop': 'n8n-nodes-base.splitInBatches',
  'merge': 'n8n-nodes-base.merge',
  'filter': 'n8n-nodes-base.filter',
  
  // Utility
  'set': 'n8n-nodes-base.set',
  'function': 'n8n-nodes-base.functionItem',
  'crypto': 'n8n-nodes-base.crypto',
  'date': 'n8n-nodes-base.dateTime',
  'html': 'n8n-nodes-base.html',
  'xml': 'n8n-nodes-base.xml',
  'json': 'n8n-nodes-base.itemLists',
};

/**
 * Get n8n node type from UI app name
 */
export function getN8nNodeType(appName: string): string {
  return nodeTypeMapping[appName.toLowerCase()] || 'n8n-nodes-base.noOp';
}

/**
 * Create a node based on app type
 */
export function createNodeFromApp(appName: string, nodeName: string, position: [number, number]): N8nNode {
  const nodeType = getN8nNodeType(appName);
  
  // Create basic node structure
  const node: N8nNode = {
    name: nodeName,
    type: nodeType,
    typeVersion: 1,
    position,
    parameters: {}
  };
  
  // Add default parameters based on node type
  switch (appName.toLowerCase()) {
    case 'webhook':
      node.parameters = {
        path: generateWebhookId(),
        responseMode: 'onReceived',
        responseData: 'firstEntryJson',
        responseCode: 200
      };
      break;
      
    case 'schedule':
      node.parameters = {
        rule: {
          interval: [{
            field: 'hours',
            hours: 1
          }]
        }
      };
      break;
      
    case 'email':
    case 'mailerlite':
    case 'sendgrid':
      node.parameters = {
        fromEmail: '',
        toEmail: '={{ $json.email }}',
        subject: '',
        text: ''
      };
      break;
      
    case 'http':
      node.parameters = {
        method: 'GET',
        url: '',
        authentication: 'none'
      };
      break;
      
    case 'if':
      node.parameters = {
        conditions: {
          boolean: [],
          string: [],
          number: []
        }
      };
      break;
      
    case 'wait':
    case 'delay':
      node.parameters = {
        resume: 'timeInterval',
        amount: 5,
        unit: 'minutes'
      };
      break;
      
    case 'code':
      node.parameters = {
        language: 'javaScript',
        jsCode: '// Add your code here\nreturn items;'
      };
      break;
  }
  
  return node;
}

/**
 * Validate workflow structure
 */
export function validateWorkflow(nodes: N8nNode[], connections: N8nConnections): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check if there's at least one trigger
  const triggerNodes = nodes.filter(n => 
    n.type.includes('trigger') || 
    n.type.includes('webhook') || 
    n.type === 'n8n-nodes-base.start'
  );
  
  if (triggerNodes.length === 0) {
    errors.push('Workflow must have at least one trigger node');
  }
  
  // Check for duplicate node names
  const nodeNames = nodes.map(n => n.name);
  const duplicates = nodeNames.filter((name, index) => nodeNames.indexOf(name) !== index);
  if (duplicates.length > 0) {
    errors.push(`Duplicate node names found: ${duplicates.join(', ')}`);
  }
  
  // Check connections reference existing nodes
  for (const [sourceName, sourceConnections] of Object.entries(connections)) {
    if (!nodeNames.includes(sourceName)) {
      errors.push(`Connection source "${sourceName}" does not exist`);
    }
    
    if (sourceConnections.main) {
      for (const outputConnections of sourceConnections.main) {
        if (outputConnections) {
          for (const conn of outputConnections) {
            if (!nodeNames.includes(conn.node)) {
              errors.push(`Connection target "${conn.node}" does not exist`);
            }
          }
        }
      }
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Build workflow from simplified steps
 */
export function buildWorkflowFromSteps(steps: Array<{
  id: string;
  type: 'trigger' | 'action' | 'condition';
  app: string;
  appName: string;
  event: string;
  configured: boolean;
}>): { nodes: N8nNode[]; connections: N8nConnections } {
  const nodes: N8nNode[] = [];
  const connections: N8nConnections = {};
  
  steps.forEach((step, index) => {
    const position = calculateNodePosition(index);
    const node = createNodeFromApp(step.app, step.appName, position);
    nodes.push(node);
    
    // Connect to previous node
    if (index > 0) {
      const previousNode = nodes[index - 1];
      connectNodes(connections, previousNode.name, node.name);
    }
  });
  
  return { nodes, connections };
}