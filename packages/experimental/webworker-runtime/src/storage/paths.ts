/**
 * Virtual root of the worker host's in-memory filesystem. Kept
 * in one module so the process shim, the path/os shims, and the VFS image
 * collector cannot drift apart.
 */

/** Virtual filesystem root; `process.cwd()` and every absolute path start here. */
export const KH_ROOT = '/kh'

/** `$KH_HOME`: durable-state directory inside the image. */
export const KH_HOME = `${KH_ROOT}/home`

/** Flat, symlink-free package tree resolved by the worker module loader. */
export const KH_NODE_MODULES = `${KH_ROOT}/node_modules`

/** Directory holding the composed cordis.yml. */
export const KH_CONFIG = `${KH_ROOT}/config`

/** Default (empty) workspace directory. */
export const KH_WORKSPACE = `${KH_ROOT}/workspace`

/** Temporary directory reported by `os.tmpdir()`. */
export const KH_TMP = `${KH_ROOT}/tmp`
