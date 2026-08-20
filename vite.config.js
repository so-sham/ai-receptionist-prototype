import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// No API proxy: this build runs on a mocked extract() (see src/lib/extract.js),
// so there is no key to keep off the browser. Wire one up here if that changes —
// forward /api/claude to https://api.anthropic.com/v1/messages, injecting
// x-api-key and anthropic-version from the environment.
export default defineConfig({
  plugins: [react()],
})
