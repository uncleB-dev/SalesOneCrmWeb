const DRIVE_API = 'https://www.googleapis.com/drive/v3'
const ROOT_FOLDER_NAME = 'SalesOneCRM'

export interface DriveFile {
  id: string
  name: string
  createdTime: string | null
  modifiedTime: string | null
}

async function driveRequest(url: string, accessToken: string, options?: RequestInit): Promise<any> {
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...(options?.body ? { 'Content-Type': 'application/json' } : {}),
      ...options?.headers,
    },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(`Google Drive API 오류: ${err?.error?.message ?? res.statusText}`)
  }
  return res.json()
}

async function findFolder(accessToken: string, name: string, parentId?: string): Promise<string | null> {
  const parentClause = parentId ? `'${parentId}' in parents` : `'root' in parents`
  const q = encodeURIComponent(
    `name='${name}' and mimeType='application/vnd.google-apps.folder' and trashed=false and ${parentClause}`
  )
  const data = await driveRequest(`${DRIVE_API}/files?q=${q}&fields=files(id)&pageSize=1`, accessToken)
  return data.files?.[0]?.id ?? null
}

async function createFolderInParent(accessToken: string, name: string, parentId?: string): Promise<string> {
  const body: any = { name, mimeType: 'application/vnd.google-apps.folder' }
  if (parentId) body.parents = [parentId]
  const data = await driveRequest(`${DRIVE_API}/files`, accessToken, {
    method: 'POST',
    body: JSON.stringify(body),
  })
  return data.id as string
}

async function findOrCreateRootFolder(accessToken: string): Promise<string> {
  const existing = await findFolder(accessToken, ROOT_FOLDER_NAME)
  if (existing) return existing
  return createFolderInParent(accessToken, ROOT_FOLDER_NAME)
}

async function findAvailableFolderName(
  accessToken: string,
  baseName: string,
  parentId: string
): Promise<string> {
  // Fetch folders in the parent whose name starts with baseName
  const q = encodeURIComponent(
    `'${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and name contains '${baseName}' and trashed=false`
  )
  const data = await driveRequest(`${DRIVE_API}/files?q=${q}&fields=files(name)&pageSize=100`, accessToken)
  const existingNames = new Set<string>((data.files ?? []).map((f: any) => f.name as string))

  if (!existingNames.has(baseName)) return baseName

  let counter = 2
  while (existingNames.has(`${baseName}_${counter}`)) counter++
  return `${baseName}_${counter}`
}

export async function createDriveFolder(accessToken: string, customerName: string): Promise<string> {
  // STEP 1: SalesOneCRM 루트 폴더 확인 또는 생성
  const rootId = await findOrCreateRootFolder(accessToken)

  // STEP 2: 폴더명 생성 {customerName}_{YYMMDD}
  const now = new Date()
  const yy = String(now.getFullYear()).slice(2)
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  const baseName = `${customerName}_${yy}${mm}${dd}`

  // STEP 3: 중복 확인 및 넘버링
  const finalName = await findAvailableFolderName(accessToken, baseName, rootId)

  // STEP 4: SalesOneCRM 폴더 아래 생성
  return createFolderInParent(accessToken, finalName, rootId)
}

export async function getDriveFolderFiles(accessToken: string, folderId: string): Promise<DriveFile[]> {
  const query = encodeURIComponent(`'${folderId}' in parents and trashed = false`)
  const fields = encodeURIComponent('files(id,name,createdTime,modifiedTime)')
  const data = await driveRequest(
    `${DRIVE_API}/files?q=${query}&fields=${fields}&orderBy=modifiedTime+desc`,
    accessToken
  )
  return (data.files ?? []) as DriveFile[]
}

export function getGoogleDriveFolderUrl(folderId: string): string {
  return `https://drive.google.com/drive/folders/${folderId}`
}
