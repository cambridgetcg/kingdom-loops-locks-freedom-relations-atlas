import assert from 'node:assert/strict'
import test from 'node:test'

import { buildAtlas, semanticIssues } from '../src/atlas.mjs'
import { canonicalJson } from '../src/io.mjs'
import { publicSchema, schemaIssues, validateRecord } from '../src/schema.mjs'
import { allFixtureIssues, envelopeJointActions } from '../src/verifier.mjs'

const atlas = buildAtlas()

test('candidate is structurally, semantically and mathematically valid', () => {
  assert.deepEqual(validateRecord(atlas), [])
  assert.deepEqual(schemaIssues(publicSchema), [])
  assert.deepEqual(semanticIssues(atlas), [])
  assert.deepEqual(allFixtureIssues(atlas.syntheticFixtures), [])
})

test('identity and exact closed counts are explicit', () => {
  assert.equal(atlas.protocol, 'kingdom.loops-locks-freedom-relations/0.1')
  assert.equal(atlas.$schema, 'https://thekingdom.dev/schemas/loops-locks-freedom-relations-atlas/0.1.json')
  assert.equal(publicSchema.$id, atlas.$schema)
  assert.deepEqual(atlas.counts, {
    conversions: 5,
    equationCards: 15,
    freedomRelevantEnvelopes: 2,
    governanceFixtures: 18,
    kingdomSemanticOrientations: 9,
    lanes: 14,
    lockKinds: 6,
    mathematicalFixtures: 13,
    nonEquivalences: 55,
    sourceBindings: 17,
    syntheticFixtures: 31,
    terms: 15,
  })
})

test('all references resolve to one canonical typed registry', () => {
  const fixtureIds = new Set(atlas.syntheticFixtures.map((fixture) => fixture.id))
  const falsifierIds = new Set(atlas.nonEquivalences.map((entry) => entry.id))
  for (const equation of atlas.equationCards) {
    for (const id of equation.fixtureIds) assert.ok(fixtureIds.has(id), `${equation.id}/${id}`)
    for (const id of equation.falsifierIds) assert.ok(falsifierIds.has(id), `${equation.id}/${id}`)
  }
  for (const fixture of atlas.syntheticFixtures) for (const id of fixture.falsifies) assert.ok(falsifierIds.has(id), `${fixture.id}/${id}`)
  for (const entry of atlas.nonEquivalences) {
    assert.equal(entry.relation, 'NON_EQUIVALENT')
    assert.ok(atlas.vocabularies.lanes.includes(entry.fromLane))
    assert.ok(atlas.vocabularies.lanes.includes(entry.toLane))
    assert.ok(entry.declaredAssumptions.length > 0)
    assert.ok(entry.informationLost.length > 0)
    assert.ok(entry.forbiddenInference.length > 0)
    for (const id of entry.fixtureIds) assert.ok(fixtureIds.has(id), `${entry.id}/${id}`)
  }
})

test('authorization and key falsifiers bind their exact distinguishing fixtures', () => {
  const permit = atlas.nonEquivalences.find((entry) => entry.id === 'authorization_permit_is_not_enforcement')
  const possession = atlas.nonEquivalences.find((entry) => entry.id === 'key_possession_is_not_authentication')
  assert.deepEqual(permit.fixtureIds, ['authorization_permit_not_enforced'])
  assert.deepEqual(possession.fixtureIds, ['key_possession_without_challenge'])
  const passedChallenge = atlas.syntheticFixtures.find((fixture) => fixture.id === 'valid_key_no_authority')
  assert.deepEqual(passedChallenge.falsifies, ['authentication_pass_is_not_authorization_permit'])
})

test('authentication definition is evidence-bounded and key kinds contain nothing', () => {
  const authentication = atlas.vocabularies.terms.find((term) => term.id === 'authentication')
  assert.match(authentication.definition, /^A process that produces evidence under a declared authenticator binding/u)
  assert.doesNotMatch(authentication.definition, /proves identity|establishes identity/iu)
  assert.deepEqual(atlas.vocabularies.keyAndAuthenticatorKinds.map((kind) => kind.id).sort(), [
    'AUTHENTICATOR_SECRET_REFERENCE',
    'DECRYPTION_KEY_SYMBOL',
    'SIGNING_PRIVATE_KEY_SYMBOL',
    'VERIFICATION_PUBLIC_KEY_SYMBOL',
  ])
  for (const kind of atlas.vocabularies.keyAndAuthenticatorKinds) {
    assert.equal(kind.containsMaterial, false)
    assert.equal(kind.executable, false)
  }
})

