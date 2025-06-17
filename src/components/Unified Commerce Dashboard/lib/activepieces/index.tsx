// lib/automations/index.ts - Updated createFlow method

import axios, { AxiosInstance, AxiosError } from 'axios';
import {
  ActivePiecesConfig,
  ActivePiecesResponse,
  ApiError,
  Flow,
  CreateFlowData,
  UpdateFlowData,
  ListFlowsParams,
  Connection,
  CreateConnectionData,
  Folder,
  CreateFolderData,
  FlowRun,
  ListFlowRunsParams,
  PaginatedResponse,
  N8nWorkflow,
  N8nExecution,
  N8nCredential,
  N8nTag,
  N8nPaginatedResponse,
  n8nWorkflowToFlow,
  flowToN8nWorkflow,
  FlowTrigger,
  FlowAction,
  N8nNode,
  N8nConnections,
} from './types';

/**
 * ActivePieces Service Class (using n8n API under the hood)
 * Maintains the same interface but talks to n8n instead
 */
export class ActivePiecesService {
  private client: AxiosInstance;
  private config: ActivePiecesConfig;
  private consueloProjectId: string = 'consuelo'; // Fixed project ID

  constructor(config?: Partial<ActivePiecesConfig>) {
    this.config = {
      apiUrl: config?.apiUrl || process.env.N8N_API_URL || process.env.ACTIVEPIECES_API_URL || '',
      apiKey: config?.apiKey || process.env.N8N_API_KEY || process.env.ACTIVEPIECES_API_KEY || '',
      defaultProjectId: 'consuelo',
    };

    if (!this.config.apiUrl || !this.config.apiKey) {
      throw new Error('n8n API URL and API Key are required');
    }

    // n8n uses header api key auth
    this.client = axios.create({
      baseURL: this.config.apiUrl,
      headers: {
        'X-N8N-API-KEY': this.config.apiKey,
        'Content-Type': 'application/json',
      },
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<any>) => {
        const apiError: ApiError = {
          error: error.message,
          message: error.response?.data?.message || error.message,
          statusCode: error.response?.status,
        };
        return Promise.reject(apiError);
      }
    );
  }

  /**
   * Convert our trigger/action structure to n8n nodes
   */
  private convertTriggerToNodes(trigger?: FlowTrigger): { nodes: N8nNode[], connections: N8nConnections } {
    const nodes: N8nNode[] = [];
    const connections: N8nConnections = {};
    
    if (!trigger) {
      // Default start node
      nodes.push({
        name: 'Start',
        type: 'n8n-nodes-base.start',
        typeVersion: 1,
        position: [250, 300],
        parameters: {}
      });
      return { nodes, connections };
    }

    // Convert trigger to n8n node
    const triggerNode: N8nNode = {
      name: trigger.name || 'Trigger',
      type: this.mapTriggerTypeToN8n(trigger),
      typeVersion: 1,
      position: [250, 300],
      parameters: trigger.settings.input || {}
    };
    nodes.push(triggerNode);

    // Convert actions to nodes
    let currentAction = trigger.nextAction;
    let previousNodeName = triggerNode.name;
    let yPosition = 450;

    while (currentAction) {
      const actionNode: N8nNode = {
        name: currentAction.name || `Action_${nodes.length}`,
        type: this.mapActionTypeToN8n(currentAction),
        typeVersion: 1,
        position: [250, yPosition],
        parameters: currentAction.settings.input || {}
      };
      nodes.push(actionNode);

      // Create connection from previous node to this one
      if (!connections[previousNodeName]) {
        connections[previousNodeName] = { main: [] };
      }
      connections[previousNodeName].main.push([{
        node: actionNode.name,
        type: 'main',
        index: 0
      }]);

      previousNodeName = actionNode.name;
      yPosition += 150;
      currentAction = currentAction.nextAction;
    }

    return { nodes, connections };
  }

  /**
   * Map our trigger types to n8n node types
   */
  private mapTriggerTypeToN8n(trigger: FlowTrigger): string {
    if (trigger.type === 'WEBHOOK' || trigger.settings.triggerName === 'webhook') {
      return 'n8n-nodes-base.webhook';
    }
    if (trigger.type === 'SCHEDULE' || trigger.settings.triggerName === 'schedule') {
      return 'n8n-nodes-base.scheduleTrigger';
    }
    if (trigger.settings.triggerName === 'email') {
      return 'n8n-nodes-base.emailTrigger';
    }
    if (trigger.settings.triggerName === 'form') {
      return 'n8n-nodes-base.formTrigger';
    }
    // Default to webhook for unknown triggers
    return 'n8n-nodes-base.webhook';
  }

