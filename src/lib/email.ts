import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'CoreInventory'
const FROM_EMAIL = `${APP_NAME} <${process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'}>`
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

function baseLayout(content: string) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f4f4f5;padding:40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="480" cellspacing="0" cellpadding="0" style="background-color:#ffffff;border-radius:8px;border:1px solid #e4e4e7;overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="padding:32px 32px 0;text-align:center;">
              <div style="width:44px;height:44px;background-color:#4f46e5;border-radius:8px;display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px;">
                <span style="color:#ffffff;font-size:20px;font-weight:700;">C</span>
              </div>
              <h1 style="margin:0;font-size:18px;font-weight:600;color:#18181b;">${APP_NAME}</h1>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding:24px 32px 32px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:16px 32px;background-color:#fafafa;border-top:1px solid #e4e4e7;text-align:center;">
              <p style="margin:0;font-size:12px;color:#71717a;">
                ${APP_NAME} &mdash; Inventory Management System
              </p>
              <p style="margin:4px 0 0;font-size:11px;color:#a1a1aa;">
                This is an automated email. Please do not reply.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

function buttonHtml(text: string, url: string) {
  return `
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:24px 0;">
  <tr>
    <td align="center">
      <a href="${url}" target="_blank" style="display:inline-block;background-color:#4f46e5;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;padding:12px 32px;border-radius:6px;">
        ${text}
      </a>
    </td>
  </tr>
</table>`
}

export function inviteEmailHtml(fullName: string, link: string) {
  return baseLayout(`
    <h2 style="margin:0 0 8px;font-size:20px;font-weight:600;color:#18181b;">Welcome aboard, ${fullName}!</h2>
    <p style="margin:0 0 4px;font-size:14px;color:#52525b;line-height:1.6;">
      You've been invited to join <strong>${APP_NAME}</strong>. Click the button below to set up your password and get started.
    </p>
    ${buttonHtml('Set Up Your Password', link)}
    <p style="margin:0;font-size:12px;color:#a1a1aa;line-height:1.5;">
      This link will expire in 24 hours. If you didn't expect this invitation, you can safely ignore this email.
    </p>
    <hr style="border:none;border-top:1px solid #e4e4e7;margin:20px 0;" />
    <p style="margin:0;font-size:11px;color:#a1a1aa;word-break:break-all;">
      If the button doesn't work, copy and paste this URL into your browser:<br/>
      <a href="${link}" style="color:#4f46e5;">${link}</a>
    </p>
  `)
}

export function resetPasswordEmailHtml(link: string) {
  return baseLayout(`
    <h2 style="margin:0 0 8px;font-size:20px;font-weight:600;color:#18181b;">Reset Your Password</h2>
    <p style="margin:0 0 4px;font-size:14px;color:#52525b;line-height:1.6;">
      We received a request to reset your password. Click the button below to choose a new password.
    </p>
    ${buttonHtml('Reset Password', link)}
    <p style="margin:0;font-size:12px;color:#a1a1aa;line-height:1.5;">
      This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
    </p>
    <hr style="border:none;border-top:1px solid #e4e4e7;margin:20px 0;" />
    <p style="margin:0;font-size:11px;color:#a1a1aa;word-break:break-all;">
      If the button doesn't work, copy and paste this URL into your browser:<br/>
      <a href="${link}" style="color:#4f46e5;">${link}</a>
    </p>
  `)
}

export function resendInviteEmailHtml(link: string) {
  return baseLayout(`
    <h2 style="margin:0 0 8px;font-size:20px;font-weight:600;color:#18181b;">Your Invitation Link</h2>
    <p style="margin:0 0 4px;font-size:14px;color:#52525b;line-height:1.6;">
      Your previous invitation link may have expired. Here's a fresh one to set up your password and access <strong>${APP_NAME}</strong>.
    </p>
    ${buttonHtml('Set Up Your Password', link)}
    <p style="margin:0;font-size:12px;color:#a1a1aa;line-height:1.5;">
      This link will expire in 24 hours. If you didn't expect this email, you can safely ignore it.
    </p>
    <hr style="border:none;border-top:1px solid #e4e4e7;margin:20px 0;" />
    <p style="margin:0;font-size:11px;color:#a1a1aa;word-break:break-all;">
      If the button doesn't work, copy and paste this URL into your browser:<br/>
      <a href="${link}" style="color:#4f46e5;">${link}</a>
    </p>
  `)
}

export async function sendInviteEmail(to: string, fullName: string, link: string) {
  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `You're invited to ${APP_NAME}`,
    html: inviteEmailHtml(fullName, link),
  })

  if (error) {
    console.error('Resend error (invite):', error)
    throw new Error(error.message)
  }
  return data
}

export async function sendResetPasswordEmail(to: string, link: string) {
  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Reset your ${APP_NAME} password`,
    html: resetPasswordEmailHtml(link),
  })

  if (error) {
    console.error('Resend error (reset):', error)
    throw new Error(error.message)
  }
  return data
}

export async function sendResendInviteEmail(to: string, link: string) {
  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Your ${APP_NAME} invitation (resent)`,
    html: resendInviteEmailHtml(link),
  })

  if (error) {
    console.error('Resend error (resend invite):', error)
    throw new Error(error.message)
  }
  return data
}
