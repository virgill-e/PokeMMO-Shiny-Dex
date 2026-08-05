import type { Locale } from '~/i18n/translations'
import { LOCALES, UI_TEXT } from '~/i18n/translations'

const STORAGE_KEY = 'pokemmo-shiny-dex:locale'

export function useLocale() {
  const locale = useState<Locale>('locale', () => 'fr')

  onMounted(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored && LOCALES.includes(stored as Locale)) {
      locale.value = stored as Locale
    }
  })

  function setLocale(next: Locale) {
    locale.value = next
    localStorage.setItem(STORAGE_KEY, next)
  }

  const t = computed(() => UI_TEXT[locale.value])

  return { locale, setLocale, t }
}
