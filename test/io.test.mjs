import assert from 'node:assert/strict'
import { existsSync, mkdirSync, rmSync, symlinkSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'

import {
  ROOT,
  atomicWriteAuthorized,
  canonicalJson,
  ensureRealParentDirectories,
  parseJsonBytes,
  publicInventoryIssues,
} from '../src/io.mjs'

test('canonical JSON orders keys and rejects unsafe shapes', () => {
  assert.equal(canonicalJson({ z: 1, a: { d: true, c: false } }), '{"a":{"c":false,"d":true},"z":1}')
  assert.throws(() => canonicalJson({ value: Number.MAX_SAFE_INTEGER + 1 }), /safe integer/u)
  assert.throws(() => canonicalJson(Object.assign(Object.create({ inherited: true }), { own: true })), /non-ordinary/u)
  assert.throws(() => canonicalJson({ bad: '\ud800' }), /unpaired/u)
})

test('strict bundled JSON rejects duplicates, prototype keys, decimals and trailing bytes', () => {
  assert.throws(() => parseJsonBytes(Buffer.from('{"a":1,"a":2}')), /duplicate key/u)
  assert.throws(() => parseJsonBytes(Buffer.from('{"__proto__":{}}')), /prototype-shaped/u)
  assert.throws(() => parseJsonBytes(Buffer.from('{"a":1.2}')), /trailing JSON data|expected comma/u)
  assert.throws(() => parseJsonBytes(Buffer.from('{"a":1}x')), /trailing JSON data/u)
  assert.throws(() => parseJsonBytes(Buffer.from('{"a":"\\ud800"}')), /unpaired/u)
})

test('componentwise directory creation refuses a symlink ancestor before any child creation', () => {
  const local = join(ROOT, `.test-io-${process.pid}`)
  const outside = join(tmpdir(), `kingdom-loops-locks-outside-${process.pid}`)
  rmSync(local, { recursive: true, force: true })
  rmSync(outside, { recursive: true, force: true })
  mkdirSync(local)
  mkdirSync(outside)
  symlinkSync(outside, join(local, 'linked'))
  try {
    assert.throws(() => ensureRealParentDirectories(join(local, 'linked', 'created', 'file.json')), /real directory/u)
    assert.equal(existsSync(join(outside, 'created')), false)
  } finally {
    rmSync(local, { recursive: true, force: true })
    rmSync(outside, { recursive: true, force: true })
  }
})

test('undeclared output is rejected before creating an ancestor', () => {
  const targetDirectory = join(ROOT, `.test-undeclared-${process.pid}`)
  rmSync(targetDirectory, { recursive: true, force: true })
  assert.throws(() => atomicWriteAuthorized(join(targetDirectory, 'escape.json'), '{}\n'), /undeclared public output/u)
  assert.equal(existsSync(targetDirectory), false)
})

test('public inventory is exactly the declared triplet', () => {
  assert.deepEqual(publicInventoryIssues(), [])
})
