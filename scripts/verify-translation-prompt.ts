/** Documentation is English only; the translation prompt is not used. */

const mode = process.argv[2]
if (mode !== undefined && mode !== '--snapshot') {
  console.error(`verify-translation-prompt: unsupported argument ${JSON.stringify(mode)}`)
  process.exit(2)
}
console.log('verify-translation-prompt: documentation is English only.')
