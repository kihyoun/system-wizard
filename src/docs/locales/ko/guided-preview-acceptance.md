# 배포 후 기본 안내형 미리 보기 승인 검사

검토된 `guided-preview-live.js` 진입점은 명시적으로 선택한 로컬 실행 System 컨트롤러에서
초기 안내형 설정을 검사합니다. 새 컨트롤러가 승인되고 명시적으로 배포된 후에만 실행하세요.
기본 Wizard 설정, 소스 우선 채택, GitLab 파이프라인, 환경 도우미를 재사용합니다.
컨트롤러를 설치하거나 운영 환경을 승격하지 않습니다.

이는 폐기 가능한 플랫폼 게이트와 별개입니다. 비공개 입력은 운영자 인스턴스를 식별합니다.
기본 호스트나 CI의 암묵적 활성화는 없습니다. 오프라인 전송 계약만으로 이 실제 승인 검사가
실행되었다고 입증할 수 없습니다. 성공한 검사 전용 보고서는 계획이며, 기능 승인 통과가 아닙니다.

## 사전 조건

승인된 컨트롤러/Wizard 이미지 쌍과 보관된 릴리스 설치 기록이 있는 새로운 공개 운영 환경
설치를 사용하세요. 일반 구성, 관리형 Wizard 등록, HTTPS GitLab과 Registry, Runner 등록,
신뢰할 수 있는 정확한 호스트 DNS/인증서가 이미 작동해야 합니다. 승인된 불변 System 환경
도우미가 기본 절차로 프로비저닝되어 있어야 합니다. 선택한 Runner는 `docker`와
`wizard-source-primary` 태그를 포함하여 일반 기본 Wizard 작업을 허용해야 합니다.
해당 작업에서 패키지, 브라우저, 이미지 의존성을 사용할 수 있어야 합니다.

네임스페이스와 아직 존재하지 않는 새 비공개 소스 프로젝트 이름을 선택하세요. 공개 HTTPS
Wizard 소스 또는 포크에는 승인된 컨트롤러 스냅샷과 동일하게 승인된 기본 CI 생성기 바이트가
있어야 합니다. 소스 전송은 공개 DNS를 검증하고 Git의 이름 해석을 고정합니다. 비공개 소스
엔드포인트, 조작된 기록, 편집된 CI 생성기는 승인 검사를 단축하는 방법이 아닙니다. Review
호스트는 사용 중이지 않아야 하고, 선언된 인증서/키가 있어야 하며, 이 설치로 해석되어야 합니다.
Beta는 비활성화된 상태로 둘 수 있습니다. 독립적인 System 소스 설정은 별도로 완료하세요.
Wizard 승인 검사에 또 다른 System 마이그레이션 파이프라인은 필요하지 않습니다.

도구는 Node 24와 로컬 Unix 소켓에 대한 Docker 접근 권한을 갖춘 운영자의 Linux 호스트에서
실행됩니다. 기본 인증을 읽기 전에 운영자가 제공한 정확한 컨트롤러 이미지 ID를 확인합니다.
이 ID는 독립적으로 검토된 배포/이미지 증거에서 얻으세요. 검사를 통과시키려고 임의의 현재
이미지로 대체하지 마세요.

## 비공개 입력과 명령

입력과 보고서를 체크아웃 밖에 보관하세요. 비공개 운영자 디렉터리와 다음 형태의 0600 권한
JSON 입력을 만들고, 모든 예시 값을 바꾸세요.

```json
{
  "version": 1,
  "syncUrl": "https://sync.example.com",
  "gitlabUrl": "https://gitlab.example.com",
  "controllerImageId": "sha256:<64 verified hexadecimal characters>",
  "settings": {
    "version": 1,
    "namespace": "operator-team",
    "wizard": {
      "mode": "import",
      "project": "wizard-preview-source",
      "origin": "https://github.com/REPLACE_OWNER/REPLACE_REPOSITORY.git"
    },
    "review": {
      "enabled": true,
      "host": "review.example.com",
      "ssl": "/ssl/live/review.example.com/fullchain.pem",
      "sslKey": "/ssl/live/review.example.com/privkey.pem"
    },
    "beta": {"enabled": false, "host": "", "ssl": "", "sslKey": ""}
  },
  "reportPath": "/root/private-preview-acceptance/report.json",
  "timeBudgetMilliseconds": 3600000
}
```

