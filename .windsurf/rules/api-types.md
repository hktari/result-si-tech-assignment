---
trigger: always_on
---

import api types like

```ts
import type { components } from '../../api-types'

type ActivityResponseDto = components['schemas']['ActivityResponseDto']
type CreateActivityDto = components['schemas']['CreateActivityDto']
type UpdateActivityDto = components['schemas']['UpdateActivityDto']
type ActivitiesListResponseDto = components['schemas']['ActivitiesListResponseDto']
```