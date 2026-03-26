import { createClient } from '@supabase/supabase-js'

// 서비스 롤 클라이언트 — RLS 우회, 서버 사이드 전용
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)
