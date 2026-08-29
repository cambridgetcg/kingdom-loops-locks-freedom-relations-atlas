import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import { existsSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, relative } from 'node:path'
import test from 'node:test'

import { buildAtlas } from '../src/atlas.mjs'
import { PUBLIC_FILES, ROOT, canonicalJson, parseJsonBytes } from '../src/io.mjs'

function filesUnder(path, repositoryRoot = ROOT) {
  const output = []
  const visit = (current) => {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const child = join(current, entry.name)
      const rel = relative(repositoryRoot, child).split('\\').join('/')
      if (entry.name.startsWith('.test-')) continue
      const status = lstatSync(child)
      if (status.isSymbolicLink()) throw new Error(`symlink forbidden: ${rel}`)
      if (rel === '.git') {
        if (!status.isDirectory()) throw new Error('repository-root .git must be a real directory')
        continue
      }
      if (entry.name === '.git') throw new Error(`nested Git metadata forbidden: ${rel}`)
      if (status.isDirectory()) visit(child)
      else if (status.isFile()) output.push(child)
      else throw new Error(`special file forbidden: ${rel}`)
    }
  }
  visit(path)
  return output.sort()
}

test('source has no network, process launch, dynamic evaluation or cryptographic execution', () => {
  const source = filesUnder(join(ROOT, 'src')).map((path) => readFileSync(path, 'utf8')).join('\n')
  for (const pattern of [
    /node:(?:http|https|http2|net|tls|dns|dgram|child_process|cluster|worker_threads)/u,
    /\bfetch\s*\(/u,
    /\bXMLHttpRequest\b/u,
    /\bWebSocket\b/u,
    /\beval\s*\(/u,
    /\bnew\s+Function\b/u,
    /\b(?:createPrivateKey|generateKeyPair|privateDecrypt|publicEncrypt|sign|verify)\s*\(/u,
    /\b(?:spawn|execFile|execFileSync|execSync)\s*\(/u,
  ]) assert.doesNotMatch(source, pattern)
})

test('CLI exposes only fixed offline inspection and deterministic build', () => {
  for (const command of ['validate', 'check', 'overview']) {
    const stdout = execFileSync(process.execPath, ['./src/cli.mjs', command], { cwd: ROOT })
    const result = parseJsonBytes(stdout, command)
    assert.equal(result.networkUsed, false)
  }
  for (const args of [['serve'], ['run'], ['publish'], ['validate', 'extra'], ['build', '--output', '/tmp/escape']]) {
    const result = spawnSync(process.execPath, ['./src/cli.mjs', ...args], { cwd: ROOT, encoding: 'utf8' })
    assert.notEqual(result.status, 0)
    assert.match(result.stderr, /unknown command|unexpected argument/u)
  }
})

test('record contains no personal-shaped intake, score or executable key field', () => {
  const atlas = buildAtlas()
  const text = canonicalJson(atlas)
  assert.equal(atlas.scope.personalData, false)
  assert.equal(atlas.scope.realPeople, false)
  assert.doesNotMatch(text, /"(?:email|phone|postcode|accountId|userId|realPersonName|contact)"\s*:/iu)
  assert.doesNotMatch(text, /"(?:freedomLevel|karmaScore|zeroneScore)"\s*:/iu)
  assert.doesNotMatch(text, /"(?:privateKeyBytes|secretBytes|credentialValue|ciphertextBytes|plaintextBytes)"\s*:/iu)
})

test('repository inventory is explicit, dependency-free and excludes safe root Git metadata', () => {
  const expected = [
    '.github/workflows/validate.yml', '.gitignore', 'NOTICE.md', 'PUBLICATION-AUTHORIZATION.md', 'README.md', 'REVIEWED-RECEIPTS.json',
    'guide/public-guide.md', 'package.json',
    ...PUBLIC_FILES,
    'src/atlas.mjs', 'src/cli.mjs', 'src/content.mjs', 'src/io.mjs', 'src/schema.mjs', 'src/verifier.mjs',
    'test/contracts.test.mjs', 'test/io.test.mjs', 'test/mutations.test.mjs', 'test/publication.test.mjs', 'test/schema.test.mjs', 'test/security.test.mjs',
  ].sort()
  assert.deepEqual(filesUnder(ROOT).map((path) => relative(ROOT, path).split('\\').join('/')).sort(), expected)
  assert.equal(existsSync(join(ROOT, 'node_modules')), false)
  assert.equal(existsSync(join(ROOT, 'package-lock.json')), false)
  const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'))
  assert.equal(Object.hasOwn(pkg, 'dependencies'), false)
  assert.equal(Object.hasOwn(pkg, 'devDependencies'), false)
})

test('inventory allows only a real root .git directory and rejects unsafe or nested forms', () => {
  const temporary = mkdtempSync(join(tmpdir(), 'kingdom-loops-locks-inventory-'))
  try {
    writeFileSync(join(temporary, 'record.txt'), 'fixture\n')
    assert.equal(filesUnder(temporary, temporary).length, 1)
    mkdirSync(join(temporary, '.git'))
    assert.equal(filesUnder(temporary, temporary).length, 1)
    rmSync(join(temporary, '.git'), { recursive: true })
    writeFileSync(join(temporary, '.git'), 'unsafe\n')
    assert.throws(() => filesUnder(temporary, temporary), /root \.git must be a real directory/u)
    rmSync(join(temporary, '.git'))
    mkdirSync(join(temporary, 'nested'))
    mkdirSync(join(temporary, 'nested', '.git'))
    assert.throws(() => filesUnder(temporary, temporary), /nested Git metadata/u)
    rmSync(join(temporary, 'nested'), { recursive: true })
    mkdirSync(join(temporary, 'outside'))
    symlinkSync(join(temporary, 'outside'), join(temporary, '.git'))
    assert.throws(() => filesUnder(temporary, temporary), /symlink forbidden/u)
  } finally {
    rmSync(temporary, { recursive: true, force: true })
  }
})
