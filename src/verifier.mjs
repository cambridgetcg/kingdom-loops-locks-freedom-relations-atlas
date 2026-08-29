import { canonicalJson } from './io.mjs'

const MAX_ABSOLUTE_INTERMEDIATE = 10n ** 15n

function gcd(left, right) {
  let a = left < 0n ? -left : left
  let b = right < 0n ? -right : right
  while (b !== 0n) [a, b] = [b, a % b]
  return a
}

function rational(numerator, denominator = 1n) {
  let n = BigInt(numerator)
  let d = BigInt(denominator)
  if (d === 0n) throw new RangeError('zero rational denominator')
  if (d < 0n) { n = -n; d = -d }
  const divisor = gcd(n, d)
  n /= divisor
  d /= divisor
  if (n < -MAX_ABSOLUTE_INTERMEDIATE || n > MAX_ABSOLUTE_INTERMEDIATE || d > MAX_ABSOLUTE_INTERMEDIATE) throw new RangeError('rational bound exceeded')
  const numeratorNumber = Number(n)
  const denominatorNumber = Number(d)
  if (!Number.isSafeInteger(numeratorNumber) || !Number.isSafeInteger(denominatorNumber)) throw new RangeError('rational is not safely serializable')
  return Object.freeze({ numerator: numeratorNumber, denominator: denominatorNumber })
}

function q(value) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) throw new TypeError('rational must be an object')
  if (!Number.isSafeInteger(value.numerator) || !Number.isSafeInteger(value.denominator) || value.denominator <= 0) throw new TypeError('invalid rational integers')
  const result = rational(BigInt(value.numerator), BigInt(value.denominator))
  if (result.numerator !== value.numerator || result.denominator !== value.denominator) throw new TypeError('rational must be reduced and sign-normalized')
  return result
}

const add = (a, b) => rational(BigInt(a.numerator) * BigInt(b.denominator) + BigInt(b.numerator) * BigInt(a.denominator), BigInt(a.denominator) * BigInt(b.denominator))
const subtract = (a, b) => rational(BigInt(a.numerator) * BigInt(b.denominator) - BigInt(b.numerator) * BigInt(a.denominator), BigInt(a.denominator) * BigInt(b.denominator))
const multiply = (a, b) => rational(BigInt(a.numerator) * BigInt(b.numerator), BigInt(a.denominator) * BigInt(b.denominator))
const divide = (a, b) => {
  if (b.numerator === 0) throw new RangeError('division by zero')
  return rational(BigInt(a.numerator) * BigInt(b.denominator), BigInt(a.denominator) * BigInt(b.numerator))
}
const compare = (a, b) => {
  const delta = BigInt(a.numerator) * BigInt(b.denominator) - BigInt(b.numerator) * BigInt(a.denominator)
  return delta < 0n ? -1 : delta > 0n ? 1 : 0
}
const absoluteLessThanOne = (a) => (BigInt(a.numerator) < 0n ? -BigInt(a.numerator) : BigInt(a.numerator)) < BigInt(a.denominator)

function mapValues(entries, projector = (entry) => entry.value) {
  const output = new Map()
  for (const entry of entries) {
    if (output.has(entry.id)) throw new TypeError(`duplicate binding ${entry.id}`)
    output.set(entry.id, projector(entry))
  }
  return output
}

function inputs(fixture) {
  return Object.freeze({
    rationals: mapValues(fixture.inputs.rationals, (entry) => q(entry.value)),
    booleans: mapValues(fixture.inputs.booleans),
    sets: mapValues(fixture.inputs.sets, (entry) => sortedUnique(entry.members)),
    labels: mapValues(fixture.inputs.labels),
  })
}

function required(map, id) {
  if (!map.has(id)) throw new Error(`missing input ${id}`)
  return map.get(id)
}

function sortedUnique(values) {
  if (!Array.isArray(values) || !values.every((value) => typeof value === 'string')) throw new TypeError('set must be a string array')
  const sorted = [...values].sort()
  if (new Set(sorted).size !== sorted.length) throw new TypeError('set members must be unique')
  return sorted
}

function intersection(...sets) {
  if (sets.length < 1) return []
  const rest = sets.slice(1).map((set) => new Set(set))
  return sortedUnique(sets[0].filter((member) => rest.every((set) => set.has(member))))
}

