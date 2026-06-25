import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET() {
  try {
    const supabase = createServerClient()

    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const [
      { count: total },
      { count: pending },
      { count: approved },
      { count: rejected },
      { count: thisMonth },
      { data: byTypeRaw },
      { count: staleCount },
      { data: recentActivity },
    ] = await Promise.all([
      supabase.from('submissions').select('*', { count: 'exact', head: true }),
      supabase.from('submissions').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('submissions').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
      supabase.from('submissions').select('*', { count: 'exact', head: true }).eq('status', 'rejected'),
      supabase.from('submissions').select('*', { count: 'exact', head: true })
        .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
      supabase.from('submissions').select('type, status'),
      supabase.from('submissions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved')
        .lt('updated_at', sixMonthsAgo.toISOString()),
      supabase.from('submissions')
        .select('id, title, type, status, contact_name, created_at, updated_at')
        .order('created_at', { ascending: false })
        .limit(6),
    ])

    // Count by type
    const typeMap: Record<string, number> = {}
    for (const row of byTypeRaw ?? []) {
      const t = row.type || 'Other'
      typeMap[t] = (typeMap[t] || 0) + 1
    }

    // Unique contact_emails (for user count proxy)
    const { data: emailRows } = await supabase
      .from('submissions')
      .select('contact_email')
    const uniqueUsers = new Set((emailRows ?? []).map(r => r.contact_email).filter(Boolean)).size

    return NextResponse.json({
      total: total ?? 0,
      pending: pending ?? 0,
      approved: approved ?? 0,
      rejected: rejected ?? 0,
      thisMonth: thisMonth ?? 0,
      byType: typeMap,
      staleCount: staleCount ?? 0,
      uniqueUsers,
      recentActivity: recentActivity ?? [],
    })
  } catch (err) {
    console.error('stats error:', err)
    return NextResponse.json({
      total: 0, pending: 0, approved: 0, rejected: 0, thisMonth: 0,
      byType: {}, staleCount: 0, uniqueUsers: 0, recentActivity: [],
    }, { status: 500 })
  }
}
