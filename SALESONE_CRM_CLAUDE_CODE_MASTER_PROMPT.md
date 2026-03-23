# SalesONE-CRM — Claude Code 전용 마스터 프롬프트 v2.0
# "모든 영업인의 고객 관리를, 하나의 흐름으로"

---

## 📌 이 문서의 사용 방법

이 파일은 Claude Code에게 프로젝트 전체 컨텍스트를 제공하는 **단일 진실 소스(Single Source of Truth)** 입니다.
Claude Code 세션 시작 시 반드시 이 파일을 먼저 읽고, 지시된 에이전트/스킬 파일을 추가로 로드한 뒤 작업을 시작하세요.

```
프로젝트 루트에서 실행:
claude --context SALESONE_CRM_CLAUDE_CODE_MASTER_PROMPT.md
```

---

## 🎯 프로젝트 개요

| 항목 | 내용 |
|------|------|
| **서비스명** | SalesONE-CRM |
| **슬로건** | 모든 영업인의 고객 관리를, 하나의 흐름으로 |
| **타입** | B2C SaaS CRM (웹 우선, 앱 연동 준비) |
| **타겟** | 보험설계사, 부동산 중개인, IT 영업, 자동차 영업, 프리랜서 등 모든 영업직 |
| **현재 단계** | Phase 1 — 웹 서비스 (앱 API 연동 설계 포함) |

---

## 🛠 기술 스택 (확정)

### 웹 (현재)
| 레이어 | 기술 | 비고 |
|--------|------|------|
| Frontend | Next.js 14 (App Router) + TypeScript | 서버 컴포넌트 우선 |
| 스타일링 | Tailwind CSS + shadcn/ui | 커스텀 테마 적용 |
| Backend | Next.js API Routes | REST + 추후 tRPC 전환 고려 |
| Database | Supabase (PostgreSQL) | RLS 필수 |
| 인증 | Supabase Auth + Google OAuth | JWT 기반 |
| 드래그앤드롭 | @hello-pangea/dnd | SSR 호환 |
| 배포 | Vercel | Edge Functions 활용 |
| 상태관리 | Zustand (클라이언트 전역 상태) | |
| 폼 | React Hook Form + Zod | 유효성 검사 |
| 날짜 | date-fns | 경량 |
| 알림 | Sonner (toast) | |

### 앱 연동 준비 (설계만, 구현 추후)
| 항목 | 기술 | 비고 |
|------|------|------|
| 모바일 앱 | React Native (Expo) | 웹 로직 재사용 |
| API 계층 | REST API v1 (현재) → v2 OpenAPI Spec | 앱에서 동일 엔드포인트 사용 |
| 실시간 | Supabase Realtime | 앱 푸시 알림 연동 |
| 인증 공유 | Supabase Auth JWT | 웹/앱 동일 세션 |
| 딥링크 | Universal Links / App Links 준비 | URL 구조 설계 시 반영 |

---

## 📁 프로젝트 전체 구조

```
salesone-crm/
├── CLAUDE.md                          # Claude Code 프로젝트 규칙
├── .env.local                         # 환경변수
├── .env.example                       # 환경변수 템플릿 (커밋용)
├── next.config.ts                     # Next.js 설정
├── tailwind.config.ts                 # 테마 커스터마이징
├── components.json                    # shadcn/ui 설정
├── tsconfig.json
├── package.json
│
├── .claude/
│   ├── agents/
│   │   ├── 00-orchestrator.md         # 전체 조율 에이전트
│   │   ├── 01-database.md             # DB 스키마/마이그레이션 전담
│   │   ├── 02-auth.md                 # 인증/보안 전담
│   │   ├── 03-api.md                  # API Routes 전담
│   │   ├── 04-frontend-layout.md      # 레이아웃/네비게이션 전담
│   │   ├── 05-frontend-customers.md   # 고객 관리 UI 전담
│   │   ├── 06-frontend-pipeline.md    # 파이프라인 칸반 전담
│   │   ├── 07-frontend-dashboard.md   # 대시보드/KPI 전담
│   │   ├── 08-frontend-team.md        # 팀 관리 UI 전담
│   │   ├── 09-frontend-settings.md    # 설정 페이지 전담
│   │   ├── 10-notifications.md        # 알림 시스템 전담
│   │   └── 11-mobile-api-bridge.md    # 앱 연동 API 설계 전담
│   │
│   └── skills/
│       ├── skill-supabase-rls.md      # RLS 정책 작성 패턴
│       ├── skill-api-pattern.md       # API Route 표준 패턴
│       ├── skill-form-pattern.md      # 폼 + Zod 표준 패턴
│       ├── skill-kanban-dnd.md        # 드래그앤드롭 구현 패턴
│       ├── skill-optimistic-ui.md     # 낙관적 업데이트 패턴
│       ├── skill-responsive.md        # 반응형 구현 패턴
│       ├── skill-auth-guard.md        # 인증 보호 패턴
│       ├── skill-empty-state.md       # 빈 상태 UI 패턴
│       ├── skill-infinite-scroll.md   # 무한 스크롤 패턴
│       └── skill-app-bridge.md        # 앱 연동 API 설계 패턴
│
├── supabase/
│   └── migrations/
│       ├── 001_initial_schema.sql
│       ├── 002_pipeline_stages.sql
│       ├── 003_team_tables.sql
│       ├── 004_seed_data.sql
│       └── 005_api_keys.sql           # 앱 연동용 API 키 테이블
│
└── src/
    ├── middleware.ts
    ├── types/                         # 전역 타입 정의
    │   ├── index.ts                   # 통합 export
    │   ├── customer.ts
    │   ├── pipeline.ts
    │   ├── team.ts
    │   ├── notification.ts
    │   └── api.ts                     # API 요청/응답 타입
    │
    ├── app/
    │   ├── layout.tsx
    │   ├── auth/
    │   │   ├── page.tsx
    │   │   └── callback/route.ts
    │   └── dashboard/
    │       ├── layout.tsx
    │       ├── page.tsx               # 대시보드
    │       ├── customers/
    │       │   ├── page.tsx
    │       │   ├── CustomersClient.tsx
    │       │   └── [id]/page.tsx
    │       ├── pipeline/page.tsx
    │       ├── reminders/page.tsx
    │       ├── team/
    │       │   ├── page.tsx
    │       │   ├── pipeline/page.tsx
    │       │   └── report/page.tsx
    │       └── settings/page.tsx
    │
    ├── api/
    │   └── v1/                        # API v1 (웹 + 앱 공용)
    │       ├── customers/
    │       │   ├── route.ts
    │       │   ├── reorder/route.ts
    │       │   └── [id]/
    │       │       ├── route.ts
    │       │       ├── stage/route.ts
    │       │       ├── interactions/
    │       │       │   ├── route.ts
    │       │       │   └── [iid]/route.ts
    │       │       └── reminders/
    │       │           ├── route.ts
    │       │           └── [rid]/route.ts
    │       ├── pipeline-stages/
    │       │   ├── route.ts
    │       │   └── [id]/route.ts
    │       ├── teams/
    │       │   ├── route.ts
    │       │   ├── join-request/route.ts
    │       │   └── [id]/
    │       │       ├── route.ts
    │       │       ├── members/
    │       │       │   ├── route.ts
    │       │       │   └── [uid]/
    │       │       │       ├── route.ts
    │       │       │       ├── accept/route.ts
    │       │       │       └── reject/route.ts
    │       │       ├── invite/route.ts
    │       │       ├── stats/route.ts
    │       │       └── report/route.ts
    │       ├── notifications/
    │       │   ├── route.ts
    │       │   └── read-all/route.ts
    │       └── auth/logout/route.ts
    │
    ├── components/
    │   ├── layout/
    │   │   ├── Sidebar.tsx
    │   │   ├── BottomTabBar.tsx
    │   │   └── Header.tsx
    │   ├── customers/
    │   │   ├── CustomerForm.tsx
    │   │   ├── CustomerCard.tsx
    │   │   ├── CustomerTable.tsx
    │   │   ├── StageBadge.tsx
    │   │   └── InteractionTimeline.tsx
    │   ├── pipeline/
    │   │   ├── KanbanBoard.tsx
    │   │   └── KanbanCard.tsx
    │   ├── dashboard/
    │   │   ├── KpiCard.tsx
    │   │   ├── ActivityFeed.tsx
    │   │   └── StageChart.tsx
    │   ├── reminders/
    │   │   └── ReminderItem.tsx
    │   ├── settings/
    │   │   └── PipelineStagesEditor.tsx
    │   ├── team/
    │   │   ├── TeamDashboard.tsx
    │   │   ├── MemberPipelineView.tsx
    │   │   ├── TeamReport.tsx
    │   │   └── MemberStatsTable.tsx
    │   ├── notifications/
    │   │   └── NotificationDropdown.tsx
    │   └── ui/                        # shadcn/ui 컴포넌트
    │
    ├── hooks/                         # 커스텀 훅
    │   ├── useCustomers.ts
    │   ├── usePipelineStages.ts
    │   ├── useNotifications.ts
    │   ├── useTeam.ts
    │   └── useDebounce.ts
    │
    ├── store/                         # Zustand 스토어
    │   ├── useCustomerStore.ts
    │   ├── usePipelineStore.ts
    │   └── useNotificationStore.ts
    │
    └── lib/
        ├── supabase.ts                # 브라우저 클라이언트
        ├── supabase-server.ts         # 서버 클라이언트
        ├── api-client.ts              # fetch 래퍼 (웹/앱 공용 로직)
        ├── validations/               # Zod 스키마
        │   ├── customer.ts
        │   ├── pipeline.ts
        │   └── team.ts
        └── utils/
            ├── format.ts              # 날짜, 전화번호 포맷
            ├── constants.ts           # 상수값
            └── cn.ts                  # classnames 유틸
```