test('lock kinds are inert, typed and the removal fixture binds one exact kind', () => {
  assert.deepEqual(atlas.vocabularies.lockKinds.map((kind) => kind.id).sort(), [
    'CRYPTOGRAPHIC_TRANSFORM_LOCK',
    'DEPENDENCY_LOCK_IN',
    'METAPHORICAL_LOCK_LABEL',
    'PHYSICAL_CONSTRAINT_LABEL',
    'POLICY_DENY_LOCK',
    'TECHNICAL_CAPABILITY_GUARD',
  ])
  for (const kind of atlas.vocabularies.lockKinds) {
    assert.equal(kind.containsMechanism, false)
    assert.equal(kind.executable, false)
    assert.ok(kind.threatModel.length > 0)
    assert.ok(kind.authoritySemantics.length > 0)
  }
  const removal = atlas.syntheticFixtures.find((fixture) => fixture.id === 'constraint_removal_not_freedom')
  assert.equal(removal.inputs.labels.find((entry) => entry.id === 'lockKind').value, 'TECHNICAL_CAPABILITY_GUARD')
  const exportFixture = atlas.syntheticFixtures.find((fixture) => fixture.id === 'export_roundtrip_with_omission_detected')
  assert.equal(exportFixture.inputs.labels.find((entry) => entry.id === 'lockKind').value, 'DEPENDENCY_LOCK_IN')
  assert.equal(exportFixture.expected.booleans.find((entry) => entry.id === 'dependencyLockInProvenGenerally').value, false)
  const dependencyRefusals = ['dependency_lock_in_indicator_is_not_normative_freedom_judgment', 'dependency_lock_in_is_not_authority', 'dependency_lock_in_is_not_cryptographic_lock', 'dependency_lock_in_is_not_policy_deny_lock']
  assert.deepEqual(atlas.nonEquivalences.filter((entry) => entry.id.includes('dependency_lock_in')).map((entry) => entry.id).sort(), dependencyRefusals)
  assert.deepEqual(exportFixture.falsifies.filter((id) => id.includes('dependency_lock_in')).sort(), dependencyRefusals)
})

test('behavioral vocabulary spells out all four quadrants without color', () => {
  assert.deepEqual(atlas.vocabularies.behavioralContingencyQuadrants, [
    { classification: 'POSITIVE_REINFORCEMENT', operation: 'ADD', responseDirection: 'INCREASE' },
    { classification: 'NEGATIVE_REINFORCEMENT', operation: 'REMOVE', responseDirection: 'INCREASE' },
    { classification: 'POSITIVE_PUNISHMENT', operation: 'ADD', responseDirection: 'DECREASE' },
    { classification: 'NEGATIVE_PUNISHMENT', operation: 'REMOVE', responseDirection: 'DECREASE' },
  ])
  assert.equal(atlas.vocabularies.unresolvedBehavioralClassification, 'UNCLASSIFIED')
})

test('freedom envelopes recompute seven independent action gates', () => {
  for (const envelope of atlas.freedomRelevantEnvelopes) {
    assert.deepEqual(envelopeJointActions(envelope), envelope.jointlyAdmissibleActionsUnderDeclaredModel)
    assert.deepEqual(envelope.axes.map((axis) => axis.id).sort(), ['EXIT_REFUSAL', 'NEGATIVE_LIBERTY', 'NON_DOMINATION', 'POSITIVE_CAPABILITY'])
    for (const field of ['recoveryOptions', 'contestationOptions', 'nonDominationConditions', 'unknownConstraints']) assert.ok(Array.isArray(envelope[field]))
  }
  assert.ok(atlas.equationCards.find((card) => card.id === 'freedom_relevant_tuple_and_joint_set').equation.includes('A_rights'))
  const jointTerm = atlas.vocabularies.terms.find((term) => term.id === 'jointly_admissible_actions_under_declared_model').definition
  for (const word of ['capable', 'permitted', 'consented', 'safe', 'declared-rights-compatible', 'accessible', 'privacy-compatible']) assert.ok(jointTerm.includes(word), word)
  const envelopeTerm = atlas.vocabularies.terms.find((term) => term.id === 'freedom_relevant_envelope').definition
  for (const word of ['capability', 'permission', 'consent', 'safety', 'declared-rights compatibility', 'accessibility', 'privacy compatibility', 'reversibility', 'exit', 'appeal', 'contestation', 'recovery', 'return', 'non-domination', 'unknown constraints']) assert.ok(envelopeTerm.includes(word), word)
})

