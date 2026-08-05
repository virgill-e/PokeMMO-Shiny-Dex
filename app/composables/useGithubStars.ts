const REPO = 'virgill-e/PokeMMO-Shiny-Dex'

// Fetched once per session (module-scope state via useState), not re-fetched
// on every mount. Failures (rate limit, offline) just leave it null — the
// count is a nice-to-have, never worth blocking or erroring the page over.
export function useGithubStars() {
  const stars = useState<number | null>('github-stars', () => null)

  onMounted(async () => {
    if (stars.value !== null) return
    try {
      const data = await $fetch<{ stargazers_count: number }>(`https://api.github.com/repos/${REPO}`)
      stars.value = data.stargazers_count
    } catch {
      // ignore: keep stars null, UI falls back to a plain GitHub link
    }
  })

  return { stars }
}
