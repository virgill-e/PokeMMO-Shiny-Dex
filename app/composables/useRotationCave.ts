// Mirrors the server's SHEET_ID/GID (server/api/rotation-cave.get.ts) so the
// sheet link can still be shown to the user even when the fetch/parse fails.
export const ROTATION_CAVE_SHEET_URL = 'https://docs.google.com/spreadsheets/d/12lZupylxLAKUVQQJZIC8GJmvQiUwpbAAQ3BduAu_rig/edit?gid=1031347870'

export interface RotationCaveEntry { name: string, tier: number | null }
export interface RotationCaveData {
  typeName: string
  singles: RotationCaveEntry[]
  rareSingles: RotationCaveEntry[]
  hordes: RotationCaveEntry[]
  sourceUrl: string
  credit: string
}

// Fetched once per page load (not cached across visits) so the hover always
// reflects whatever is currently live on the sheet.
export function useRotationCave() {
  const data = useState<RotationCaveData | null>('rotation-cave-data', () => null)
  const error = useState('rotation-cave-error', () => false)
  const loading = useState('rotation-cave-loading', () => false)

  async function load() {
    if (data.value || loading.value) return
    loading.value = true
    error.value = false
    try {
      data.value = await $fetch<RotationCaveData>('/api/rotation-cave')
    } catch {
      error.value = true
    } finally {
      loading.value = false
    }
  }

  return { data, error, loading, load }
}
