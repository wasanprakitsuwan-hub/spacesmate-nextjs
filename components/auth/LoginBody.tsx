'use client'

import { useEffect, useState } from 'react'
import GoogleSignInButton from '@/components/auth/GoogleSignInButton'
import TermsTick from '@/components/auth/TermsTick'
import { termsMetadata, savePendingTerms } from '@/lib/terms-consent'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase'
import { AUTH_T, type Locale } from '@/lib/auth-i18n'
import { localeHref } from '@/lib/routes-i18n'

export default function LoginBody({ locale = 'th' }: { locale?: Locale }) {
  const t = AUTH_T[locale]
  const [tab,      setTab]      = useState<'login' | 'signup'>('login')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [success,  setSuccess]  = useState('')
  const router = useRouter()

  // Login fields
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPwd,   setLoginPwd]   = useState('')

  // Forgot password. The link used to be <a href="#"> — a dead control on the
  // page every logged-out redirect lands on, from the dashboard, from checkout
  // and from the listing wizard. The working flow existed only in the navbar
  // modal, which someone who cannot sign in is not necessarily looking at.
  const [forgotPwd,   setForgotPwd]   = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')

  // Signup fields
  const [signName,  setSignName]  = useState('')
  const [signEmail, setSignEmail] = useState('')
  const [signPwd,   setSignPwd]   = useState('')
  const [signPwd2,  setSignPwd2]  = useState('')

  // Sign-up acceptance (lib/terms-consent): terms + privacy required, marketing optional.
  const [accepted,  setAccepted]  = useState(false)
  const [marketing, setMarketing] = useState(false)

  // ?tab=signup opens on sign-up (the "list a property" buttons send logged-out
  // owners here); ?redirect= is where to go afterwards. Same-site paths only —
  // an open redirect is a phishing primitive.
  const [redirect, setRedirect] = useState<string | null>(null)
  useEffect(() => {
    const qs = new URLSearchParams(window.location.search)
    if (qs.get('tab') === 'signup') setTab('signup')
    const wanted = qs.get('redirect')
    if (wanted && wanted.startsWith('/') && !wanted.startsWith('//')) setRedirect(wanted)
  }, [])

  function switchTab(t: 'login' | 'signup') {
    setTab(t); setError(''); setSuccess(''); setForgotPwd(false)
  }

  // ── Forgot password ──────────────────────────────────────────────────────
  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault()
    if (!forgotEmail) { setError(t.needEmail); return }
    setLoading(true); setError('')
    try {
      const supabase = createBrowserClient()
      // The emailed link has to land in the language they asked from, or an
      // English owner resetting a password meets a Thai form.
      const redirectTo = `${window.location.origin}${localeHref('/reset-password', locale)}`
      const { error: resetErr } = await supabase.auth.resetPasswordForEmail(forgotEmail.trim(), { redirectTo })
      if (resetErr) throw resetErr
      setSuccess(t.resetSent(forgotEmail))
      setForgotPwd(false)
    } catch (err: any) {
      setError(err?.message ?? t.genericError)
    }
    setLoading(false)
  }

  // ── Login ────────────────────────────────────────────────────────────────
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const supabase = createBrowserClient()
      const { data } = await supabase.auth.signInWithPassword({
        email: loginEmail, password: loginPwd,
      })
      /**
       * A password that no longer meets the project's minimum returns BOTH a
       * session and an AuthWeakPasswordError: the credentials were correct,
       * the password merely falls short of a rule tightened after they signed
       * up. Supabase is explicit that such users can still sign in.
       *
       * So the test is whether a session came back, not whether an error did.
       * Treating any error as a failed login would tell an owner with an older
       * 6-character password that their password is wrong — every time, with
       * no way to understand why — the moment the minimum is raised. Locked
       * out by our error handling rather than by Supabase.
       *
       * Keying on the session also means a future tightening of the rules
       * cannot lock anyone out of an account they can still legitimately
       * access.
       */
      if (!data?.session) {
        setError(t.badCredentials)
      } else if (data.user) {
        // Use service-role API to bypass RLS
        const r = await fetch('/api/auth/role', {
          headers: { Authorization: `Bearer ${data.session?.access_token}` },
        })
        const { role } = await r.json()

        // Honour ?redirect= so someone sent here mid-task (buying slots from
        // /pricing, for example) lands back where they were rather than on a
        // dashboard, having to find their way again.
        // Only same-site paths — an open redirect is a phishing primitive.
        const wanted = new URLSearchParams(window.location.search).get('redirect')
        const safe = wanted && wanted.startsWith('/') && !wanted.startsWith('//') ? wanted : null

        router.push(safe ?? (role === 'admin' || role === 'super_admin' ? '/dashboard' : '/owner-dashboard'))
      }
    } catch {
      setError(t.genericError)
    }
    setLoading(false)
  }

  // ── Sign Up ───────────────────────────────────────────────────────────────
  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    if (!accepted) { setError(t.acceptRequired); return }
    if (signPwd !== signPwd2) { setError(t.pwdMismatch); return }
    // 8, matching AuthModal. These are two front doors to the same Supabase
    // account; until 17 Oct 2026 this one asked for 6 and the modal for 8, so
    // the rule an owner met depended on which they happened to open.
    if (signPwd.length < 8)  { setError(t.pwdTooShort); return }
    setLoading(true); setError('')
    try {
      const supabase = createBrowserClient()
      const { data, error: authErr } = await supabase.auth.signUp({
        email: signEmail, password: signPwd,
        options: {
          data: { full_name: signName, ...termsMetadata(marketing) },
          emailRedirectTo: `${window.location.origin}${redirect ?? localeHref('/owner-dashboard', locale)}`,
        },
      })
      if (authErr) {
        setError(authErr.message || t.signupFailedShort)
      } else if (data.user) {
        // Profile is created automatically via DB trigger on auth.users insert.
        // Show the email confirmation screen immediately.
        setSuccess(signEmail)
      }
    } catch {
      setError(t.genericError)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-spacemate-bgLight flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/">
            <span className="text-2xl font-bold text-spacemate-brandDark tracking-tight">
              Spaces<span className="text-spacemate-brandTeal">Mate</span>
            </span>
          </Link>
          <p className="text-gray-400 text-sm mt-2">
            {tab === 'login' ? t.loginSub : t.signupSub}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-spacemate-borderLight shadow-premium overflow-hidden">

          {/* Tabs */}
          <div className="flex border-b border-spacemate-borderLight">
            {(['login', 'signup'] as const).map(tb => (
              <button
                key={tb}
                onClick={() => switchTab(tb)}
                className={`flex-1 py-3.5 text-sm font-semibold transition-colors ${
                  tab === tb
                    ? 'text-spacemate-brandDark border-b-2 border-spacemate-brandDark bg-white'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {tb === 'login' ? t.login : t.signup}
              </button>
            ))}
          </div>

          <div className="p-7">
            {/* Google above the fold on both tabs — the one-tap path should be
                visible before anyone starts typing a password. */}
            {tab === 'signup' && !success && (
              <div className="mb-5">
                <TermsTick locale={locale} accepted={accepted} onAccepted={v => { setAccepted(v); setError('') }}
                  marketing={marketing} onMarketing={setMarketing} />
              </div>
            )}
            <GoogleSignInButton
              locale={locale}
              label={tab === 'login' ? t.googleLogin : t.googleSignup}
              redirectTo={redirect ?? undefined}
              beforeSignIn={tab === 'signup' ? () => {
                if (!accepted) { setError(t.acceptRequired); return false }
                savePendingTerms(marketing)
                return true
              } : undefined}
            />
            <div className="flex items-center gap-3 my-5">
              <span className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400">{t.or}</span>
              <span className="flex-1 h-px bg-gray-200" />
            </div>

            {/* ── LOGIN FORM ── */}
            {tab === 'login' && forgotPwd && (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <p className="text-base font-bold text-spacemate-brandDark mb-1">{t.resetTitle}</p>
                  <p className="text-sm text-gray-500 mb-3">{t.resetSub}</p>
                  <label className="label block mb-1.5">{t.email}</label>
                  <input
                    type="email" value={forgotEmail}
                    onChange={e => { setForgotEmail(e.target.value); setError('') }}
                    required placeholder="email@example.com"
                    className="w-full rounded-lg border border-spacemate-borderLight px-3 py-2.5 text-sm outline-none focus:border-spacemate-brandTeal"
                  />
                </div>
                <button
                  type="submit" disabled={loading}
                  className="w-full rounded-lg bg-spacemate-brandDark py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {loading ? t.sending : t.sendResetLink}
                </button>
                <p className="text-center text-sm text-gray-400 pt-1">
                  <button type="button" onClick={() => { setForgotPwd(false); setError('') }} className="text-spacemate-brandTeal font-medium hover:underline">
                    {t.backToLogin}
                  </button>
                </p>
              </form>
            )}

            {tab === 'login' && !forgotPwd && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="label block mb-1.5">{t.email}</label>
                  <input
                    type="email" value={loginEmail}
                    onChange={e => { setLoginEmail(e.target.value); setError('') }}
                    required placeholder="email@example.com"
                    className="input-field w-full"
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="label">{t.password}</label>
                    <button
                      type="button"
                      onClick={() => { setForgotPwd(true); setError(''); setSuccess(''); setForgotEmail(loginEmail) }}
                      className="text-xs text-spacemate-brandTeal hover:underline"
                    >{t.forgotPwd}</button>
                  </div>
                  <input
                    type="password" value={loginPwd}
                    onChange={e => { setLoginPwd(e.target.value); setError('') }}
                    required placeholder="••••••••"
                    className="input-field w-full"
                  />
                </div>
                {error && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                    <p className="text-amber-700 text-xs">{error}</p>
                  </div>
                )}
                <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed">
                  {loading ? t.loggingIn : t.login}
                </button>
                <p className="text-center text-sm text-gray-400 pt-1">
                  {t.noAccount}{' '}
                  <button type="button" onClick={() => switchTab('signup')} className="text-spacemate-brandTeal font-medium hover:underline">
                    {t.signupFree}
                  </button>
                </p>
              </form>
            )}

            {/* ── SIGNUP SUCCESS ── */}
            {tab === 'signup' && success && (
              <div className="text-center py-4 space-y-4">
                <div><span className="msym" style={{ fontSize: 44, color: '#02402e', fontVariationSettings: "'wght' 300, 'FILL' 0" }}>mail</span></div>
                <h3 className="text-lg font-bold text-spacemate-brandDark">{t.checkEmailTitle}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {t.checkEmailSent}<br/>
                  <span className="font-semibold text-spacemate-brandDark">{success}</span>
                </p>
                <p className="text-xs text-gray-400 leading-relaxed">
                  {t.checkEmailAction}<br/>
                  {t.checkEmailSpam}
                </p>
                <button
                  type="button"
                  onClick={() => { setSuccess(''); switchTab('login') }}
                  className="btn-primary w-full"
                >
                  {t.backToLogin}
                </button>
              </div>
            )}

            {/* ── SIGNUP FORM ── */}
            {tab === 'signup' && !success && (
              <form onSubmit={handleSignup} className="space-y-4">
                <div>
                  <label className="label block mb-1.5">{t.fullNameLogin}</label>
                  <input
                    type="text" value={signName}
                    onChange={e => { setSignName(e.target.value); setError('') }}
                    required placeholder={t.fullNamePlaceholder}
                    className="input-field w-full"
                  />
                </div>
                <div>
                  <label className="label block mb-1.5">{t.email}</label>
                  <input
                    type="email" value={signEmail}
                    onChange={e => { setSignEmail(e.target.value); setError('') }}
                    required placeholder="email@example.com"
                    className="input-field w-full"
                  />
                </div>
                <div>
                  <label className="label block mb-1.5">{t.password}</label>
                  <input
                    type="password" value={signPwd}
                    onChange={e => { setSignPwd(e.target.value); setError('') }}
                    required placeholder={t.min8}
                    className="input-field w-full"
                  />
                </div>
                <div>
                  <label className="label block mb-1.5">{t.confirmPwd}</label>
                  <input
                    type="password" value={signPwd2}
                    onChange={e => { setSignPwd2(e.target.value); setError('') }}
                    required placeholder="••••••••"
                    className="input-field w-full"
                  />
                </div>
                {error && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                    <p className="text-amber-700 text-xs">{error}</p>
                  </div>
                )}
                {success && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                    <p className="text-green-700 text-xs">{success}</p>
                  </div>
                )}
                <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed">
                  {loading ? t.signingUpLong : t.signupFree}
                </button>
                <p className="text-center text-sm text-gray-400 pt-1">
                  {t.haveAccount}{' '}
                  <button type="button" onClick={() => switchTab('login')} className="text-spacemate-brandTeal font-medium hover:underline">
                    {t.login}
                  </button>
                </p>
              </form>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-gray-300 mt-6">
          © 2026 Space Works Co., Ltd. ·{' '}
          <Link href={localeHref('/privacy', locale)} className="hover:underline">{t.privacy}</Link>
        </p>
      </div>
    </div>
  )
}