---

## 🗄 데이터베이스 스키마 (전체 + 앱 연동 확장)

### 환경변수 (.env.local)
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
SUPABASE_SECRET_KEY=your_secret_key

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# 앱 연동 (추후)
# EXPO_PUBLIC_API_URL=https://api.salesone.io
# PUSH_NOTIFICATION_KEY=your_fcm_key
```

### 001_initial_schema.sql
```sql
-- customers 테이블
CREATE TABLE customers (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID REFERENCES auth.users NOT NULL,
  name                TEXT NOT NULL,
  phone               TEXT NOT NULL,
  email               TEXT,
  birth_date          DATE,
  gender              TEXT CHECK (gender IN ('남', '여')),
  stage               TEXT NOT NULL DEFAULT 'DB배정',
  source              TEXT,
  tags                TEXT[] DEFAULT '{}',
  memo                TEXT,
  company             TEXT,
  job_title           TEXT,
  order_index         INTEGER DEFAULT 0,
  is_blacklist        BOOLEAN DEFAULT FALSE,
  deleted_at          TIMESTAMPTZ,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- interactions 테이블
CREATE TABLE interactions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id      UUID REFERENCES customers NOT NULL,
  user_id          UUID REFERENCES auth.users NOT NULL,
  type             TEXT NOT NULL
    CHECK (type IN ('전화', '문자', '이메일', '방문', '화상', '기타')),
  content          TEXT,
  duration         INTEGER,
  stage_changed_to TEXT,
  occurred_at      TIMESTAMPTZ DEFAULT NOW()
);

-- reminders 테이블
CREATE TABLE reminders (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers NOT NULL,
  user_id     UUID REFERENCES auth.users NOT NULL,
  due_date    DATE NOT NULL,
  memo        TEXT,
  is_done     BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- updated_at 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS 활성화
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

-- RLS 정책
CREATE POLICY "본인 데이터만" ON customers
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "본인 데이터만" ON interactions
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "본인 데이터만" ON reminders
  FOR ALL USING (auth.uid() = user_id);

-- 인덱스 (성능)
CREATE INDEX idx_customers_user_id ON customers(user_id);
CREATE INDEX idx_customers_stage ON customers(stage);
CREATE INDEX idx_customers_deleted_at ON customers(deleted_at);
CREATE INDEX idx_interactions_customer_id ON interactions(customer_id);
CREATE INDEX idx_interactions_occurred_at ON interactions(occurred_at DESC);
CREATE INDEX idx_reminders_user_id_due_date ON reminders(user_id, due_date);
```

### 002_pipeline_stages.sql
```sql
CREATE TABLE pipeline_stages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users NOT NULL,
  name        TEXT NOT NULL,
  color       TEXT NOT NULL DEFAULT '#94A3B8',
  order_index INTEGER NOT NULL,
  stage_type  TEXT NOT NULL DEFAULT 'pipeline'
    CHECK (stage_type IN ('pipeline', 'escape')),
  is_default  BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE pipeline_stages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "본인 데이터만" ON pipeline_stages
  FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_pipeline_stages_user_id ON pipeline_stages(user_id);
```

### 003_team_tables.sql
```sql
CREATE TABLE teams (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  manager_id  UUID REFERENCES auth.users NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE team_members (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id     UUID REFERENCES teams NOT NULL,
  user_id     UUID REFERENCES auth.users NOT NULL,
  role        TEXT NOT NULL DEFAULT 'member'
    CHECK (role IN ('manager', 'member')),
  status      TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'active', 'rejected')),
  invited_by  UUID REFERENCES auth.users,
  joined_at   TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

CREATE TABLE notifications (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES auth.users NOT NULL,
  from_user_id  UUID REFERENCES auth.users,
  type          TEXT NOT NULL
    CHECK (type IN (
      'team_join_request',
      'team_invite',
      'team_accepted',
      'team_rejected',
      'team_disconnected'
    )),
  team_id       UUID REFERENCES teams,
  is_read       BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "팀 조회" ON teams
  USING (auth.uid() = manager_id OR
    id IN (
      SELECT team_id FROM team_members
      WHERE user_id = auth.uid() AND status = 'active'
    ));

CREATE POLICY "팀원 조회" ON team_members
  USING (
    team_id IN (
      SELECT team_id FROM team_members
      WHERE user_id = auth.uid() AND status = 'active'
    ) OR user_id = auth.uid()
  );

CREATE POLICY "본인 알림만" ON notifications
  FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_team_members_team_id ON team_members(team_id);
CREATE INDEX idx_team_members_user_id ON team_members(user_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id, is_read);
```

### 004_seed_data.sql
```sql
-- 첫 로그인 시 /auth/callback 에서 자동 실행되는 기본 단계
-- 아래는 참고용. 실제 삽입은 API에서 처리.

-- 영업 파이프라인 (stage_type = 'pipeline') 기본 10단계
-- 이탈 관리 (stage_type = 'escape') 기본 5단계
-- 상세 목록은 /auth/callback/route.ts 참조
```

### 005_api_keys.sql (앱 연동 준비)
```sql
-- 앱에서 사용할 API 키 관리 (추후 모바일 앱 연동 시 활성화)
CREATE TABLE api_keys (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users NOT NULL,
  key_hash    TEXT NOT NULL UNIQUE,     -- bcrypt 해시된 키
  name        TEXT NOT NULL,            -- "iOS 앱", "Android 앱"
  last_used   TIMESTAMPTZ,
  expires_at  TIMESTAMPTZ,
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "본인 API 키만" ON api_keys
  FOR ALL USING (auth.uid() = user_id);
```

---

## 🎨 디자인 시스템

```typescript
// tailwind.config.ts 커스텀 컬러
const colors = {
  brand: {
    navy:      '#0F172A',   // 메인 (사이드바, 헤더)
    sky:       '#38BDF8',   // 포인트 (버튼, 링크)
    skyHover:  '#0EA5E9',
  },
  surface: {
    bg:        '#F8FAFC',   // 페이지 배경
    card:      '#FFFFFF',   // 카드 배경
    border:    '#E2E8F0',   // 구분선
  },
  text: {
    primary:   '#1E293B',   // 주요 텍스트
    secondary: '#64748B',   // 보조 텍스트
    muted:     '#94A3B8',   // 비활성
  },
  state: {
    success:   '#10B981',
    warning:   '#F59E0B',
    danger:    '#EF4444',
    info:      '#38BDF8',
  }
}
```

### 단계별 색상 팔레트 (파이프라인)
```typescript
// 영업 파이프라인
const PIPELINE_DEFAULTS = [
  { name: '리드배정',  color: '#94A3B8', order_index: 0 },
  { name: '초기연락',  color: '#60A5FA', order_index: 1 },
  { name: '니즈파악',  color: '#A78BFA', order_index: 2 },
  { name: '상담중',    color: '#C084FC', order_index: 3 },
  { name: '제안완료',  color: '#FBBF24', order_index: 4 },
  { name: '협상중',    color: '#F97316', order_index: 5 },
  { name: '계약완료',  color: '#10B981', order_index: 6 },
  { name: '사후관리',  color: '#14B8A6', order_index: 7 },
  { name: '추가영업',  color: '#6366F1', order_index: 8 },
  { name: '재터치',    color: '#64748B', order_index: 9 },
]

// 이탈 관리
const ESCAPE_DEFAULTS = [
  { name: '연락불가',    color: '#EF4444', order_index: 0 },
  { name: '고민중',      color: '#F59E0B', order_index: 1 },
  { name: '연락두절',    color: '#9CA3AF', order_index: 2 },
  { name: '거절',        color: '#EC4899', order_index: 3 },
  { name: '블랙리스트',  color: '#374151', order_index: 4 },
]
```

---

## 🔐 인증 시스템

### middleware.ts
```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // 보호된 경로
  if (pathname.startsWith('/dashboard')) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      { cookies: { getAll: () => request.cookies.getAll() } }
    )
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.redirect(new URL('/auth', request.url))
    }
  }
  
  // 이미 로그인한 사용자가 /auth 접근 시
  if (pathname === '/auth') {
    // 세션 체크 후 /dashboard로 리다이렉트
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/auth']
}
```

### src/lib/supabase.ts
```typescript
import { createBrowserClient } from '@supabase/ssr'

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  )
```

### src/lib/supabase-server.ts
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const createServerSupabaseClient = async () => {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        }
      }
    }
  )
}
```

