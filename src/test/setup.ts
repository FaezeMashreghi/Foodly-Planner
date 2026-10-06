// Runs before every component test file.
import '@testing-library/jest-dom/vitest' // adds toBeInTheDocument(), toHaveFocus()…
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// Remove what the previous test rendered, so every test starts with an empty page.
afterEach(() => cleanup())

// jsdom has <dialog> but not showModal()/close(): a minimal stand-in for component tests.
HTMLDialogElement.prototype.showModal ??= function (this: HTMLDialogElement) {
  this.open = true
}
HTMLDialogElement.prototype.close ??= function (this: HTMLDialogElement) {
  this.open = false
  this.dispatchEvent(new Event('close'))
}
