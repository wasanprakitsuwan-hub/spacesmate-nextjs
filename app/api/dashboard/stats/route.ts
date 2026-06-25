import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET() {
  try {
    const supabase = createServerClient()

    const [
      { count: total },
      { count: pending },
      { count: approved },
      { count: thisMonth },
    ] = await Promise.all([
      supabase.from('submissions').select('*', { count: 'exact', head: true }),
      supabase.from('submissions').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('submissions').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
      supabase.from('submissions').select('*', { count: 'exact', head: true })
        .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
    ])

    return NextResponse.json({ total: total ?? 0, pending: pending ?? 0, approved: approved ?? 0, thisMonth: thisMonth ?? 0 })
  } catch (err) {
    console.error('stats error:', err)
    return NextResponse.json({ total: 0, pending: 0, approved: 0, thisMonth: 0 }, { status: 500 })
  }
}
