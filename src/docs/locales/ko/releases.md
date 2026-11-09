# 승인된 제품 릴리스

System은 [Semantic Versioning](https://semver.org/)에 따라 **MAJOR.MINOR.PATCH**를 사용하고
`vX.Y.Z` 태그를 붙입니다. 공개 설정, 백업, API 또는 설치 계약의 호환성을 깨는 변경은
주 버전을 올리고, 호환되는 기능은 부 버전, 호환되는 수정 및 보안 수정은 패치 버전을 올립니다.
데이터베이스 마이그레이션은 운영자 계약이 호환되어도 중단 시간과 체크포인트가 필요할 수 있습니다.
릴리스 노트에는 마이그레이션과 복구 요구 사항을 명시해야 합니다.
SemVer만으로 임의의 업그레이드가 안전하다고 판단할 수는 없습니다.

**1.0.0은 최초의 지원 제품 기준 버전입니다.** 과거 커밋과 이미지 공개는 원래 식별 정보를 유지합니다.
`VERSION`과 [관리되는 변경 이력](https://github.com/kihyoun/system/blob/master/CHANGELOG.md)은
각 릴리스를 준비할 때 검토합니다. 실패한 후보, 재시도 및 일반 파이프라인 실행에는 새 버전을 부여하지 않습니다.
소스/이미지 시도에 이미 버전이 할당되었다면, 다른 승인 시도에는 검토를 거친 새 버전이 필요합니다.

## 공개 릴리스 구성

[GitHub Releases](https://github.com/kihyoun/system/releases)는 신뢰할 수 있는 GitLab 절차의 결과를 제공합니다.
공개 코드 미러와 Docker Hub는 각각 소스와 이미지 배포 경로로 유지됩니다.
GitHub Actions는 공개 절차에 참여하지 않습니다. 각 안정 릴리스에는 다음이 포함됩니다.

- 미러링된 정확한 승인 System 커밋을 가리키는, 생성만 가능한 GitHub 표시용 태그와
  검토된 변경 이력에서 가져온 사용자용 릴리스 노트.
- `system-release-vX.Y.Z.json` 및 SHA-256 검증 파일: 정확한 System 커밋,
  소스 트리와 Wizard gitlink, 일치하는 공개 컨트롤러/Wizard 참조,
  변경 불가능한 매니페스트/설정 다이제스트와 승인 이미지 ID,
  동일 시도의 증거 해시와 검증된 호스트 호환성, 설치/업그레이드/복구 링크.
- 해당 릴리스 태그에 고정된 `quickstart.sh`와 `release-notes.md`.

공개 매니페스트 형식은 `system-accepted-release-v1`입니다. 모든 데이터는 동일 파이프라인의
승인된 후보, Docker Hub 공개 및 정확한 Wizard 소스 공개 기록으로부터 생성합니다.
내부 원본 기록, 비공개 레지스트리 URL, 설정, Seed, 인증 정보 및 운영 로그는 릴리스 자산에 포함하지 않습니다.
메타데이터와 체크섬은 모두 신뢰할 수 있는 GitHub 릴리스에서 받습니다.
체크섬은 전송 불일치를 탐지하며 독립적인 서명 신원을 증명하지 않습니다.

명시적으로 선택한 버전을 가져오는 예:

```bash
curl -fLO https://github.com/kihyoun/system/releases/download/v1.0.0/system-release-v1.0.0.json
curl -fLO https://github.com/kihyoun/system/releases/download/v1.0.0/system-release-v1.0.0.json.sha256
sha256sum -c system-release-v1.0.0.json.sha256
```

매니페스트의 `source.revision`을 체크아웃하고 고정된 서브모듈을 초기화하세요.

```bash
git clone https://github.com/kihyoun/system.git
cd system
git checkout --detach v1.0.0
git submodule update --init --recursive
git rev-parse HEAD HEAD^{tree}
git ls-tree HEAD wizard
```

출력을 매니페스트와 비교하세요. GitHub의 일반 소스 압축 파일에는 Wizard 서브모듈 내용이 없으므로
완전한 재귀 체크아웃이 아닙니다. 보존된 Wizard 릴리스 참조를 통해
Wizard 기본 브랜치를 변경하지 않고 고정된 gitlink를 공개적으로 가져올 수 있습니다.

새 호스트는 [빠른 시작](QUICKSTART.md)으로 설치하거나, 매니페스트의
`images.controller.reference`와 `images.wizard.reference`를
`bootstrapper/install-release.py --controller ... --wizard ... --release-metadata ...`에 전달하세요.
네이티브 설치 프로그램은 정확한 소스와 다운로드한 이미지 식별 정보를 검증합니다.
참조만으로 이미지 내용을 보존할 수는 없습니다. 검증된 이미지 아카이브를 보관하거나,
필요한 복구 기간 동안 공개/비공개 레지스트리를 복구할 수 있도록 준비하세요.

## 신뢰할 수 있는 공개 및 재시도 동작

필수 구성 요소, 브라우저, 후보 이미지 및 일회용 플랫폼 검사,
검토된 병합, 병합 후 검사, 공개 이미지 복사 및 소스 미러링은 GitLab에서 수행합니다.
보호된 네이티브 기본 브랜치의 `deploy:github-release` 작업은 해당 작업들이 끝난 뒤 실행됩니다.
GitLab API로 정확한 파이프라인/소스/아티팩트 소유권을 검증하고,
공개 소스와 이미지를 익명으로 가져올 수 있는지 확인합니다. 이미지를 복사하거나 다시 빌드하지 않습니다.
기존 GitLab 버전 태그 파이프라인의 검증은 그대로 유지됩니다.
GitHub 전용 표시 태그는 GitLab 태그 파이프라인을 만들지 않습니다.

게시 도구는 직렬화된 리소스 그룹을 사용합니다. 초안을 만들고 일관된 자산을 업로드한 뒤
게시하고 익명 조회를 검증합니다. 재시도는 동일 커밋의 태그, 동일한 릴리스 필드 및
바이트 단위로 동일한 자산만 재사용하며, 재할당이나 교체를 거부합니다.
중단된 초안은 같은 시도를 다시 실행하여 완료할 수 있습니다.
게시된 버전에는 누락된 자산이나 교체 자산을 추가할 수 없습니다.
이 절차 밖의 작성자로부터 추가로 보호하려면 GitHub의 변경 불가능한 릴리스와
레지스트리의 변경 불가능한 검색 태그를 활성화하세요.

신뢰할 수 있는 GitLab Runner에 다음 보호 변수를 설정하세요.

- `GITHUB_RELEASE_PUBLISH_ENABLED=true`와 기존 Docker Hub, GitHub 백업 및
  Wizard 소스 공개의 활성화 플래그와 인증 정보.
- `GITHUB_RELEASE_REPOSITORY=kihyoun/system` 또는 운영자의 공개 미러.
- `GITHUB_RELEASE_TOKEN_FILE`: 릴리스 저장소에만 Contents 쓰기 권한을 가진
  범위 제한 GitHub 토큰이 들어 있는 외부 mode-0600 파일.
  대체 수단은 보호되고 마스킹된 `GITHUB_RELEASE_TOKEN`입니다. 파일 선택이 우선합니다.
- `SYSTEM_RELEASE_GITLAB_TOKEN_FILE`: 소스 프로젝트용으로 범위가 제한된 GitLab `read_api`
  토큰이 들어 있는 외부 mode-0600 파일. 대체 수단은 보호되고 마스킹된
  `SYSTEM_RELEASE_GITLAB_TOKEN`입니다. SSH 미러 인증 정보는 릴리스 API 게시에 사용할 수 없습니다.

두 토큰은 신뢰할 수 없는 MR 코드가 접근할 수 없게 하고 체크아웃 및 아티팩트 경로 밖에 보관하세요.
인증 정보가 없으면 안전하게 중단됩니다. 기존 미러 SSH 키를 사용할 수 있는 API 토큰으로 간주하지 않습니다.
공개 메타데이터에는 이 인증 정보를 넣지 않습니다.

## 업그레이드 및 롤백

공개는 결과를 표시하고 배포하는 과정이며 운영 환경을 승격하지 않습니다.
기존 운영자는 승인된 소스/이미지 입력값을 네이티브
[컨트롤러 승격](../bootstrapper/README.md),
[GitLab 마이그레이션 및 콜드 체크포인트 복구](HANDBOOK.md#5-evolving-a-running-system),
[설정 및 Seed 복구](RECOVERY_CONTRACT.md) 절차에 사용합니다.
이전 컨트롤러/이미지, 설정, 일치하는 Seed 또는 콜드 체크포인트,
소스 및 독립적으로 접근 가능한 인증 정보를 보관하세요.
컨테이너 롤백으로 데이터베이스 마이그레이션을 되돌릴 수는 없습니다.
각 릴리스에 명시된 호환성을 검토하고 지정된 검증을 수행한 뒤 의도적으로 승격하세요.