### /auth/callback/route.ts (첫 로그인 기본 단계 생성)
```typescript
import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { PIPELINE_DEFAULTS, ESCAPE_DEFAULTS } from '@/lib/utils/constants'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  
  if (code) {
    const supabase = await createServerSupabaseClient()
    const { data: { session } } = await supabase.auth.exchangeCodeForSession(code)
    
    if (session) {
      // 첫 로그인 감지: pipeline_stages 레코드 수 확인
      const { count } = await supabase
        .from('pipeline_stages')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', session.user.id)
      
      if (count === 0) {
        // 기본 파이프라인 단계 생성
        const stages = [
          ...PIPELINE_DEFAULTS.map(s => ({ ...s, user_id: session.user.id, stage_type: 'pipeline', is_default: true })),
          ...ESCAPE_DEFAULTS.map(s => ({ ...s, user_id: session.user.id, stage_type: 'escape', is_default: true })),
        ]
        await supabase.from('pipeline_stages').insert(stages)
      }
    }
  }
  
  return NextResponse.redirect(new URL('/dashboard', request.url))
}
```

---

## 📐 레이아웃 시스템

### dashboard/layout.tsx
```typescript
// PC: 사이드바(w-52) + 헤더(h-16) + 메인(ml-52, pt-16)
// 모바일: 헤더(h-16) + 메인(pt-16, pb-16) + 하단탭바

export default async function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-surface-bg">
      <Sidebar />                              {/* hidden md:flex */}
      <Header />                               {/* fixed top-0 */}
      <main className="md:ml-52 pt-16 pb-16 md:pb-0 min-h-screen">
        {children}
      </main>
      <BottomTabBar />                         {/* md:hidden */}
    </div>
  )
}
```

### Sidebar.tsx
- **위치**: `fixed left-0 top-0 h-screen w-52 z-40`
- **배경**: `bg-brand-navy`
- **hidden md:flex flex-col** (모바일 숨김)
- 로고 영역 (상단 h-16, 브랜드 컬러)
- 메뉴 네비게이션 (중간, flex-1)
- 사용자 정보 + 로그아웃 (하단)
- **메뉴 클릭 시 반드시**: `router.push(href); router.refresh()`

### BottomTabBar.tsx
- **위치**: `fixed bottom-0 left-0 right-0 z-40`
- **md:hidden** (PC 숨김)
- 5개 탭: 홈/고객/파이프라인/리마인더/설정

### Header.tsx
- **위치**: `fixed top-0 left-0 right-0 md:left-52 z-30 h-16`
- 좌: 현재 페이지 제목
- 우: 알림 벨(🔔 + 배지) + 사용자 아바타

---

## 📋 페이지 & 기능 상세 명세

---

### PAGE 1: 로그인 (/auth)

```typescript
// 구성 요소
- 브랜드 로고 + 슬로건
- "Google로 계속하기" 버튼
- 서비스 소개 문구 (3줄 이내)

// 동작
- supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: '/auth/callback' } })
- 이미 로그인 시 → /dashboard 리다이렉트
```

---

### PAGE 2: 대시보드 (/dashboard)

```typescript
export const dynamic = 'force-dynamic'
export const revalidate = 0

// KPI 카드 4개 (서버에서 병렬 fetch)
const [totalCustomers, newThisMonth, contractsThisMonth, todayReminders] = 
  await Promise.all([
    // 전체 고객 수 (soft delete 제외)
    supabase.from('customers').select('id', { count: 'exact', head: true })
      .eq('user_id', userId).is('deleted_at', null),
    
    // 이번달 신규
    supabase.from('customers').select('id', { count: 'exact', head: true })
      .eq('user_id', userId).is('deleted_at', null)
      .gte('created_at', startOfMonth),
    
    // 이번달 계약 완료
    supabase.from('customers').select('id', { count: 'exact', head: true })
      .eq('user_id', userId).eq('stage', '계약완료').is('deleted_at', null)
      .gte('updated_at', startOfMonth),
    
    // 오늘 리마인더
    supabase.from('reminders').select('id', { count: 'exact', head: true })
      .eq('user_id', userId).eq('due_date', today).eq('is_done', false),
  ])

// 최근 활동 피드 (최근 고객 5명 + 최근 상담 5건)
// 단계별 고객 현황 (파이프라인 단계 × 고객 수)
```

**KPI 카드 UI**
```
┌──────────┬──────────┬──────────┬──────────┐
│ 👥       │ ✨       │ 🤝       │ 🔔       │
│ 전체고객  │ 이번달신규│ 이번달계약│ 오늘리마  │
│ 248명    │ 12명     │ 3건      │ 5개      │
└──────────┴──────────┴──────────┴──────────┘
```

---

### PAGE 3: 고객 관리 (/dashboard/customers)

```typescript
export const dynamic = 'force-dynamic'
```

#### 고객 목록 (CustomersClient.tsx — 클라이언트 컴포넌트)

**상태 관리**
```typescript
const [customers, setCustomers] = useState<Customer[]>([])
const [search, setSearch] = useState('')
const [stageFilter, setStageFilter] = useState<string>('전체')
const [sortField, setSortField] = useState<'name' | 'stage' | 'last_contact' | 'created_at'>('created_at')
const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
const [isFormOpen, setIsFormOpen] = useState(false)
const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
```

**검색 + 필터 로직**
```typescript
// 이름 OR 전화번호 실시간 검색 (debounce 300ms)
// 단계 필터: pipeline_stages에서 동적 로드 (전체 + 각 단계)
// 정렬: 컬럼 헤더 클릭으로 토글
```

**테이블 (PC)**
```
| 체크박스 | 이름 | 전화번호 | 회사 | 단계(배지) | 최근연락일 | 리마인더 | 메모 | → |
```

**카드 (모바일)**
```
이름 + 단계배지
전화번호 | 회사
최근연락: N일 전
```

#### CustomerForm.tsx

**PC**: 오른쪽에서 슬라이드인 패널 (w-96, fixed right-0)
**모바일**: 풀스크린 모달

**필드 정의**
```typescript
// Zod 스키마
const customerSchema = z.object({
  name:      z.string().min(1, '이름을 입력하세요'),
  phone:     z.string().regex(/^010-\d{4}-\d{4}$/, '010-0000-0000 형식'),
  email:     z.string().email().optional().or(z.literal('')),
  birth_year: z.number().min(1900).max(2010).optional(),
  birth_month: z.number().min(1).max(12).optional(),
  birth_day:  z.number().min(1).max(31).optional(),
  gender:    z.enum(['남', '여']).optional(),
  stage:     z.string().min(1),              // pipeline stage만
  source:    z.enum(['지인소개','SNS','블로그','콜드콜','기존고객','전시회','기타']).optional(),
  company:   z.string().optional(),
  job_title: z.string().optional(),
  memo:      z.string().optional(),
})
```

**전화번호 자동 포맷팅**: 숫자 입력 시 010-0000-0000 자동 변환

---

### PAGE 4: 고객 상세 (/dashboard/customers/[id])

```typescript
export const dynamic = 'force-dynamic'
```

**레이아웃**
```
PC:  [고객 기본정보 카드 (40%)] | [탭 영역 (60%)]
모바일: [기본정보] → [탭 영역] 세로 스택
```

**기본정보 카드**
- 이름 (xl, font-bold)
- 연락처 (📞 클릭 시 tel: 링크 — 앱 연동 준비)
- 이메일 (📧)
- 생년월일 / 성별 / 나이 자동 계산
- 단계 드롭다운: 변경 시 PATCH /api/v1/customers/[id]/stage + 자동 interaction 기록
- 유입경로, 회사명, 직책
- 태그 (클릭 편집)
- 메모 (인라인 편집)
- [정보 수정] [삭제] 버튼

**탭 1: 상담이력**
```typescript
// 타임라인 (최신순)
// 유형 아이콘 맵
const INTERACTION_ICONS = {
  '전화': '📞', '문자': '💬', '이메일': '📧',
  '방문': '🏢', '화상': '💻', '기타': '📝'
}

// 추가 폼 필드
- type: select (6가지)
- content: textarea
- duration: number (분, optional)
- occurred_at: datetime-local (기본값: now)

// 단계 변경 시 자동 기록
- stage_changed_to 필드 자동 설정
```

**탭 2: 리마인더**
```typescript
// 미완료 (due_date 오름차순)
// 완료 (collapsed, 별도 섹션)
// 지난 미완료 → red text + red dot

// 추가 폼
- due_date: date input
- memo: text input
```

---

### PAGE 5: 파이프라인 (/dashboard/pipeline)

```typescript
export const dynamic = 'force-dynamic'
```

#### KanbanBoard.tsx

**데이터 구조**
```typescript
interface KanbanData {
  pipelineColumns: KanbanColumn[]   // stage_type = 'pipeline'
  escapeColumns: KanbanColumn[]     // stage_type = 'escape'
}

interface KanbanColumn {
  id: string
  name: string
  color: string
  customers: Customer[]
}
```

**레이아웃**
```
[영업 파이프라인]
┌──────┬──────┬──────┬──────┬──────┬ ... ┐
│리드배정│초기연락│니즈파악│상담중 │제안완료│     │
│ (3)  │ (7)  │ (2)  │ (5)  │ (1)  │     │
│      │      │      │      │      │     │
│card  │card  │      │card  │      │     │
└──────┴──────┴──────┴──────┴──────┴─────┘

─ ─ ─ ─ 이탈 관리 ─ ─ ─ ─ ─ ─ ─ ─ ─ ─

┌──────┬──────┬──────┬──────┬─────────┐
│연락불가│고민중 │연락두절│거절  │블랙리스트│
└──────┴──────┴──────┴──────┴─────────┘
```

