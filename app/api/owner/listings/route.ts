import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const email = searchParams.get('email')
    if (!email) return NextResponse.json({ listings: [] })

    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('submissions')
      .select('id, title, type, price, status, contact_email, contact_name, district, province, package_type, expires_at, created_at, address, bedrooms, bathrooms, size')
      .eq('contact_email', email)
      .order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json({ listings: data ?? [] })
  } catch {
    return NextResponse.json({ listings: [] })
  }
}
