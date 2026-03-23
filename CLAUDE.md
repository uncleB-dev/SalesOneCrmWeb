# SalesONE-CRM — Claude Code 프로젝트 규칙

## 개요
B2C SaaS CRM 웹 서비스. 영업인의 고객 관리를 위한 올인원 플랫폼.

## 기술 스택
- **Frontend**: Next.js 14 (App Router) + TypeScript
- **스타일링**: Tailwind CSS v4 + shadcn/ui
- **Backend**: Next.js API Routes (/app/api/v1/*)
- **Database**: Supabase (PostgreSQL + RLS)
- **인증**: Supabase Auth + Google OAuth
- **드래그앤드롭**: @hello-pangea/dnd
- **폼**: React Hook Form + Zod
- **상태관리**: Zustand
- **날짜**: date-fns
- **알림**: Sonner (toast)

## 프로젝트 구조
```
app/             → Next.js App Router (페이지 + API Routes)
components/      → 재사용 컴포넌트
lib/             → 유틸리티, Supabase 클라이언트, 검증 스키마
types/           → TypeScript 타입 정의
hooks/           → 커스텀 훅
store/           → Zustand 스토어
supabase/        → DB 마이그레이션 SQL
```

## 핵심 규칙
1. 모든 API Route에 `export const dynamic = 'force-dynamic'` 필수
2. 서버 컴포넌트: `createServerSupabaseClient()` (SUPABASE_SECRET_KEY)
3. 클라이언트 컴포넌트: `createClient()` (PUBLISHABLE_KEY)
4. RLS 우회 시 반드시 `.eq('user_id', session.user.id)` 수동 추가
5. Sidebar 메뉴 클릭: `router.push(href); router.refresh()` 두 줄 모두 필수
6. Soft delete: `deleted_at` 컬럼 사용, 모든 SELECT에 `.is('deleted_at', null)` 적용
7. 낙관적 업데이트: 이전 상태 저장 → UI 업데이트 → API 호출 → 실패 시 롤백

## 완료된 기능

### Phase 1: 기반 구축
- [x] **Step 1**: 프로젝트 초기화 (Next.js 14, Tailwind v4, shadcn/ui, 패키지 설치)
  - 디렉토리 구조 생성 (app, components, lib, types, hooks, store, supabase)
  - 커스텀 브랜드 컬러 설정 (globals.css)
  - 핵심 유틸리티 파일 생성 (constants, format, cn)
  - Supabase 클라이언트 설정 (supabase.ts, supabase-server.ts)
  - API 클라이언트 생성 (api-client.ts)
  - 타입 정의 (customer, pipeline, team, notification, api)
  - Zod 검증 스키마 (customer, pipeline, team)
  - DB 마이그레이션 SQL 파일 생성 (001~005)
  - .env.example 생성
  - next.config.ts 업데이트 (staleTimes, CORS headers)
  - .claude/agents/, .claude/skills/ 디렉토리 생성

- [x] **Step 2**: Supabase 연결 + DB 마이그레이션
  - supabase link → supabase db push 완료 (001~005 모든 마이그레이션)
  - customers, interactions, reminders, pipeline_stages, teams, team_members, notifications, api_keys 테이블 생성
- [x] **Step 3**: Google OAuth 로그인
  - app/auth/page.tsx (Google 로그인 UI)
  - app/auth/callback/route.ts (첫 로그인 시 기본 15개 파이프라인 단계 생성)
- [x] **Step 4**: 미들웨어 (proxy.ts — Next.js 16 convention)
  - /dashboard/* 인증 보호, /auth 로그인 시 /dashboard 리다이렉트
- [x] **Step 5**: 레이아웃
  - app/dashboard/layout.tsx
  - components/layout/Sidebar.tsx (네이비, 아이콘 메뉴)
  - components/layout/Header.tsx (알림 뱃지 포함)
  - components/layout/BottomTabBar.tsx (모바일 5탭)
  - store/useNotificationStore.ts, useCustomerStore.ts, usePipelineStore.ts

## Phase 3: 파이프라인
- [x] **Step 11**: 파이프라인 단계 관리 (PipelineStagesEditor)
  - 추가/삭제/이름수정/순서변경/색상변경
  - 고객 있는 단계 삭제 방지 (고객수 표시)
  - 이름 수정 시 customers.stage 자동 동기화 (PATCH /api/v1/pipeline-stages/[id])
  - 파이프라인 페이지 우측 패널 + 설정 페이지 양쪽에서 접근
- [x] **Step 12**: 칸반 보드 (KanbanBoard + KanbanCard)
  - @hello-pangea/dnd 드래그앤드롭
  - 영업 파이프라인 + 이탈 관리 섹션 구분
  - 낙관적 업데이트 + 실패 시 롤백
  - 가장 가까운 리마인더 날짜 표시 (🔔)
- [x] **Step 13**: 컬럼 내 순서 변경 (PATCH /api/v1/customers/reorder)

## 다음 단계 (Phase 2)
- [ ] **Step 6**: 고객 목록 API + UI
- [ ] **Step 7**: 고객 등록/수정 폼
- [ ] **Step 8**: 고객 상세 페이지
- [ ] **Step 9**: 상담이력
- [ ] **Step 10**: 리마인더 (고객 상세 탭)

## 참고
- Next.js 버전: 16.2.1 (proxy.ts 사용, middleware.ts 아님)
- Supabase 프로젝트 ref: nxvfoavevfllpazpqqko
- Google OAuth: Supabase Dashboard에서 Provider 활성화 필요
