import {
  ATLAS_PUBLIC_PATH,
  GUIDE_PUBLIC_PATH,
  GUIDE_SOURCE_PATH,
  SCHEMA_PUBLIC_PATH,
  atomicWriteAuthorized,
  canonicalJson,
  prettyCanonicalJson,
  publicInventoryIssues,
  readBoundedBytes,
  readUtf8Text,
  sha256Bytes,
  sha256Json,
  sourceReceipt,
} from './io.mjs'
import {
  constitutionalBoundaries,
  conversionRegister,
  equationCards,
  freedomRelevantEnvelopes,
  identity,
  keyAndAuthenticatorKinds,
  kingdomSemanticOrientations,
  lanes,
  lockKinds,
  nonEquivalences,
  relationTypes,
  sourceBindings,
  syntheticFixtures,
  terms,
} from './content.mjs'
import { publicSchema, schemaIssues, validateRecord } from './schema.mjs'
import { allFixtureIssues, computeFixture, envelopeJointActions, rationalIssues } from './verifier.mjs'

const SOURCE_INPUTS = Object.freeze([
  'PUBLICATION-AUTHORIZATION.md',
  'guide/public-guide.md',
  'src/atlas.mjs',
  'src/cli.mjs',
  'src/content.mjs',
  'src/io.mjs',
  'src/schema.mjs',
  'src/verifier.mjs',
])

const behavioralContingencyQuadrants = Object.freeze([
  Object.freeze({ operation: 'ADD', responseDirection: 'INCREASE', classification: 'POSITIVE_REINFORCEMENT' }),
  Object.freeze({ operation: 'REMOVE', responseDirection: 'INCREASE', classification: 'NEGATIVE_REINFORCEMENT' }),
  Object.freeze({ operation: 'ADD', responseDirection: 'DECREASE', classification: 'POSITIVE_PUNISHMENT' }),
  Object.freeze({ operation: 'REMOVE', responseDirection: 'DECREASE', classification: 'NEGATIVE_PUNISHMENT' }),
])

const scope = Object.freeze({
  staticArtifact: true,
  syntheticOnly: true,
  realPeople: false,
  personalData: false,
  liveObservation: false,
  liveOptimization: false,
  runtimeAgent: false,
  rewardRuntime: false,
  controlActuation: false,
  privateKeys: false,
  credentials: false,
  keyGeneration: false,
  authenticationAdapter: false,
  authorizationAdapter: false,
  enforcementAdapter: false,
  accessDecision: false,
  policyDeployment: false,
  automaticAction: false,
  recommendation: false,
  punishmentRecommendation: false,
  censorship: false,
  humanTraining: false,
  behavioralDiagnosis: false,
  intentInference: false,
  consciousnessInference: false,
  personScore: false,
  communityScore: false,
  freedomScore: false,
  moralScore: false,
  alignmentScore: false,
  reinforcementScore: false,
  lockStrengthScore: false,
  unconstrainedAction: false,
  network: false,
  mcp: false,
})

const artifact = Object.freeze({
  id: identity.artifactId,
  title: identity.title,
  asOf: identity.asOf,
  lifecyclePhase: 'FROZEN_STATIC_FIXTURE',
  releaseState: 'FROZEN_FOR_IMMUTABLE_HANDOFF',
  immutableCandidate: true,
  synthetic: true,
  authorship: Object.freeze({
    humanDirected: true,
    modelAssisted: true,
    assistanceDisclosure: 'Human-directed request; model-assisted research synthesis, fixture authorship, implementation and verification. Independent model review and human review are reported separately and never inferred from assistance.',
    independentModelReviewCompleted: true,
    humanReviewCompleted: false,
    userPublicationPermissionRecorded: true,
    releaseGateSatisfied: true,
  }),
})

