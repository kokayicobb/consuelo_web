// tryOn.ts
const retryRequest = async (fn: Function, retries: number, delay: number) => {
  let attempt = 0;
  while (attempt < retries) {
    try {
      return await fn();
    } catch (error) {
      console.error(`Attempt ${attempt + 1} failed:`, error);
      if (attempt === retries - 1) throw error;
      attempt++;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

// Initiate Try-On API Request
export const initiateTryOn = async (body: any) => {
  console.log("Initiating Try-On with payload:", body);

  return retryRequest(
    async () => {
      // Make direct call to FASHN API instead of your local endpoint
      const response = await fetch('https://api.fashn.ai/v1/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer fa-u5Z4R9wIqa6R-kfW6TOb7KXllTSG1PB278ZiB', // Replace with your actual API key
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`Failed to initiate try-on: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Try-On API Response:", data);

      if (data.error) {
        throw new Error(`API Error: ${data.error.message || 'Unknown error'}`);
      }

      return data;
    },
    3,
    1000
  );
};

// Get Try-On Status
export const getTryOnStatus = async (id: string) => {
  console.log("Fetching Try-On Status for ID:", id);

  return retryRequest(
    async () => {
      // Make direct call to FASHN API status endpoint
      const response = await fetch(`https://api.fashn.ai/v1/status/${id}`, {
        headers: {
          'Authorization': 'Bearer fa-u5Z4R9wIqa6R-kfW6TOb7KXllTSG1PB278ZiB', // Replace with your actual API key
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get try-on status: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Try-On Status API Response:", data);

      if (data.error) {
        throw new Error(`API Error: ${data.error.message || 'Unknown error'}`);
      }

      return data;
    },
    3,
    1000
  );
};