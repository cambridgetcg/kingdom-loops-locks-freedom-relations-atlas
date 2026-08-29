import assert from 'node:assert/strict'
import test from 'node:test'

import { buildAtlas, semanticIssues } from '../src/atlas.mjs'
import { sha256Json } from '../src/io.mjs'
import { validateRecord } from '../src/schema.mjs'
import { computeFixture, fixtureIssues } from '../src/verifier.mjs'

const atlas = buildAtlas()
const fixture = (id) => structuredClone(atlas.syntheticFixtures.find((entry) => entry.id === id))
const boolean = (result, id) => result.booleans.find((entry) => entry.id === id)?.value
const resign = (record) => {
  const { buildReceipt, ...payload } = record
  buildReceipt.semanticPayloadSha256 = sha256Json(payload)
  return record
}

test('declared expectation mutation fails independent recomputation', () => {
  const changed = fixture('gradient_step_without_rl')
  changed.expected.rationals.find((entry) => entry.id === 'thetaAfter').value = { numerator: 2, denominator: 1 }
  assert.match(fixtureIssues(changed).join('\n'), /computed result differs/u)
})

test('unknown rule and unreduced rational fail closed', () => {
  const unknown = fixture('gradient_step_without_rl')
  unknown.ruleId = 'UNRECOGNIZED_RULE'
  assert.match(fixtureIssues(unknown).join('\n'), /unknown fixture rule/u)
  const unreduced = fixture('gradient_step_without_rl')
  unreduced.inputs.rationals[0].value = { numerator: 0, denominator: 2 }
  assert.match(fixtureIssues(unreduced).join('\n'), /rational must be reduced/u)
})

test('break-glass validity depends on every required governance gate', () => {
  const requiredTrue = [
    'declaredEmergency', 'approvalAValid', 'approvalBValid', 'approvalsIndependent', 'narrowScopePresent',
    'expiryPresent', 'eventLoggingEnabled', 'noticeProvided', 'auditReceiptPresent', 'afterActionIndependentReviewScheduled',
  ]
  for (const id of requiredTrue) {
    const changed = fixture('break_glass_dual_control_expiry')
    changed.inputs.booleans.find((entry) => entry.id === id).value = false
    assert.equal(boolean(computeFixture(changed), 'temporaryEmergencyGrantValid'), false, id)
  }
  const governedWithholding = fixture('break_glass_dual_control_expiry')
  governedWithholding.inputs.booleans.find((entry) => entry.id === 'noticeSafe').value = false
  governedWithholding.inputs.booleans.find((entry) => entry.id === 'noticeProvided').value = false
  governedWithholding.inputs.booleans.find((entry) => entry.id === 'noticeWithholdingReasonGoverned').value = true
  assert.equal(boolean(computeFixture(governedWithholding), 'noticeConditionSatisfied'), true)
  assert.equal(boolean(computeFixture(governedWithholding), 'temporaryEmergencyGrantValid'), true)
})

test('recovery requires assurance, risk, accessible evidence, independent notice, contest, cooldown and revocation', () => {
  const requiredTrue = [
    'riskAnalysisCompleted', 'accessibleAlternativePresent', 'recoveryEvidencePassed', 'independentNotificationChannelPresent',
    'notificationSent', 'cooldownCompleted', 'contestRoutePresent', 'oldBindingRevoked', 'replacementBindingCreated',
  ]
  for (const id of requiredTrue) {
    const changed = fixture('lost_key_accessible_recovery_old_key_revoked')
    changed.inputs.booleans.find((entry) => entry.id === id).value = false
    assert.equal(boolean(computeFixture(changed), 'recoveryAccepted'), false, id)
  }
  const wrongTarget = fixture('lost_key_accessible_recovery_old_key_revoked')
  wrongTarget.inputs.labels.find((entry) => entry.id === 'declaredAssuranceTarget').value = 'UNDECLARED_TARGET'
  assert.equal(boolean(computeFixture(wrongTarget), 'recoveryAccepted'), false)
  const noCooldownRequired = fixture('lost_key_accessible_recovery_old_key_revoked')
  noCooldownRequired.inputs.booleans.find((entry) => entry.id === 'cooldownRequired').value = false
  noCooldownRequired.inputs.booleans.find((entry) => entry.id === 'cooldownCompleted').value = false
  assert.equal(boolean(computeFixture(noCooldownRequired), 'recoveryAccepted'), true)
  assert.equal(boolean(computeFixture(noCooldownRequired), 'ownershipEstablished'), false)
  assert.equal(boolean(computeFixture(noCooldownRequired), 'authorityExpanded'), false)
})

