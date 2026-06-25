import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') // 'all' | 'pending' | 'approved' | 'rejected'
    const page = parseInt(searchParams.get('page') || '1')
    const perPage = 20

    const supabase = createServerClient()
    let query = supabase
      .from('submissions')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page - 1) * perPage, page * perPage - 1)

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    const { data, count, error } = await query
    if (error) throw error

    return NextResponse.json({ data: data ?? [], total: count ?? 0, page, perPage })
  } catch (err) {
    console.error('submissions fetch error:', err)
    return NextResponse.json({ data: [], total: 0, page: 1, perPage: 20 }, { status: 500 })
  }
}
