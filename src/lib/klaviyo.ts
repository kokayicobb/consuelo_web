export async function sendTryOnNotification() {
  const data = {
    token: process.env.NEXT_PUBLIC_KLAVIYO_PUBLIC_API_KEY,
    event: "Virtual Try-On Clicked",
    customer_properties: {
      $email: "Kokayi@consuelohq.com",
    },
    properties: {
      clickedAt: new Date().toISOString(),
    },
  };

  const response = await fetch("/api/klaviyo/track", {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to send Klaviyo event");
  }
}
