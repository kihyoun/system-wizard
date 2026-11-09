# 의존성 보안

커밋된 잠금 파일과 그 파일로 빌드한 애플리케이션을 모두 감사하세요. 개발 의존성은
운영 환경 이미지에 포함되지 않더라도 로컬 개발 서버나 빌드에 영향을 줄 수 있습니다.

저장소에서 선언한 Node/npm 버전을 사용하세요. 다음 각 디렉터리에서 `npm audit --json`을 실행하세요.

- `sync`
- `wizard`
- `project-bootstrap/templates/angular`
- `project-bootstrap/templates/react`
- `project-bootstrap/wizard-build/modern/smoke`
- `project-bootstrap/wizard-build/recipe/smoke`

마지막 디렉터리는 보존된 과거 레시피입니다. 해당 소스와 레시피 식별 정보를 유지하세요.
현재 관리형 빌드의 변경은 새로 지원되는 레시피와 해당 마이그레이션 절차에 반영해야 합니다.

발견 사항을 실제 의존성 경로, 영향을 받는 버전, 업스트림 보안 공지와 대조하세요.
브라우저 애플리케이션, Node HTTP 클라이언트, 개발 서버, 빌드 도구를 구분하세요.
Registry 감사만으로 비공개 호스팅 제공자의 경고 목록을 읽었거나 해당 경고가 해결되었다고
입증할 수는 없습니다.

## 안정적인 수정과 호환성

문제가 수정된 호환 릴리스를 우선 선택하고 npm으로 잠금 파일을 다시 생성하세요.
직접 의존성의 정확한 버전 선언을 유지하고 안정 릴리스를 사용하세요. 호환성 확인을
`npm audit fix --force`로 대신하지 마세요. 영향을 받는 린트, 타입 검사, 빌드,
애플리케이션 검사를 실행한 다음, 지정된 통합 System 후보 검사와 병합 후 검사를 실행하세요.

현재 수정은 다음과 같이 서로 다른 경로를 다룹니다.

| 의존성 | 관련 용도 | 수정된 선택 버전 |
| --- | --- | --- |
| `body-parser` | Sync는 라우트 인증 전에 요청 본문을 파싱합니다. | `2.4.0`: [압축 본문 서비스 거부](https://github.com/advisories/GHSA-27r3-jxmh-p828)를 수정합니다. |
| `follow-redirects` | Axios의 Node HTTP 어댑터입니다. 브라우저는 다른 어댑터를 사용합니다. | 호환되는 잠금 파일 선택 버전 `1.16.3`에는 [민감한 헤더 수정](https://github.com/advisories/GHSA-mrwp-f3q8-3g9p)이 포함됩니다. |
| `minimatch` | ESLint와 TypeScript ESLint 개발 도구입니다. | 범위가 제한된 `11.0.5` 재정의에는 [패턴 증폭 수정](https://github.com/advisories/GHSA-g3hv-75wg-m249)이 포함됩니다. |
| Angular build/Vite | Angular 스타터의 빌드 및 개발 서버 도구입니다. | 안정 버전 Angular build/CLI `22.2.6`은 패치된 Vite 계열을 선택합니다. |
| `fast-uri` | Angular 도구 체인에서 간접 의존성으로 수행하는 URI/스키마 처리입니다. | 호환되는 잠금 파일 선택 버전 `3.1.9`가 URI 정규화와 스킴 처리를 수정합니다. |

`minimatch` 재정의는 Sync와 Wizard의 `eslint`, `@eslint/config-array`,
`@typescript-eslint/typescript-estree`에 한정됩니다. 상위 패키지 릴리스는 여전히 영향을 받는
10.x 계열을 요청합니다. 버전 11은 정규 표현식 생성 API를 제거하지만, 이 호출자들은
유지되는 `Minimatch`/`match` API를 사용합니다. 이 재정의를 변경할 때는 선언된 Node
24 런타임에서 실제 프로젝트의 린트/구성 순회를 검증하세요. 상위 패키지가 수정된 호환 의존성을
직접 선택하게 되면 동일한 검사를 반복한 뒤 재정의를 제거하세요. 패키지를 갱신할 때
타사 라이선스 고지를 보존하세요.

지속적인 발견에는 [Renovate의 승인 제어 배치](DEPENDENCY_UPDATES.md)를 사용하세요.
봇의 제안, 성공한 감사, 게시된 릴리스만으로 운영 환경이 승격되지는 않습니다.
릴리스 승인과 명시적인 배포가 계속 필요합니다.
