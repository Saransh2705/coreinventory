'use server'

import { createClient as createAdminClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'
import { sendResetPasswordEmail } from '@/lib/email'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function forgotPassword(formData: FormData) {
  const email = formData.get('email') as string

  if (!email) {
    return { error: 'Email is required' }
  }

  try {
    const adminClient = createAdminClient<Database>(supabaseUrl, supabaseServiceRoleKey)

    // Generate a recovery link without sending Supabase's default email
    const { data: linkData, error } = await adminClient.auth.admin.generateLink({
      type: 'recovery',
      email,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/reset-password`,
      },
    })

    if (error) {
      // Don't reveal whether the email exists
      return { success: true }
    }

    const link = linkData?.properties?.action_link
    if (link) {
      await sendResetPasswordEmail(email, link)
    }

    return { success: true }
  } catch (err) {
    console.error('Unexpected error in forgotPassword:', err)
    // Don't reveal errors to prevent email enumeration
    return { success: true }
  }
}
