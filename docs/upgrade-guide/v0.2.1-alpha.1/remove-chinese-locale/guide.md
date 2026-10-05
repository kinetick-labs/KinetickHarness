---
kind: upgrade-guide
description: "Shipped UI locales and documentation are English only."
---

# Chinese locale and documentation removed

## Change

The browser client and Desktop shell ship English only. `locale.preference` value `zh` no longer selects a built-in dictionary; the UI opens in English. Chinese documentation pages (`*.zh.md`) and pairing records (`*.i18n.yaml`) are not published.

## Migration

1. Remove a saved `locale.preference` of `zh`, or leave it unset. Confirm the Web UI and Desktop shell render English.
2. Update links that pointed at `*.zh.md` pages so they point at the English page.
3. Confirm a repository checkout contains no `*.zh.md` or `*.i18n.yaml` files.