**드래그앤드롭 (DragDropContext)**
```typescript
onDragEnd: async (result) => {
  const { source, destination, draggableId } = result
  if (!destination) return
  if (source.droppableId === destination.droppableId &&
      source.index === destination.index) return

  // 1. 컬럼 간 이동 → 단계 변경
  if (source.droppableId !== destination.droppableId) {
    // 낙관적 업데이트 (즉시 UI 반영)
    optimisticUpdateStage(draggableId, destination.droppableId)
    try {
      await fetch(`/api/v1/customers/${draggableId}/stage`, {
        method: 'PATCH',
        body: JSON.stringify({ stage: destination.droppableId })
      })
    } catch {
      rollbackStage()  // 실패 시 롤백
    }
  }

  // 2. 같은 컬럼 내 순서 변경
  if (source.droppableId === destination.droppableId) {
    optimisticReorder(source.droppableId, source.index, destination.index)
    await fetch('/api/v1/customers/reorder', {
      method: 'PATCH',
      body: JSON.stringify({ stageCustomers: reorderedList })
    })
  }
}
```

#### KanbanCard.tsx
```typescript
interface KanbanCardProps {
  customer: Customer
  isDragging: boolean
}

// 카드 내용
- 이름 (font-semibold)
- 전화번호 (text-sm)
- 회사명 (있으면)
- 마지막 상담: N일 전
- 리마인더 있으면: 🔔 YYYY.MM.DD
- 메모 앞 30자 (text-gray-500 text-xs)
- 클릭 → router.push(`/dashboard/customers/${id}`)
```

---

### PAGE 6: 리마인더 (/dashboard/reminders)

```typescript
export const dynamic = 'force-dynamic'

// 필터
const filters = ['오늘', '이번 주', '전체']

// 오늘: due_date = today
// 이번 주: due_date BETWEEN today AND today+7
// 전체: 전체 (완료 포함 또는 미완료만 선택)

// 정렬: due_date ASC (지난 것은 최상단 빨간색)
// 완료 항목: 하단으로 이동, 회색 처리
// 클릭 시 완료/미완료 토글 → PATCH /api/v1/customers/[id]/reminders/[rid]
```

---

### PAGE 7: 팀 관리 (/dashboard/team)

**접근 제어**: 팀장(manager)만 전체 기능 접근. 팀원은 자신의 통계만 확인.

#### 팀 대시보드 (팀장 전용)

**팀원 실적 현황 테이블**
```typescript
// 데이터 집계 방법
const memberStats = await Promise.all(
  activeMembers.map(async (member) => {
    const [customers, newThisMonth, interactions, contracts] = await Promise.all([
      // 전체 고객 수
      supabase.from('customers').select('id', { count: 'exact', head: true })
        .eq('user_id', member.user_id).is('deleted_at', null),
      // 이번달 신규
      ..., // 나머지
    ])
    return { member, stats: { customers, newThisMonth, interactions, contracts } }
  })
)
```

**테이블**
```
| 팀원명 | 전체고객 | 신규(월) | 상담건수 | 계약(월) | 전환율 | 마지막활동 | 상태  |
|--------|---------|---------|---------|---------|--------|----------|-------|
| 이민지  |   48   |    3    |   12   |    2   |  4.2% | 오늘     |       |
| 김철수  |   31   |    0    |    0   |    0   |    -  | 7일전   | ⚠️   |
```

**기간 필터**: 이번 주 / 이번 달 / 직접 선택 (DateRange Picker)

#### 팀원 파이프라인 열람 (/dashboard/team/pipeline)
```typescript
// 팀원 선택 드롭다운
// 선택한 팀원의 pipeline_stages 로드 → 칸반 보드 표시
// isDraggable = false (읽기 전용)
// 우측 상단: "읽기 전용" 배지
```

#### 팀 활동 리포트 (/dashboard/team/report)
```typescript
// 기간 선택 (기본: 이번달)
// 팀원별 활동 유형 차트 (막대 그래프)
// 리마인더 완료율
// 마지막 활동일
```

---

### PAGE 8: 설정 (/dashboard/settings)

**탭 구성**
```
[파이프라인 단계 관리] | [팀 관리]
```

#### 파이프라인 단계 관리 (PipelineStagesEditor.tsx)

```typescript
// 영업 파이프라인 섹션
// - 최소 5개 ~ 최대 12개
// - DnD로 순서 변경
// - 색상 팔레트 (10가지 색상)
// - 삭제 조건 체크

// 고객 있는 단계 삭제 방지
const isStageDeleteable = (stageName: string) => {
  const customerCount = customers.filter(c => c.stage === stageName).length
  return customerCount === 0
}

// 단계 이름 옆 고객 수 표시
// "리드배정 (3명)" → 삭제 버튼 disabled + 툴팁

// 이탈 관리 섹션
// - 최소 1개
// - 연한 빨강 배경 (bg-red-50)
```

#### 팀 관리 섹션

```typescript
// 팀장 뷰 (팀 없음)
<Card>
  <Button onClick={() => createTeam(teamName)}>+ 팀 만들기</Button>
</Card>

// 팀장 뷰 (팀 있음)
<Card>
  <h3>서울 영업팀</h3>
  <TeamMemberList members={members} onKick={handleKick} />
  <InviteForm onInvite={handleInvite} />
</Card>

// 팀원 뷰
<Card>
  <p>현재 소속: {currentTeam?.name || '없음 (독립 영업인)'}</p>
  {!currentTeam && (
    <JoinRequestForm onSubmit={handleJoinRequest} />
  )}
</Card>
```

---

## 🔔 알림 시스템 상세

### NotificationDropdown.tsx

```typescript
// 폴링 방식 (30초마다) 또는 Supabase Realtime
// 읽지 않은 수: 빨간 배지

// 알림 렌더링
const renderNotification = (notif: Notification) => {
  switch (notif.type) {
    case 'team_join_request':
      return (
        <div>
          <span>{notif.from_user.name}님이 팀 합류를 요청했습니다</span>
          <Button onClick={() => accept(notif)}>수락</Button>
          <Button onClick={() => reject(notif)}>거절</Button>
        </div>
      )
    case 'team_invite':
      return <div>{notif.team.name} 팀에 초대받았습니다</div>
    // ...
  }
}
```

---

## 🌐 API 명세 (전체 + 앱 연동 헤더)

### 공통 규칙
```typescript
// 모든 API Route 상단
export const dynamic = 'force-dynamic'

// 인증 헬퍼 (매 API에서 재사용)
async function getAuthSession() {
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('Unauthorized')
  return { supabase, session, userId: session.user.id }
}

// 에러 응답 표준화
const errorResponse = (message: string, status: number) =>
  NextResponse.json({ error: message, success: false }, { status })

const successResponse = (data: unknown, status = 200) =>
  NextResponse.json({ data, success: true }, { status })

// 앱 연동: Authorization: Bearer {token} 헤더도 지원 (추후)
// 현재: Supabase 세션 쿠키 기반
```

### 고객 API
```typescript
// GET /api/v1/customers
// Query: search, stage, sort_field, sort_order, page, limit
// Response: { data: Customer[], total: number, page: number }
// 앱 연동: 동일 엔드포인트 사용 (페이지네이션 필수)

// POST /api/v1/customers
// Body: CustomerCreateInput (Zod 검증)
// Response: { data: Customer }

// GET /api/v1/customers/:id
// Response: { data: Customer & { interactions: Interaction[], reminders: Reminder[] } }

// PATCH /api/v1/customers/:id
// Body: Partial<CustomerCreateInput>

// DELETE /api/v1/customers/:id
// Soft delete: { deleted_at: new Date().toISOString() }

// PATCH /api/v1/customers/:id/stage
// Body: { stage: string }
// 주의: stage는 반드시 사용자의 pipeline_stages에 존재하는 name이어야 함
// 자동으로 interaction 레코드 생성 (stage_changed_to)

// PATCH /api/v1/customers/reorder
// Body: { items: Array<{ id: string, order_index: number }> }
// Upsert order_index for all items in batch
```

### 상담이력 API
```typescript
// GET /api/v1/customers/:id/interactions
// Response: { data: Interaction[] } (occurred_at DESC)

// POST /api/v1/customers/:id/interactions
// Body: { type, content, duration?, occurred_at? }

// DELETE /api/v1/customers/:id/interactions/:iid
// 소유권 확인 필수 (user_id 체크)
```

### 리마인더 API
```typescript
// GET /api/v1/customers/:id/reminders
// GET /api/v1/reminders (전체 리마인더 페이지용)
// Query: filter = 'today' | 'week' | 'all'

// POST /api/v1/customers/:id/reminders
// Body: { due_date: string, memo?: string }

// PATCH /api/v1/customers/:id/reminders/:rid
// Body: { is_done: boolean }

// DELETE /api/v1/customers/:id/reminders/:rid
```

