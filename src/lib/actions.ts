'use server';

import { streamText,  } from 'ai';
import { groq,  } from '@ai-sdk/groq';
import { supabaseAdmin } from '@/lib/supabase/client';
import { SQL_SYSTEM_PROMPT, SQL_EXPLANATION_PROMPT } from '@/lib/prompts/sql-prompts';
import { QueryExplanation } from '@/types/otf';

const AI_TASK_TIMEOUT = 120000; // 2 minutes

// Enhanced logging with timestamps and structured data
function debugLog(context: string, message: string, metadata?: object) {
  const timestamp = new Date().toISOString();
  console.log(JSON.stringify({
    timestamp,
    context,
    message,
    ...metadata
  }));
}

// Improved stream handling with chunk-level logging
// Updated handleAIStream function
async function handleAIStream(stream: any, context: string) {
  const startTime = Date.now();
  debugLog(context, 'Starting stream processing');

  try {
    // Verify the stream is iterable
    if (!stream[Symbol.asyncIterator]) {
      throw new Error('Stream is not async iterable');
    }

    let fullText = '';
    let chunkCount = 0;

    // Proper async iteration
    for await (const chunk of stream) {
      chunkCount++;
      fullText += chunk;
      debugLog(context, 'Stream chunk processed', {
        chunkLength: chunk.length,
        totalLength: fullText.length,
        chunkCount
      });
    }

    debugLog(context, 'Stream completed successfully', {
      totalChunks: chunkCount,
      totalLength: fullText.length,
      processingTime: Date.now() - startTime
    });

    return fullText;
  } catch (error) {
    debugLog(context, 'Stream processing failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      duration: Date.now() - startTime
    });
    throw error;
  }
}


// Updated safeStreamText function
async function safeStreamText(params: any) {
  const context = 'safeStreamText';
  const startTime = Date.now();
  
  debugLog(context, 'Starting AI request', {
    model: params.model,
    maxTokens: params.maxTokens
  });

  try {
    const result = await streamText(params);
    const decoder = new TextDecoder();
    let fullText = '';

    for await (const chunk of result.toDataStream()) {
      const textChunk = decoder.decode(chunk);
      fullText += textChunk;
      debugLog(context, 'Stream chunk processed', {
        chunkLength: textChunk.length,
        totalLength: fullText.length
      });
    }

    // Enhanced SQL cleaning
    const cleanSQL = fullText
  .replace(/<think>[\s\S]*?<\/think>/g, '') // Remove think blocks
  .replace(/```sql/g, '')
  .replace(/```/g, '')
  .replace(/^[^SELECT]*/i, '') // Remove anything before SELECT
  .replace(/;.*$/g, '') // Remove anything after semicolon
  .replace(/\s+/g, ' ') // Collapse whitespace
  .trim()
  .replace(/^SELECT/i, 'SELECT ') // Ensure space after SELECT
  .concat(';'); // Ensure ending semicolon
    debugLog(context, 'Text extraction completed', {
      textLength: cleanSQL.length,
      preview: cleanSQL.slice(0, 100),
      totalTime: Date.now() - startTime
    });

    return cleanSQL;
  } catch (error) {
    debugLog(context, 'AI request failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      duration: Date.now() - startTime
    });
    throw error;
  }
}


