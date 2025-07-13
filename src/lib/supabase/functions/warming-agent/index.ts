// supabase/functions/warming-agent/index.ts
import { serve } from "https://deno.land/std@0.220.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
// Expanded cadence logic - more comprehensive like a real sales team
const cadences = {
  LeadEngagement: [
    {
      delayDays: 0,
      prompt:
        "Write a personalized introduction email. Thank the lead for their interest, reference how Consuelo can address a specific pain point in their industry, and invite them to share their current challenges. Do not make up any details you don't know.",
    },
    {
      delayDays: 3,
      prompt:
        "Write a follow-up email offering a short demo or discovery call. Highlight one key feature relevant to their business. Ask if they have any questions or want to see how Consuelo works for companies like theirs. Do not invent any case studies or results.",
    },
    {
      delayDays: 10,
      prompt:
        "Write a value-focused email sharing a relevant industry insight or trend (without making up data). Position Consuelo as a helpful resource and offer to provide more information if they're interested.",
    },
    {
      delayDays: 20,
      prompt:
        "Write a gentle check-in email. Ask if they're still exploring solutions and offer to answer any questions. Keep it friendly and helpful, not pushy.",
    },
  ],
  NewClientOnboarding: [
    {
      delayDays: 1,
      prompt:
        "Write a warm welcome email. Thank them for choosing us, set expectations for the partnership, and ask if they have any immediate questions. Include a direct phone number they can reach you at.",
    },
    {
      delayDays: 7,
      prompt:
        "Write a check-in email asking how their first week has been. Offer to schedule a brief call to ensure everything is going smoothly and address any concerns.",
    },
    {
      delayDays: 30,
      prompt:
        "Write a 30-day check-in email. Ask for feedback on their experience so far, mention a success story from a similar client, and see if there are any additional ways you can help their business.",
    },
  ],
  RenewalPush: [
    {
      delayDays: 0,
      prompt:
        "Your partnership with us is expiring in 60 days. Write a warm, non-salesy email checking in. Mention something positive from their LinkedIn profile and ask if there's anything they need to ensure a smooth continuation.",
    },
    {
      delayDays: 15,
      prompt:
        "Following up, your partnership expires in 45 days. Write a slightly more direct email highlighting one key benefit they've received. Offer to schedule a brief call to discuss their renewal options.",
    },
    {
      delayDays: 30,
      prompt:
        "Partnership expires in 30 days. Write an email with urgency but helpful tone. Highlight 2-3 specific benefits they've received and include a clear renewal link.",
    },
    {
      delayDays: 45,
      prompt:
        "Final reminder - partnership expires in 15 days. Write a concise, helpful email with a clear call to action to renew. Keep the tone helpful, not desperate.",
    },
  ],
  StandardNurture: [
    {
      delayDays: 0,
      prompt:
        "Write a casual check-in email. Mention something interesting from their company's recent news or their LinkedIn profile. Do not try to sell anything. The goal is simply to build rapport and stay top-of-mind.",
    },
    {
      delayDays: 30,
      prompt:
        "Write another casual check-in. Find a different piece of news or a different post from their LinkedIn. Ask a question about it to encourage a reply. Share a relevant industry insight.",
    },
    {
      delayDays: 60,
      prompt:
        "Write a value-add email. Share a relevant article, tip, or resource that could help their business. No sales pitch - just genuine value.",
    },
    {
      delayDays: 90,
      prompt:
        "Write a friendly check-in asking how their business is doing. Mention a recent success story (anonymized) from another client in their industry.",
    },
  ],
  ReEngagement: [
    {
      delayDays: 0,
      prompt:
        "Write a re-engagement email. Acknowledge it's been a while since you connected. Ask if their priorities have changed and if there's anything new you can help with.",
    },
    {
      delayDays: 30,
      prompt:
        "Write a final re-engagement attempt. Offer to remove them from communications if they're not interested, but leave the door open for future contact.",
    },
  ],
};