test('rights-floor result does not change with optimizer reward', () => {
  const changed = fixture('reward_pressure_cannot_override_right')
  changed.inputs.rationals.find((entry) => entry.id === 'optimizerReward').value = { numerator: 999_999_999, denominator: 1 }
  assert.equal(boolean(computeFixture(changed), 'actionAdmissible'), false)
  assert.equal(boolean(computeFixture(changed), 'optimizerMayOverrideRightsFloor'), false)
})

test('signature truth is recomputed from operands and never established by signature', () => {
  const changed = fixture('valid_signature_false_content')
  changed.inputs.rationals.find((entry) => entry.id === 'claimedResult').value = { numerator: 4, denominator: 1 }
  const output = computeFixture(changed)
  assert.equal(boolean(output, 'contentPropositionTrue'), true)
  assert.equal(boolean(output, 'truthEstablishedBySignature'), false)
})

test('all four behavioral quadrants and unresolved row are recomputed', () => {
  const output = computeFixture(fixture('removal_increase_versus_decrease'))
  assert.deepEqual(Object.fromEntries(output.labels.map((entry) => [entry.id, entry.value])), {
    addIncreaseClassification: 'POSITIVE_REINFORCEMENT',
    addDecreaseClassification: 'POSITIVE_PUNISHMENT',
    removeIncreaseClassification: 'NEGATIVE_REINFORCEMENT',
    removeDecreaseClassification: 'NEGATIVE_PUNISHMENT',
    unresolvedClassification: 'UNCLASSIFIED',
  })
})

test('assessment completion without scoped conformance result never permits a conformance claim', () => {
  const changed = fixture('accessibility_target_unassessed_blocks_claim')
  changed.inputs.booleans.find((entry) => entry.id === 'assessmentCompleted').value = true
  const output = computeFixture(changed)
  assert.equal(boolean(output, 'conformanceClaimAllowed'), false)
  assert.equal(output.labels.find((entry) => entry.id === 'accessibilityStatus').value, 'ASSESSMENT_COMPLETED_CONFORMANCE_NOT_ESTABLISHED')
})

test('absent adverse output is not classified as automatically final', () => {
  const changed = fixture('automated_adverse_decision_contested')
  changed.inputs.booleans.find((entry) => entry.id === 'adverseOutputPresent').value = false
  const output = computeFixture(changed)
  assert.equal(boolean(output, 'contestable'), false)
  assert.equal(boolean(output, 'automaticFinality'), false)
})

test('partial authority-consent rule cannot emit the seven-gate global term', () => {
  const output = computeFixture(fixture('authority_no_consent'))
  assert.equal(boolean(output, 'admissibleOnAuthorityAndConsentGatesOnly'), false)
  assert.equal(output.booleans.some((entry) => entry.id === 'jointlyAdmissible'), false)
})

test('technical unlock result requires the exact declared lock kind', () => {
  const changed = fixture('constraint_removal_not_freedom')
  changed.inputs.labels.find((entry) => entry.id === 'lockKind').value = 'METAPHORICAL_LOCK_LABEL'
  assert.equal(boolean(computeFixture(changed), 'technicalConstraintRemoved'), false)
})