test('external sources are structured link-only orientations with typed targets', () => {
  for (const source of atlas.sourceBindings) {
    assert.ok(source.authors.length > 0)
    assert.match(source.publicationDate, /^\d{4}/u)
    assert.match(source.url, /^https:\/\//u)
    assert.equal(source.use, 'LINK_ONLY_ORIENTATION')
    for (const key of ['copiesContent', 'importsAuthority', 'establishesTruth', 'establishesCurrentness', 'establishesCompliance', 'endorsementClaimed']) assert.equal(source[key], false, `${source.id}/${key}`)
    for (const target of source.appliesTo) assert.ok(['CONSTITUTIONAL_BOUNDARIES', 'EQUATION_CARD', 'SYNTHETIC_FIXTURE'].includes(target.kind))
  }
  assert.equal(atlas.sourceBindings.find((source) => source.id === 'kalman_1960').title, 'A New Approach to Linear Filtering and Prediction Problems')
  assert.equal(atlas.sourceBindings.find((source) => source.id === 'goodhart_1975_bibliography').sourceKind, 'OFFICIAL_INSTITUTIONAL_BIBLIOGRAPHY')
  assert.match(atlas.sourceBindings.find((source) => source.id === 'skinner_1953').rightsOrReuseStatus, /LINK_ONLY_PARAPHRASE/u)
  const williams = atlas.sourceBindings.find((source) => source.id === 'williams_1992')
  assert.deepEqual({ authors: williams.authors, venue: williams.venueOrOriginalPublisher, host: williams.host, url: williams.url, scope: williams.versionScope }, {
    authors: ['Ronald J. Williams'],
    venue: 'Machine Learning',
    host: 'Springer DOI landing',
    url: 'https://doi.org/10.1007/BF00992696',
    scope: 'Volume 8, pages 229–256',
  })
  assert.deepEqual(atlas.sourceBindings.find((source) => source.id === 'everitt_et_al_2019').authors, ['Tom Everitt', 'Marcus Hutter', 'Ramana Kumar', 'Victoria Krakovna'])
  assert.deepEqual(atlas.sourceBindings.find((source) => source.id === 'nist_sp_800_162').authors, ['Vincent C. Hu', 'David Ferraiolo', 'Richard Kuhn', 'Adam Schnitzer', 'Kenneth Sandlin', 'Robert Miller', 'Karen Scarfone'])
})

test('predecessor orientations are byte-pinned and import no semantics', () => {
  for (const entry of atlas.kingdomSemanticOrientations) {
    assert.equal(entry.baseCommit, '9b07ac26da03cac79709437aeea3f53b808321e1')
    assert.equal(entry.baseTree, 'd99577d666551e605271ead5c49482213347c071')
    assert.match(entry.byteSha256, /^sha256:[a-f0-9]{64}$/u)
    for (const key of ['copiesContent', 'importsAuthority', 'establishesTruth', 'runtimeDependency']) assert.equal(entry[key], false)
    assert.equal(entry.hasDirectPublicRoute, entry.publicRoute !== 'NONE')
  }
  assert.equal(atlas.kingdomSemanticOrientations.find((entry) => entry.repositoryPath === 'RIGHTS.md').publicRoute, 'NONE')
  assert.doesNotMatch(canonicalJson(atlas.kingdomSemanticOrientations), /FREEDOM\.md/u)
})

test('authorship and scope record the reviewed static handoff without human-review, runtime or score overclaim', () => {
  assert.equal(atlas.artifact.authorship.modelAssisted, true)
  assert.equal(atlas.artifact.authorship.independentModelReviewCompleted, true)
  assert.equal(atlas.artifact.authorship.humanReviewCompleted, false)
  assert.equal(atlas.artifact.authorship.releaseGateSatisfied, true)
  assert.equal(atlas.publicHandoff.publicationAuthorized, true)
  assert.equal(atlas.artifact.lifecyclePhase, 'FROZEN_STATIC_FIXTURE')
  assert.equal(atlas.artifact.releaseState, 'FROZEN_FOR_IMMUTABLE_HANDOFF')
  assert.equal(atlas.publicHandoff.currentState, atlas.artifact.releaseState)
  for (const [key, value] of Object.entries(atlas.scope)) if (!['staticArtifact', 'syntheticOnly'].includes(key)) assert.equal(value, false, key)
})
