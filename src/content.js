import initial from './site-content.json'
export const DRAFT_KEY = 'chempek-site-draft-v1'
export const defaultContent = initial
const text = v => typeof v === 'string' && v.length <= 10000
export function validImage(v, empty = false) {
  return typeof v === 'string' && ((empty && v === '') || /^(https:\/\/[^\s]+|\.?\/?images\/[^\s]+|\/[^/\s][^\s]*|data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+/=]+)$/.test(v))
}
export function validateContent(c) {
  if (!c || typeof c !== 'object') return '올바른 홈페이지 JSON 파일이 아닙니다.'
  if (!c.company || !['name','englishName','phone','address','businessNumber','officialBrand','serviceArea'].every(k=>text(c.company[k])) || !c.company.name.trim() || !validImage(c.company.logo,true)) return '업체 정보와 로고 경로를 확인해 주세요.'
  if (c.company.portfolioUrl && !/^https:\/\/[^\s]+$/.test(c.company.portfolioUrl)) return '외부 시공 자료 링크는 HTTPS 주소로 입력해 주세요.'
  if (c.company.phone && !/^0[0-9\-\s]{8,14}$/.test(c.company.phone)) return '전화번호는 0으로 시작하는 숫자, 공백, 하이픈으로 입력해 주세요.'
  if (!c.images || !['hero','kitchen','living','commercial','detail'].every(k=>validImage(c.images[k]))) return '이미지 경로를 확인해 주세요. HTTPS 주소 또는 사진 업로드를 이용하세요.'
  if (!c.hero || !['eyebrow','title','description'].every(k=>text(c.hero[k])) || typeof c.hero.sample!=='boolean' || !c.hero.title.trim()) return '첫 화면의 제목과 샘플 표시를 확인해 주세요.'
  if (!c.about || !['title','lead','body'].every(k=>text(c.about[k]))) return '업체 소개 내용을 확인해 주세요.'
  if (!Array.isArray(c.projects) || c.projects.length>50 || !c.projects.every(p=>p && ['title','type','description','scope'].every(k=>text(p[k])) && p.title.trim() && ['주거','상업','부분공사'].includes(p.category) && validImage(p.image) && Array.isArray(p.gallery) && p.gallery.length>=1 && p.gallery.length<=10 && p.gallery.every(v=>validImage(v)) && typeof p.sample==='boolean' && text(p.details??'') && (typeof p.id==='number'||text(p.id))) || new Set(c.projects.map(p=>p.id)).size!==c.projects.length) return '사례 제목·분류·사진과 중복되지 않은 ID를 확인해 주세요.'
  if (!Array.isArray(c.services) || !c.services.length || c.services.length>20 || !c.services.every(s=>Array.isArray(s)&&s.length===3&&s.every(text))) return '서비스 내용을 확인해 주세요.'
  if (!Array.isArray(c.faqs) || c.faqs.length>30 || !c.faqs.every(f=>Array.isArray(f)&&f.length===2&&f.every(text))) return 'FAQ 내용을 확인해 주세요.'
  return ''
}
export function loadContent() {
  try {
    if (new URLSearchParams(location.search).get('draft') === '1') {
      const saved=JSON.parse(localStorage.getItem(DRAFT_KEY))
      if (!validateContent(saved)) return saved
    }
  } catch { /* 저장소가 제한된 환경에서는 배포된 내용을 사용합니다. */ }
  if (window.__CHEMPEK_CONTENT__ && !validateContent(window.__CHEMPEK_CONTENT__)) return window.__CHEMPEK_CONTENT__
  return initial
}
