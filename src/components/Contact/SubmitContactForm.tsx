'use server'

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function submitContactForm(prevState: { message: string }, formData: FormData) {
  const email = formData.get('email') as string

  if (!email) {
    return { message: "Email is required." }
  }

  try {
    // Save to Supabase
    const { error } = await supabase
      .from('email_signups')
      .insert([
        { email, created_at: new Date().toISOString() }
      ])

    if (error) throw error

    // Email will be sent via Supabase webhook automatically

    return { message: "Successfully added to waitlist! Check your email." }
  } catch (error) {
    console.error('Supabase error:', error)
    return { message: "Error submitting form. Please try again." }
  }
}