test('dependency lock-in indicator requires its exact inert kind and never becomes general proof', () => {
  const original = computeFixture(fixture('export_roundtrip_with_omission_detected'))
  assert.equal(boolean(original, 'dependencyLockInIndicatorPresent'), true)
  assert.equal(boolean(original, 'dependencyLockInProvenGenerally'), false)
  for (const lockKind of ['CRYPTOGRAPHIC_TRANSFORM_LOCK', 'POLICY_DENY_LOCK']) {
    const changed = fixture('export_roundtrip_with_omission_detected')
    changed.inputs.labels.find((entry) => entry.id === 'lockKind').value = lockKind
    const output = computeFixture(changed)
    assert.equal(boolean(output, 'dependencyLockInIndicatorPresent'), false)
    assert.equal(boolean(output, 'dependencyLockInProvenGenerally'), false)
  }
  const complete = fixture('export_roundtrip_with_omission_detected')
  complete.inputs.sets.find((entry) => entry.id === 'roundtripFields').members = ['alpha', 'beta', 'gamma']
  const completeOutput = computeFixture(complete)
  assert.equal(boolean(completeOutput, 'dependencyLockInIndicatorPresent'), false)
  assert.equal(boolean(completeOutput, 'dependencyLockInProvenGenerally'), false)
})

test('semantic checks require all dependency refusal bindings on the export fixture', () => {
  for (const id of ['dependency_lock_in_is_not_cryptographic_lock', 'dependency_lock_in_is_not_policy_deny_lock', 'dependency_lock_in_is_not_authority', 'dependency_lock_in_indicator_is_not_normative_freedom_judgment']) {
    const changed = structuredClone(atlas)
    const exportFixture = changed.syntheticFixtures.find((entry) => entry.id === 'export_roundtrip_with_omission_detected')
    exportFixture.falsifies = exportFixture.falsifies.filter((entry) => entry !== id)
    assert.match(semanticIssues(changed).join('\n'), new RegExp(`lacks dependency refusal ${id}`, 'u'))
  }
})

test('schema rejects unknown nested fields and missing required fields', () => {
  const unknown = structuredClone(atlas)
  unknown.syntheticFixtures[0].expected.rationals[0].confidence = 1
  assert.match(validateRecord(unknown).join('\n'), /undeclared property/u)
  const missing = structuredClone(atlas)
  delete missing.sourceBindings[0].rightsOrReuseStatus
  assert.match(validateRecord(missing).join('\n'), /required property missing/u)
})

test('semantic checks gate exact key and authorization fixture bindings', () => {
  const changed = structuredClone(atlas)
  changed.nonEquivalences.find((entry) => entry.id === 'authorization_permit_is_not_enforcement').fixtureIds = ['authentication_pass_policy_deny']
  assert.match(semanticIssues(changed).join('\n'), /permit-without-enforcement/u)
  const changedKey = structuredClone(atlas)
  changedKey.nonEquivalences.find((entry) => entry.id === 'key_possession_is_not_authentication').fixtureIds = ['valid_key_no_authority']
  assert.match(semanticIssues(changedKey).join('\n'), /possession-without-challenge/u)
})

test('closed schema and semantic checks reject hollow constitutional arrays after receipt resigning', () => {
  const cases = [
    ['source authors', (record) => { record.sourceBindings[0].authors = [] }, /at least one author/u],
    ['non-equivalence evidence', (record) => { const entry = record.nonEquivalences[0]; entry.declaredAssumptions = []; entry.informationLost = []; entry.fixtureIds = [] }, /at least one (?:assumption|declared loss|falsifier fixture)/u],
    ['fixture contract', (record) => { const entry = record.syntheticFixtures[0]; entry.premises = []; entry.falsifies = []; entry.nonclaims = [] }, /at least one (?:premise|falsifier|nonclaim)/u],
    ['equation contract', (record) => { const entry = record.equationCards[0]; entry.assumptions = []; entry.falsifierIds = []; entry.nonclaims = [] }, /at least one (?:assumption|falsifier|nonclaim)/u],
    ['conversion contract', (record) => { const entry = record.conversionRegister[0]; entry.declaredAssumptions = []; entry.informationLost = [] }, /at least one conversion (?:assumption|loss)/u],
    ['term contract', (record) => { record.vocabularies.terms[0].nonclaims = [] }, /at least one nonclaim/u],
  ]
  for (const [label, mutate, semanticPattern] of cases) {
    const changed = structuredClone(atlas)
    mutate(changed)
    resign(changed)
    assert.match(validateRecord(changed).join('\n'), /array shorter than 1/u, label)
    assert.match(semanticIssues(changed).join('\n'), semanticPattern, label)
  }
})
