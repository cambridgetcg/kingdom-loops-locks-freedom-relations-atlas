import { createHash } from 'node:crypto'
import {
  closeSync,
  existsSync,
  fsyncSync,
  lstatSync,
  mkdirSync,
  openSync,
  readFileSync,
  readdirSync,
  renameSync,
  statSync,
  unlinkSync,
  writeSync,
} from 'node:fs'
import { dirname, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

export const ROOT = fileURLToPath(new URL('../', import.meta.url))
export const ATLAS_PUBLIC_PATH = join(ROOT, 'public', 'atlases', 'loops-locks-freedom-relations-atlas-2026-08-28.json')
export const SCHEMA_PUBLIC_PATH = join(ROOT, 'public', 'schemas', 'loops-locks-freedom-relations-atlas', '0.1.json')
export const GUIDE_PUBLIC_PATH = join(ROOT, 'public', 'LOOPS-LOCKS-FREEDOM-RELATIONS-ATLAS-v0.1.md')
export const GUIDE_SOURCE_PATH = join(ROOT, 'guide', 'public-guide.md')
export const PUBLIC_FILES = Object.freeze([
  'public/LOOPS-LOCKS-FREEDOM-RELATIONS-ATLAS-v0.1.md',
  'public/atlases/loops-locks-freedom-relations-atlas-2026-08-28.json',
  'public/schemas/loops-locks-freedom-relations-atlas/0.1.json',
])
export const MAX_JSON_BYTES = 8 * 1024 * 1024
export const MAX_TEXT_BYTES = 1024 * 1024

function assertWellFormedString(value) {
  for (let index = 0; index < value.length; index += 1) {
    const unit = value.charCodeAt(index)
    if (unit >= 0xd800 && unit <= 0xdbff) {
      const next = value.charCodeAt(index + 1)
      if (!(next >= 0xdc00 && next <= 0xdfff)) throw new TypeError('unpaired high surrogate')
      index += 1
    } else if (unit >= 0xdc00 && unit <= 0xdfff) throw new TypeError('unpaired low surrogate')
  }
  return value
}

function normalize(value, seen = new Set()) {
  if (value === null || typeof value === 'boolean') return value
  if (typeof value === 'string') return assertWellFormedString(value)
  if (typeof value === 'number') {
    if (!Number.isFinite(value) || !Number.isSafeInteger(value)) throw new TypeError('only finite safe integers are allowed')
    return Object.is(value, -0) ? 0 : value
  }
  if (typeof value !== 'object') throw new TypeError('unsupported JSON value')
  if (seen.has(value)) throw new TypeError('cyclic JSON value')
  seen.add(value)
  try {
    if (Array.isArray(value)) return value.map((item) => normalize(item, seen))
    const prototype = Object.getPrototypeOf(value)
    if (prototype !== Object.prototype && prototype !== null) throw new TypeError('non-ordinary JSON object')
    const result = Object.create(null)
    for (const key of Object.keys(value).sort()) {
      if (['__proto__', 'prototype', 'constructor'].includes(key)) throw new TypeError('prototype-shaped key is forbidden')
      if (value[key] === undefined) throw new TypeError('undefined JSON value')
      result[key] = normalize(value[key], seen)
    }
    return result
  } finally {
    seen.delete(value)
  }
}

export function canonicalJson(value) {
  return JSON.stringify(normalize(value))
}

export function prettyCanonicalJson(value) {
  return `${JSON.stringify(normalize(value), null, 2)}\n`
}

export function sha256Bytes(bytes) {
  return `sha256:${createHash('sha256').update(bytes).digest('hex')}`
}

export function sha256Json(value) {
  return sha256Bytes(Buffer.from(canonicalJson(value)))
}

function insideRoot(path) {
  const rel = relative(ROOT, resolve(path))
  return rel !== '' && rel !== '..' && !rel.startsWith(`..${sep}`) && !rel.includes(`${sep}..${sep}`)
}

export function assertNoSymlinkComponents(path) {
  const absolute = resolve(path)
  if (!insideRoot(absolute)) throw new RangeError('path must stay inside repository')
  const rootStatus = lstatSync(ROOT)
  if (!rootStatus.isDirectory() || rootStatus.isSymbolicLink()) throw new TypeError('repository root must be a real directory')
  let current = ROOT
  for (const component of relative(ROOT, absolute).split(sep)) {
    current = join(current, component)
    try {
      const status = lstatSync(current)
      if (status.isSymbolicLink()) throw new TypeError('symbolic-link path component is forbidden')
      if (current !== absolute && !status.isDirectory()) throw new TypeError('path ancestor must be a directory')
      if (current === absolute && !status.isFile()) throw new TypeError('input must be a regular file')
    } catch (error) {
      if (error?.code === 'ENOENT') break
      throw error
    }
  }
}

export function readBoundedBytes(path, maximum = MAX_JSON_BYTES) {
  const absolute = resolve(path)
  if (!insideRoot(absolute)) throw new RangeError('bundled input must stay inside repository')
  assertNoSymlinkComponents(absolute)
  const status = statSync(absolute)
  if (!status.isFile() || status.size < 1 || status.size > maximum) throw new RangeError(`file size outside 1..${maximum}`)
  return readFileSync(absolute)
}

function scanStrictJson(text, maximumDepth = 64, maximumItems = 50_000) {
  let position = 0
  let nodes = 0
  const fail = (message) => { throw new SyntaxError(`${message} at character ${position}`) }
  const whitespace = () => { while (/[\t\n\r ]/u.test(text[position] ?? 'x')) position += 1 }
  const stringToken = () => {
    if (text[position] !== '"') fail('expected JSON string')
    const start = position++
    while (position < text.length) {
      if (text[position] === '"') {
        position += 1
        return assertWellFormedString(JSON.parse(text.slice(start, position)))
      }
      if (text[position] === '\\') {
        position += 1
        if (text[position] === 'u') {
          if (!/^[0-9a-fA-F]{4}$/u.test(text.slice(position + 1, position + 5))) fail('invalid Unicode escape')
          position += 4
        } else if (!/["\\/bfnrt]/u.test(text[position] ?? '')) fail('invalid JSON escape')
      } else if (text.charCodeAt(position) < 0x20) fail('control character in JSON string')
      position += 1
    }
    fail('unterminated JSON string')
  }
  const value = (depth) => {
    if (depth > maximumDepth) fail('JSON nesting limit exceeded')
    nodes += 1
    if (nodes > maximumItems) fail('JSON node limit exceeded')
    whitespace()
    if (text[position] === '{') return object(depth + 1)
    if (text[position] === '[') return array(depth + 1)
    if (text[position] === '"') { stringToken(); return }
    for (const literal of ['true', 'false', 'null']) {
      if (text.startsWith(literal, position)) { position += literal.length; return }
    }
    const number = text.slice(position).match(/^-?(?:0|[1-9][0-9]*)/u)?.[0]
    if (number !== undefined) { position += number.length; return }
    fail('invalid JSON value')
  }
  const array = (depth) => {
    position += 1
    whitespace()
    if (text[position] === ']') { position += 1; return }
    let count = 0
    while (true) {
      if (++count > maximumItems) fail('JSON array item limit exceeded')
      value(depth)
      whitespace()
      if (text[position] === ']') { position += 1; return }
      if (text[position] !== ',') fail('expected comma or closing bracket')
      position += 1
    }
  }
  const object = (depth) => {
    position += 1
    whitespace()
    if (text[position] === '}') { position += 1; return }
    const keys = new Set()
    while (true) {
      whitespace()
      const key = stringToken()
      if (keys.has(key)) fail(`duplicate key ${JSON.stringify(key)}`)
      if (['__proto__', 'prototype', 'constructor'].includes(key)) fail('prototype-shaped key is forbidden')
      keys.add(key)
      whitespace()
      if (text[position] !== ':') fail('expected colon')
      position += 1
      value(depth)
      whitespace()
      if (text[position] === '}') { position += 1; return }
      if (text[position] !== ',') fail('expected comma or closing brace')
      position += 1
    }
  }
  whitespace()
  value(0)
  whitespace()
  if (position !== text.length) fail('trailing JSON data')
}

export function parseJsonBytes(bytes, label = 'JSON') {
  if (!(bytes instanceof Uint8Array) || bytes.byteLength < 1 || bytes.byteLength > MAX_JSON_BYTES) throw new RangeError(`${label} byte length outside bounds`)
  const text = new TextDecoder('utf-8', { fatal: true }).decode(bytes)
  scanStrictJson(text)
  const value = JSON.parse(text)
  if (value === null || typeof value !== 'object') throw new TypeError(`${label} must hold an object or array`)
  return normalize(value)
}

export function readUtf8Text(path, maximum = MAX_TEXT_BYTES) {
  return new TextDecoder('utf-8', { fatal: true }).decode(readBoundedBytes(path, maximum))
}

function repositoryPath(path) {
  return relative(ROOT, resolve(path)).split(sep).join('/')
}

export function ensureRealParentDirectories(path) {
  const absolute = resolve(path)
  if (!insideRoot(absolute)) throw new RangeError('output must stay inside repository')
  let current = ROOT
  const parentRelative = relative(ROOT, dirname(absolute))
  for (const component of parentRelative === '' ? [] : parentRelative.split(sep)) {
    current = join(current, component)
    let status
    try {
      status = lstatSync(current)
    } catch (error) {
      if (error?.code !== 'ENOENT') throw error
      try {
        mkdirSync(current, { mode: 0o755 })
      } catch (creationError) {
        if (creationError?.code !== 'EEXIST') throw creationError
      }
      status = lstatSync(current)
    }
    if (status.isSymbolicLink() || !status.isDirectory()) throw new TypeError('public output ancestor must be a real directory')
  }
}

function writeAll(descriptor, bytes, writer = writeSync) {
  let offset = 0
  while (offset < bytes.byteLength) {
    const count = writer(descriptor, bytes, offset, bytes.byteLength - offset)
    if (!Number.isSafeInteger(count) || count < 1 || count > bytes.byteLength - offset) throw new Error('write made invalid progress')
    offset += count
  }
}

export function atomicWriteAuthorized(path, text, operations = {}) {
  if (typeof text !== 'string' || text.length < 1) throw new TypeError('output must be non-empty text')
  const absolute = resolve(path)
  const rel = repositoryPath(absolute)
  if (!PUBLIC_FILES.includes(rel)) throw new RangeError(`undeclared public output ${rel}`)
  assertNoSymlinkComponents(absolute)
  ensureRealParentDirectories(absolute)
  assertNoSymlinkComponents(absolute)
  const temporary = `${absolute}.${process.pid}.tmp`
  const open = operations.openSync ?? openSync
  const write = operations.writeSync ?? writeSync
  const sync = operations.fsyncSync ?? fsyncSync
  const close = operations.closeSync ?? closeSync
  const rename = operations.renameSync ?? renameSync
  const unlink = operations.unlinkSync ?? unlinkSync
  let descriptor
  let failure
  try {
    descriptor = open(temporary, 'wx', 0o600)
    writeAll(descriptor, Buffer.from(text), write)
    sync(descriptor)
    const completed = descriptor
    descriptor = undefined
    close(completed)
    rename(temporary, absolute)
  } catch (error) {
    failure = error
  } finally {
    if (descriptor !== undefined) try { close(descriptor) } catch (error) { failure ??= error }
    try { unlink(temporary) } catch (error) { if (error?.code !== 'ENOENT') failure ??= error }
  }
  if (failure !== undefined) throw failure
}

function filesBelow(path) {
  if (!existsSync(path)) return []
  const files = []
  const visit = (current) => {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const child = join(current, entry.name)
      const status = lstatSync(child)
      if (status.isSymbolicLink()) throw new TypeError(`public symlink forbidden: ${repositoryPath(child)}`)
      if (status.isDirectory()) visit(child)
      else if (status.isFile()) files.push(repositoryPath(child))
      else throw new TypeError(`non-regular public entry forbidden: ${repositoryPath(child)}`)
    }
  }
  visit(path)
  return files.sort()
}

export function publicInventoryIssues({ allowMissing = false } = {}) {
  const actual = filesBelow(join(ROOT, 'public'))
  const expected = [...PUBLIC_FILES].sort()
  if (allowMissing && actual.length === 0) return []
  const issues = []
  for (const path of expected) if (!actual.includes(path)) issues.push(`missing ${path}`)
  for (const path of actual) if (!expected.includes(path)) issues.push(`undeclared ${path}`)
  return issues
}

export function sourceReceipt(repositoryRelativePath) {
  const path = join(ROOT, ...repositoryRelativePath.split('/'))
  const bytes = readBoundedBytes(path, MAX_TEXT_BYTES)
  return Object.freeze({ path: repositoryRelativePath, bytes: bytes.byteLength, byteSha256: sha256Bytes(bytes) })
}