  /**
   * Map our action types to n8n node types
   */
  private mapActionTypeToN8n(action: FlowAction): string {
    const actionName = action.settings.actionName || action.name;
    
    const mapping: Record<string, string> = {
      'email': 'n8n-nodes-base.emailSend',
      'sms': 'n8n-nodes-base.twilio',
      'webhook': 'n8n-nodes-base.httpRequest',
      'delay': 'n8n-nodes-base.wait',
      'branch': 'n8n-nodes-base.if',
      'code': 'n8n-nodes-base.code',
    };
    
    return mapping[actionName] || 'n8n-nodes-base.httpRequest';
  }

  /**
   * Create a new flow (workflow in n8n)
   * @param data Flow configuration
   */
  async createFlow(data: CreateFlowData): Promise<ActivePiecesResponse<Flow>> {
    try {
      console.log(`📋 Creating flow with data:`, JSON.stringify(data, null, 2));
      
      // Convert trigger/actions to n8n nodes
      const { nodes, connections } = this.convertTriggerToNodes(data.trigger);
      
      // Create n8n workflow structure
      const n8nWorkflow: Partial<N8nWorkflow> = {
        name: data.displayName,
        nodes,
        connections,
        settings: {
          saveExecutionProgress: true,
          saveManualExecutions: true,
          saveDataErrorExecution: 'all',
          saveDataSuccessExecution: 'all',
        },
        staticData: {
          ...data.metadata,
          trigger: data.trigger, // Store original trigger structure in metadata
        }
      };

      console.log('🔄 Sending workflow creation request to n8n with:', JSON.stringify(n8nWorkflow, null, 2));
      const response = await this.client.post<N8nWorkflow>('/workflows', n8nWorkflow);
      console.log(`✅ n8n responded with status: ${response.status}`);
      
      // If we need to add tags/folder after creation
      if (data.folderId) {
        try {
          console.log(`🏷️ Adding workflow to folder: ${data.folderId}`);
          // This would be a separate API call to add the workflow to a folder
        } catch (folderError) {
          console.warn('⚠️ Failed to add workflow to folder, but workflow was created:', folderError);
        }
      }
      
      // Convert back to our Flow format
      const flow = n8nWorkflowToFlow(response.data);
      
      // If we stored the trigger in metadata, use that instead
      if (response.data.staticData?.trigger) {
        flow.version.trigger = response.data.staticData.trigger;
      }
      
      return { success: true, data: flow };
    } catch (error: any) {
      console.error('❌ Error creating flow:', error);
      
      // Detailed error logging
      if (error.response) {
        console.error(`Response status: ${error.response.status}`);
        console.error('Response data:', error.response.data);
      }
      
      return { 
        success: false, 
        error: { 
          error: 'Failed to create flow', 
          message: error.message || 'API error',
          statusCode: error.response?.status || 500
        } 
      };
    }
  }

  /**
   * Update a flow (workflow)
   * @param id Flow ID
   * @param data Update data
   */
  async updateFlow(id: string, data: UpdateFlowData): Promise<ActivePiecesResponse<Flow>> {
    try {
      // First get the existing workflow
      const existingResponse = await this.client.get<N8nWorkflow>(`/workflows/${id}`);
      const existingWorkflow = existingResponse.data;

      let updatedNodes = existingWorkflow.nodes;
      let updatedConnections = existingWorkflow.connections;

      // If trigger is provided, convert to nodes
      if (data.trigger) {
        const converted = this.convertTriggerToNodes(data.trigger);
        updatedNodes = converted.nodes;
        updatedConnections = converted.connections;
      }

      // Merge updates
      const updatedWorkflow: Partial<N8nWorkflow> = {
        ...existingWorkflow,
        name: data.displayName || existingWorkflow.name,
        active: data.active !== undefined ? data.active : existingWorkflow.active,
        nodes: data.nodes || updatedNodes,
        connections: data.connections || updatedConnections,
        settings: data.settings ? { ...existingWorkflow.settings, ...data.settings } : existingWorkflow.settings,
        staticData: {
          ...existingWorkflow.staticData,
          trigger: data.trigger || existingWorkflow.staticData?.trigger,
        }
      };

      const response = await this.client.put<N8nWorkflow>(`/workflows/${id}`, updatedWorkflow);
      const flow = n8nWorkflowToFlow(response.data);
      
      // Use stored trigger if available
      if (response.data.staticData?.trigger) {
        flow.version.trigger = response.data.staticData.trigger;
      }
      
      return { success: true, data: flow };
    } catch (error) {
      return { success: false, error: error as ApiError };
    }
  }

