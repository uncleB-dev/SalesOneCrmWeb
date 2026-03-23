#!/usr/bin/env node
/**
 * Supabase 마이그레이션 실행 스크립트
 * 사용법: SUPABASE_ACCESS_TOKEN=xxx node scripts/run-migrations.js
 * 또는:   DATABASE_URL=postgresql://postgres:[password]@db.xxx.supabase.co:5432/postgres node scripts/run-migrations.js
 */
const fs = require('fs')
const path = require('path')
const https = require('https')

const PROJECT_REF = 'nxvfoavevfllpazpqqko'
const MIGRATIONS_DIR = path.join(__dirname, '..', 'supabase', 'migrations')

async function runSQL(sql, token) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ query: sql })
    const req = https.request({
      hostname: 'api.supabase.com',
      path: `/v1/projects/${PROJECT_REF}/database/query`,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    }, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        if (res.statusCode >= 400) {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`))
        } else {
          resolve(JSON.parse(data))
        }
      })
    })
    req.on('error', reject)
    req.write(body)
    req.end()
  })
}

async function main() {
  const token = process.env.SUPABASE_ACCESS_TOKEN
  if (!token) {
    console.error('SUPABASE_ACCESS_TOKEN 환경변수가 필요합니다')
    console.error('https://supabase.com/dashboard/account/tokens 에서 발급받으세요')
    process.exit(1)
  }

  const files = fs.readdirSync(MIGRATIONS_DIR)
    .filter(f => f.endsWith('.sql'))
    .sort()

  console.log(`총 ${files.length}개 마이그레이션 파일 실행`)

  for (const file of files) {
    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8')
    console.log(`\n▶ ${file} 실행 중...`)
    try {
      await runSQL(sql, token)
      console.log(`✓ ${file} 완료`)
    } catch (err) {
      console.error(`✗ ${file} 실패:`, err.message)
      // 이미 존재하는 경우 계속 진행
      if (err.message.includes('already exists')) {
        console.log('  → 이미 존재. 건너뜁니다.')
        continue
      }
      process.exit(1)
    }
  }

  console.log('\n✅ 모든 마이그레이션 완료!')
}

main()
