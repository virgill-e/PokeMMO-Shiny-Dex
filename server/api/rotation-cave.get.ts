// Fetches the community-maintained "Rotation Groups" sheet that tracks
// PokeMMO's rotating Altering Cave: the cave's type theme (and its spawns)
// changes periodically, and this sheet is the only place tracking which one
// is currently active. Google's gviz endpoint has no CORS headers, so this
// has to run server-side; the response isn't cached, per the request to
// re-fetch on every page load.
//
// Sheet: https://docs.google.com/spreadsheets/d/12lZupylxLAKUVQQJZIC8GJmvQiUwpbAAQ3BduAu_rig
// Credit required by the sheet itself: "if you are using this data for a
// site, tool, etc, whatever it is, you must credit this sheet" (cell O1).
const SHEET_ID = '12lZupylxLAKUVQQJZIC8GJmvQiUwpbAAQ3BduAu_rig'
const GID = '1031347870' // "Rotation Groups" tab
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit?gid=${GID}`

const SECTION_LABELS = new Set(['Singles', 'Rare Singles', 'Hordes'])

interface Entry { name: string, tier: number | null }
interface RotationCaveData {
  typeName: string
  singles: Entry[]
  rareSingles: Entry[]
  hordes: Entry[]
  sourceUrl: string
  credit: string
}

export default defineEventHandler(async (): Promise<RotationCaveData> => {
  const raw = await $fetch<string>(
    `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq`,
    { query: { tqx: 'out:json', gid: GID, headers: '0' }, responseType: 'text' },
  )

  const json = JSON.parse(raw.replace(/^[^(]*\(/, '').replace(/\);?\s*$/, ''))
  const rows: Array<{ c: Array<{ v: unknown } | null> }> = json.table.rows
  const cell = (row: number, col: number) => rows[row]?.c[col]?.v ?? null

  // The sheet has a dedicated leading column marked "Current" (row 3) with
  // the live data — this is the authoritative marker. Every other column
  // just holds historical "Rotation N" reference data; the last one is
  // still tagged "ACTIVE" (row 2) but that no longer means "currently
  // active" since the sheet started using a separate "Current" column, so
  // it's only a fallback in case the sheet ever reverts to the old layout
  // where both markers lived on the same column.
  let activeCol = -1
  let fallbackCol = -1
  const typeRow = rows[1]?.c ?? []
  for (let col = 0; col < typeRow.length; col += 2) {
    if (cell(3, col) === 'Current') {
      activeCol = col
      break
    }
    if (cell(2, col) === 'ACTIVE' && fallbackCol === -1) {
      fallbackCol = col
    }
  }
  if (activeCol === -1) activeCol = fallbackCol
  if (activeCol === -1) {
    throw createError({ statusCode: 502, statusMessage: 'No active rotation found in sheet' })
  }

  const typeName = String(cell(1, activeCol))
  const tierCol = activeCol + 1

  const sections: Record<string, Entry[]> = { Singles: [], 'Rare Singles': [], Hordes: [] }
  let currentSection: string | null = null

  for (let row = 4; row < rows.length; row++) {
    const name = cell(row, activeCol)
    if (name === null) break
    if (SECTION_LABELS.has(String(name))) {
      currentSection = String(name)
      continue
    }
    if (!currentSection) continue
    const tier = cell(row, tierCol)
    sections[currentSection]!.push({ name: String(name), tier: typeof tier === 'number' ? tier : null })
  }

  return {
    typeName,
    singles: sections.Singles!,
    rareSingles: sections['Rare Singles']!,
    hordes: sections.Hordes!,
    sourceUrl: SHEET_URL,
    credit: 'Rotation Groups — Team Méw (@rsslunar, @hekation, @kithri, @lorddusk)',
  }
})