### 파이프라인 API
```typescript
// GET /api/v1/pipeline-stages
// Query: stage_type = 'pipeline' | 'escape' | 'all'
// Response: { data: PipelineStage[] }

// POST /api/v1/pipeline-stages
// Body: { stages: PipelineStageInput[] } — 전체 upsert
// 검증: pipeline 최소 5개, 최대 12개 / escape 최소 1개

// DELETE /api/v1/pipeline-stages/:id
// 검증: 해당 단계에 고객이 있으면 400
const { count } = await supabase
  .from('customers')
  .select('id', { count: 'exact', head: true })
  .eq('stage', stageName)
  .is('deleted_at', null)
if (count > 0) return errorResponse('이 단계에 고객이 있어 삭제할 수 없습니다', 400)
```

### 팀 API
```typescript
// POST /api/v1/teams — 팀 생성 (팀장)
// GET /api/v1/teams/:id — 팀 정보
// PATCH /api/v1/teams/:id — 팀 이름 수정

// POST /api/v1/teams/:id/invite
// Body: { email: string }
// 1. email로 auth.users 검색
// 2. team_members INSERT (status: 'pending')
// 3. notifications INSERT (type: 'team_invite', to: target user)

// POST /api/v1/teams/join-request
// Body: { manager_email: string }
// 1. email로 팀장 확인
// 2. 팀장의 team 찾기
// 3. team_members INSERT (status: 'pending')
// 4. notifications INSERT (type: 'team_join_request', to: manager)

// PATCH /api/v1/teams/:id/members/:uid/accept
// team_members.status = 'active', joined_at = now()
// notifications INSERT (type: 'team_accepted', to: target)

// PATCH /api/v1/teams/:id/members/:uid/reject
// team_members.status = 'rejected'
// notifications INSERT (type: 'team_rejected', to: target)

// DELETE /api/v1/teams/:id/members/:uid
// 주의: customers/interactions/reminders 절대 삭제 금지!
// team_members 레코드만 삭제
// notifications INSERT (type: 'team_disconnected', to: target)

// GET /api/v1/teams/:id/stats — 팀원 실적 (팀장 전용)
// Query: period = 'week' | 'month' | 'custom', start_date?, end_date?

// GET /api/v1/teams/:id/members/:uid/pipeline — 팀원 파이프라인 읽기
// 팀장 권한 확인 필수
// Response: { data: { stages: PipelineStage[], customers: Customer[] } }

// GET /api/v1/teams/:id/report — 팀 활동 리포트
```

### 알림 API
```typescript
// GET /api/v1/notifications
// Response: { data: Notification[], unread_count: number }

// PATCH /api/v1/notifications/read-all
// notifications.is_read = true WHERE user_id = userId
```

---

## 📱 반응형 가이드 (앱 연동 고려)

```
분기점: md = 768px

=== 웹 PC (md 이상) ===
- 사이드바: fixed w-52 (네이비)
- 메인: ml-52 pt-16
- 고객 목록: 테이블 뷰
- 고객 폼: 슬라이드 패널 (right-side)
- 파이프라인: 가로 스크롤 칸반

=== 웹 모바일 (md 미만) ===
- 사이드바: hidden
- 하단 탭바: fixed bottom-0
- 고객 목록: 카드 리스트
- 고객 폼: 풀스크린 모달
- 파이프라인: 가로 스크롤 유지 (min-w-[200px])
- 터치 영역: 최소 44px (Fitts의 법칙)

=== 앱 (추후 React Native) ===
- 동일 API 엔드포인트 사용
- 인증: Supabase Auth (동일 세션)
- 컴포넌트: 웹과 별도 (네이티브 UI)
- 딥링크: salesone://customers/:id
- 푸시 알림: FCM/APNs (notifications 테이블 연동)
- 오프라인: Supabase 로컬 캐시 (추후)
```

---

## ✅ 공통 UX 패턴

### 로딩 상태
```typescript
// 스켈레톤 (테이블/카드)
// 스피너 (버튼 클릭 후)
// 전체 페이지 로딩: next/loading.tsx 파일
```

### 빈 상태 (EmptyState)
```typescript
// 재사용 컴포넌트
<EmptyState
  icon="👥"
  title="아직 고객이 없어요"
  description="첫 고객을 추가해 파이프라인을 시작해보세요"
  action={{ label: '+ 고객 추가', onClick: () => setIsFormOpen(true) }}
/>
```

### 토스트 알림
```typescript
import { toast } from 'sonner'
toast.success('저장되었습니다')
toast.error('오류가 발생했습니다: ' + error.message)
```

### 삭제 확인 모달
```typescript
<AlertDialog>
  <AlertDialogContent>
    <AlertDialogTitle>고객을 삭제하시겠습니까?</AlertDialogTitle>
    <AlertDialogDescription>
      삭제된 고객은 복구할 수 없습니다.
    </AlertDialogDescription>
    <AlertDialogAction onClick={handleDelete}>삭제</AlertDialogAction>
    <AlertDialogCancel>취소</AlertDialogCancel>
  </AlertDialogContent>
</AlertDialog>
```

### 캐시 설정 (필수)
```typescript
// 모든 서버 컴포넌트 페이지
export const dynamic = 'force-dynamic'
export const revalidate = 0

// next.config.ts
experimental: {
  staleTimes: { dynamic: 0, static: 0 }
}

// Sidebar 메뉴 클릭
router.push(href)
router.refresh()
```

---

## 🤖 에이전트 파일 상세 내용

---

### .claude/agents/00-orchestrator.md
```markdown
# Orchestrator Agent

## 역할
전체 개발 흐름을 조율하고, 서브 에이전트에 작업을 위임한다.
Phase별 진행 상황을 추적하고, 각 Step 완료 시 CLAUDE.md를 업데이트한다.

## 현재 Phase & Step 추적
Phase 1: 기반 구축 (Steps 1-5)
Phase 2: 핵심 기능 (Steps 6-10)
Phase 3: 파이프라인 (Steps 11-13)
Phase 4: 대시보드 & 리마인더 (Steps 14-15)
Phase 5: 팀 관리 (Steps 16-22)
Phase 6: 마무리 (Steps 23-26)

## Step 완료 체크리스트
각 Step 완료 시:
1. 생성/수정된 파일 목록 출력
2. CLAUDE.md "완료된 기능" 섹션 업데이트
3. 실행할 SQL 파일이 있으면 경로와 함께 안내
4. 다음 Step 준비 상태 확인

## 에이전트 위임 규칙
- DB 관련 → 01-database 에이전트
- 인증 관련 → 02-auth 에이전트
- API Route → 03-api 에이전트
- UI/레이아웃 → 04~09 프론트엔드 에이전트
- 알림 → 10-notifications 에이전트
- 앱 연동 → 11-mobile-api-bridge 에이전트
```

---

### .claude/agents/01-database.md
```markdown
# Database Agent

## 역할
Supabase PostgreSQL 스키마 설계, 마이그레이션 파일 작성, RLS 정책 관리

## 핵심 규칙
1. 모든 테이블에 RLS 활성화 필수
2. user_id 컬럼이 있는 테이블은 반드시 auth.uid() = user_id 정책
3. deleted_at IS NULL 조건을 모든 SELECT에 적용
4. 인덱스: user_id, created_at, stage, due_date 필수 생성
5. updated_at 자동 갱신 트리거 설정

## 마이그레이션 파일 네이밍
supabase/migrations/NNN_description.sql

## 타입 생성
마이그레이션 후 npx supabase gen types typescript 실행하여
src/types/database.types.ts 자동 생성 안내

## 검증 항목
- customers.stage → pipeline_stages.name과 일치 여부 (앱 레벨에서 검증)
- 단계 삭제 전 고객 존재 여부 확인
- team_members UNIQUE(team_id, user_id) 제약

## 앱 연동 고려
- api_keys 테이블 (005_api_keys.sql) 준비
- UUID 기반 설계 (앱에서도 동일 ID 사용)
```

---

### .claude/agents/02-auth.md
```markdown
# Auth Agent

## 역할
Supabase Auth, Google OAuth, 미들웨어, 세션 관리

## 핵심 규칙
1. 클라이언트용: createBrowserClient (PUBLISHABLE_KEY 사용)
2. 서버용: createServerClient (SECRET_KEY 사용)
3. API Route: createServerSupabaseClient()로 세션 검증
4. 미들웨어: 모든 /dashboard/* 경로 보호

## 첫 로그인 처리
/auth/callback/route.ts에서:
1. exchangeCodeForSession
2. pipeline_stages count 확인
3. 0이면 기본 15개 단계 INSERT

## 앱 연동 준비
- JWT 토큰 검증 로직 (Authorization: Bearer)
- api_keys 테이블 기반 인증 (추후)
- Supabase Auth는 웹/앱 공유 가능

## 보안 주의
- SECRET_KEY는 서버 사이드에서만 사용
- PUBLISHABLE_KEY는 클라이언트에서 사용
- RLS가 주요 보안 레이어
```

---

### .claude/agents/03-api.md
```markdown
# API Agent

## 역할
모든 /app/api/v1/** Route Handler 작성

## 표준 패턴
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // 비즈니스 로직
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('user_id', session.user.id)
      .is('deleted_at', null)

    if (error) throw error
    return NextResponse.json({ data, success: true })
  } catch (error) {
    return NextResponse.json({ error: error.message, success: false }, { status: 500 })
  }
}
```

## 응답 표준
```typescript
// 성공
{ data: T, success: true }
// 성공 (목록)
{ data: T[], total: number, success: true }
// 에러
{ error: string, success: false }
```