먼저 기본 사전 조건 계획을 검토하세요.

```sh
node tests/e2e/guided-preview-live.js --check-only /root/private-preview-acceptance/input.json
```

검사 전용 실행은 설치된 공개 이미지 쌍, 운영 환경 식별 정보, 기본 DNS/인증서/소스/Runner
사전 검사를 검증합니다. 저장소를 가져오거나, 소스 파이프라인을 시작하거나, 연결을 채택하거나,
Review를 배포하지 않습니다. 기본 인증은 사전 검사 중 평소처럼 수명이 짧은 API 자격 증명을
생성하고 폐기할 수 있습니다.

선택한 인스턴스, 소스, 네임스페이스, Review 호스트를 검토한 뒤 실제 승인 검사를 명시적으로
시작하세요.

```sh
node tests/e2e/guided-preview-live.js --apply /root/private-preview-acceptance/input.json
```

자격 증명은 선택한 컨트롤러의 저장된 구성에서 프로세스 메모리로 읽어옵니다. GitLab 관리자
API 토큰에는 고유한 승인 검사 이름이 있으며, 요청 입력으로만 전달하고 완료 또는 실패 시
폐기합니다. 명령 인수나 입력 파일에 토큰, 암호, 개인 키를 넣을 필요가 없습니다. 원시 하위
프로세스 오류, 작업 추적, HTTP 본문은 보고서에서 제외됩니다. 보고서는 운영자별 프로젝트와
작업 ID를 기록하므로 비공개입니다.

## 검증 항목과 보관 결과

적용에는 초기 관리형 등록이 필요하며 대상 프로젝트가 없어야 합니다. 실제 기본 가져오기는
새로운 자체 인스턴스 프로젝트 ID와 정상적인 기본 브랜치 푸시 파이프라인을 만듭니다.
도구는 실제 Runner에서 필수 `build:source`, `test:browser`, `build:wizard`, `test:wizard`
작업이 성공할 때까지 기다립니다. 실제 아티팩트를 읽고 기본 증거 계약을 사용해 소스 커밋,
파이프라인/이미지 식별 정보, 승인된 생성기 체크섬, 프로젝트 병합 게이트를 검증한 뒤 채택을
승인합니다.

도구는 동일한 인증 API로 설정을 재개합니다. 이어서 소유한 브랜치 하나와 초안 MR을 만들고,
해당 MR의 정상 기본 검사를 기다린 뒤 실제 수동 Review Deploy 및 Stop 작업을 실행합니다.
기존 제품 계약에서는 기본 푸시와 MR 컨텍스트가 모두 필요합니다. 대체 CI 생성기나 System
파이프라인은 도입하지 않습니다. 라우팅된 HTTPS 페이지, 실행 중인 후보 컨테이너, 정식 배포
식별 정보, Stop 후 제거를 확인합니다.

정확한 기본 구성 바이트와 실행 중인 불변 운영 환경 이미지 ID는 전체 과정에서 변경되지
않아야 합니다. 설정의 소스 우선 연결과 원하는 미리 보기 설정은 의도적으로 구성된 상태로
남습니다. 소스 프로젝트, 브랜치, 초안 MR, 파이프라인 증거는 검토할 수 있도록 남겨 둡니다.
도구는 정식 소스나 승인된 이력을 삭제하지 않습니다. 임시 자격 증명과 소유한 Review 배포만
정리합니다.

적용이 통과한 보고서에는 `acceptancePassed: true`가 있습니다. 승인을 기록하기 전에 개별
단계 결과와 실제 프로젝트/파이프라인/작업 ID를 읽으세요. 일부 기본 작업이 통과했어도 중단되거나
실패한 실행은 미완료입니다. 복구 전에 저장된 안내형 설정 상태, 소스 프로젝트, 정확한 Review
세대를 검사하세요. Stop 작업이 실패했다면 해당 소유 세대에 기존 기본 Stop/조정 절차를
사용하세요. 소유권 충돌을 우회하려고 라이브 환경 임대를 지우거나 다른 소스 이름으로 설정을
반복하지 마세요.