// SQL Generation with full diagnostics
// Updated SQL generation prompt to enforce valid output
export async function generateQuery(input: string) {
  const context = 'generateQuery';
  const startTime = Date.now();
  
  debugLog(context, 'Process started', {
    inputPreview: input.slice(0, 50)
  });

  try {
    if (!input.trim()) throw new Error('Empty query input');

    const model = groq('deepseek-r1-distill-llama-70b');
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error(`Timeout after ${AI_TASK_TIMEOUT}ms`)), AI_TASK_TIMEOUT)
    );

    const sqlText = await Promise.race([
      safeStreamText({
        model,
        system: SQL_SYSTEM_PROMPT,
        prompt: `Generate a valid PostgreSQL query for: ${input}\n
          Requirements:
          - ONLY the SQL query
          - No markdown or code formatting
          - Valid Supabase RPC syntax
          - Include proper quotes around text values
          - Use ISO date format (YYYY-MM-DD)`,
        maxTokens: 1000,
      }),
      timeoutPromise
    ]);

    // Clean and validate the SQL output
    const sqlQuery = (sqlText as string)
      .trim()
      .replace(/```sql/g, '')
      .replace(/```/g, '')
      .replace(/^SELECT/i, 'SELECT') // Standardize casing
      .replace(/;$/, ''); // Remove trailing semicolon

    debugLog(context, 'SQL generated', {
      queryPreview: sqlQuery.slice(0, 50),
      queryLength: sqlQuery.length,
      totalTime: Date.now() - startTime
    });

    return sqlQuery;
  } catch (error) {
    debugLog(context, 'Generation failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      duration: Date.now() - startTime
    });
    throw error;
  }
}
function validateSQL(sql: string) {
  const cleanSQL = sql
    .replace(/[\s\n]+/g, ' ') // Collapse whitespace
    .trim()
    .toLowerCase();

  // Check for valid SELECT statement
  if (!/^\s*select\b/i.test(cleanSQL)) {
    throw new Error('Only SELECT queries are allowed');
  }

  // Check for forbidden patterns using regex
  const forbiddenPatterns = [
    /\binsert\b/i, 
    /\bupdate\b/i, 
    /\bdelete\b/i,
    /\bdrop\b/i, 
    /\btruncate\b/i, 
    /\balter\b/i
  ];

  if (forbiddenPatterns.some(pattern => pattern.test(cleanSQL))) {
    throw new Error('Contains forbidden SQL operations');
  }

  // Check for proper termination
  if (!cleanSQL.endsWith(';')) {
    throw new Error('SQL query must end with semicolon');
  }
}

// Enhanced SQL execution with better error handling
export async function runGeneratedSQLQuery(sqlQuery: string) {
  const context = 'runGeneratedSQLQuery';
  const startTime = Date.now();
  
  debugLog(context, 'Execution started', {
    queryPreview: sqlQuery.slice(0, 50)
  });

  try {
    // Enhanced safety checks
    
    
    validateSQL(sqlQuery);

    if (!sqlQuery.trim().toLowerCase().startsWith('select ')) {
      throw new Error('Only SELECT queries are allowed');
    }

    debugLog(context, 'Supabase RPC call initiated', {
      queryHash: hashString(sqlQuery)
    });

    const { data, error } = await supabaseAdmin.rpc('execute_sql', { 
      query: sqlQuery 
    });

    if (error) {
      debugLog(context, 'Supabase error', error);
      throw new Error(`Database error: ${error.message}`);
    }

    debugLog(context, 'RPC call completed', {
      resultCount: data?.length || 0,
      duration: Date.now() - startTime
    });

    return data || [];
  } catch (error) {
    debugLog(context, 'Execution failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      duration: Date.now() - startTime
    });
    throw error;
  }
}
// Query Explanation with diagnostics
export async function explainQuery(input: string, sqlQuery: string): Promise<QueryExplanation[]> {
  const context = 'explainQuery';
  const startTime = Date.now();
  
  debugLog(context, 'Explanation started', {
    inputPreview: input.slice(0, 50),
    sqlPreview: sqlQuery.slice(0, 50)
  });

  try {
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error(`Timeout after ${AI_TASK_TIMEOUT}ms`)), AI_TASK_TIMEOUT)
    );

    const explanationText = await Promise.race([
      safeStreamText({
        model: groq('deepseek-r1-distill-llama-70b'),
        system: SQL_EXPLANATION_PROMPT,
        prompt: `Explain SQL for: ${input}\n${sqlQuery}\nBreakdown required.`
      }),
      timeoutPromise
    ]);

    const explanations = parseExplanations(explanationText);
    debugLog(context, 'Explanation parsed', {
      sectionsFound: explanations.length,
      processingTime: Date.now() - startTime
    });

    return explanations;
  } catch (error) {
    debugLog(context, 'Explanation failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      duration: Date.now() - startTime
    });
    throw error;
  }
}

