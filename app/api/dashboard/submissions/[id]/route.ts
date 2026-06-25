import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { status } = await req.json()
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const supabase = createServerClient()
    const { error } = await supabase
      .from('submissions')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', params.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('submission update error:', err)
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }
}