const publicHandoff = Object.freeze({
  routes: Object.freeze([
    Object.freeze({ route: '/atlases/loops-locks-freedom-relations-atlas-2026-08-28.json', absoluteUrl: 'https://thekingdom.dev/atlases/loops-locks-freedom-relations-atlas-2026-08-28.json', mimeType: 'application/json; charset=utf-8', role: 'CANONICAL_RECORD', immutable: true }),
    Object.freeze({ route: '/schemas/loops-locks-freedom-relations-atlas/0.1.json', absoluteUrl: identity.schemaId, mimeType: 'application/json; charset=utf-8', role: 'CLOSED_SCHEMA', immutable: true }),
    Object.freeze({ route: '/LOOPS-LOCKS-FREEDOM-RELATIONS-ATLAS-v0.1.md', absoluteUrl: 'https://thekingdom.dev/LOOPS-LOCKS-FREEDOM-RELATIONS-ATLAS-v0.1.md', mimeType: 'text/markdown; charset=utf-8', role: 'ACCESSIBLE_LINEAR_GUIDE', immutable: true }),
  ]),
  mutableAlias: false,
  page: false,
  runtime: false,
  publicationAuthorized: true,
  reviewGate: 'INDEPENDENT_MODEL_GREEN_AND_RELEASE_OWNER_EXACT_BYTE_CONFIRMATION',
  currentState: 'FROZEN_FOR_IMMUTABLE_HANDOFF',
})

function counts() {
  return Object.freeze({
    lanes: lanes.length,
    terms: terms.length,
    lockKinds: lockKinds.length,
    equationCards: equationCards.length,
    syntheticFixtures: syntheticFixtures.length,
    mathematicalFixtures: syntheticFixtures.filter((fixture) => fixture.kind === 'MATHEMATICAL').length,
    governanceFixtures: syntheticFixtures.filter((fixture) => fixture.kind === 'GOVERNANCE').length,
    nonEquivalences: nonEquivalences.length,
    conversions: conversionRegister.length,
    freedomRelevantEnvelopes: freedomRelevantEnvelopes.length,
    sourceBindings: sourceBindings.length,
    kingdomSemanticOrientations: kingdomSemanticOrientations.length,
  })
}

function payload() {
  return {
    $schema: identity.schemaId,
    protocol: identity.protocol,
    artifact,
    scope,
    vocabularies: {
      lanes,
      relationTypes,
      terms,
      keyAndAuthenticatorKinds,
      lockKinds,
      behavioralContingencyQuadrants,
      unresolvedBehavioralClassification: 'UNCLASSIFIED',
    },
    equationCards,
    syntheticFixtures,
    nonEquivalences,
    conversionRegister,
    freedomRelevantEnvelopes,
    constitutionalBoundaries,
    kingdomSemanticOrientations,
    sourceBindings,
    counts: counts(),
    publicHandoff,
  }
}

export function buildAtlas() {
  const semanticPayload = payload()
  const record = {
    ...semanticPayload,
    buildReceipt: {
      semanticPayloadSha256: sha256Json(semanticPayload),
      verifierState: 'ALL_STATIC_SYNTHETIC_FIXTURES_RECOMPUTED',
      verifiedFixtureCount: syntheticFixtures.length,
      arithmetic: 'EXACT_BOUNDED_BIGINT_RATIONAL_AND_FINITE_SYMBOLIC_RULES',
      clockRead: false,
      networkUsed: false,
      externalInputUsed: false,
      generatorInputReceipts: SOURCE_INPUTS.map(sourceReceipt),
    },
  }
  return JSON.parse(canonicalJson(record))
}

function duplicateIds(entries, label) {
  const seen = new Set()
  const issues = []
  for (const entry of entries) {
    if (seen.has(entry.id)) issues.push(`${label}: duplicate id ${entry.id}`)
    seen.add(entry.id)
  }
  return issues
}

function bindingDuplicateIssues(fixture) {
  const issues = []
  for (const side of ['inputs', 'expected']) {
    for (const kind of ['rationals', 'booleans', 'sets', 'labels']) {
      const ids = fixture[side][kind].map((entry) => entry.id)
      if (new Set(ids).size !== ids.length) issues.push(`${fixture.id}/${side}/${kind}: duplicate binding id`)
    }
  }
  return issues
}

function getById(entries, id, label, issues) {
  const found = entries.find((entry) => entry.id === id)
  if (found === undefined) issues.push(`${label}: missing ${id}`)
  return found
}

