import { NextRequest, NextResponse } from 'next/server';
import { Stagehand } from "@browserbasehq/stagehand";
import { z } from "zod";

export async function GET() {
  return NextResponse.json({
    message: 'Scraping API is working',
    hasApiKey: !!process.env.BROWSERBASE_API_KEY,
    hasProjectId: !!process.env.BROWSERBASE_PROJECT_ID
  });
}

const BookSchema = z.object({
  books: z.array(z.object({
    title: z.string(),
    price: z.string(),
    image: z.string(),
    inStock: z.string(),
    link: z.string(),
  }))
});

export async function POST(request: NextRequest) {
  console.log('Scraping API called');
  
  // Check environment variables first
  if (!process.env.BROWSERBASE_API_KEY) {
    console.error('Missing BROWSERBASE_API_KEY environment variable');
    return NextResponse.json({
      success: false,
      error: 'Missing BROWSERBASE_API_KEY environment variable',
      data: []
    }, { status: 500 });
  }

  if (!process.env.BROWSERBASE_PROJECT_ID) {
    console.error('Missing BROWSERBASE_PROJECT_ID environment variable');
    return NextResponse.json({
      success: false,
      error: 'Missing BROWSERBASE_PROJECT_ID environment variable',
      data: []
    }, { status: 500 });
  }

  if (!process.env.GROQ_API_KEY) {
    console.error('Missing GROQ_API_KEY environment variable');
    return NextResponse.json({
      success: false,
      error: 'Missing GROQ_API_KEY environment variable',
      data: []
    }, { status: 500 });
  }

  let stagehand: Stagehand | null = null;

  try {
    console.log('Environment variables check passed');
    console.log('Initializing Stagehand...');
    stagehand = new Stagehand({
      env: "BROWSERBASE",
      verbose: 1, // Increase verbosity for debugging
      modelName: "groq/llama-3.3-70b-versatile",
      modelClientOptions: {
        apiKey: process.env.GROQ_API_KEY,
      },
    });

    console.log('Stagehand init...');
    await stagehand.init();
    const page = stagehand.page;

    console.log('Navigating to books.toscrape.com...');
    await page.goto("https://books.toscrape.com/");

    console.log('Extracting books data...');
    const scrape = await page.extract({
      instruction: "Extract the books from the page",
      schema: BookSchema,
    });

    console.log('Extraction complete, found books:', scrape.books?.length || 0);
    await stagehand.close();

    const response = {
      success: true,
      data: scrape.books || [],
      count: scrape.books?.length || 0
    };

    console.log('Returning response:', response);
    return NextResponse.json(response);

  } catch (error) {
    console.error('Scraping error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      type: typeof error,
      error: error
    });
    
    // Ensure stagehand is closed even on error
    if (stagehand) {
      try {
        await stagehand.close();
      } catch (closeError) {
        console.error('Error closing stagehand:', closeError);
      }
    }
    
    const errorResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      data: []
    };

    console.log('Returning error response:', errorResponse);
    return NextResponse.json(errorResponse, { status: 500 });
  }
}