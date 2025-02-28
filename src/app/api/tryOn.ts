// src/app/api/tryOn.ts
const retryRequest = async <T>(fn: () => Promise<T>, retries: number, delay: number): Promise<T> => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      console.error(`Attempt ${attempt}/${retries} failed:`, error);
      if (attempt === retries) throw error;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('All retry attempts failed');
};

export const initiateTryOn = async (body: any) => {
  const response = await fetch('https://api.fashn.ai/v1/run', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.FASHN_API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Failed to initiate try-on');
  }

  return response.json();
};

export const getTryOnStatus = async (id: string) => {
  const response = await fetch(`https://api.fashn.ai/v1/status/${id}`, {
    headers: {
      'Authorization': `Bearer ${process.env.FASHN_API_KEY}`,
    }
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Failed to get try-on status');
  }

  return response.json();
};