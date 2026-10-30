import { unstable_cache } from 'next/cache'
import { createServerClient } from '@/lib/supabase'
import {
  SITE_SETTINGS_TAG, normaliseCompany, normaliseEmailTemplates, normaliseAlertEmail,
  type CompanyInfo, type EmailTemplate,
} from '@/lib/site-config'

// Server side of lib/site-config: reads the values Settings saves. Server only.
export * from '@/lib/site-config'

const loadStored = unstable_cache(
  async (key: string): Promise<unknown> => {
    const { data, error } = await createServerClient()
      .from('site_settings').select('value').eq('key', key).maybeSingle()
    if (error) throw error
    return data?.value ?? null
  },
  ['site-setting'],
  { revalidate: 300, tags: [SITE_SETTINGS_TAG] },
)

// A failed read falls back to the defaults: the footer and the emails must
// still work when the settings table cannot be read. It is logged, not hidden.
async function read(key: string): Promise<unknown> {
  try {
    return await loadStored(key)
  } catch (err) {
    // A PostgrestError is not an Error instance, so String() would print [object Object].
    const msg = (err as { message?: string } | null)?.message ?? String(err)
    console.error(`[site-settings] ${key}:`, msg)
    return null
  }
}

export async function getCompanyInfo(): Promise<CompanyInfo> {
  return normaliseCompany(await read('company_info'))
}

export async function getEmailTemplates(): Promise<EmailTemplate[]> {
  return normaliseEmailTemplates(await read('email_templates'))
}

export async function getAlertEmail(): Promise<string> {
  return normaliseAlertEmail(await read('alert_email'))
}
