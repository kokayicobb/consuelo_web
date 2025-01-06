// app/api/try-on/status/[id]/route.js
export async function GET(req, { params }) {
  console.log('=== Status Check Started ===');
  try {
    const { id } = params;
    console.log('Request ID:', id);
    
    const url = `https://api.fashn.ai/v1/status/${id}`;
    console.log('Calling FASHN API URL:', url);
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${process.env.FASHN_API_KEY}`,
        'Cache-Control': 'no-cache'
      }
    });
    
    console.log('FASHN API Response Status:', response.status);
    const data = await response.json();
    console.log('FASHN API Raw Response:', data);

    if (data.status === 'completed') {
      console.log('Processing completed successfully. Output URLs:', data.output);
    }

    return new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate'
      }
    });
  } catch (error) {
    console.error('Status check error:', error);
    return Response.json(
      { error: { message: error.message } },
      { status: 500 }
    );
  }
}