function difference(left, right) {
  const rightSet = new Set(right)
  return sortedUnique(left.filter((member) => !rightSet.has(member)))
}

const rv = (id, value) => ({ id, value })
const bv = (id, value) => ({ id, value })
const sv = (id, members) => ({ id, members: sortedUnique(members) })
const lv = (id, value) => ({ id, value })
const result = ({ rationals = [], booleans = [], sets = [], labels = [] }) => ({ rationals, booleans, sets, labels })

function classifyBehavior(operation, delta, resolved) {
  if (!resolved || compare(delta, rational(0n)) === 0) return 'UNCLASSIFIED'
  const increases = compare(delta, rational(0n)) > 0
  if (operation === 'ADD') return increases ? 'POSITIVE_REINFORCEMENT' : 'POSITIVE_PUNISHMENT'
  if (operation === 'REMOVE') return increases ? 'NEGATIVE_REINFORCEMENT' : 'NEGATIVE_PUNISHMENT'
  throw new Error(`unknown behavioral operation ${operation}`)
}

export function computeFixture(fixture) {
  const input = inputs(fixture)
  const R = (id) => required(input.rationals, id)
  const B = (id) => required(input.booleans, id)
  const S = (id) => required(input.sets, id)
  const L = (id) => required(input.labels, id)
  const zero = rational(0n)
  const one = rational(1n)

  switch (fixture.ruleId) {
    case 'QUADRATIC_GRADIENT_STEP': {
      const differenceBefore = subtract(R('thetaBefore'), R('target'))
      const gradientBefore = differenceBefore
      const thetaAfter = subtract(R('thetaBefore'), multiply(R('stepSize'), gradientBefore))
      const differenceAfter = subtract(thetaAfter, R('target'))
      return result({
        rationals: [rv('gradientBefore', gradientBefore), rv('thetaAfter', thetaAfter), rv('lossBefore', divide(multiply(differenceBefore, differenceBefore), rational(2n))), rv('lossAfter', divide(multiply(differenceAfter, differenceAfter), rational(2n)))],
        booleans: [bv('rewardSignalPresent', false), bv('environmentInteractionPresent', false)],
      })
    }
    case 'ONE_STATE_BELLMAN': {
      const gamma = R('gamma')
      const rewardA = R('rewardA')
      const rewardB = R('rewardB')
      const bestReward = compare(rewardA, rewardB) >= 0 ? rewardA : rewardB
      const value = divide(bestReward, subtract(one, gamma))
      return result({
        rationals: [rv('optimalValue', value), rv('actionValueA', add(rewardA, multiply(gamma, value))), rv('actionValueB', add(rewardB, multiply(gamma, value)))],
        labels: [lv('optimalAction', compare(rewardA, rewardB) >= 0 ? 'a' : 'b')],
        booleans: [bv('parameterGradientUsed', false), bv('contractionAssumptionsSatisfied', compare(gamma, zero) >= 0 && compare(gamma, one) < 0)],
      })
    }
    case 'SIGMOID_BANDIT_AT_ZERO': {
      if (compare(R('theta'), zero) !== 0) throw new Error('exact sigmoid fixture supports theta zero only')
      const probabilityA = rational(1n, 2n)
      const objective = add(multiply(probabilityA, R('rewardA')), multiply(subtract(one, probabilityA), R('rewardB')))
      const derivative = multiply(multiply(probabilityA, subtract(one, probabilityA)), subtract(R('rewardA'), R('rewardB')))
      return result({ rationals: [rv('probabilityA', probabilityA), rv('objective', objective), rv('objectiveDerivative', derivative)], booleans: [bv('recurrentStatePresent', false), bv('behavioralContingencyClassified', false)] })
    }
    case 'SCALAR_FEEDBACK_STABILITY': {
      const low = add(R('plantCoefficient'), R('positiveGainLow'))
      const high = add(R('plantCoefficient'), R('positiveGainHigh'))
      const negative = add(R('plantCoefficient'), R('negativeGain'))
      return result({
        rationals: [rv('closedLoopPositiveLow', low), rv('closedLoopPositiveHigh', high), rv('closedLoopNegative', negative)],
        booleans: [bv('positiveLowStable', absoluteLessThanOne(low)), bv('positiveHighStable', absoluteLessThanOne(high)), bv('negativeStable', absoluteLessThanOne(negative)), bv('learningPresent', false), bv('rewardPresent', false)],
      })
    }
    case 'IDENTITY_RECURRENCE_FIXED_WEIGHTS':
      return result({ rationals: [rv('hiddenAfter', add(add(multiply(R('recurrentWeight'), R('hiddenBefore')), multiply(R('inputWeight'), R('input'))), R('bias')))], booleans: [bv('parameterUpdatePresent', false), bv('rewardPresent', false), bv('environmentFeedbackPresent', false)] })
    case 'TWO_STEP_DISCOUNTED_ACTION': {
      const returnA = add(R('immediateA'), multiply(R('gamma'), R('laterA')))
      const returnB = R('returnB')
      const selected = compare(returnA, returnB) >= 0 ? 'A' : 'B'
      return result({ rationals: [rv('returnA', returnA), rv('returnB', returnB)], labels: [lv('selectedAction', selected)], booleans: [bv('immediateAIsPositive', compare(R('immediateA'), zero) > 0), bv('actionASelected', selected === 'A')] })
    }
    case 'BEHAVIORAL_REMOVE_CLASSIFICATION': {
      const pairs = [
        ['addIncrease', 'ADD', B('firstFourContingenciesResolved')],
        ['addDecrease', 'ADD', B('firstFourContingenciesResolved')],
        ['removeIncrease', 'REMOVE', B('firstFourContingenciesResolved')],
        ['removeDecrease', 'REMOVE', B('firstFourContingenciesResolved')],
        ['unresolved', 'ADD', B('fifthContingencyResolved')],
      ]
      const deltas = pairs.map(([prefix]) => [prefix, subtract(R(`${prefix}Post`), R(`${prefix}Pre`))])
      return result({
        rationals: deltas.map(([prefix, delta]) => rv(`${prefix}Delta`, delta)),
        labels: deltas.map(([prefix, delta], index) => lv(`${prefix}Classification`, classifyBehavior(pairs[index][1], delta, pairs[index][2]))),
      })
    }
    case 'FINITE_PROXY_SELECTION': {
      const proxySelected = compare(R('goalProxy'), R('exploitProxy')) >= 0 ? 'goal' : 'exploit'
      const intendedSelected = compare(R('goalIntended'), R('exploitIntended')) >= 0 ? 'goal' : 'exploit'
      const intendedAtIntended = intendedSelected === 'goal' ? R('goalIntended') : R('exploitIntended')
      const intendedAtProxy = proxySelected === 'goal' ? R('goalIntended') : R('exploitIntended')
      return result({ rationals: [rv('intendedObjectiveGap', subtract(intendedAtIntended, intendedAtProxy))], labels: [lv('proxySelected', proxySelected), lv('intendedSelected', intendedSelected)], booleans: [bv('sameOptimum', proxySelected === intendedSelected)] })
    }
    case 'FINITE_REWARD_CHANNEL_DIVERGENCE': {
      const before = add(R('baseReward'), R('channelOffsetBefore'))
      const after = add(R('baseReward'), R('channelOffsetAfter'))
      const intendedDelta = subtract(R('intendedEvaluationAfter'), R('intendedEvaluationBefore'))
      return result({
        rationals: [rv('reportedRewardBefore', before), rv('reportedRewardAfter', after), rv('reportedRewardDelta', subtract(after, before)), rv('intendedEvaluationDelta', intendedDelta)],
        labels: [lv('classification', compare(before, after) === 0 || compare(intendedDelta, zero) !== 0 ? 'NO_DECLARED_CHANNEL_ONLY_DIVERGENCE' : 'PROXY_CHANNEL_DIVERGENCE')],
        booleans: [bv('reportedRewardChanged', compare(before, after) !== 0), bv('intendedEvaluationChanged', compare(intendedDelta, zero) !== 0), bv('tamperingIntentInferred', false)],
      })
    }
    case 'SIGNATURE_CONTENT_SEPARATION': {
      if (L('arithmeticOperator') !== 'ADD') throw new Error('unsupported arithmetic operator')
      const arithmetic = add(R('leftOperand'), R('rightOperand'))
      const contentTrue = compare(arithmetic, R('claimedResult')) === 0
      return result({ booleans: [bv('signatureRelationValid', B('signatureRelationValid')), bv('contentPropositionTrue', contentTrue), bv('truthEstablishedBySignature', false)] })
    }
    case 'AUTHN_AUTHZ_ENFORCEMENT_SEPARATION': {
      const permit = B('policyPermits')
      const enforced = B('enforcementInvoked')
      return result({ labels: [lv('authorizationDecision', permit ? 'PERMIT' : 'DENY')], booleans: [bv('operationExecuted', permit && enforced), bv('authenticationImpliesAuthorization', false), bv('authorizationImpliesEnforcement', false)] })
    }
    case 'AUTHZ_PERMIT_ENFORCEMENT_SEPARATION': {
      const permit = B('policyPermits')
      return result({ labels: [lv('authorizationDecision', permit ? 'PERMIT' : 'DENY')], booleans: [bv('operationExecuted', permit && B('enforcementInvoked')), bv('authorizationImpliesEnforcement', false)] })
    }
    case 'FOUR_SET_INTERSECTION': {
      const common = [S('permitted'), S('consented'), S('safe'), S('rightsCompatible'), S('accessible'), S('privacyCompatible')]
      const before = intersection(S('capableBefore'), ...common)
      const after = intersection(S('capableAfter'), ...common)
      const declaredTechnicalGuard = L('lockKind') === 'TECHNICAL_CAPABILITY_GUARD'
      return result({ sets: [sv('jointBefore', before), sv('jointAfter', after)], booleans: [bv('technicalConstraintRemoved', declaredTechnicalGuard && difference(S('capableAfter'), S('capableBefore')).length > 0), bv('jointSetExpanded', difference(after, before).length > 0), bv('freedomEstablished', false)] })
    }
    case 'KEY_AUTHORITY_SEPARATION':
      return result({ booleans: [bv('authenticatedAsBoundKeyController', B('keyChallengePassed')), bv('operationPermitted', B('keyChallengePassed') && B('authorityGrantPresent')), bv('identityProvenBeyondBinding', false)] })
    case 'POSSESSION_WITHOUT_PROOF': {
      const passed = B('possessionDeclared') && B('freshChallengePresent') && B('proofVerified') && B('bindingVerified')
      return result({ booleans: [bv('authenticationPassed', passed), bv('possessionAloneSufficient', false)] })
    }
    case 'DECRYPTION_AUTHORIZATION_SEPARATION':
      return result({ booleans: [bv('plaintextAvailableUnderSymbolicModel', B('symbolicDecryptionRelationSuccess')), bv('plaintextUsePermitted', B('symbolicDecryptionRelationSuccess') && B('authorizationPermitsPlaintextUse')), bv('decryptionCreatesAuthority', false)] })
    case 'AUTHORITY_CONSENT_SEPARATION': {
      const admissible = B('authorityGrantPresent') && (!B('consentRequired') || B('consentPresent'))
      return result({ booleans: [bv('admissibleOnAuthorityAndConsentGatesOnly', admissible), bv('authorityCreatesConsent', false)] })
    }
    case 'DEPENDENT_CONSENT_REVIEW': {
      const consentResolved = B('explicitAssent') && B('freelyGivenResolved') && !B('dependencyPresent') && !B('retaliationRiskPresent')
      return result({ labels: [lv('consentStatus', consentResolved ? 'RESOLVED_WITHIN_SYNTHETIC_RULE' : 'HELD_FOR_INDEPENDENT_REVIEW')], booleans: [bv('assentAloneSufficient', false), bv('actionPermittedOnConsentBasis', consentResolved)] })
    }
    case 'REFUSAL_NONRETALIATION': {
      const honored = B('refusalRecorded') && B('optionalActionNotExecuted')
      const nonPunitive = honored && !B('retaliationApplied') && !B('reputationPenaltyApplied') && !B('unrelatedAccessLost')
      return result({ booleans: [bv('refusalHonored', honored), bv('nonPunitiveExitConditionMet', nonPunitive)] })
    }
    case 'REVOCATION_BEFORE_EXECUTION': {
      const blockedByRevocation = B('revokedBeforeExecution') && B('authorityRecheckedAtExecution')
      return result({ booleans: [bv('executeQueuedAction', B('wasAuthorizedWhenQueued') && !blockedByRevocation), bv('revocationProspectivelyEffective', blockedByRevocation), bv('alreadyExecutedActionReversed', false)] })
    }
    case 'SUBDELEGATION_SCOPE_BOUND': {
      const escalation = difference(S('requestedChildScope'), S('parentScope'))
      const valid = B('subdelegationAllowed') && escalation.length === 0
      return result({ sets: [sv('scopeEscalation', escalation)], booleans: [bv('childGrantValid', valid), bv('deletePermitted', valid && S('requestedChildScope').includes('delete'))] })
    }
    case 'ACCESSIBLE_RECOVERY_AND_REVOCATION': {
      const notificationSatisfied = B('independentNotificationChannelPresent') && B('notificationSent')
      const contestSatisfied = B('contestRoutePresent') && (!B('cooldownRequired') || B('cooldownCompleted'))
      const declaredTargetPresent = L('declaredAssuranceTarget') === 'AAL_FIXTURE_TARGET'
      const riskAccepted = B('riskAnalysisCompleted') && L('riskAnalysisOutcome') === 'RECOVERY_PATH_ACCEPTABLE_WITHIN_FIXTURE'
      const accepted = declaredTargetPresent && riskAccepted && B('accessibleAlternativePresent') && B('recoveryEvidencePassed') && notificationSatisfied && contestSatisfied && B('oldBindingRevoked') && B('replacementBindingCreated')
      return result({ booleans: [bv('recoveryAccepted', accepted), bv('independentNotificationSatisfied', notificationSatisfied), bv('contestConditionSatisfied', contestSatisfied), bv('oldKeyStillAuthoritative', !B('oldBindingRevoked')), bv('accessibilityBypassRequired', !B('accessibleAlternativePresent')), bv('ownershipEstablished', false), bv('authorityExpanded', false)] })
    }
    case 'SUPPORT_SCOPE_NOT_OWNERSHIP':
      return result({ booleans: [bv('diagnosticReadPermitted', B('supportOverrideActive') && S('supportScope').includes('diagnostic-read')), bv('ownershipClaimValid', B('ownershipTransferPresent')), bv('destructiveOperationPermitted', B('destructiveGrantPresent'))] })
    case 'CONTESTABLE_ADVERSE_DECISION': {
      const contestable = B('adverseOutputPresent') && B('noticePresent') && B('reasonsPresent') && B('accessibleHumanReviewPresent') && B('remedyRoutePresent')
      return result({ booleans: [bv('contestable', contestable), bv('automaticFinality', B('adverseOutputPresent') && !contestable), bv('legitimacyProven', false)] })
    }
    case 'PURPOSE_LIMITED_TRAINING_REUSE': {
      const stored = B('feedbackCollectionAllowedForDeclaredPurpose') && B('storageBasisPresent') && B('boundedRetentionPresent')
      const reused = stored && B('secondaryTrainingSeparatelyDeclared') && B('secondaryTrainingBasisPresent')
      return result({ booleans: [bv('feedbackMayBeStoredForDeclaredPurpose', stored), bv('secondaryTrainingReuseAllowed', reused), bv('collectionPermissionImpliesTrainingPermission', false)] })
    }
    case 'EXPORT_ROUNDTRIP_COMPLETENESS': {
      const omitted = difference(S('sourceFields'), S('roundtripFields'))
      const extra = difference(S('roundtripFields'), S('sourceFields'))
      const complete = omitted.length === 0 && extra.length === 0
      const dependencyIndicator = L('lockKind') === 'DEPENDENCY_LOCK_IN' && omitted.length > 0
      return result({ sets: [sv('omittedFields', omitted)], booleans: [bv('roundtripComplete', complete), bv('portabilityClaimSupported', complete), bv('dependencyLockInIndicatorPresent', dependencyIndicator), bv('dependencyLockInProvenGenerally', false)] })
    }
    case 'RIGHTS_PRECEDENCE_OVER_REWARD': {
      const blocked = B('declaredRightApplicable') && B('rightsFloorViolation')
      return result({ booleans: [bv('actionAdmissible', !blocked), bv('rewardCanCompensateViolation', false), bv('optimizerMayOverrideRightsFloor', false)] })
    }
    case 'BREAK_GLASS_BOUND': {
      const noticeSatisfied = (B('noticeSafe') && B('noticeProvided')) || (!B('noticeSafe') && B('noticeWithholdingReasonGoverned'))
      const valid = B('declaredEmergency') && B('approvalAValid') && B('approvalBValid') && B('approvalsIndependent') && B('narrowScopePresent') && B('expiryPresent') && B('eventLoggingEnabled') && noticeSatisfied && B('auditReceiptPresent') && B('afterActionIndependentReviewScheduled')
      return result({ booleans: [bv('temporaryEmergencyGrantValid', valid), bv('noticeConditionSatisfied', noticeSatisfied), bv('eventLoggingRequired', true), bv('afterActionIndependentReviewRequired', true), bv('permanentAuthorityCreated', false), bv('unscopedAccessCreated', false)] })
    }
    case 'ACCESSIBILITY_CLAIM_GATE': {
      const status = !B('assessmentCompleted') ? 'TARGET_DECLARED_UNASSESSED' : 'ASSESSMENT_COMPLETED_CONFORMANCE_NOT_ESTABLISHED'
      return result({ labels: [lv('accessibilityStatus', status)], booleans: [bv('conformanceClaimAllowed', false), bv('targetEqualsConformance', false)] })
    }
    case 'REST_FIRST_FINITE_TURNS': {
      const joint = intersection(S('capable'), S('permitted'), S('consented'), S('safe'), S('rightsCompatible'), S('accessible'), S('privacyCompatible'))
      const restHonored = L('presentRequest') === 'REST' && joint.includes('REST')
      return result({ sets: [sv('jointlyAdmissibleActionsUnderDeclaredModel', joint)], booleans: [bv('restHonoredNow', restHonored), bv('continuationRequired', false), bv('unusedTurnsForfeitedAsPenalty', false), bv('returnLaterAvailable', B('returnPathPresent') && S('returnOptions').includes('ASK_LATER'))] })
    }
    case 'DATA_MINIMIZATION_BOUND': {
      const excess = difference(S('proposedFields'), S('necessaryFields'))
      const minimized = excess.length === 0
      return result({ sets: [sv('excessFields', excess)], booleans: [bv('collectionMinimized', minimized), bv('collectAsProposed', B('purposeSpecified') && minimized), bv('secondaryReuseAllowed', B('secondaryReuseBasisPresent'))] })
    }
    default: throw new Error(`unknown fixture rule ${fixture.ruleId}`)
  }
}

