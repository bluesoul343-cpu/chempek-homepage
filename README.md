# 켐팩 / Chempek 홈페이지 초안

React 19 + Vite 8 기반 반응형 홈페이지입니다. Node.js 22.12 이상(현재 검증: 24.19.0)이 필요합니다.

## 실행

```bash
cd /workspace/chempek-homepage
npm ci --cache /tmp/chempek-npm
npm run dev -- --host 0.0.0.0
```

개발 서버 포트는 5173입니다. 앱 미리보기 기능이 제공되는 환경에서는 해당 포트를 선택하세요. 현재 온보딩 화면은 로컬 서버 미리보기 링크를 지원하지 않습니다. 로컬 컴퓨터에서는 개발 서버가 출력하는 주소를 브라우저로 여세요.

```bash
npm run build
npm run preview -- --host 0.0.0.0
npm run lint
```

빌드 출력: `dist/`. 정적 호스팅에 배포할 수 있으며 현재 공개 배포하지 않았습니다.

## 수정 위치

- `src/data.js`: 업체명, 전화번호, 주소, 사업자등록번호, 공식 대리점 브랜드, 로고 경로, 사진 및 사례, 서비스, FAQ.
- `company.logo`: `public/`에 로고 파일을 넣고 `/logo.png`처럼 지정. 비어 있으면 텍스트 로고 표시.
- 사진은 `public/images/`에 넣고 `images`와 사례의 `image`, `gallery` 경로를 수정하세요.
- `src/App.jsx`: 페이지 구성, 상담 검증 및 제출 처리.
- `src/App.css`, `src/index.css`: 반응형 디자인과 색상.

## 실제 공개 전

모든 사례와 사진은 샘플입니다. `public/images/`의 이미지는 AI 생성 인테리어 시각화이며 실제 시공 실적이 아닙니다. 외부 이미지/폰트 서비스 없이 작동합니다. 실제 현장 사진, 확인된 공사 범위와 기간으로 교체한 뒤에만 샘플 표시를 제거하세요. 전화번호를 입력하면 모바일 전화 상담 버튼이 통화 링크로 바뀝니다. 주소·사업자번호·브랜드는 확인된 값만 입력하세요. 후기는 만들지 않았습니다.

상담 양식은 HTML 입력 검증 및 입력 확인만 수행합니다. 전송/저장/접수하지 않으며 새로고침하면 내용이 사라집니다. `consultationEndpoint`만 입력해도 연결되지는 않습니다. 실제 API와 서버 검증, 오류 처리, 스팸 방지, 개인정보 처리·동의 및 보관 정책을 구현한 뒤 서버가 접수를 확인한 경우에만 완료 안내를 제공해야 합니다.

## 검증

`npm run build`, `npm run lint` 실행. Chromium/Playwright로 사례 필터 및 초기화, 상세 모달과 Escape 닫기, FAQ, 필수 입력 검증, 미연결 안내, 390px 모바일 메뉴 및 고정 버튼, 가로 넘침을 검사했습니다. 사용자 계정 연결은 필요하지 않습니다.

## 설치 없이 확인할 단일 HTML

`npm run export:html`로 `dist/chempek.html`을 만듭니다. React 코드, CSS, 샘플 이미지를 모두 포함하여 서버 설치 없이 일반 브라우저에서 열 수 있습니다. 상담 기능은 여전히 실제 전송하지 않습니다. 관리형 브라우저는 보안 정책에 따라 로컬 HTML 열기를 제한할 수 있습니다.

## GitHub Pages 무료 배포

예정 주소: https://bluesoul343-cpu.github.io/chempek-homepage/

`.github/workflows/deploy-pages.yml`은 `main`에 푸시할 때 빌드하고 GitHub Pages에 배포합니다. GitHub 저장소의 **Settings → Pages → Build and deployment → Source → GitHub Actions**를 선택해야 합니다. **Actions → Deploy Chempek to GitHub Pages → Run workflow → main → Run workflow**에서 수동 배포할 수 있습니다. 계정 플랜에 따라 무료 Pages 이용에는 공개 저장소가 필요할 수 있습니다. 저장소 공개 여부는 소유자가 확인하세요.

파일과 사진은 상대 경로로 제공되어 프로젝트 하위 주소에서도 작동합니다. 실제 배포 성공은 Actions의 결과와 공개 주소에서 확인해야 합니다.