## 중요 제약
- 팀 API: 팀원 customers 수정/삭제 절대 금지
- 팀원 내보내기: team_members만 삭제
- stage 변경 시 interaction 자동 기록
- reorder: 배치 업데이트로 처리

## 앱 연동
- 현재 API v1은 웹/앱 공용
- 응답 형식 변경 없이 앱에서 사용 가능
- 페이지네이션 query param: page, limit (기본 50)
```

---

### .claude/agents/04-frontend-layout.md
```markdown
# Frontend Layout Agent

## 역할
사이드바, 헤더, 하단탭바, 대시보드 레이아웃 구현

## 디자인 원칙
- 네이비(#0F172A) 사이드바: 권위감, 신뢰감
- 스카이블루(#38BDF8) 포인트: 역동성
- 전체적으로 깔끔하고 프로페셔널한 SaaS 느낌

## 사이드바 메뉴 구성
```typescript
const menuItems = [
  { label: '대시보드',   icon: LayoutDashboard, href: '/dashboard' },
  { label: '고객 관리',  icon: Users,           href: '/dashboard/customers' },
  { label: '파이프라인', icon: Kanban,           href: '/dashboard/pipeline' },
  { label: '리마인더',   icon: Bell,             href: '/dashboard/reminders' },
  { label: '팀 관리',    icon: UserGroup,        href: '/dashboard/team', managerOnly: true },
  { label: '설정',       icon: Settings,         href: '/dashboard/settings' },
]
```

## 반응형 체크포인트
- 사이드바: hidden md:flex
- 하단탭바: flex md:hidden
- 메인 패딩: ml-0 md:ml-52

## 캐시 갱신 (필수)
Sidebar 메뉴 클릭 시:
router.push(href)
router.refresh()
두 줄 모두 필수!
```

---

### .claude/agents/05-frontend-customers.md
```markdown
# Frontend Customers Agent

## 역할
고객 목록, 고객 상세, CustomerForm, CustomerCard 구현

## 상태 관리 전략
- 목록: SWR 또는 로컬 useState + fetch
- 폼: React Hook Form + Zod
- 최적화: 낙관적 업데이트 (추가/수정/삭제)

## CustomerForm 특이사항
1. 전화번호 자동 포맷: 010-0000-0000
2. 생년월일: 년(input) / 월(select 1-12) / 일(select 1-31) 분리 입력
3. 단계 select: stage_type='pipeline'만 표시 (escape 제외)
4. 저장 성공 시 목록 새로고침 + 슬라이드 패널 닫기

## 상담이력 추가 시 자동 단계 기록
상담이력 추가 폼에 "단계 변경됨" 필드 (optional)
stage_changed_to 자동 설정

## 모바일 카드 vs PC 테이블
- md:hidden 카드
- hidden md:table 테이블
- 두 UI 모두 동일 데이터 바인딩
```

---

### .claude/agents/06-frontend-pipeline.md
```markdown
# Frontend Pipeline Agent

## 역할
KanbanBoard, KanbanCard, 드래그앤드롭 구현

## @hello-pangea/dnd 사용법
```typescript
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'

// SSR 이슈 방지
const [isMounted, setIsMounted] = useState(false)
useEffect(() => setIsMounted(true), [])
if (!isMounted) return null
```

## 낙관적 업데이트 패턴
```typescript
// 1. 즉시 UI 업데이트
const previousData = [...columns]
setColumns(updatedColumns)

// 2. API 호출
try {
  await updateStage(customerId, newStage)
} catch {
  // 3. 실패 시 롤백
  setColumns(previousData)
  toast.error('이동 실패. 다시 시도해주세요.')
}
```

## 이탈 관리 섹션 구분
border-t-2 border-dashed border-red-200 my-8

## 읽기 전용 모드 (팀원 파이프라인 열람)
- isDraggable prop으로 제어
- "읽기 전용" 뱃지 표시
- onDragEnd 핸들러 비활성화
```

---

### .claude/agents/07-frontend-dashboard.md
```markdown
# Frontend Dashboard Agent

## 역할
KPI 카드, 활동 피드, 단계별 현황 차트 구현

## 서버 컴포넌트로 구현 (데이터 fetch 서버에서)
export const dynamic = 'force-dynamic'

## KPI 카드 컴포넌트
```typescript
interface KpiCardProps {
  title: string
  value: number | string
  icon: string
  color: 'blue' | 'green' | 'yellow' | 'purple'
  trend?: { value: number, direction: 'up' | 'down' }
}
```

## 단계별 현황
수평 진행 바 형태:
[리드배정 ████░░] 48명
[초기연락 ██░░░░] 23명
...

## 최근 활동 피드
타임라인 형태, 고객 추가 + 상담이력 혼합
```

---

### .claude/agents/08-frontend-team.md
```markdown
# Frontend Team Agent

## 역할
팀 대시보드, 팀원 실적 테이블, 리포트 구현

## 권한 체크
```typescript
// 팀장 확인 (서버 컴포넌트에서)
const isManager = team?.manager_id === session.user.id
if (!isManager) redirect('/dashboard')
```

## 팀원 실적 테이블
- 기간 필터 (useState)
- 전환율 계산: (계약수 / 전체고객수) * 100
- 1위 🏆 배지
- 활동 없음 ⚠️ 경고

## 팀원 파이프라인 열람
- 팀원 선택 → 해당 팀원의 API 호출
- KanbanBoard isDraggable=false
- 읽기 전용 배지

## 팀 활동 리포트
- 유형별 상담 차트 (bar chart)
- recharts 사용 권장
```

---

### .claude/agents/09-frontend-settings.md
```markdown
# Frontend Settings Agent

## 역할
파이프라인 단계 에디터, 팀 관리 설정 UI 구현

## PipelineStagesEditor
```typescript
// 단계 추가 제한
const maxPipeline = 12
const minPipeline = 5
const addStage = () => {
  if (pipelineStages.length >= maxPipeline) {
    toast.error(`최대 ${maxPipeline}개까지 추가할 수 있습니다`)
    return
  }
  // ...
}

// 삭제 버튼 disabled 조건
const isDeleteable = customerCountByStage[stage.name] === 0
```

## 색상 팔레트 (10색상 선택기)
```typescript
const COLOR_PALETTE = [
  '#94A3B8', '#60A5FA', '#A78BFA', '#C084FC',
  '#FBBF24', '#F97316', '#10B981', '#14B8A6',
  '#6366F1', '#EF4444',
]
```

## 저장 처리
전체 upsert (POST /api/v1/pipeline-stages)
성공 시 router.refresh()
```

---

### .claude/agents/10-notifications.md
```markdown
# Notifications Agent

## 역할
앱 내 알림 시스템, NotificationDropdown 구현

## 폴링 방식 (기본)
```typescript
// 30초마다 알림 체크
useEffect(() => {
  const interval = setInterval(fetchNotifications, 30000)
  return () => clearInterval(interval)
}, [])
```

## Supabase Realtime (선택적 업그레이드)
```typescript
const channel = supabase
  .channel('notifications')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'notifications',
    filter: `user_id=eq.${userId}`
  }, handleNewNotification)
  .subscribe()
```

## 팀 합류 요청 처리 플로우
1. 팀원: POST /api/v1/teams/join-request { manager_email }
2. 팀장 알림 생성 (type: team_join_request)
3. 팀장 알림 드롭다운에서 수락/거절
4. PATCH /api/v1/teams/:id/members/:uid/accept|reject
5. 팀원에게 결과 알림 생성

## 앱 연동 준비
- FCM 토큰 저장 컬럼 (users 테이블에 추후 추가)
- push_notifications 테이블 (추후)
- 현재 notifications 테이블 구조는 앱에서도 동일 사용
```

---

### .claude/agents/11-mobile-api-bridge.md
```markdown
# Mobile API Bridge Agent

## 역할
웹/앱 공용 API 설계 원칙, 앱 연동 준비 사항 관리

## 앱 연동 체크리스트 (현재 웹 개발 중 반영할 것)

### 1. API 응답 형식 (앱에서도 동일 사용)
```typescript
// 표준 응답 (웹/앱 공용)
interface ApiResponse<T> {
  data: T
  success: boolean
  error?: string
  pagination?: {
    page: number
    limit: number
    total: number
  }
}
```

### 2. 인증 이중화 (추후 앱에서 필요)
```typescript
// 현재: 쿠키 기반 세션
// 추후: Authorization: Bearer JWT

async function getSession(request: NextRequest) {
  // 1. 쿠키에서 세션 확인 (웹)
  // 2. Authorization 헤더에서 JWT 확인 (앱)
  const authHeader = request.headers.get('Authorization')
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7)
    const { data } = await supabase.auth.getUser(token)
    return data.user
  }
}
```

### 3. 딥링크 대응 URL 구조
- /dashboard/customers/:id → salesone://customers/:id
- /dashboard/pipeline → salesone://pipeline
- 현재 웹 URL 구조를 변경하지 말 것

### 4. 앱에서 재사용할 API 훅 (src/lib/api-client.ts)
```typescript
// 웹에서는 fetch, 앱에서는 동일 함수 사용 가능
export const apiClient = {
  customers: {
    list: (params) => fetch('/api/v1/customers?' + new URLSearchParams(params)),
    create: (data) => fetch('/api/v1/customers', { method: 'POST', body: JSON.stringify(data) }),
    // ...
  }
}
```

### 5. 파일 업로드 준비 (추후)
- Supabase Storage 사용 예정
- 고객 프로필 사진, 계약서 첨부 등
- API 구조에 file_urls: string[] 컬럼 예비

### 6. 오프라인 고려
- 현재: 온라인 전용
- 추후 앱: Supabase 로컬 캐시 또는 MMKV
- created_at, updated_at 기반 동기화 전략
```

---

## 🛠 스킬 파일 상세 내용

---

### .claude/skills/skill-supabase-rls.md
```markdown
# Skill: Supabase RLS 정책 패턴

## 기본 패턴 (본인 데이터만)
CREATE POLICY "본인 데이터만" ON [table]
  FOR ALL USING (auth.uid() = user_id);

## 팀 데이터 접근 패턴 (팀원이 팀 데이터 조회)
CREATE POLICY "같은 팀 조회" ON [table]
  USING (
    user_id IN (
      SELECT user_id FROM team_members
      WHERE team_id = [table].team_id AND status = 'active'
    )
  );

## 삽입 시 user_id 강제
CREATE POLICY "본인 데이터 삽입" ON [table]
  FOR INSERT WITH CHECK (auth.uid() = user_id);

## 팀장 전용 정책
CREATE POLICY "팀장만" ON teams
  USING (auth.uid() = manager_id);

## 주의: API Route에서 SUPABASE_SECRET_KEY를 사용하면 RLS 우회됨
## → 반드시 .eq('user_id', session.user.id) 조건 수동 추가
```

---

### .claude/skills/skill-api-pattern.md
```markdown
# Skill: API Route 표준 패턴

## 기본 구조
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

// 입력 스키마
const inputSchema = z.object({ ... })

export async function POST(request: NextRequest) {
  try {
    // 1. 인증
    const supabase = await createServerSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // 2. 입력 검증
    const body = await request.json()
    const parsed = inputSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    // 3. 소유권 확인 (수정/삭제 시)
    const { data: resource } = await supabase.from('table').select().eq('id', id).single()
    if (resource.user_id !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // 4. 비즈니스 로직
    const { data, error } = await supabase.from('table').insert({
      ...parsed.data,
      user_id: session.user.id  // 항상 서버에서 설정
    }).select().single()
    if (error) throw error

    return NextResponse.json({ data, success: true }, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Internal Server Error', success: false }, { status: 500 })
  }
}
```

## 페이지네이션 패턴
```typescript
const page = parseInt(searchParams.get('page') || '1')
const limit = parseInt(searchParams.get('limit') || '50')
const from = (page - 1) * limit
const to = from + limit - 1

const { data, count, error } = await supabase
  .from('customers')
  .select('*', { count: 'exact' })
  .eq('user_id', userId)
  .is('deleted_at', null)
  .range(from, to)
```
```

---

### .claude/skills/skill-form-pattern.md
```markdown
# Skill: React Hook Form + Zod 패턴

## 기본 구조
```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(1, '필수 입력입니다'),
  phone: z.string().regex(/^010-\d{4}-\d{4}$/, '010-0000-0000 형식으로 입력하세요'),
})

type FormData = z.infer<typeof schema>

function MyForm({ onSubmit }: { onSubmit: (data: FormData) => Promise<void> }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema)
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('name')} />
      {errors.name && <span>{errors.name.message}</span>}
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? '저장 중...' : '저장'}
      </button>
    </form>
  )
}
```

## 전화번호 자동 포맷
```typescript
const formatPhone = (value: string) => {
  const numbers = value.replace(/\D/g, '')
  if (numbers.length <= 3) return numbers
  if (numbers.length <= 7) return `${numbers.slice(0,3)}-${numbers.slice(3)}`
  return `${numbers.slice(0,3)}-${numbers.slice(3,7)}-${numbers.slice(7,11)}`
}
```
```

