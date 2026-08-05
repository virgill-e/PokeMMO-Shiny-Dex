// Tracks which single RarityCell tooltip is open, for tap-to-toggle on touch
// devices (CSS :hover alone requires a sustained press on mobile). Only one
// tooltip is ever open at a time, and a single app-wide "click outside"
// listener (registered once in app.vue) closes it.
export function useRarityTooltip() {
  const openId = useState<string | null>('rarity-tooltip-open-id', () => null)

  function toggle(id: string) {
    openId.value = openId.value === id ? null : id
  }

  function isOpen(id: string) {
    return openId.value === id
  }

  function close() {
    openId.value = null
  }

  return { toggle, isOpen, close }
}
