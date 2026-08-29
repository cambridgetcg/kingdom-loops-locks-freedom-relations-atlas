import assert from 'node:assert/strict'
import test from 'node:test'

import { buildAtlas } from '../src/atlas.mjs'
import { canonicalJson } from '../src/io.mjs'
import { publicSchema, schemaIssues, validateRecord } from '../src/schema.mjs'

test('Draft 2020-12 schema has exact immutable route identity', () => {
  assert.equal(publicSchema.$schema, 'https://json-schema.org/draft/2020-12/schema')
  assert.equal(publicSchema.$id, 'https://thekingdom.dev/schemas/loops-locks-freedom-relations-atlas/0.1.json')
  assert.deepEqual(schemaIssues(publicSchema), [])
})

test('every object schema is recursively closed by both closure keywords', () => {
  const issues = []
  const visit = (node, path) => {
    if (node === null || typeof node !== 'object' || Array.isArray(node)) return
    if (node.type === 'object') {
      if (node.additionalProperties !== false) issues.push(`${path}/additionalProperties`)
      if (node.unevaluatedProperties !== false) issues.push(`${path}/unevaluatedProperties`)
      assert.deepEqual([...node.required].sort(), Object.keys(node.properties).sort())
    }
    for (const [key, child] of Object.entries(node.properties ?? {})) visit(child, `${path}/properties/${key}`)
    for (const [key, child] of Object.entries(node.$defs ?? {})) visit(child, `${path}/$defs/${key}`)
    if (node.items !== undefined) visit(node.items, `${path}/items`)
  }
  visit(publicSchema, '$')
  assert.deepEqual(issues, [])
})

test('record conforms and its top-level is exactly closed', () => {
  const atlas = buildAtlas()
  assert.deepEqual(validateRecord(atlas), [])
  assert.deepEqual(Object.keys(atlas).sort(), Object.keys(publicSchema.properties).sort())
  const changed = structuredClone(atlas)
  changed.surprise = false
  assert.match(validateRecord(changed).join('\n'), /^\$\/surprise: undeclared property/mu)
})

test('schema serialization is deterministic', () => {
  assert.equal(canonicalJson(publicSchema), canonicalJson(structuredClone(publicSchema)))
})
