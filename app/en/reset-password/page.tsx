import ResetPasswordBody from '@/components/auth/ResetPasswordBody'

/**
 * Landed on from the password-reset email. Which language the link points at
 * is decided where the email is requested — see the redirectTo in AuthModal
 * and LoginBody, which now follow the locale the person was reading.
 */
export default function EnResetPasswordPage() {
  return <ResetPasswordBody locale="en" />
}