  // ... rest of the methods remain the same as in your original file ...

  /**
   * List all flows (workflows) in the Consuelo project
   * @param params Optional filter parameters
   */
  async listFlows(params?: Omit<ListFlowsParams, 'projectId'>): Promise<ActivePiecesResponse<PaginatedResponse<Flow>>> {
    try {
      const queryParams: Record<string, any> = {
        limit: params?.limit || 100,
      };

      if (params?.active !== undefined) {
        queryParams.active = params.active;
      }
      if (params?.tags) {
        queryParams.tags = params.tags;
      }
      if (params?.name) {
        queryParams.name = params.name;
      }
      if (params?.cursor) {
        queryParams.cursor = params.cursor;
      }

      const response = await this.client.get<N8nPaginatedResponse<N8nWorkflow>>('/workflows', {
        params: queryParams,
      });

      const flows = response.data.data.map(workflow => {
        const flow = n8nWorkflowToFlow(workflow);
        // Use stored trigger if available
        if (workflow.staticData?.trigger) {
          flow.version.trigger = workflow.staticData.trigger;
        }
        return flow;
      });
      
      return {
        success: true,
        data: {
          data: flows,
          nextCursor: response.data.nextCursor || null,
        }
      };
    } catch (error) {
      return { success: false, error: error as ApiError };
    }
  }

  /**
   * Get a specific flow by ID
   * @param id Flow ID
   */
  async getFlow(id: string): Promise<ActivePiecesResponse<Flow>> {
    try {
      const response = await this.client.get<N8nWorkflow>(`/workflows/${id}`);
      const flow = n8nWorkflowToFlow(response.data);
      
      // Use stored trigger if available
      if (response.data.staticData?.trigger) {
        flow.version.trigger = response.data.staticData.trigger;
      }
      
      return { success: true, data: flow };
    } catch (error) {
      return { success: false, error: error as ApiError };
    }
  }

  /**
   * Delete a flow
   * @param id Flow ID
   */
  async deleteFlow(id: string): Promise<ActivePiecesResponse<void>> {
    try {
      await this.client.delete(`/workflows/${id}`);
      return { success: true };
    } catch (error) {
      return { success: false, error: error as ApiError };
    }
  }

  /**
   * Activate a workflow
   */
  async activateFlow(id: string): Promise<ActivePiecesResponse<Flow>> {
    try {
      const response = await this.client.post<N8nWorkflow>(`/workflows/${id}/activate`);
      const flow = n8nWorkflowToFlow(response.data);
      
      if (response.data.staticData?.trigger) {
        flow.version.trigger = response.data.staticData.trigger;
      }
      
      return { success: true, data: flow };
    } catch (error) {
      return { success: false, error: error as ApiError };
    }
  }

  /**
   * Deactivate a workflow
   */
  async deactivateFlow(id: string): Promise<ActivePiecesResponse<Flow>> {
    try {
      const response = await this.client.post<N8nWorkflow>(`/workflows/${id}/deactivate`);
      const flow = n8nWorkflowToFlow(response.data);
      
      if (response.data.staticData?.trigger) {
        flow.version.trigger = response.data.staticData.trigger;
      }
      
      return { success: true, data: flow };
    } catch (error) {
      return { success: false, error: error as ApiError };
    }
  }



  // ==================== CONNECTION METHODS (n8n Credentials) ====================

  /**
   * Create a new connection (credential in n8n)
   * @param data Connection configuration
   */
  async createConnection(data: CreateConnectionData): Promise<ActivePiecesResponse<Connection>> {
    try {
      const n8nCredential = {
        name: data.name,
        type: data.type,
        data: data.data,
      };

      const response = await this.client.post<N8nCredential>('/credentials', n8nCredential);
      
      const connection: Connection = {
        id: response.data.id,
        created: response.data.createdAt,
        updated: response.data.updatedAt,
        externalId: response.data.id,
        displayName: response.data.name,
        type: response.data.type,
        pieceName: response.data.type,
        projectIds: [this.consueloProjectId],
        scope: 'PROJECT',
        status: 'ACTIVE',
      };

      return { success: true, data: connection };
    } catch (error) {
      return { success: false, error: error as ApiError };
    }
  }

  /**
   * List all connections (credentials) - n8n doesn't have a list endpoint
   */
  async listConnections(): Promise<ActivePiecesResponse<PaginatedResponse<Connection>>> {
    // n8n API doesn't expose a credentials list endpoint for security
    // Return empty list or implement caching if needed
    return {
      success: true,
      data: {
        data: [],
        nextCursor: null,
      }
    };
  }

