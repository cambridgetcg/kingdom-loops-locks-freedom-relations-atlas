#!/usr/bin/env node

import { prettyCanonicalJson, sha256Json } from './io.mjs'
import { buildAtlas, checkTriplet, semanticIssues, tripletReceipts, writeTriplet } from './atlas.mjs'
import { publicSchema, schemaIssues, validateRecord } from './schema.mjs'

const HELP = `KINGDOM Loops, Locks & Freedom Relations Atlas v0.1
offline · static · synthetic · non-operative

Usage:
  kingdom-loops-locks-freedom-relations-atlas validate   recompute fixtures and validate schema, references and boundaries
  kingdom-loops-locks-freedom-relations-atlas build      deterministically write only the declared public triplet
  kingdom-loops-locks-freedom-relations-atlas check      prove checked-in public bytes match the deterministic build
  kingdom-loops-locks-freedom-relations-atlas overview   print bounded metadata without a score or verdict
  kingdom-loops-locks-freedom-relations-atlas help       print this help
`

function output(value) {
  process.stdout.write(prettyCanonicalJson(value))
}

function noArguments(rest) {
  if (rest.length !== 0) throw new Error(`unexpected argument(s): ${rest.join(' ')}`)
}

function main() {
  const [command = 'help', ...rest] = process.argv.slice(2)
  if (['help', '--help', '-h'].includes(command)) {
    noArguments(rest)
    process.stdout.write(HELP)
    return
  }
  noArguments(rest)

  if (command === 'validate') {
    const atlas = buildAtlas()
    const structural = validateRecord(atlas)
    const semantic = semanticIssues(atlas)
    const schema = schemaIssues(publicSchema)
    if (structural.length + semantic.length + schema.length > 0) throw new Error([...structural, ...semantic, ...schema].join('\n'))
    output({
      state: 'VALID_FROZEN_STATIC_SYNTHETIC_RELATIONS_ATLAS',
      protocol: atlas.protocol,
      artifactId: atlas.artifact.id,
      lifecyclePhase: atlas.artifact.lifecyclePhase,
      counts: atlas.counts,
      atlasCanonicalReceipt: sha256Json(atlas),
      structuralIssues: 0,
      semanticIssues: 0,
      schemaIssues: 0,
      scores: false,
      runtime: false,
      actionAuthority: false,
      networkUsed: false,
    })
    return
  }

  if (command === 'build') {
    output({
      state: 'BUILT_FROZEN_STATIC_SYNTHETIC_PUBLIC_TRIPLET',
      protocol: 'kingdom.loops-locks-freedom-relations/0.1',
      filesWritten: 3,
      receipts: writeTriplet(),
      externalPublication: false,
      networkUsed: false,
    })
    return
  }

  if (command === 'check') {
    const checked = checkTriplet()
    if (!checked.current) throw new Error(`public triplet differs from deterministic build: ${checked.inventoryIssues.join('; ')}`)
    output({
      state: 'MATCHES_DETERMINISTIC_FROZEN_PUBLIC_TRIPLET',
      protocol: checked.atlas.protocol,
      artifactId: checked.atlas.artifact.id,
      counts: checked.atlas.counts,
      receipts: checked.receipts,
      scores: false,
      runtime: false,
      actionAuthority: false,
      networkUsed: false,
    })
    return
  }

  if (command === 'overview') {
    const atlas = buildAtlas()
    output({
      title: atlas.artifact.title,
      protocol: atlas.protocol,
      artifact: atlas.artifact,
      publicHandoff: atlas.publicHandoff,
      counts: atlas.counts,
      fixtureIndex: atlas.syntheticFixtures.map((fixture) => ({ id: fixture.id, title: fixture.title, lane: fixture.lane, kind: fixture.kind, synthetic: fixture.synthetic })),
      publicReceipts: tripletReceipts(),
      scores: false,
      runtime: false,
      actionAuthority: false,
      networkUsed: false,
    })
    return
  }

  throw new Error(`unknown command ${JSON.stringify(command)}\n\n${HELP}`)
}

try {
  main()
} catch (error) {
  process.stderr.write(`${error?.stack ?? error}\n`)
  process.exitCode = 1
}