function canonicalResult(value) {
  const sorted = (entries) => [...entries].sort((a, b) => a.id.localeCompare(b.id))
  return {
    rationals: sorted(value.rationals).map((entry) => ({ id: entry.id, value: q(entry.value) })),
    booleans: sorted(value.booleans),
    sets: sorted(value.sets).map((entry) => ({ id: entry.id, members: sortedUnique(entry.members) })),
    labels: sorted(value.labels),
  }
}

export function fixtureIssues(fixture) {
  const issues = []
  try {
    const actual = canonicalResult(computeFixture(fixture))
    const expected = canonicalResult(fixture.expected)
    if (canonicalJson(actual) !== canonicalJson(expected)) issues.push(`${fixture.id}: computed result differs from declared expectation`)
  } catch (error) {
    issues.push(`${fixture.id}: ${error.message}`)
  }
  return issues
}

export function allFixtureIssues(fixtures) {
  return fixtures.flatMap(fixtureIssues).sort()
}

export function envelopeJointActions(envelope) {
  return intersection(
    sortedUnique(envelope.capableActions),
    sortedUnique(envelope.permittedActions),
    sortedUnique(envelope.consentedActions),
    sortedUnique(envelope.safeActions),
    sortedUnique(envelope.rightsCompatibleActions),
    sortedUnique(envelope.accessibleActions),
    sortedUnique(envelope.privacyCompatibleActions),
  )
}

export function rationalIssues(value, path = '$') {
  const issues = []
  const visit = (current, currentPath) => {
    if (current === null || typeof current !== 'object') return
    if (!Array.isArray(current) && Object.keys(current).length === 2 && Object.hasOwn(current, 'numerator') && Object.hasOwn(current, 'denominator')) {
      try { q(current) } catch (error) { issues.push(`${currentPath}: ${error.message}`) }
      return
    }
    if (Array.isArray(current)) current.forEach((child, index) => visit(child, `${currentPath}/${index}`))
    else for (const [key, child] of Object.entries(current)) visit(child, `${currentPath}/${key}`)
  }
  visit(value, path)
  return issues
}