function fieldNameIssues(record) {
  const forbidden = new Set(record.constitutionalBoundaries.forbiddenFieldNames)
  const issues = []
  const visit = (value, path) => {
    if (value === null || typeof value !== 'object') return
    if (Array.isArray(value)) return value.forEach((entry, index) => visit(entry, `${path}/${index}`))
    for (const [key, child] of Object.entries(value)) {
      const allowedScopeDeclaration = path === '$/scope' && child === false
      if (forbidden.has(key) && !allowedScopeDeclaration) issues.push(`${path}/${key}: forbidden field name outside false scope declaration`)
      visit(child, `${path}/${key}`)
    }
  }
  visit(record, '$')
  return issues
}

export function semanticIssues(record) {
  const issues = []
  issues.push(...allFixtureIssues(record.syntheticFixtures))
  issues.push(...rationalIssues(record))
  issues.push(...duplicateIds(record.vocabularies.terms, 'terms'))
  issues.push(...duplicateIds(record.vocabularies.keyAndAuthenticatorKinds, 'key kinds'))
  issues.push(...duplicateIds(record.vocabularies.lockKinds, 'lock kinds'))
  issues.push(...duplicateIds(record.equationCards, 'equation cards'))
  issues.push(...duplicateIds(record.syntheticFixtures, 'fixtures'))
  issues.push(...duplicateIds(record.nonEquivalences, 'non-equivalences'))
  issues.push(...duplicateIds(record.conversionRegister, 'conversions'))
  issues.push(...duplicateIds(record.freedomRelevantEnvelopes, 'freedom envelopes'))
  issues.push(...duplicateIds(record.sourceBindings, 'source bindings'))
  issues.push(...duplicateIds(record.kingdomSemanticOrientations, 'KINGDOM orientations'))
  for (const term of record.vocabularies.terms) if (term.nonclaims.length < 1) issues.push(`${term.id}: at least one nonclaim is required`)
  for (const card of record.equationCards) {
    if (card.assumptions.length < 1) issues.push(`${card.id}: at least one assumption is required`)
    if (card.falsifierIds.length < 1) issues.push(`${card.id}: at least one falsifier is required`)
    if (card.nonclaims.length < 1) issues.push(`${card.id}: at least one nonclaim is required`)
  }
  for (const fixture of record.syntheticFixtures) {
    issues.push(...bindingDuplicateIssues(fixture))
    if (fixture.premises.length < 1) issues.push(`${fixture.id}: at least one premise is required`)
    if (fixture.falsifies.length < 1) issues.push(`${fixture.id}: at least one falsifier is required`)
    if (fixture.nonclaims.length < 1) issues.push(`${fixture.id}: at least one nonclaim is required`)
  }
  for (const entry of record.nonEquivalences) {
    if (entry.declaredAssumptions.length < 1) issues.push(`${entry.id}: at least one assumption is required`)
    if (entry.informationLost.length < 1) issues.push(`${entry.id}: at least one declared loss is required`)
    if (entry.fixtureIds.length < 1) issues.push(`${entry.id}: at least one falsifier fixture is required`)
  }
  for (const entry of record.conversionRegister) {
    if (entry.declaredAssumptions.length < 1) issues.push(`${entry.id}: at least one conversion assumption is required`)
    if (entry.informationLost.length < 1) issues.push(`${entry.id}: at least one conversion loss is required`)
  }
  for (const source of record.sourceBindings) if (source.authors.length < 1) issues.push(`${source.id}: at least one author is required`)
  for (const kind of record.vocabularies.lockKinds) {
    if (kind.containsMechanism !== false || kind.executable !== false) issues.push(`${kind.id}: lock kind must remain inert`)
    if (!record.vocabularies.lanes.includes(kind.lane)) issues.push(`${kind.id}: lock kind lane is unresolved`)
  }

  const fixtureIds = new Set(record.syntheticFixtures.map((fixture) => fixture.id))
  const equationIds = new Set(record.equationCards.map((card) => card.id))
  const falsifierIds = new Set(record.nonEquivalences.map((entry) => entry.id))
  for (const card of record.equationCards) {
    for (const fixtureId of card.fixtureIds) if (!fixtureIds.has(fixtureId)) issues.push(`${card.id}: unresolved fixture ${fixtureId}`)
    for (const falsifierId of card.falsifierIds) if (!falsifierIds.has(falsifierId)) issues.push(`${card.id}: unresolved falsifier ${falsifierId}`)
  }
  for (const fixture of record.syntheticFixtures) for (const falsifierId of fixture.falsifies) if (!falsifierIds.has(falsifierId)) issues.push(`${fixture.id}: unresolved falsifier ${falsifierId}`)
  for (const entry of record.nonEquivalences) {
    if (entry.relation !== 'NON_EQUIVALENT') issues.push(`${entry.id}: wrong relation`)
    for (const fixtureId of entry.fixtureIds) if (!fixtureIds.has(fixtureId)) issues.push(`${entry.id}: unresolved fixture ${fixtureId}`)
  }
  for (const entry of record.conversionRegister) {
    if (!record.vocabularies.relationTypes.includes(entry.relation)) issues.push(`${entry.id}: unknown relation`)
    if (!record.vocabularies.lanes.includes(entry.fromLane) || !record.vocabularies.lanes.includes(entry.toLane)) issues.push(`${entry.id}: unknown lane`)
  }
  for (const source of record.sourceBindings) {
    for (const flag of ['copiesContent', 'importsAuthority', 'establishesTruth', 'establishesCurrentness', 'establishesCompliance', 'endorsementClaimed']) if (source[flag] !== false) issues.push(`${source.id}: ${flag} must be false`)
    if (source.use !== 'LINK_ONLY_ORIENTATION') issues.push(`${source.id}: source use is not link-only`)
    for (const target of source.appliesTo) {
      if (target.kind === 'EQUATION_CARD' && !equationIds.has(target.id)) issues.push(`${source.id}: unresolved equation target ${target.id}`)
      else if (target.kind === 'SYNTHETIC_FIXTURE' && !fixtureIds.has(target.id)) issues.push(`${source.id}: unresolved fixture target ${target.id}`)
      else if (target.kind === 'CONSTITUTIONAL_BOUNDARIES' && target.id !== 'kingdom_freedom_foundation') issues.push(`${source.id}: unresolved constitutional target ${target.id}`)
    }
  }
  for (const orientation of record.kingdomSemanticOrientations) {
    for (const flag of ['copiesContent', 'importsAuthority', 'establishesTruth', 'runtimeDependency']) if (orientation[flag] !== false) issues.push(`${orientation.id}: ${flag} must be false`)
    if (orientation.hasDirectPublicRoute !== (orientation.publicRoute !== 'NONE')) issues.push(`${orientation.id}: public-route presence mismatch`)
  }
  for (const envelope of record.freedomRelevantEnvelopes) {
    if (canonicalJson(envelopeJointActions(envelope)) !== canonicalJson(envelope.jointlyAdmissibleActionsUnderDeclaredModel)) issues.push(`${envelope.id}: joint action set does not recompute`)
    const axes = envelope.axes.map((axis) => axis.id).sort()
    if (canonicalJson(axes) !== canonicalJson(['EXIT_REFUSAL', 'NEGATIVE_LIBERTY', 'NON_DOMINATION', 'POSITIVE_CAPABILITY'])) issues.push(`${envelope.id}: four independent axes not present exactly once`)
  }

  const expectedCounts = counts()
  if (canonicalJson(record.counts) !== canonicalJson(expectedCounts)) issues.push('counts differ from content')
  if (record.buildReceipt.verifiedFixtureCount !== record.syntheticFixtures.length) issues.push('verified fixture count mismatch')
  const { buildReceipt, ...semanticPayload } = record
  if (buildReceipt.semanticPayloadSha256 !== sha256Json(semanticPayload)) issues.push('semantic payload receipt mismatch')
  for (const receipt of buildReceipt.generatorInputReceipts) {
    try {
      if (canonicalJson(receipt) !== canonicalJson(sourceReceipt(receipt.path))) issues.push(`${receipt.path}: generator receipt mismatch`)
    } catch (error) { issues.push(`${receipt.path}: ${error.message}`) }
  }
  if (canonicalJson(buildReceipt.generatorInputReceipts.map((entry) => entry.path)) !== canonicalJson([...SOURCE_INPUTS].sort())) issues.push('generator input allowlist mismatch or order drift')
  if (record.artifact.lifecyclePhase !== record.constitutionalBoundaries.lifecycle.current) issues.push('artifact and constitutional lifecycle disagree')
  if (record.artifact.authorship.humanReviewCompleted !== false) issues.push('human review must remain explicitly false')
  if (record.artifact.lifecyclePhase !== 'FROZEN_STATIC_FIXTURE') issues.push('artifact must retain the reviewed frozen lifecycle')
  if (record.artifact.releaseState !== 'FROZEN_FOR_IMMUTABLE_HANDOFF') issues.push('artifact must retain the reviewed immutable-handoff state')
  if (!record.artifact.authorship.independentModelReviewCompleted || !record.artifact.authorship.releaseGateSatisfied || !record.publicHandoff.publicationAuthorized) issues.push('reviewed static handoff gates must remain satisfied')
  if (record.publicHandoff.currentState !== record.artifact.releaseState) issues.push('artifact and handoff release state disagree')
  for (const [key, value] of Object.entries(record.scope)) if (!['staticArtifact', 'syntheticOnly'].includes(key) && value !== false) issues.push(`scope/${key}: forbidden capability enabled`)
  issues.push(...fieldNameIssues(record))

  const permitEnforcement = getById(record.nonEquivalences, 'authorization_permit_is_not_enforcement', 'non-equivalence', issues)
  if (permitEnforcement !== undefined && canonicalJson(permitEnforcement.fixtureIds) !== canonicalJson(['authorization_permit_not_enforced'])) issues.push('authorization permit/enforcement falsifier must bind the permit-without-enforcement fixture')
  const possessionAuthentication = getById(record.nonEquivalences, 'key_possession_is_not_authentication', 'non-equivalence', issues)
  if (possessionAuthentication !== undefined && canonicalJson(possessionAuthentication.fixtureIds) !== canonicalJson(['key_possession_without_challenge'])) issues.push('key possession/authentication falsifier must bind possession-without-challenge fixture')
  const authenticationTerm = getById(record.vocabularies.terms, 'authentication', 'term', issues)
  if (authenticationTerm !== undefined && !authenticationTerm.definition.includes('produces evidence under a declared authenticator binding')) issues.push('authentication definition overclaims beyond evidence')
  const jointTerm = getById(record.vocabularies.terms, 'jointly_admissible_actions_under_declared_model', 'term', issues)
  if (jointTerm !== undefined && !['capable', 'permitted', 'consented', 'safe', 'declared-rights-compatible', 'accessible', 'privacy-compatible'].every((word) => jointTerm.definition.includes(word))) issues.push('joint-action term does not name all seven gates')
  const envelopeTerm = getById(record.vocabularies.terms, 'freedom_relevant_envelope', 'term', issues)
  if (envelopeTerm !== undefined && !['capability', 'permission', 'consent', 'safety', 'declared-rights compatibility', 'accessibility', 'privacy compatibility', 'reversibility', 'exit', 'appeal', 'contestation', 'recovery', 'return', 'non-domination', 'unknown constraints'].every((word) => envelopeTerm.definition.includes(word))) issues.push('freedom-envelope term omits a declared dimension')
  const rightsFixture = getById(record.syntheticFixtures, 'reward_pressure_cannot_override_right', 'fixture', issues)
  if (rightsFixture !== undefined) {
    const result = computeFixture(rightsFixture)
    if (result.booleans.find((entry) => entry.id === 'actionAdmissible')?.value !== false) issues.push('rights-floor violation did not force action inadmissible')
  }
  const breakGlass = getById(record.syntheticFixtures, 'break_glass_dual_control_expiry', 'fixture', issues)
  if (breakGlass !== undefined) {
    for (const id of ['eventLoggingEnabled', 'noticeSafe', 'noticeProvided', 'noticeWithholdingReasonGoverned', 'afterActionIndependentReviewScheduled']) if (!breakGlass.inputs.booleans.some((entry) => entry.id === id)) issues.push(`break-glass missing input ${id}`)
    for (const id of ['eventLoggingRequired', 'noticeConditionSatisfied', 'afterActionIndependentReviewRequired']) if (!breakGlass.expected.booleans.some((entry) => entry.id === id)) issues.push(`break-glass missing expected output ${id}`)
  }
  const authorityConsent = getById(record.syntheticFixtures, 'authority_no_consent', 'fixture', issues)
  if (authorityConsent !== undefined) {
    if (authorityConsent.expected.booleans.some((entry) => entry.id === 'jointlyAdmissible')) issues.push('partial authority-consent fixture must not emit global jointlyAdmissible')
    if (!authorityConsent.expected.booleans.some((entry) => entry.id === 'admissibleOnAuthorityAndConsentGatesOnly')) issues.push('partial authority-consent fixture lacks scoped result name')
  }
  const lockRemoval = getById(record.syntheticFixtures, 'constraint_removal_not_freedom', 'fixture', issues)
  if (lockRemoval !== undefined && lockRemoval.inputs.labels.find((entry) => entry.id === 'lockKind')?.value !== 'TECHNICAL_CAPABILITY_GUARD') issues.push('constraint-removal fixture lacks exact technical lock kind')
  const dependencyKind = getById(record.vocabularies.lockKinds, 'DEPENDENCY_LOCK_IN', 'lock kind', issues)
  if (dependencyKind !== undefined && (dependencyKind.containsMechanism !== false || dependencyKind.executable !== false || dependencyKind.lane !== 'FREEDOM_RELEVANT_CONDITIONS')) issues.push('dependency lock-in kind is not inert and freedom-scoped')
  const exportFixture = getById(record.syntheticFixtures, 'export_roundtrip_with_omission_detected', 'fixture', issues)
  const dependencyRefusals = ['dependency_lock_in_is_not_cryptographic_lock', 'dependency_lock_in_is_not_policy_deny_lock', 'dependency_lock_in_is_not_authority', 'dependency_lock_in_indicator_is_not_normative_freedom_judgment']
  if (exportFixture !== undefined) {
    if (exportFixture.inputs.labels.find((entry) => entry.id === 'lockKind')?.value !== 'DEPENDENCY_LOCK_IN') issues.push('export roundtrip fixture lacks dependency lock-in binding')
    if (computeFixture(exportFixture).booleans.find((entry) => entry.id === 'dependencyLockInProvenGenerally')?.value !== false) issues.push('export roundtrip overclaims general dependency lock-in proof')
    for (const id of dependencyRefusals) if (!exportFixture.falsifies.includes(id)) issues.push(`export roundtrip fixture lacks dependency refusal ${id}`)
  }
  for (const id of dependencyRefusals) {
    const entry = getById(record.nonEquivalences, id, 'non-equivalence', issues)
    if (entry !== undefined && canonicalJson(entry.fixtureIds) !== canonicalJson(['export_roundtrip_with_omission_detected'])) issues.push(`${id}: wrong fixture binding`)
  }
  const accessibility = getById(record.syntheticFixtures, 'accessibility_target_unassessed_blocks_claim', 'fixture', issues)
  if (accessibility !== undefined && computeFixture(accessibility).booleans.find((entry) => entry.id === 'conformanceClaimAllowed')?.value !== false) issues.push('accessibility fixture overclaims conformance')
  const kalman = getById(record.sourceBindings, 'kalman_1960', 'source', issues)
  if (kalman !== undefined && kalman.title !== 'A New Approach to Linear Filtering and Prediction Problems') issues.push('Kalman source title is inaccurate')
  const goodhart = getById(record.sourceBindings, 'goodhart_1975_bibliography', 'source', issues)
  if (goodhart !== undefined && goodhart.sourceKind !== 'OFFICIAL_INSTITUTIONAL_BIBLIOGRAPHY') issues.push('Goodhart source must remain bibliography-only')
  const williams = getById(record.sourceBindings, 'williams_1992', 'source', issues)
  if (williams !== undefined && canonicalJson({ authors: williams.authors, title: williams.title, venue: williams.venueOrOriginalPublisher, host: williams.host, url: williams.url, scope: williams.versionScope }) !== canonicalJson({ authors: ['Ronald J. Williams'], title: 'Simple Statistical Gradient-Following Algorithms for Connectionist Reinforcement Learning', venue: 'Machine Learning', host: 'Springer DOI landing', url: 'https://doi.org/10.1007/BF00992696', scope: 'Volume 8, pages 229–256' })) issues.push('Williams source identity tuple is inaccurate')
  const everitt = getById(record.sourceBindings, 'everitt_et_al_2019', 'source', issues)
  if (everitt !== undefined && canonicalJson(everitt.authors) !== canonicalJson(['Tom Everitt', 'Marcus Hutter', 'Ramana Kumar', 'Victoria Krakovna'])) issues.push('Everitt source author tuple is inaccurate')
  const nistAbac = getById(record.sourceBindings, 'nist_sp_800_162', 'source', issues)
  if (nistAbac !== undefined && canonicalJson(nistAbac.authors) !== canonicalJson(['Vincent C. Hu', 'David Ferraiolo', 'Richard Kuhn', 'Adam Schnitzer', 'Kenneth Sandlin', 'Robert Miller', 'Karen Scarfone'])) issues.push('NIST SP 800-162 author tuple is inaccurate')
  return [...new Set(issues)].sort()
}

