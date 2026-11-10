import { createSharedComposable, useColorMode } from '@vueuse/core'

// index.html reads this same key to apply the dark class before the first paint.
const STORAGE_KEY = 'expense-tracker:appearance'

export const useAppearance = createSharedComposable(() => useColorMode({ storageKey: STORAGE_KEY }))