function getNextStep(client) {
  const today = new Date();
  const logs = [];
  logs.push(`\n=== ANALYZING CLIENT: ${client.Client} ===`);
  logs.push(`Status: ${client.status}`);
  logs.push(`Current cadence: ${client.current_cadence_name || "NONE"}`);
  logs.push(`Total messages sent: ${client.total_messages_count || 0}`);
  logs.push(`Last contact: ${client.last_contact_date || "NEVER"}`);
  logs.push(`Next contact scheduled: ${client.next_contact_date || "NOT SET"}`);
  logs.push(`Expiration date: ${client["Expiration Date"] || "NONE"}`);
  const expirationDate = client["Expiration Date"]
    ? new Date(client["Expiration Date"])
    : null;
  // 1. RENEWAL LOGIC - Check if client needs renewal push
  if (expirationDate) {
    const daysUntilExpiration = Math.ceil(
      (expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );
    logs.push(`Days until expiration: ${daysUntilExpiration}`);
    if (daysUntilExpiration > 0 && daysUntilExpiration <= 60) {
      if (client.current_cadence_name !== "RenewalPush") {
        logs.push(`🔄 TRIGGER: Starting RenewalPush cadence`);
        console.log(logs.join("\n"));
        return {
          step: cadences["RenewalPush"][0],
          newCadenceName: "RenewalPush",
          reason: `Expiration in ${daysUntilExpiration} days`,
        };
      }
    }
  }
  // 2. CONTINUE EXISTING CADENCE
  if (client.current_cadence_name && cadences[client.current_cadence_name]) {
    const lastContact = client.last_contact_date
      ? new Date(client.last_contact_date)
      : null;
    const currentCadence = cadences[client.current_cadence_name];
    const messageCount = client.total_messages_count || 0;
    const nextStepIndex = messageCount;
    const nextStep = currentCadence[nextStepIndex];
    logs.push(`Current cadence has ${currentCadence.length} steps`);
    logs.push(`Looking for step index: ${nextStepIndex}`);
    if (nextStep) {
      logs.push(`Next step found: ${nextStep.delayDays} day delay required`);
      if (lastContact) {
        const daysSinceLastContact = Math.ceil(
          (today.getTime() - lastContact.getTime()) / (1000 * 60 * 60 * 24),
        );
        logs.push(`Days since last contact: ${daysSinceLastContact}`);
        logs.push(`Required delay: ${nextStep.delayDays} days`);
        if (daysSinceLastContact >= nextStep.delayDays) {
          logs.push(
            `✅ TRIGGER: Continuing ${client.current_cadence_name} cadence`,
          );
          console.log(logs.join("\n"));
          return {
            step: nextStep,
            reason: `Continuing ${client.current_cadence_name}, step ${nextStepIndex + 1}`,
          };
        } else {
          logs.push(
            `⏳ WAIT: Need ${nextStep.delayDays - daysSinceLastContact} more days`,
          );
        }
      } else {
        logs.push(`✅ TRIGGER: No last contact date, sending next step`);
        console.log(logs.join("\n"));
        return {
          step: nextStep,
          reason: `Continuing ${client.current_cadence_name}, no last contact date`,
        };
      }
    } else {
      logs.push(
        `📝 END: Reached end of ${client.current_cadence_name} cadence`,
      );
      // Move to re-engagement if they've completed a cadence
      logs.push(`🔄 TRIGGER: Starting ReEngagement cadence`);
      console.log(logs.join("\n"));
      return {
        step: cadences["ReEngagement"][0],
        newCadenceName: "ReEngagement",
        reason: `Completed ${client.current_cadence_name}, starting re-engagement`,
      };
    }
  }
  // 3. NEW CLIENT - No cadence set
  if (!client.current_cadence_name) {
    // Check if they're a brand new client (no messages sent)
    if (!client.total_messages_count || client.total_messages_count === 0) {
      logs.push(`🆕 TRIGGER: New client - starting onboarding`);
      console.log(logs.join("\n"));
      return {
        step: cadences["NewClientOnboarding"][0],
        newCadenceName: "NewClientOnboarding",
        reason: "New client onboarding",
      };
    } else {
      // Existing client with no cadence - start nurture
      logs.push(`📈 TRIGGER: Starting StandardNurture cadence`);
      console.log(logs.join("\n"));
      return {
        step: cadences["StandardNurture"][0],
        newCadenceName: "StandardNurture",
        reason: "Starting standard nurture sequence",
      };
    }
  }
  logs.push(`❌ NO ACTION: No conditions met`);
  console.log(logs.join("\n"));
  return null;
}
// Base system prompt template that gets customized per company
const baseSystemPrompt = `  ​​System Prompt
As a professional sales representative for Consuelo, you represent a cutting-edge Modern Workspace tailored specifically for Sales Teams. This all-in-one platform seamlessly integrates AI-driven sales applications with powerful automation tools, meticulously designed to empower businesses in boosting their revenue. With Consuelo, businesses are equipped with intelligent lead generation capabilities that sift through vast amounts of data to identify high-potential prospects. The platform also offers personalized outreach features, allowing sales teams to craft tailored messages that resonate deeply with each potential client. Additionally, Consuelo's automated follow-up system ensures that no lead falls through the cracks, persistently engaging prospects with timely communications. This comprehensive suite of tools transforms the sales process into a streamlined, efficient, and effective journey towards enhanced business growth.
Company Overview
Company: Consuelo
Mission:
Transform disjointed piles of sales documents and scattered digital tools into a cohesive AI-driven platform that seamlessly handles every step of the sales journey, from initial lead generation and nurturing to closing deals and post-sale follow-ups.
Key Features:
Lead generation involved systematically scouring various online platforms to collect potential client information. This process included scraping data from sources like LinkedIn and industry-specific forums. The gathered information was then carefully enriched by cross-referencing it with additional data, such as company size, job title, and recent business activities, to create a comprehensive profile of each prospective lead.
On-Call Coaching (receive real-time sales tips and guidance directly on your computer screen while engaging in live calls)
AI chatbots (multilingual, pre-qualification)
Automated voice and SMS outreach
Email automation and inbox management
Content and marketing automation
Real-time analytics and pipeline management
Value Proposition: Our platform automates the entire sales process, starting from identifying potential leads to finalizing deals. It uses advanced AI to customize interactions uniquely to each prospect, adapting communication based on their preferences and behaviors. Additionally, it incorporates detailed insights and trends specific to various industries, ensuring that every engagement is relevant and impactful.
Email Writing Rules
You MUST respond with a JSON object containing two keys: "subject" and "body".
The "subject" should be a short, personalized, and engaging email subject line (under 10 words).
The "body" is the email content.
Do not include any other text, reasoning, or markdown formatting outside of the JSON object.
Keep emails concise: 150–250 words.
Maintain a conversational, warm, and genuine tone.
Highlight one specific value relevant to the recipient’s business.
End with a soft, actionable closing.
Sign as “Your partners at Consuelo.”
Use the company phone number from settings if needed.
Never include internal thoughts, reasoning, or meta-commentary.
Writing Style Guidelines
Address the recipient by first name.
Focus on building relationships, not just making a sale.
Reference benefits that align with the recipient’s industry or needs.
Keep paragraphs short (2–3 sentences each).
Be helpful, authentic, and solution-oriented.
Product Messaging Priorities
1. Lead Generation & Prospecting
Google Maps Business Scraper for local business data.
Multi-platform integration (Apollo, ZoomInfo, LinkedIn).
Social media monitoring for real-time lead discovery.
Automated contact enrichment and verification.
2. AI Communication Hub
Multilingual smart chatbot for lead qualification.
Automated voice calling and after-hours call handling.
Integrated SMS/text campaigns.
3. Email & Outreach Automation
Personalized cold email campaigns.
Warm nurturing sequences based on lead data.
Multi-channel orchestration (email, SMS, voice).
AI-managed inbox until human intervention is required.
4. Content Creation & Marketing
AI-generated social posts, videos, and landing pages.
SEO-optimized blog automation.
5. Sales Analytics & Management
Custom dashboards, call analytics, and lead scoring.
Automated CRM updates and pipeline management.
6. Productivity & Workflow
AI-prioritized task management and meeting assistant.
Automated process documentation and voice command support.`

;
serve(async (req) => {
  // Handle CORS (no changes here)
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
        "Access-Control-Allow-Headers":
          "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    const body = req.method === "POST" ? await req.json() : {};
    const triggeredBy = body.triggered_by || "system";
    const companyId = body.company_id || 1;
    console.log("\n🚀 WARMING AGENT STARTED");
    console.log(`Triggered by: ${triggeredBy}`);
    console.log(`Company ID: ${companyId}`);
    console.log(`Timestamp: ${new Date().toISOString()}`);

    // Initialize Supabase client (no changes here)
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // Get environment variables (no changes here)
    const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!GROQ_API_KEY || !RESEND_API_KEY) {
      throw new Error(
        "Missing required environment variables (GROQ_API_KEY or RESEND_API_KEY)",
      );
    }
    console.log("✅ Environment variables loaded");

    // 1. Get company settings (no changes here)
    const { data: companySettings, error: companyError } = await supabase
      .from("company_settings")
      .select("*")
      .eq("id", companyId)
      .single();
    if (companyError || !companySettings) {
      console.error("❌ Company settings error:", companyError);
      throw new Error(`Company settings not found for ID: ${companyId}`);
    }
    console.log(`🏢 Processing for company: ${companySettings.company_name}`);
    console.log(`📧 From email: ${companySettings.from_email}`);

    // 2. Fetch clients (no changes here)
    const { data: clients, error: fetchError } = await supabase
      .from("clients")
      .select(
        `"Client ID", "Client", email, linkedin, status, "Expiration Date", last_contact_date, current_cadence_name, total_messages_count, next_contact_date, company_id`,
      )
      .eq("status", "active")
      .eq("company_id", companyId)
      .or(
        `next_contact_date.is.null,next_contact_date.lte.${new Date().toISOString()}`,
      );
    if (fetchError) {
      console.error("❌ Supabase fetch error:", fetchError);
      throw new Error(`Supabase fetch error: ${fetchError.message}`);
    }
    console.log(
      `📊 Found ${clients?.length || 0} clients to evaluate for ${companySettings.company_name}`,
    );
    if (!clients || clients.length === 0) {
      // (no changes in this block)
      return new Response(
        JSON.stringify({
          success: true,
          message: `No clients to process today for ${companySettings.company_name}.`,
          processed: 0,
          successful: 0,
          company: companySettings.company_name,
          triggered_by: triggeredBy,
        }),
        { headers: { "Content-Type": "application/json" }, status: 200 },
      );
    }

    let processedCount = 0;
    let successCount = 0;
    let skipCount = 0;

    // 3. Customize system prompt (no changes here)
    const systemPrompt = baseSystemPrompt.replace(
      /{COMPANY_NAME}/g,
      companySettings.company_name,
    );

    // 4. Process each client
    for (const client of clients) {
      console.log(`\n📋 Evaluating: ${client.Client}`);
      const action = getNextStep(client);
      if (!action) {
        skipCount++;
        console.log(`⏭️ Skipping ${client.Client} - no action needed`);
        continue;
      }
      processedCount++;
      console.log(`\n📧 Processing email for: ${client.Client}`);
      console.log(`Action reason: ${action.reason}`);

      try {
        // 5. Generate email with Groq using company-specific context
        const userPrompt = `
Company Name: ${companySettings.company_name}
Client Name: ${client.Client}
Client LinkedIn: ${client.linkedin || "Not available"}
Client Email: ${client.email}
My Goal: "${action.step.prompt}"
Context: ${action.reason}
        `.trim();

        console.log("🤖 Generating email and subject with Groq...");
        const groqResponse = await fetch(
          "https://api.groq.com/openai/v1/chat/completions",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${GROQ_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt },
              ],
              model: "deepseek-r1-distill-llama-70b", // Using a model known for great instruction following
              // model: "deepseek-r1-distill-llama-70b", // Your original model
              max_tokens: 1500,
              temperature: 0.7,
              // --- NEW: Force the model to output JSON ---
              response_format: { type: "json_object" },
            }),
          },
        );

        if (!groqResponse.ok) {
          const errorText = await groqResponse.text();
          console.error("❌ Groq API error:", errorText);
          throw new Error(`Groq API error: ${errorText}`);
        }

        const completion = await groqResponse.json();

        // --- NEW: Parse the JSON response from the LLM ---
        const rawContent = completion.choices[0]?.message?.content;
        if (!rawContent) {
          throw new Error("Groq returned an empty response content.");
        }

        let subject, emailBody;
        try {
          const parsedContent = JSON.parse(rawContent);
          subject = parsedContent.subject;
          emailBody = parsedContent.body;
          if (!subject || !emailBody) {
            throw new Error(
              'LLM response JSON is missing "subject" or "body" key.',
            );
          }
        } catch (e) {
          console.error("❌ Failed to parse LLM JSON response:", rawContent);
          throw new Error(`Invalid JSON response from LLM: ${e.message}`);
        }

        console.log("✅ Email content generated successfully");
        console.log(`Subject: ${subject}`);
        console.log(`Body length: ${emailBody.length} characters`);

        // 6. Send email via Resend (no changes here, but uses the new variables)
        console.log("📮 Sending email via Resend...");
        const fromEmail = companySettings.from_name
          ? `${companySettings.from_name} <${companySettings.from_email}>`
          : companySettings.from_email;
        const emailResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: fromEmail,
            to: client.email,
            subject: subject, // <-- Using the AI-generated subject
            html: emailBody.replace(/\n/g, "<br>"),
          }),
        });

        if (!emailResponse.ok) {
          const errorText = await emailResponse.text();
          console.error("❌ Resend error:", errorText);
          throw new Error(`Resend error: ${errorText}`);
        }
        const emailResult = await emailResponse.json();
        console.log("✅ Email sent successfully:", emailResult.id);
        console.log(`📤 Sent from: ${fromEmail}`);

        // 7. Log success & update client record
        console.log("💾 Updating database records...");
        await supabase.from("warming_log").insert({
          client_id: client["Client ID"],
          status: "sent",
          generated_subject: subject, // <-- Logging the AI-generated subject
          generated_body: emailBody,
          cadence_name: action.newCadenceName || client.current_cadence_name,
          cadence_step_prompt: action.step.prompt,
          triggered_by: triggeredBy,
          reason: action.reason,
          company_id: companyId,
        });

        // (The rest of the database update logic is unchanged)
        const nextContactDate = new Date();
        const nextStepIndex = (client.total_messages_count || 0) + 1;
        const currentCadence =
          cadences[
            action.newCadenceName ||
              client.current_cadence_name ||
              "StandardNurture"
          ];
        const nextStep = currentCadence[nextStepIndex];
        if (nextStep) {
          nextContactDate.setDate(
            nextContactDate.getDate() + nextStep.delayDays,
          );
          console.log(
            `📅 Next contact scheduled for: ${nextContactDate.toISOString().split("T")[0]} (${nextStep.delayDays} days)`,
          );
        } else {
          nextContactDate.setDate(nextContactDate.getDate() + 180);
          console.log(
            `📅 End of cadence - next contact scheduled for: ${nextContactDate.toISOString().split("T")[0]}`,
          );
        }
        await supabase
          .from("clients")
          .update({
            last_contact_date: new Date().toISOString(),
            next_contact_date: nextContactDate.toISOString(),
            current_cadence_name:
              action.newCadenceName || client.current_cadence_name,
            total_messages_count: (client.total_messages_count || 0) + 1,
          })
          .eq("Client ID", client["Client ID"]);

        console.log("✅ Database updated successfully");
        successCount++;
      } catch (emailError) {
        console.error(
          `❌ Error processing client ${client.Client}:`,
          emailError.message,
        );
        // 8. Log failure (no changes here)
        await supabase.from("warming_log").insert({
          client_id: client["Client ID"],
          status: "failed",
          error_message: emailError.message,
          cadence_name: action.newCadenceName || client.current_cadence_name,
          cadence_step_prompt: action.step.prompt,
          triggered_by: triggeredBy,
          reason: action.reason,
          company_id: companyId,
        });
      }
    }

    // Summary (no changes here)
    const summary = `
🎯 WARMING AGENT SUMMARY for ${companySettings.company_name}
Evaluated: ${clients.length} clients
Processed: ${processedCount} clients  
Successful: ${successCount} emails sent
Skipped: ${skipCount} clients (no action needed)
Triggered by: ${triggeredBy}
From: ${companySettings.from_email}
    `.trim();
    console.log(summary);
    return new Response(
      JSON.stringify({
        success: true,
        message: `Warming agent run complete for ${companySettings.company_name}. Processed ${processedCount} clients, ${successCount} successful.`,
        processed: processedCount,
        successful: successCount,
        skipped: skipCount,
        evaluated: clients.length,
        company: companySettings.company_name,
        triggered_by: triggeredBy,
      }),
      { headers: { "Content-Type": "application/json" }, status: 200 },
    );
  } catch (err) {
    // Critical error handling (no changes here)
    console.error("💥 CRITICAL ERROR:", err);
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { headers: { "Content-Type": "application/json" }, status: 500 },
    );
  }
});