---

### .claude/skills/skill-kanban-dnd.md
```markdown
# Skill: 칸반 드래그앤드롭 패턴

## SSR 이슈 해결
```typescript
'use client'
import { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'

// SSR에서 DnD는 작동하지 않으므로 마운트 후 렌더링
const [isMounted, setIsMounted] = useState(false)
useEffect(() => setIsMounted(true), [])
if (!isMounted) return <KanbanSkeleton />
```

## 컬럼 타입 정의
```typescript
interface Column {
  id: string        // droppableId로 사용
  name: string
  color: string
  items: Customer[]
}
```

## onDragEnd 핸들러
```typescript
const onDragEnd = async (result: DropResult) => {
  const { source, destination, draggableId } = result
  if (!destination) return
  
  const srcCol = columns.find(c => c.id === source.droppableId)!
  const dstCol = columns.find(c => c.id === destination.droppableId)!
  
  if (source.droppableId !== destination.droppableId) {
    // 컬럼 간 이동 (단계 변경)
    // ... 낙관적 업데이트 + API 호출
  } else {
    // 같은 컬럼 내 순서 변경
    const items = [...srcCol.items]
    const [removed] = items.splice(source.index, 1)
    items.splice(destination.index, 0, removed)
    // order_index 재계산 후 API 호출
  }
}
```

## 읽기 전용 모드
```typescript
// isDraggable=false 일 때
<Draggable isDragDisabled={!isDraggable} ...>
```
```

---

### .claude/skills/skill-optimistic-ui.md
```markdown
# Skill: 낙관적 업데이트 패턴

## 단계 변경 낙관적 업데이트
```typescript
const optimisticUpdateStage = useCallback(async (customerId: string, newStage: string) => {
  // 1. 이전 상태 저장
  const previousColumns = JSON.parse(JSON.stringify(columns))
  
  // 2. 즉시 UI 업데이트
  setColumns(prev => {
    // 고객을 원래 컬럼에서 제거하고 새 컬럼에 추가
    return prev.map(col => ({
      ...col,
      items: col.id === newStage
        ? [...col.items, customer]
        : col.items.filter(c => c.id !== customerId)
    }))
  })
  
  // 3. API 호출
  try {
    const res = await fetch(`/api/v1/customers/${customerId}/stage`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage: newStage })
    })
    if (!res.ok) throw new Error('Failed')
  } catch (error) {
    // 4. 실패 시 롤백
    setColumns(previousColumns)
    toast.error('이동에 실패했습니다')
  }
}, [columns])
```

## 고객 추가 낙관적 업데이트
```typescript
// 1. 임시 ID로 즉시 추가
const tempId = 'temp-' + Date.now()
setCustomers(prev => [{ ...newCustomer, id: tempId }, ...prev])

// 2. API 호출
const { data } = await createCustomer(newCustomer)

// 3. 임시 ID를 실제 ID로 교체
setCustomers(prev => prev.map(c => c.id === tempId ? data : c))
```
```

---

### .claude/skills/skill-auth-guard.md
```markdown
# Skill: 인증 보호 패턴

## 미들웨어 보호 (전역)
src/middleware.ts에서 /dashboard/* 전체 보호

## 서버 컴포넌트에서 추가 보호
```typescript
import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export default async function ProtectedPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/auth')
  
  // 추가 권한 체크 (팀장 전용 페이지)
  const isManager = await checkIsManager(supabase, session.user.id)
  if (!isManager) redirect('/dashboard')
  
  return <PageContent />
}
```

## 클라이언트에서 세션 확인
```typescript
'use client'
import { createClient } from '@/lib/supabase'
import { useEffect, useState } from 'react'

export function useSession() {
  const supabase = createClient()
  const [session, setSession] = useState(null)
  
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])
  
  return session
}
```
```

---