// Helper function to parse explanations
function parseExplanations(text: string): QueryExplanation[] {
  const explanations: QueryExplanation[] = [];
  const sections = text.split(/Section:|SECTION:/i).filter(Boolean);

  for (const section of sections) {
    const parts = section.split(/Explanation:|EXPLANATION:/i);
    if (parts.length >= 2) {
      explanations.push({
        section: parts[0].trim(),
        explanation: parts[1].trim()
      });
    }
  }

  return explanations.length > 0 ? explanations : [{
    section: "Full Explanation",
    explanation: text.trim()
  }];
}

// Visualization Configuration Generator
export async function generateChartConfig(results: any[], userQuery: string) {
  const context = 'generateChartConfig';
  const startTime = Date.now();
  
  debugLog(context, 'Chart config started', {
    resultCount: results.length,
    queryPreview: userQuery.slice(0, 50)
  });

  try {
    const jsonText = await safeStreamText({
      model: groq('deepseek-r1-distill-llama-70b'),
      system: 'Data visualization expert',
      prompt: `Generate chart config for:\n${userQuery}\nData: ${JSON.stringify(results.slice(0, 20))}`
    });

    const chartConfig = parseChartConfig(jsonText, results);
    debugLog(context, 'Chart config created', {
      configType: chartConfig.type,
      processingTime: Date.now() - startTime
    });

    return chartConfig;
  } catch (error) {
    debugLog(context, 'Chart config failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      duration: Date.now() - startTime
    });
    return getDefaultChartConfig(results);
  }
}

// Action Suggestions Generator
export async function generateActionSuggestions(results: any[], userQuery: string) {
  const context = 'generateActionSuggestions';
  const startTime = Date.now();
  
  debugLog(context, 'Action suggestions started', {
    resultCount: results.length,
    queryPreview: userQuery.slice(0, 50)
  });

  try {
    const jsonText = await safeStreamText({
      model: groq('deepseek-r1-distill-llama-70b'),
      system: 'Fitness business expert',
      prompt: `Generate actions for:\n${userQuery}\nData: ${JSON.stringify(results.slice(0, 10))}`
    });

    const suggestions = parseActions(jsonText);
    debugLog(context, 'Actions generated', {
      actionCount: suggestions.actions.length,
      processingTime: Date.now() - startTime
    });

    return suggestions;
  } catch (error) {
    debugLog(context, 'Action generation failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      duration: Date.now() - startTime
    });
    return getDefaultActions();
  }
}

// Helper functions for fallback configurations
function getChartColor(index: number): string {
  const colors = ['#F58220', '#1E88E5', '#43A047', '#8E24AA', '#FFB300'];
  return colors[index % colors.length];
}

function parseChartConfig(jsonText: string, results: any[]): any {
  try {
    const cleanedJson = jsonText.replace(/```json/g, '').replace(/```/g, '').trim();
    const config = JSON.parse(cleanedJson);
    return {
      ...config,
      colors: (config.yKeys || []).map((_: any, i: number) => getChartColor(i))
    };
  } catch {
    return getDefaultChartConfig(results);
  }
}

function getDefaultChartConfig(results: any[]): any {
  return {
    type: "bar",
    title: "Data Overview",
    xKey: Object.keys(results[0] || {})[0] || 'x',
    yKeys: [Object.keys(results[0] || {})[1] || 'y'],
    colors: [getChartColor(0)]
  };
}

function parseActions(jsonText: string): any {
  try {
    const cleanedJson = jsonText.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanedJson);
  } catch {
    return getDefaultActions();
  }
}

function getDefaultActions(): any {
  return {
    actions: [{
      title: "Follow-up Check-in",
      description: "Contact clients for progress update",
      priority: "medium",
      effort: "easy",
      scriptTemplate: "Hi [Name], checking in on your fitness goals..."
    }],
    summary: "Regular communication improves client retention"
  };
}

// Utility function for safe logging
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return hash.toString(16);
}