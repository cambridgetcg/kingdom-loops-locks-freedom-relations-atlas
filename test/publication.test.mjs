import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import test from 'node:test'

import { buildAtlas, checkTriplet, renderedTriplet, tripletReceipts } from '../src/atlas.mjs'
import { ATLAS_PUBLIC_PATH, GUIDE_PUBLIC_PATH, GUIDE_SOURCE_PATH, PUBLIC_FILES, ROOT, SCHEMA_PUBLIC_PATH, canonicalJson, parseJsonBytes, prettyCanonicalJson, sha256Bytes, sha256Json } from '../src/io.mjs'

test('checked-in triplet exactly matches deterministic render', () => {
  const checked = checkTriplet()
  assert.equal(checked.current, true, checked.inventoryIssues.join('; '))
  assert.deepEqual(checked.receipts, tripletReceipts())
})

test('public JSON files parse strictly and have exact identities', () => {
  const record = parseJsonBytes(readFileSync(ATLAS_PUBLIC_PATH), 'public atlas')
  const schema = parseJsonBytes(readFileSync(SCHEMA_PUBLIC_PATH), 'public schema')
  assert.equal(record.protocol, 'kingdom.loops-locks-freedom-relations/0.1')
  assert.equal(record.$schema, 'https://thekingdom.dev/schemas/loops-locks-freedom-relations-atlas/0.1.json')
  assert.equal(schema.$id, record.$schema)
  assert.equal(record.artifact.lifecyclePhase, 'FROZEN_STATIC_FIXTURE')
  assert.equal(record.artifact.releaseState, 'FROZEN_FOR_IMMUTABLE_HANDOFF')
})

test('public guide is exact source and states symbolic signature boundary', () => {
  assert.ok(readFileSync(GUIDE_PUBLIC_PATH).equals(readFileSync(GUIDE_SOURCE_PATH)))
  const guide = readFileSync(GUIDE_PUBLIC_PATH, 'utf8')
  assert.match(guide, /synthetic fixture declares the symbolic signature relation `VALID`/u)
  assert.match(guide, /performs no cryptography/u)
  assert.match(guide, /neither policy denial nor proof of freedom or unfreedom/u)
  assert.match(guide, /Independent model review is recorded complete with a GREEN verdict/u)
  assert.match(guide, /not evidence of deployment/u)
  assert.doesNotMatch(guide, /human review (?:is|was) complete/iu)
})

test('build has no clock, network or external input and is byte deterministic', () => {
  const previousFetch = globalThis.fetch
  globalThis.fetch = () => { throw new Error('network forbidden') }
  try {
    const first = renderedTriplet()
    const second = renderedTriplet()
    assert.equal(first.atlasText, second.atlasText)
    assert.equal(first.schemaText, second.schemaText)
    assert.equal(first.guideText, second.guideText)
    const atlas = buildAtlas()
    assert.equal(atlas.buildReceipt.clockRead, false)
    assert.equal(atlas.buildReceipt.networkUsed, false)
    assert.equal(atlas.buildReceipt.externalInputUsed, false)
  } finally {
    if (previousFetch === undefined) delete globalThis.fetch
    else globalThis.fetch = previousFetch
  }
})