  /**
   * Delete a connection
   * @param id Connection ID
   */
  async deleteConnection(id: string): Promise<ActivePiecesResponse<void>> {
    try {
      await this.client.delete(`/credentials/${id}`);
      return { success: true };
    } catch (error) {
      return { success: false, error: error as ApiError };
    }
  }

  // ==================== FOLDER METHODS (Using n8n Tags) ====================

  /**
   * Create a new folder (tag in n8n)
   * @param data Folder configuration
   */
  async createFolder(data: CreateFolderData | string): Promise<ActivePiecesResponse<Folder>> {
    try {
      const folderName = typeof data === 'string' ? data : data.displayName;
      
      const response = await this.client.post<N8nTag>('/tags', {
        name: folderName
      });

      const folder: Folder = {
        id: response.data.id,
        created: response.data.createdAt || new Date().toISOString(),
        updated: response.data.updatedAt || new Date().toISOString(),
        projectId: this.consueloProjectId,
        displayName: response.data.name,
        displayOrder: 0,
      };

      return { success: true, data: folder };
    } catch (error) {
      return { success: false, error: error as ApiError };
    }
  }

  /**
   * List all folders (tags)
   */
  async listFolders(): Promise<ActivePiecesResponse<PaginatedResponse<Folder>>> {
    try {
      const response = await this.client.get<N8nPaginatedResponse<N8nTag>>('/tags');
      
      const folders: Folder[] = response.data.data.map((tag, index) => ({
        id: tag.id,
        created: tag.createdAt || new Date().toISOString(),
        updated: tag.updatedAt || new Date().toISOString(),
        projectId: this.consueloProjectId,
        displayName: tag.name,
        displayOrder: index,
      }));

      return {
        success: true,
        data: {
          data: folders,
          nextCursor: response.data.nextCursor || null,
        }
      };
    } catch (error) {
      return { success: false, error: error as ApiError };
    }
  }

  /**
   * Get a specific folder (tag)
   * @param id Folder ID
   */
  async getFolder(id: string): Promise<ActivePiecesResponse<Folder>> {
    try {
      const response = await this.client.get<N8nTag>(`/tags/${id}`);
      
      const folder: Folder = {
        id: response.data.id,
        created: response.data.createdAt || new Date().toISOString(),
        updated: response.data.updatedAt || new Date().toISOString(),
        projectId: this.consueloProjectId,
        displayName: response.data.name,
        displayOrder: 0,
      };

      return { success: true, data: folder };
    } catch (error) {
      return { success: false, error: error as ApiError };
    }
  }

  /**
   * Update a folder (tag)
   * @param id Folder ID
   * @param data Update data
   */
  async updateFolder(id: string, data: Partial<CreateFolderData>): Promise<ActivePiecesResponse<Folder>> {
    try {
      const response = await this.client.put<N8nTag>(`/tags/${id}`, {
        name: data.displayName
      });
      
      const folder: Folder = {
        id: response.data.id,
        created: response.data.createdAt || new Date().toISOString(),
        updated: response.data.updatedAt || new Date().toISOString(),
        projectId: this.consueloProjectId,
        displayName: response.data.name,
        displayOrder: 0,
      };

      return { success: true, data: folder };
    } catch (error) {
      return { success: false, error: error as ApiError };
    }
  }

  /**
   * Delete a folder (tag)
   * @param id Folder ID
   */
  async deleteFolder(id: string): Promise<ActivePiecesResponse<void>> {
    try {
      await this.client.delete(`/tags/${id}`);
      return { success: true };
    } catch (error) {
      return { success: false, error: error as ApiError };
    }
  }

  // ==================== FLOW RUN METHODS (n8n Executions) ====================

  /**
   * Get a specific flow run (execution)
   * @param id Execution ID
   */
  async getFlowRun(id: string): Promise<ActivePiecesResponse<FlowRun>> {
    try {
      const response = await this.client.get<N8nExecution>(`/executions/${id}`);
      
      const flowRun: FlowRun = {
        id: response.data.id.toString(),
        created: response.data.startedAt,
        updated: response.data.stoppedAt || response.data.startedAt,
        projectId: this.consueloProjectId,
        flowId: response.data.workflowId,
        flowVersionId: response.data.workflowId,
        flowDisplayName: 'Workflow',
        status: this.mapExecutionStatus(response.data),
        startTime: response.data.startedAt,
        finishTime: response.data.stoppedAt,
        environment: response.data.mode === 'manual' ? 'TESTING' : 'PRODUCTION',
        steps: response.data.data || {},
      };

      return { success: true, data: flowRun };
    } catch (error) {
      return { success: false, error: error as ApiError };
    }
  }

