'use server'

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function submitContactForm(prevState: { message: string }, formData: FormData) {
  const fullName = formData.get('name') as string
  const company = formData.get('company') as string
  const email = formData.get('email') as string
  const website = formData.get('website') as string
  const message = formData.get('message') as string

  try {
    const { error } = await supabase
      .from('contact_submissions')
      .insert([
        { full_name: fullName, company, email, website, message }
      ])

    if (error) throw error

    return { message: "Form submitted successfully!" }
  } catch (error) {
    return { message: "Error submitting form. Please try again." }
  }
}