export function renderedTriplet() {
  const atlas = buildAtlas()
  const structural = validateRecord(atlas)
  const semantic = semanticIssues(atlas)
  const schema = schemaIssues(publicSchema)
  if (structural.length + semantic.length + schema.length > 0) throw new Error(`cannot render invalid triplet:\n${[...structural, ...semantic, ...schema].join('\n')}`)
  return {
    atlas,
    atlasText: prettyCanonicalJson(atlas),
    schemaText: prettyCanonicalJson(publicSchema),
    guideText: readUtf8Text(GUIDE_SOURCE_PATH),
  }
}

export function writeTriplet() {
  const inventory = publicInventoryIssues({ allowMissing: true })
  if (inventory.length > 0) throw new Error(`public inventory is not clean: ${inventory.join('; ')}`)
  const rendered = renderedTriplet()
  atomicWriteAuthorized(ATLAS_PUBLIC_PATH, rendered.atlasText)
  atomicWriteAuthorized(SCHEMA_PUBLIC_PATH, rendered.schemaText)
  atomicWriteAuthorized(GUIDE_PUBLIC_PATH, rendered.guideText)
  return tripletReceipts()
}

export function tripletReceipts() {
  const entries = [
    ['LOOPS-LOCKS-FREEDOM-RELATIONS-ATLAS-v0.1.md', GUIDE_PUBLIC_PATH],
    ['atlases/loops-locks-freedom-relations-atlas-2026-08-28.json', ATLAS_PUBLIC_PATH],
    ['schemas/loops-locks-freedom-relations-atlas/0.1.json', SCHEMA_PUBLIC_PATH],
  ]
  return entries.map(([path, absolute]) => {
    const bytes = readBoundedBytes(absolute)
    return { path, bytes: bytes.byteLength, byteSha256: sha256Bytes(bytes) }
  })
}

export function checkTriplet() {
  const inventoryIssues = publicInventoryIssues()
  const rendered = renderedTriplet()
  if (inventoryIssues.length > 0) return { current: false, inventoryIssues, atlas: rendered.atlas, receipts: [] }
  const comparisons = [
    [ATLAS_PUBLIC_PATH, rendered.atlasText],
    [SCHEMA_PUBLIC_PATH, rendered.schemaText],
    [GUIDE_PUBLIC_PATH, rendered.guideText],
  ]
  for (const [path, expected] of comparisons) if (!readBoundedBytes(path).equals(Buffer.from(expected))) inventoryIssues.push(`${path}: generated bytes differ`)
  return { current: inventoryIssues.length === 0, inventoryIssues, atlas: rendered.atlas, receipts: inventoryIssues.length === 0 ? tripletReceipts() : [] }
}
