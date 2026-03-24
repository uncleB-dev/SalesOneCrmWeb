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
- **CSV 파싱**: papaparse

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
  - app/auth/callback/route.ts (첫 로그인 시 기본 7개 파이프라인 단계 생성: 영업 5개 + 이탈 2개)
- [x] **Step 4**: 미들웨어 (proxy.ts — Next.js 16 convention)
  - /dashboard/* 인증 보호, /auth 로그인 시 /dashboard 리다이렉트
- [x] **Step 5**: 레이아웃
  - app/dashboard/layout.tsx
  - components/layout/Sidebar.tsx (네이비, 아이콘 메뉴)
  - components/layout/Header.tsx (알림 뱃지 포함)
  - components/layout/BottomTabBar.tsx (모바일 5탭)
  - store/useNotificationStore.ts, useCustomerStore.ts, usePipelineStore.ts

### Phase 2: 핵심 고객 관리
- [x] **Step 6**: 고객 목록 API + UI (app/dashboard/customers/page.tsx + CustomersClient.tsx)
- [x] **Step 7**: 고객 등록/수정 폼 (components/customers/CustomerForm.tsx)
- [x] **Step 8**: 고객 상세 페이지 (app/dashboard/customers/[id]/page.tsx + CustomerDetailClient.tsx)
- [x] **Step 9**: 상담이력 (components/customers/InteractionTimeline.tsx)
- [x] **Step 10**: 리마인더 (고객 상세 탭, components/reminders/ReminderItem.tsx)

### Phase 3: 파이프라인
- [x] **Step 11**: 파이프라인 단계 관리 (PipelineStagesEditor)
  - 추가/삭제/이름수정/순서변경/색상변경
  - 영업 파이프라인: MIN 1개, MAX 20개 / 이탈 관리: MIN 1개, MAX 5개
  - 기본 단계: 영업 5개(리드배정, 초기연락, 상담중, 계약완료, 사후관리) + 이탈 2개(연락불가, 블랙리스트)
  - 고객 있는 단계 삭제 방지 (고객수 표시)
  - 이름 수정 시 customers.stage 자동 동기화 (PATCH /api/v1/pipeline-stages/[id])
- [x] **Step 12**: 칸반 보드 (KanbanBoard + KanbanCard)
  - @hello-pangea/dnd 드래그앤드롭
  - 컬럼 상단 border-top 4px + 헤더 배경 20% opacity + 텍스트/배지 stage.color 적용
  - 영업 파이프라인 + 이탈 관리 섹션 구분
  - 낙관적 업데이트 + 실패 시 롤백
- [x] **Step 13**: 컬럼 내 순서 변경 (PATCH /api/v1/customers/reorder)

### Phase 4: 대시보드 & 알림 & 리마인더
- [x] **Step 14**: 리마인더 목록 페이지 (app/dashboard/reminders/)
  - 오늘/이번주/전체 필터 탭
  - 미완료/완료 섹션 구분
  - 낙관적 완료 토글
  - API: GET /api/v1/reminders (전체 리마인더 조회, customers JOIN)
- [x] **Step 19**: 대시보드 KPI (app/dashboard/page.tsx)
  - 전체 고객 수 / 이번달 신규 / 이번달 계약 / 오늘 리마인더
  - Supabase 서버 컴포넌트 직접 쿼리
- [x] **Step 20**: 알림 시스템 (30초 폴링)
  - API: GET /api/v1/notifications (팀 알림 + 오늘/기한초과 리마인더 통합)
  - API: PATCH /api/v1/notifications (팀 알림 전체 읽음)
  - components/notifications/NotificationDropdown.tsx (드롭다운 UI)
  - Header에서 30초마다 폴링, 뱃지 카운트 표시

### Phase 5: 팀 관리
- [x] **Step 15**: 팀 대시보드 + 팀원 통계 (app/dashboard/team/)
  - 팀 없음: "팀 만들기" + "초대 코드로 가입" UI
  - 팀 있음: 팀원 목록 + 이번달 통계 카드 (전체 고객, 신규, 상담, 계약)
  - API: GET /api/v1/team, POST /api/v1/team
- [x] **Step 16**: 팀원 파이프라인 뷰 (읽기 전용)
  - 팀원 드롭다운 선택 → 해당 팀원의 칸반 보드 표시 (isDraggable=false)
  - API: GET /api/v1/team/members/[id]/pipeline (팀 멤버십 검증)
- [x] **Step 17**: 팀 활동 리포트
  - 기간 필터: 이번 주 / 이번 달 / 지난 달
  - 팀원별 신규 고객, 상담 건수, 리마인더 완료율, 계약 수
  - API: GET /api/v1/team/report?period=week|month|last_month
- [x] **Step 18**: 팀원 초대 / 역할 관리
  - 초대 코드 방식 (8자리, 7일 만료, 1회 사용)
  - API: GET/POST /api/v1/team/invite, POST /api/v1/team/join
  - 역할 변경: manager ↔ member (팀장 전용)
  - 팀원 제거 / 본인 탈퇴
  - API: PATCH/DELETE /api/v1/team/members/[id]
  - DB 마이그레이션: 006_team_invite_codes.sql (team_invite_codes 테이블 + get_team_member_profiles RPC)

### Phase 6: Google 통합
- [x] **Step G1**: Google OAuth 스코프 확장 (contacts, calendar, drive) + app/auth/page.tsx
- [x] **Step G2**: DB 마이그레이션 (google_integration)
  - customers: address, google_contact_id, google_drive_folder_id, is_google_contact_synced 컬럼 추가
  - reminders: google_event_id 컬럼 추가
  - customer_drive_files 테이블 신규 (UNIQUE: customer_id + file_id)
- [x] **Step G3**: Google API 라이브러리 생성
  - lib/google/contacts.ts — People API (create/update/delete contact)
  - lib/google/calendar.ts — Calendar API (create/update/delete event)
  - lib/google/drive.ts — Drive API (createFolder, listFiles)
- [x] **Step G4**: API Route 연동
  - POST /api/v1/customers → 고객 생성 시 구글 주소록 동기화 옵션
  - PATCH/DELETE /api/v1/customers/[id] → 수정/삭제 시 구글 주소록 연동
  - POST /api/v1/customers/[id]/reminders → 캘린더 이벤트 생성
  - PATCH/DELETE /api/v1/customers/[id]/reminders/[rid] → 캘린더 이벤트 수정/삭제
  - POST /api/v1/customers/[id]/drive-folder → 드라이브 폴더 생성
  - GET /api/v1/customers/[id]/drive-files → 드라이브 파일 목록 (스냅샷 동기화)
- [x] **Step G5**: UI 연동
  - CustomerForm: address 필드 + 구글 주소록 동기화 토글
  - CustomerDetailClient: 구글 연동 상태 바 (주소록 바로가기 / 드라이브 폴더 바로가기 / 폴더 만들기)
  - CustomerDetailClient: address InfoRow 표시
  - InteractionTimeline: 드라이브 파일 이력 통합 표시 (📁 파일명, Drive 링크)
  - ReminderItem: google_event_id 있으면 📅 캘린더 바로가기 버튼 표시
- [x] **Step G6**: 타입 갱신 (types/customer.ts, types/database.types.ts)

### Phase 7: UX 개선 & 고객 가져오기

- [x] **Step U1**: "리마인더" → "일정" UI 텍스트 전체 교체
  - 변경 파일: Sidebar.tsx, Header.tsx, BottomTabBar.tsx, dashboard/page.tsx, RemindersClient.tsx, ReminderItem.tsx, calendar.ts
  - DB/변수명은 유지 (reminders, is_done 등)

- [x] **Step U2**: 일정 시작 시간 (start_time) 기능
  - DB 마이그레이션: `ALTER TABLE reminders ADD COLUMN IF NOT EXISTS start_time TIME`
  - `supabase/migrations/20260324204421_reminder_start_time.sql`
  - Reminder 타입에 `start_time?: string | null` 추가
  - 일정 추가 폼: time input 추가 (현재 시간 반올림 기본값 — 분 < 30이면 :30, 이상이면 +1시간:00)
  - 목록 표시: `2026.03.24 14:30` 형식
  - Google Calendar: start_time 있으면 timed event (dateTime), 없으면 all-day event (date)
  - API: POST/PATCH /api/v1/customers/[id]/reminders — start_time 포함

- [x] **Step U3**: 일정 메모 팝업 (고객 상세 전용)
  - ReminderItem.tsx 내 `ReminderModal` 서브컴포넌트 추가
  - 행 클릭 → 팝업: 날짜/시간 + 메모 전체 + [수정] [삭제] [닫기]
  - 수정 모드: due_date / start_time / memo 인라인 편집 → PATCH API

- [x] **Step U4**: 사이드바 일정 탭 → 고객 상세 이동
  - RemindersClient.tsx: 행 본문 클릭 → `/dashboard/customers/{id}?tab=reminders`
  - app/dashboard/customers/[id]/page.tsx: `searchParams.tab` 읽어 `initialTab` prop 전달
  - CustomerDetailClient.tsx: `initialTab` prop → 탭 초기화

- [x] **Step U5**: 고객관리 파이프라인 단계별 필터 버튼
  - CustomersClient.tsx의 select 드롭다운 → 필터 버튼 행으로 교체
  - 단계별 고객 수 표시, 선택된 단계 컬러 강조
  - 영업/이탈 단계 `|` 구분선

- [x] **Step U6**: 구글 주소록 미연동 고객 → 연동하기 버튼
  - 신규 API: `POST /api/v1/customers/[id]/sync-contact`
    - createGoogleContact() 호출 → google_contact_id / is_google_contact_synced 업데이트
    - interactions에 📇 자동 기록
  - CustomerDetailClient: 미연동 시 "📇 주소록 연동하기" 버튼 표시 (항상 상태 바 표시)

- [x] **Step I1**: CSV 파일 대량 고객 등록
  - `lib/utils/phone.ts` — `normalizeKoreanPhone()` 공유 유틸
    - `+82 10-...`, `+8210-...`, `01012345678` 등 → `010-XXXX-XXXX`
  - `app/api/v1/customers/bulk-import/route.ts` — POST (최대 1,000건, 100건 배치 insert)
  - `components/customers/CsvImportModal.tsx`
    - 드래그앤드롭 + 파일 선택, CSV 템플릿 다운로드
    - 미리보기 테이블 (이름/전화번호/이메일/상태)
    - 구글 주소록 내보내기 형식 컬럼 매핑
  - CustomersClient.tsx 툴바에 "CSV 가져오기" 버튼 추가

- [x] **Step I2**: 구글 주소록 선택적 가져오기
  - `app/api/v1/google/contacts/route.ts` — GET (People API 프록시, 100개씩 페이지네이션)
    - provider_token 없으면 `REAUTH_REQUIRED` 반환
  - `app/api/v1/customers/bulk-import-contacts/route.ts` — POST
    - google_contact_id 저장, is_google_contact_synced = true 자동 설정
  - `components/customers/GoogleContactsImportModal.tsx`
    - 검색(client-side) + 전체선택(indeterminate) + 더 불러오기(nextPageToken)
    - 재인증 에러 상태: 재로그인 버튼
  - CustomersClient.tsx 툴바에 "주소록 가져오기" 버튼 추가

**툴바 최종 구조:**
```
[ 🔍 검색 ] [ ↑ CSV 가져오기 ] [ 👤 주소록 가져오기 ] [ + 고객 추가 ]
```

## 참고
- Next.js 버전: 16.2.1 (proxy.ts 사용, middleware.ts 아님)
- Supabase 프로젝트 ref: nxvfoavevfllpazpqqko
- Google OAuth: Supabase Dashboard에서 Provider 활성화 필요
