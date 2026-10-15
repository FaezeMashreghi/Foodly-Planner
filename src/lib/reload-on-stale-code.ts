const LAST_RELOAD_KEY = 'foodly:stale-code-reload'
const RETRY_WINDOW_MS = 10_000

/**
 * After a deploy, an old tab can ask for code files that no longer exist ("Failed to fetch
 * dynamically imported module"). Reloading once gets the new index.html with the new file names.
 */
export function reloadOnStaleCode() {
  window.addEventListener('vite:preloadError', reloadOnce)
}

function reloadOnce(event: Event) {
  try {
    const lastReload = Number(sessionStorage.getItem(LAST_RELOAD_KEY) ?? 0)
    // Failed again right after our reload: not stale code (offline?), so let the error page show.
    if (Date.now() - lastReload < RETRY_WINDOW_MS) return
    sessionStorage.setItem(LAST_RELOAD_KEY, String(Date.now()))
  } catch {
    // Without storage we can't stop a reload loop, so don't reload at all.
    return
  }
  event.preventDefault()
  window.location.reload()
}
