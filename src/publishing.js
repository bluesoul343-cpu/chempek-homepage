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
export async function githubError(response) {
  let detail = ''
  try { detail = (await response.json()).message || '' } catch { /* HTTP status remains available */ }
  if (response.status === 401) return 'GitHub 인증 실패 (401): 토큰이 잘못되었거나 만료·폐기되었습니다. GitHub 비밀번호가 아닌 생성한 토큰 전체를 입력해 주세요. 새 토큰 생성 시 Resource owner는 bluesoul343-cpu로 선택하세요.'
  if (response.status === 404) return '저장소 접근 실패 (404): 토큰의 Repository access에서 chempek-homepage가 선택되어 있는지 확인해 주세요. 저장소 소유자는 bluesoul343-cpu입니다.'
  if (response.status === 403 || response.status === 429) {
    if (response.headers?.get('x-ratelimit-remaining') === '0' || /rate limit/i.test(detail)) return 'GitHub 요청 한도를 초과했습니다. 잠시 후 다시 저장해 주세요.'
    return 'GitHub 권한 부족 (403): 토큰 설정에서 chempek-homepage 저장소를 선택하고 Repository permissions → Contents → Read and write로 변경한 뒤 저장하세요. 승인 대기 중인 토큰은 승인 후 사용할 수 있습니다.'
  }
  if (response.status === 409) return '동시에 다른 수정이 저장되었습니다. JSON 백업 후 새로고침하여 다시 확인해 주세요.'
  if (response.status === 422) return 'GitHub 저장 거부 (422): 파일 용량 또는 main 브랜치의 직접 저장 제한을 확인해 주세요.'
  return `GitHub 요청 실패 (${response.status}): 잠시 후 다시 시도해 주세요.`
}
export async function publishContent(content, token, baseline) {
  const error = validateContent(content)
  if (error) throw Error(error)
  if (!token.trim()) throw Error('GitHub 저장용 토큰을 입력해 주세요.')
  if (/\s/.test(token.trim())) throw Error('토큰 중간에 공백이나 줄바꿈이 들어 있습니다. 생성한 토큰만 복사해 입력해 주세요.')
  const serialized = JSON.stringify(content, null, 2) + '\n'
  const bytes = new TextEncoder().encode(serialized)
  if (bytes.length > 20 * 1024 * 1024) throw Error('전체 사진 용량이 20MB를 넘습니다. 사진 크기를 줄여 주세요.')
  const auth = { Authorization: `Bearer ${token.trim()}`, 'X-GitHub-Api-Version': '2022-11-28' }
  const current = await fetch(CONTENT_API + '?ref=main', { headers: { ...auth, Accept: 'application/vnd.github+json' }, cache: 'no-store', signal: AbortSignal.timeout(20000) })
  if (!current.ok) throw Error(await githubError(current))
  const metadata = await current.json()
  const blob = await fetch(`https://api.github.com/repos/bluesoul343-cpu/chempek-homepage/git/blobs/${metadata.sha}`, { headers: { ...auth, Accept: 'application/vnd.github+json' }, signal: AbortSignal.timeout(20000) })
  if (!blob.ok) throw Error(await githubError(blob))
  const data = await blob.json()
  const latest = JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(data.content.replace(/\s/g, '')), c => c.charCodeAt(0))))
  if (!baseline || JSON.stringify(latest) !== JSON.stringify(baseline)) throw Error('다른 곳에서 공개 내용이 변경되었습니다. JSON 백업을 내려받고 새로고침한 뒤 변경 내용을 확인해 주세요.')
  let binary = ''
  for (let i = 0; i < bytes.length; i += 8192) binary += String.fromCharCode(...bytes.subarray(i, i + 8192))
  const response = await fetch(CONTENT_API, { method: 'PUT', headers: { ...auth, Accept: 'application/vnd.github+json', 'Content-Type': 'application/json' }, body: JSON.stringify({ message: '홈페이지 사진 및 내용 수정', content: btoa(binary), sha: metadata.sha, branch: 'main' }), signal: AbortSignal.timeout(60000) })
  if (!response.ok) throw Error(await githubError(response))
  return response.json()
}
