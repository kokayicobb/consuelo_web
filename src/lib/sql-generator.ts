import OpenAI from 'openai';
import { z } from 'zod';
import Instructor from '@instructor-ai/instructor';
import { getFullSchema } from '../lib/prompts/schema';

// Initialize OpenAI client with Groq's API endpoint
const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
});

// Define the output schema using Zod
const SQLQueryResponse = z.object({
    query: z.string().describe("The generated SQL query"),
    explanation: z.string().describe("Explanation of what the query does")
});

// Create an instructor client with OpenAI
const client = Instructor({
    client: openai,
    mode: "TOOLS"
});

// Define the input schema
const RequestSchema = z.object({
    naturalLanguageQuery: z.string(),
});

/**
 * Generates a SQL query and explanation from a natural language request.
 * @param naturalLanguageQuery The user's natural language query.
 * @returns An object with { query, explanation }
 */
export async function generateSQLFromNaturalLanguage(naturalLanguageQuery: string) {
    try {
        // Validate input
        RequestSchema.parse({ naturalLanguageQuery });

        // Create the prompt using the full schema
        const prompt = `
${getFullSchema()}

Generate a SQL query for this request: ${naturalLanguageQuery}

Please provide:
1. A valid SQL query
2. A brief explanation of what the query does

The query should be compatible with PostgreSQL syntax.
`;

        // Generate the SQL query using Groq
        const response = await client.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: 'You are a SQL expert specializing in PostgreSQL. Generate SQL queries based on natural language requests and table schemas.',
                },
                {
                    role: 'user',
                    content: prompt,
                },
            ],
            model: 'gemma2-9b-it',
            response_model: {
                schema: SQLQueryResponse,
                name: "SQLQuery"
            }
        });

        // The response is already parsed according to the schema
        return response;
    } catch (error) {
        console.error('Error generating SQL query:', error);
        throw new Error('Failed to generate SQL query');
    }
}
