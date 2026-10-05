/**
 * Reject Chinese documentation counterparts. Documentation in this tree is English.
 * See `docs/i18n/README.md`.
 */

import { existsSync, globSync, readFileSync, statSync } from 'node:fs'
import { join, resolve, sep } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const args = process.argv.slice(2)
const cached = args[0] === '--cached'
if (!cached && args.length > 0) {
  console.error(`verify-translation-pairing: unsupported argument ${JSON.stringify(args[0])}`)
  process.exit(2)
}

const excludes = ['**/node_modules/**', 'vendor/**', 'website/.generated/**', 'website/.dist/**']
const errors: string[] = []

/** @param file - repository-relative path. */
function rejectChinese(file: string): void {
  const normalized = file.split(sep).join('/')
  if (normalized.endsWith('.zh.md') || normalized.endsWith('.i18n.yaml')) {
    const path = join(root, normalized)
    if (existsSync(path)) errors.push(`${normalized}: Chinese documentation is not part of this tree`)
    return
  }
  if (!normalized.endsWith('.md')) return
  const path = join(root, normalized)
  if (!existsSync(path) || !statSync(path).isFile()) return
  const text = readFileSync(path, 'utf8')
  if (/English \| \[中文\]/.test(text) || /\]\([^)\s]*\.zh\.md/.test(text)) {
    errors.push(`${normalized}: links to a Chinese counterpart`)
  }
}

if (cached) {
  for (const file of args.slice(1)) rejectChinese(file)
} else {
  for (const pattern of ['**/*.zh.md', '**/*.i18n.yaml']) {
    for (const match of globSync(pattern, { cwd: root, exclude: excludes })) rejectChinese(match)
  }
  for (const match of globSync('**/*.md', { cwd: root, exclude: [...excludes, '**/*.zh.md'] })) rejectChinese(match)
}

if (errors.length > 0) {
  console.error('verify-translation-pairing: documentation is English only (see docs/i18n/README.md):')
  for (const message of errors) console.error(`  ${message}`)
  process.exit(1)
}
console.log('verify-translation-pairing: documentation is English only.')