### .claude/skills/skill-app-bridge.md
```markdown
# Skill: 앱 연동 API 설계 패턴

## 웹 개발 중 앱 연동을 위해 지금 해야 할 것

### 1. API 응답 표준화 (지금 반영)
모든 API 응답은 { data, success, error?, pagination? } 형식
→ 앱에서 동일 파싱 로직 사용 가능

### 2. Authorization 헤더 지원 준비 (지금 반영)
```typescript
// 현재는 쿠키만 사용하지만, 향후 앱에서 Bearer 토큰 사용
// getSession 함수에서 두 방식 모두 처리하도록 준비
export async function getAuthUser(request: NextRequest) {
  const authHeader = request.headers.get('Authorization')
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7)
    const supabase = await createServerSupabaseClient()
    const { data } = await supabase.auth.getUser(token)
    return data.user
  }
  // 쿠키 기반 (웹)
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session?.user ?? null
}
```

### 3. CORS 설정 (앱 연동 시 필요)
```typescript
// next.config.ts
async headers() {
  return [{
    source: '/api/:path*',
    headers: [
      { key: 'Access-Control-Allow-Origin', value: '*' },
      { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PATCH,DELETE,OPTIONS' },
      { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
    ]
  }]
}
```

### 4. 앱에서 재사용할 유효성 검사 (공유 패키지)
src/lib/validations/ 폴더의 Zod 스키마
→ 앱 프로젝트에서 그대로 import 가능 (monorepo 고려)

### 5. 딥링크 URL 구조 (지금 반영)
현재 웹 경로:
/dashboard/customers/:id → salesone://customers/:id
/dashboard/pipeline      → salesone://pipeline
/dashboard/reminders     → salesone://reminders

URL 구조를 바꾸지 말 것 (앱 딥링크와 매핑됨)
```

---

## 🚀 개발 순서 (Phase별)

### Phase 1: 기반 구축

```
Step 1: 프로젝트 초기화
  - npx create-next-app@latest salesone-crm --typescript --tailwind --app
  - shadcn/ui init
  - 필요 패키지 설치:
    @supabase/ssr @supabase/supabase-js
    @hello-pangea/dnd
    react-hook-form @hookform/resolvers zod
    zustand date-fns sonner
    lucide-react
  - tailwind.config.ts 커스텀 컬러 설정
  - 디렉토리 구조 생성

Step 2: Supabase 연결 + DB 마이그레이션
  - .env.local 설정
  - Supabase 프로젝트 생성
  - migrations/ SQL 파일 순서대로 실행
  - src/lib/supabase.ts + supabase-server.ts 생성
  - npx supabase gen types typescript 실행

Step 3: Google OAuth 로그인
  - Supabase Dashboard에서 Google Provider 활성화
  - /app/auth/page.tsx (로그인 UI)
  - /app/auth/callback/route.ts (+ 첫 로그인 기본 단계 생성)

Step 4: 미들웨어
  - src/middleware.ts
  - /dashboard/* 인증 보호

Step 5: 레이아웃
  - dashboard/layout.tsx
  - Sidebar.tsx (네이비, 아이콘 메뉴)
  - Header.tsx (알림 아이콘 포함)
  - BottomTabBar.tsx (모바일)
```

### Phase 2: 핵심 기능

```
Step 6: 고객 목록
  - GET /api/v1/customers (검색, 필터, 정렬, 페이지네이션)
  - GET /api/v1/pipeline-stages
  - CustomersClient.tsx (검색/필터/정렬 상태)
  - 테이블 (PC) + 카드 (모바일)

Step 7: 고객 등록/수정 폼
  - CustomerForm.tsx (React Hook Form + Zod)
  - POST /api/v1/customers
  - PATCH /api/v1/customers/[id]
  - 슬라이드 패널 (PC) / 풀스크린 모달 (모바일)

Step 8: 고객 상세
  - GET /api/v1/customers/[id]
  - 기본정보 카드 + 단계 변경 드롭다운
  - PATCH /api/v1/customers/[id]/stage

Step 9: 상담이력
  - GET/POST /api/v1/customers/[id]/interactions
  - DELETE /api/v1/customers/[id]/interactions/[iid]
  - 타임라인 UI

Step 10: 리마인더 (고객 상세 탭)
  - GET/POST/PATCH/DELETE /api/v1/customers/[id]/reminders
  - 완료 체크박스, 지난 항목 빨간색
```

### Phase 3: 파이프라인

```
Step 11: 파이프라인 설정
  - GET/POST /api/v1/pipeline-stages
  - PipelineStagesEditor.tsx
  - DnD 순서 변경, 색상 팔레트, 삭제 안전장치

Step 12: 칸반 보드
  - KanbanBoard.tsx (@hello-pangea/dnd)
  - KanbanCard.tsx
  - 낙관적 업데이트

Step 13: 컬럼 내 순서 변경
  - PATCH /api/v1/customers/reorder
  - 배치 order_index 업데이트
```

### Phase 4: 대시보드 & 전체 리마인더

```
Step 14: 대시보드
  - 서버 컴포넌트로 KPI 병렬 fetch
  - KpiCard.tsx, ActivityFeed.tsx, StageChart.tsx

Step 15: 전체 리마인더 페이지
  - GET /api/v1/reminders (필터: 오늘/이번주/전체)
  - ReminderItem.tsx
  - 완료 토글
```

### Phase 5: 팀 관리

```
Step 16: 팀 설정 UI
  - POST /api/v1/teams (팀 생성)
  - settings 페이지 팀 관리 탭

Step 17: 초대/합류 요청
  - POST /api/v1/teams/[id]/invite (팀장→팀원)
  - POST /api/v1/teams/join-request (팀원→팀장)

Step 18: 수락/거절 + 알림
  - PATCH .../accept, .../reject
  - NotificationDropdown.tsx
  - GET/PATCH /api/v1/notifications

Step 19: 내보내기/나가기
  - DELETE /api/v1/teams/[id]/members/[uid]
  - customers 데이터 보호 확인

Step 20: 팀 대시보드
  - GET /api/v1/teams/[id]/stats
  - MemberStatsTable.tsx

Step 21: 팀원 파이프라인 열람
  - GET /api/v1/teams/[id]/members/[uid]/pipeline
  - KanbanBoard isDraggable=false

Step 22: 팀 활동 리포트
  - GET /api/v1/teams/[id]/report
  - TeamReport.tsx (차트 포함)
```

### Phase 6: 마무리

```
Step 23: 모바일 반응형 전체 점검
  - 모든 페이지 모바일 UI 확인
  - 터치 영역 44px 최소 보장

Step 24: 빈 상태 + 로딩 상태
  - EmptyState 컴포넌트 전체 적용
  - Skeleton 컴포넌트 (목록, 카드, 대시보드)

Step 25: 에러 처리 + 앱 연동 API 점검
  - error.tsx 파일 추가
  - API 응답 표준화 최종 점검
  - CORS 헤더 설정 (next.config.ts)
  - Authorization 헤더 처리 로직 추가

Step 26: Vercel 배포
  - 환경변수 설정
  - 도메인 연결
  - Supabase URL 허용 목록 업데이트
  - 성능 테스트
```

---

## ⚠️ 개발 필수 주의사항

### 1. stage값은 반드시 텍스트
```typescript
// ✅ 올바름
customers.stage = '리드배정'

// ❌ 잘못됨
customers.stage = 'uuid-xxxx-xxxx'
```

### 2. 캐시 설정 (모든 서버 컴포넌트)
```typescript
export const dynamic = 'force-dynamic'
export const revalidate = 0
```

### 3. Sidebar 메뉴 클릭 (두 줄 모두 필수!)
```typescript
router.push(href)
router.refresh()  // ← 이 줄 빠뜨리면 데이터 갱신 안 됨!
```

### 4. 팀원 데이터 보호
```typescript
// 팀 API에서 절대 금지
supabase.from('customers').delete()  // ❌
supabase.from('customers').update()  // ❌ (팀장이 팀원 데이터 수정)
```

### 5. 단계 삭제 안전장치
```typescript
const { count } = await supabase
  .from('customers')
  .select('id', { count: 'exact', head: true })
  .eq('stage', stageName)
  .is('deleted_at', null)
if (count && count > 0) {
  return NextResponse.json({ error: '이 단계에 고객이 있어 삭제할 수 없습니다' }, { status: 400 })
}
```

### 6. next.config.ts (캐시 비활성화)
```typescript
const nextConfig: NextConfig = {
  experimental: {
    staleTimes: { dynamic: 0, static: 0 }
  }
}
```

### 7. 앱 연동 준비: API 응답 일관성
모든 API는 반드시 `{ data, success }` 형식 유지
추후 앱에서 동일 엔드포인트 사용

---

## 📝 CLAUDE.md (프로젝트 루트)

```markdown
# SalesONE-CRM

## 프로젝트 개요
모든 영업직 종사자를 위한 B2C SaaS CRM.
웹 우선 개발 (Next.js 14), 추후 React Native 앱 연동 예정.

## 기술 스택
Next.js 14 (App Router) + TypeScript + Supabase + Tailwind CSS + shadcn/ui

## 핵심 규칙 (위반 금지)
1. 모든 API: Supabase 인증 필수 + .eq('user_id', session.user.id)
2. 모든 서버 페이지: export const dynamic = 'force-dynamic'
3. 삭제: soft delete (deleted_at 업데이트, 실제 삭제 금지)
4. stage값: 텍스트(단계명)로 저장 (UUID 아님)
5. Sidebar 클릭: router.push() + router.refresh() 두 줄 필수
6. 팀원 데이터: 팀장이 수정/삭제 불가
7. 파이프라인 단계 삭제: 고객 있으면 400 에러
8. API 응답: { data, success, error? } 표준 형식 (앱 연동 준비)

## 에이전트 역할
- 00-orchestrator: 전체 조율 + CLAUDE.md 업데이트
- 01-database: DB 스키마/마이그레이션
- 02-auth: 인증/미들웨어
- 03-api: API Routes
- 04~09: 페이지별 프론트엔드
- 10-notifications: 알림 시스템
- 11-mobile-api-bridge: 앱 연동 설계

## 현재 진행 단계
Phase 1 Step 1 시작 →

## 완료된 기능
(각 Step 완료 시 여기에 추가)
```

---

## 🎯 시작 명령어

Claude Code를 시작할 때 아래 명령어로 시작하세요:

```
이 SALESONE_CRM_CLAUDE_CODE_MASTER_PROMPT.md 파일을 처음부터 끝까지 완전히 읽어.
그 다음 .claude/agents/00-orchestrator.md 내용을 참고하여
Phase 1 Step 1부터 순서대로 개발을 시작해.

각 Step 완료 후 반드시:
1. 생성/수정된 파일 전체 목록 출력
2. CLAUDE.md "완료된 기능" 업데이트
3. Supabase에서 실행할 SQL 있으면 파일 경로와 함께 안내
4. 다음 Step 준비 여부 확인
```