  /**
   * List flow runs (executions)
   * @param params Filter parameters
   */
  async listFlowRuns(params?: Omit<ListFlowRunsParams, 'projectId'>): Promise<ActivePiecesResponse<PaginatedResponse<FlowRun>>> {
    try {
      const queryParams: Record<string, any> = {
        limit: params?.limit || 100,
      };

      if (params?.workflowId) {
        queryParams.workflowId = params.workflowId;
      }
      if (params?.status) {
        queryParams.status = params.status.toLowerCase();
      }
      if (params?.cursor) {
        queryParams.cursor = params.cursor;
      }

      const response = await this.client.get<N8nPaginatedResponse<N8nExecution>>('/executions', {
        params: queryParams,
      });

      const flowRuns: FlowRun[] = response.data.data.map(exec => ({
        id: exec.id.toString(),
        created: exec.startedAt,
        updated: exec.stoppedAt || exec.startedAt,
        projectId: this.consueloProjectId,
        flowId: exec.workflowId,
        flowVersionId: exec.workflowId,
        flowDisplayName: 'Workflow',
        status: this.mapExecutionStatus(exec),
        startTime: exec.startedAt,
        finishTime: exec.stoppedAt,
        environment: exec.mode === 'manual' ? 'TESTING' : 'PRODUCTION',
        steps: exec.data || {},
      }));

      return {
        success: true,
        data: {
          data: flowRuns,
          nextCursor: response.data.nextCursor || null,
        }
      };
    } catch (error) {
      return { success: false, error: error as ApiError };
    }
  }

  // ==================== HELPER METHODS ====================

  /**
   * Map n8n execution status to our flow run status
   */
  private mapExecutionStatus(execution: N8nExecution): FlowRun['status'] {
    if (!execution.finished) {
      return 'RUNNING';
    }
    // Check if there's an error in the execution data
    if (execution.data?.lastNodeExecuted && execution.data?.resultData?.error) {
      return 'FAILED';
    }
    return 'SUCCEEDED';
  }

  /**
   * Check if the service is properly configured and can reach the API
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.client.get('/workflows?limit=1');
      return true;
    } catch (error) {
      console.error('n8n health check failed:', error);
      return false;
    }
  }

  /**
   * Get webhook URL for a workflow
   */
  getWebhookUrl(workflowId: string, webhookPath?: string): string {
    // n8n webhook URLs are typically:
    // - Test: http://localhost:5678/webhook-test/{webhook-id}
    // - Production: http://localhost:5678/webhook/{webhook-id}
    const baseUrl = this.config.apiUrl.replace('/api/v1', '');
    return `${baseUrl}/webhook/${webhookPath || workflowId}`;
  }

  /**
   * Get the current Consuelo project details
   */
  async getConsueloProject(): Promise<ActivePiecesResponse<any>> {
    // Since n8n doesn't have projects, we return a mock project
    return {
      success: true,
      data: {
        id: this.consueloProjectId,
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
        displayName: 'Consuelo',
        ownerId: 'system',
        platformId: 'n8n',
        releasesEnabled: true,
        notifyStatus: 'NEVER',
        usage: {
          tasks: 0,
          aiCredits: 0,
          nextLimitResetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        },
        plan: {
          id: 'free',
          created: new Date().toISOString(),
          updated: new Date().toISOString(),
          projectId: this.consueloProjectId,
          name: 'Free Plan',
          piecesFilterType: 'NONE',
          pieces: [],
          tasks: null,
          aiCredits: null
        },
        analytics: {
          totalUsers: 1,
          activeUsers: 1,
          totalFlows: 0,
          activeFlows: 0
        }
      }
    };
  }

  /**
   * Get available node types (pieces) from n8n
   * This would require n8n to expose this endpoint
   */
  async getAvailableNodes(): Promise<ActivePiecesResponse<any[]>> {
    try {
      // n8n doesn't expose this via API by default
      // You might need to implement a custom endpoint or hardcode the available nodes
      return {
        success: true,
        data: []
      };
    } catch (error) {
      return { success: false, error: error as ApiError };
    }
  }

  /**
   * Test webhook trigger
   */
  async testWebhookTrigger(workflowId: string, data: any): Promise<ActivePiecesResponse<any>> {
    try {
      const webhookUrl = this.getWebhookUrl(workflowId, 'test');
      // Make a direct HTTP call to the webhook URL
      const response = await axios.post(webhookUrl, data);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error as ApiError };
    }
  }
}

// Export singleton instance
export const activePieces = new ActivePiecesService();

// Export types for convenience
export * from './types';