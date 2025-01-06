// Helper function for retries
const retryRequest = async (fn: Function, retries: number, delay: number) => {
  let attempt = 0;
  while (attempt < retries) {
    try {
      return await fn();
    } catch (error) {
      console.error(`Attempt ${attempt + 1} failed:`, error);
      if (attempt === retries - 1) throw error; // Rethrow if all retries fail
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
      const response = await fetch('/api/try-on', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
    3, // Retry up to 3 times
    1000 // Wait 1 second between retries
  );
};

// Get Try-On Status
export const getTryOnStatus = async (id: string) => {
  console.log("Fetching Try-On Status for ID:", id);

  return retryRequest(
    async () => {
      const response = await fetch(`/api/try-on/status/${id}`);
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
    3, // Retry up to 3 times
    1000 // Wait 1 second between retries
  );
};
