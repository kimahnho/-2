---
description: MECE 원칙에 따른 코드 작성 가이드
---

# MECE 코딩 가이드라인

이 프로젝트는 MECE(Mutually Exclusive, Collectively Exhaustive) 원칙에 따라 코드를 구조화합니다.

## MECE 원칙이란?

- **상호 배타적(Mutually Exclusive)**: 각 모듈이 다른 모듈과 중복되는 책임을 갖지 않음
- **전체 포괄적(Collectively Exhaustive)**: 모든 모듈을 합쳤을 때 필요한 모든 기능을 포함

## 디렉토리 구조

```
project/
├── services/           # 비즈니스 로직 (도메인별 분리)
│   ├── index.ts        # 모든 서비스 re-export
│   ├── studentService.ts
│   ├── groupService.ts
│   ├── scheduleService.ts
│   ├── projectService.ts
│   └── [새로운도메인]Service.ts
├── types/              # 타입 정의 (역할별 분리)
│   ├── index.ts        # 모든 타입 re-export
│   ├── domain.types.ts # 도메인 모델 (Student, Group, etc.)
│   ├── editor.types.ts # 에디터 관련 (DesignElement, Page)
│   └── ui.types.ts     # UI 상호작용 (Position, DragInfo)
├── constants/          # 상수 (사용 목적별 분리)
│   ├── index.ts        # 모든 상수 re-export
│   ├── style.constants.ts
│   ├── emotion.constants.ts
│   └── template.constants.ts
├── hooks/              # React 커스텀 훅
├── components/         # UI 컴포넌트
└── utils/              # 순수 유틸리티 함수
```

## 새 코드 작성 시 체크리스트

### 1. 새 서비스 추가 시
- [ ] 단일 도메인 엔티티만 담당하는가?
- [ ] 다른 서비스와 책임이 중복되지 않는가?
- [ ] `services/index.ts`에 export를 추가했는가?
- [ ] 크로스 도메인 로직이 필요하면 `storageService.ts`에 추가했는가?

### 2. 새 타입 추가 시
- [ ] 적절한 카테고리 파일에 추가했는가?
  - 도메인 모델 → `domain.types.ts`
  - 에디터 관련 → `editor.types.ts`
  - UI 상호작용 → `ui.types.ts`
- [ ] `types/index.ts`에 export를 추가했는가?

### 3. 새 상수 추가 시
- [ ] 적절한 카테고리 파일에 추가했는가?
  - 스타일 관련 → `style.constants.ts`
  - 감정 관련 → `emotion.constants.ts`
  - 템플릿 관련 → `template.constants.ts`
- [ ] `constants/index.ts`에 export를 추가했는가?

## Import 규칙

```typescript
// ✅ 권장: 통합 인덱스에서 import
import { studentService, groupService } from './services';
import { StudentProfile, DesignElement } from './types';
import { PRESET_COLORS, TEMPLATES } from './constants';

// ⚠️ 허용: 구체적인 파일에서 직접 import (필요시)
import { studentService } from './services/studentService';
import { StudentProfile } from './types/domain.types';

// ❌ 지양: 레거시 파일에서 import (deprecated)
import { storageService } from './services/storageService';
import { StudentProfile } from './types.ts';
```

## 새 도메인 추가 예시

예를 들어 `Character` 도메인을 추가한다면:

1. **서비스 생성**: `services/characterService.ts`
2. **타입 추가**: `types/editor.types.ts`에 `CharacterProfile` 추가 (또는 새 파일 생성)
3. **상수 추가**: 필요시 `constants/character.constants.ts` 생성
4. **인덱스 업데이트**: 각 `index.ts`에 export 추가

## 코드 리뷰 포인트

- 하나의 파일이 100줄을 넘으면 분리 고려
- 하나의 서비스가 2개 이상의 도메인을 다루면 분리 필요
- import문이 3개 이상의 다른 디렉토리를 참조하면 구조 재검토

---

*이 가이드라인은 `.agent/workflows/mece-coding-guide.md`에 저장되어 있습니다.*
