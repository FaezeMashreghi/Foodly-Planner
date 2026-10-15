/**
 * `import()` makes Vite put DesktopWeek and dnd-kit in their own chunk, fetched only when this runs.
 * Never import desktop-week.tsx statically, or dnd-kit is back in every phone's download.
 */
export function loadDesktopWeek() {
  return import('./desktop-week').then((module) => ({ default: module.DesktopWeek }))
}
