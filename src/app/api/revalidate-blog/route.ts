// OR for App Router: app/api/revalidate-blog/route.ts
import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret');
  
  if (secret !== process.env.REVALIDATION_SECRET) {
    return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { paths } = body || {};
    
    // Revalidate blog index
    revalidatePath('/blog');
    
    // Revalidate specific post pages if provided
    if (paths && Array.isArray(paths)) {
      for (const path of paths) {
        revalidatePath(path);
      }
    }

    return NextResponse.json({ 
      revalidated: true,
      paths: ['/blog', ...(paths || [])]
    });
  } catch (err) {
    return NextResponse.json({ message: 'Error revalidating' }, { status: 500 });
  }
}