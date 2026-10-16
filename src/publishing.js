import { validateContent } from './content'
export const CONTENT_API = 'https://api.github.com/repos/bluesoul343-cpu/chempek-homepage/contents/src/site-content.json'
const headers = { Accept: 'application/vnd.github.raw+json', 'X-GitHub-Api-Version': '2022-11-28' }
export async function readPublishedContent(signal) {
  const response = await fetch(CONTENT_API + '?ref=main', { headers, cache: 'no-store', signal })
  if (!response.ok) throw Error('최신 내용을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.')
  const content = await response.json()
  const error = validateContent(content)
  if (error) throw Error(error)
  return content
}
export async function publishContent(content, token, baseline) {
  const error = validateContent(content)
  if (error) throw Error(error)
  if (!token.trim()) throw Error('GitHub 저장용 토큰을 입력해 주세요.')
  const serialized = JSON.stringify(content, null, 2) + '\n'
  const bytes = new TextEncoder().encode(serialized)
  if (bytes.length > 20 * 1024 * 1024) throw Error('전체 사진 용량이 20MB를 넘습니다. 사진 크기를 줄여 주세요.')
  const auth = { Authorization: `Bearer ${token.trim()}`, 'X-GitHub-Api-Version': '2022-11-28' }
  const current = await fetch(CONTENT_API + '?ref=main', { headers: { ...auth, Accept: 'application/vnd.github+json' }, cache: 'no-store', signal: AbortSignal.timeout(20000) })
  if (!current.ok) throw Error('GitHub 인증 또는 저장소 권한을 확인해 주세요. Contents: Read and write 권한이 필요합니다.')
  const metadata = await current.json()
  const blob = await fetch(`https://api.github.com/repos/bluesoul343-cpu/chempek-homepage/git/blobs/${metadata.sha}`, { headers: { ...auth, Accept: 'application/vnd.github+json' }, signal: AbortSignal.timeout(20000) })
  if (!blob.ok) throw Error('현재 공개 내용을 확인하지 못했습니다. 다시 시도해 주세요.')
  const data = await blob.json()
  const latest = JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(data.content.replace(/\s/g, '')), c => c.charCodeAt(0))))
  if (!baseline || JSON.stringify(latest) !== JSON.stringify(baseline)) throw Error('다른 곳에서 공개 내용이 변경되었습니다. JSON 백업을 내려받고 새로고침한 뒤 변경 내용을 확인해 주세요.')
  let binary = ''
  for (let i = 0; i < bytes.length; i += 8192) binary += String.fromCharCode(...bytes.subarray(i, i + 8192))
  const response = await fetch(CONTENT_API, { method: 'PUT', headers: { ...auth, Accept: 'application/vnd.github+json', 'Content-Type': 'application/json' }, body: JSON.stringify({ message: '홈페이지 사진 및 내용 수정', content: btoa(binary), sha: metadata.sha, branch: 'main' }), signal: AbortSignal.timeout(60000) })
  if (!response.ok) throw Error(response.status === 409 ? '동시에 다른 수정이 저장되었습니다. 새로고침 후 다시 확인해 주세요.' : '저장하지 못했습니다. 토큰 권한·만료 및 저장소 규칙을 확인해 주세요.')
  return response.json()
}
