// src/lib/supabase/functions/warming-agent/cadance-logic.ts
export interface Client {
  "Client ID": string;
  "Client": string;
  email: string;
  linkedin?: string;
  status: string;
  "Expiration Date"?: string; // e.g., '2024-12-31'
  last_contact_date?: string;
  current_cadence_name?: string;
	total_messages_count?: number; // Total messages sent in the current cadence
  // Add any other fields you need for the logic
}

// Define the structure of a single step in a cadence
interface CadenceStep {
  delayDays: number; // Days to wait after the previous step
  prompt: string;    // The prompt to send to the AI for personalization
}

// --- DEFINE ALL YOUR CADENCES HERE ---
const cadences: { [key: string]: CadenceStep[] } = {
  // Cadence for clients approaching their expiration/renewal date
  "RenewalPush": [
    {
      delayDays: 0, // This step triggers 60 days before expiration
      prompt: "Your partnership with us is expiring in 60 days. Write a warm, non-salesy email checking in. Mention something positive from their LinkedIn profile and ask if there's anything they need to ensure a smooth continuation.",
    },
    {
      delayDays: 30, // 30 days after the first touch (30 days before expiration)
      prompt: "Following up, your partnership expires in 30 days. Write a slightly more direct email highlighting one key benefit they've received. Offer to schedule a brief call to discuss their renewal options.",
    },
    {
      delayDays: 15, // 15 days after the second touch (15 days before expiration)
      prompt: "This is a final, friendly reminder. The partnership expires in 15 days. Write a concise, helpful email with a clear call to action to renew and a link to do so. Keep the tone helpful, not desperate.",
    },
  ],

  // A general nurture cadence for active clients not in a renewal cycle
  "StandardNurture": [
     {
      delayDays: 45, // First contact 45 days after they become a client
      prompt: "Write a casual check-in email. Mention something interesting from their company's recent news or their LinkedIn profile. Do not try to sell anything. The goal is simply to build rapport and stay top-of-mind.",
    },
     {
      delayDays: 90, // Follow up 90 days later
      prompt: "Write another casual check-in. Find a different piece of news or a different post from their LinkedIn. Ask a question about it to encourage a reply. The goal is to be a valuable, interested partner.",
    },
  ],
};

// This function determines the next action for a given client
export function getNextStep(client: Client): { step: CadenceStep; newCadenceName?: string } | null {
  const today = new Date();
  const expirationDate = client["Expiration Date"] ? new Date(client["Expiration Date"]) : null;

  // --- Renewal Cadence Logic (Highest Priority) ---
  if (expirationDate) {
    const daysUntilExpiration = (expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
    if (daysUntilExpiration > 0 && daysUntilExpiration <= 60) {
      if (client.current_cadence_name !== "RenewalPush") {
        // They are entering the renewal window, start the cadence
        return { step: cadences["RenewalPush"][0], newCadenceName: "RenewalPush" };
      }
    }
  }
  
  // --- Follow-up Logic for Active Cadences ---
  if (client.current_cadence_name && cadences[client.current_cadence_name]) {
    const lastContact = client.last_contact_date ? new Date(client.last_contact_date) : new Date();
    const currentCadence = cadences[client.current_cadence_name];
    
    // Find the current step based on last contact date (this is a simplified example)
    // A more robust solution might store the 'current_step_index' in the database
    // For now, we'll assume we just move to the next step in the array
    const nextStepIndex = 1; // You would need to build logic to find the *actual* next step
    const nextStep = currentCadence[nextStepIndex];

    if (nextStep) {
       const daysSinceLastContact = (today.getTime() - lastContact.getTime()) / (1000 * 60 * 60 * 24);
       if (daysSinceLastContact >= nextStep.delayDays) {
         return { step: nextStep };
       }
    }
  }

  // --- Default to Standard Nurture if no other cadence applies ---
  if (!client.current_cadence_name) {
    return { step: cadences["StandardNurture"][0], newCadenceName: "StandardNurture"};
  }
  
  return null; // No action needed for this client today
}