test('non-recursive reviewed receipt lock pins the exact authorized frozen triplet', () => {
  const lockPath = join(ROOT, 'REVIEWED-RECEIPTS.json')
  const lockBytes = readFileSync(lockPath)
  const lock = parseJsonBytes(lockBytes, 'reviewed receipt lock')
  assert.ok(lockBytes.equals(Buffer.from(prettyCanonicalJson(lock))))
  assert.deepEqual(Object.keys(lock).sort(), ['artifactId', 'authorizationNotice', 'lockKind', 'nonRecursive', 'protocol', 'recordCounts', 'releaseGate', 'reviewEvidence', 'triplet'])

  const record = buildAtlas()
  assert.equal(lock.artifactId, record.artifact.id)
  assert.equal(lock.protocol, record.protocol)
  assert.equal(canonicalJson(lock.recordCounts), canonicalJson(record.counts))
  assert.equal(canonicalJson(lock.releaseGate), canonicalJson({
    currentState: record.publicHandoff.currentState,
    deploymentClaimed: false,
    externalPublicationPerformed: false,
    fileScopedOnly: true,
    lifecyclePhase: record.artifact.lifecyclePhase,
    publicationAuthorized: record.publicHandoff.publicationAuthorized,
    releaseGateSatisfied: record.artifact.authorship.releaseGateSatisfied,
    releaseState: record.artifact.releaseState,
    runtimeAuthorized: false,
  }))
  assert.equal(canonicalJson(lock.reviewEvidence), canonicalJson({
    humanReviewCompleted: record.artifact.authorship.humanReviewCompleted,
    independentModelReviewCompleted: record.artifact.authorship.independentModelReviewCompleted,
    independentModelReviewVerdict: 'GREEN',
    jsonschemaMetaSchemaIssues: 0,
    jsonschemaRecordIssues: 0,
    jsonschemaVersion: '4.26.0',
    nodeTestCountAtFinalProducerReview: 45,
    reviewInvariantCoreSha256: 'sha256:d0ebf30fc83e7716d20326f8f0a8fe348e4dbfa83f75471b16ddfbbb5ac01335',
  }))

  const invariantCore = structuredClone(record)
  delete invariantCore.artifact.lifecyclePhase
  delete invariantCore.artifact.releaseState
  delete invariantCore.artifact.authorship.independentModelReviewCompleted
  delete invariantCore.artifact.authorship.releaseGateSatisfied
  delete invariantCore.constitutionalBoundaries.lifecycle.current
  delete invariantCore.publicHandoff.publicationAuthorized
  delete invariantCore.publicHandoff.currentState
  delete invariantCore.buildReceipt
  assert.equal(sha256Json(invariantCore), lock.reviewEvidence.reviewInvariantCoreSha256)

  const routes = new Map(record.publicHandoff.routes.map((entry) => [entry.route, entry]))
  const expectedTriplet = tripletReceipts().map((receipt) => {
    const destinationRoute = `/${receipt.path}`
    const route = routes.get(destinationRoute)
    assert.ok(route, destinationRoute)
    return {
      byteSha256: receipt.byteSha256,
      bytes: receipt.bytes,
      destinationRoute,
      mimeType: route.mimeType,
      producerPath: `public/${receipt.path}`,
      role: route.role,
    }
  })
  assert.equal(canonicalJson(lock.triplet), canonicalJson(expectedTriplet))

  const authorizationBytes = readFileSync(join(ROOT, lock.authorizationNotice.path))
  assert.equal(lock.authorizationNotice.bytes, authorizationBytes.byteLength)
  assert.equal(lock.authorizationNotice.byteSha256, sha256Bytes(authorizationBytes))
  const authorizationRoutes = [...authorizationBytes.toString('utf8').matchAll(/^- `([^`]+)`$/gmu)].map((match) => match[1])
  assert.deepEqual(lock.authorizationNotice.authorizedRoutes, authorizationRoutes)
  assert.deepEqual([...lock.authorizationNotice.authorizedRoutes].sort(), lock.triplet.map((entry) => entry.destinationRoute).sort())

  assert.equal(canonicalJson(lock.nonRecursive), canonicalJson({ generatorInput: false, publicArtifact: false, selfHashIncluded: false }))
  assert.equal(record.buildReceipt.generatorInputReceipts.some((entry) => entry.path === 'REVIEWED-RECEIPTS.json'), false)
  assert.equal(PUBLIC_FILES.includes('public/REVIEWED-RECEIPTS.json'), false)
  assert.equal(lock.triplet.some((entry) => entry.producerPath === 'REVIEWED-RECEIPTS.json'), false)
})
