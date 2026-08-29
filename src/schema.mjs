import { canonicalJson } from './io.mjs'
import { identity, lanes, relationTypes } from './content.mjs'

const closed = (properties, extras = {}) => ({
  type: 'object',
  properties,
  required: Object.keys(properties),
  additionalProperties: false,
  unevaluatedProperties: false,
  ...extras,
})
const arrayOf = (items, minItems = 0, maxItems = 512, uniqueItems = false) => ({ type: 'array', items, minItems, maxItems, ...(uniqueItems ? { uniqueItems: true } : {}) })
const text = (maxLength = 8192) => ({ type: 'string', minLength: 1, maxLength })
const id = { type: 'string', minLength: 1, maxLength: 128, pattern: '^[a-z][a-z0-9_]*$' }
const bindingId = { type: 'string', minLength: 1, maxLength: 128, pattern: '^[a-z][A-Za-z0-9_]*$' }
const upperId = { type: 'string', minLength: 1, maxLength: 128, pattern: '^[A-Z][A-Z0-9_]*$' }
const lane = { type: 'string', enum: [...lanes] }
const falseValue = { type: 'boolean', const: false }
const trueValue = { type: 'boolean', const: true }
const stringSet = (maxItems = 256) => arrayOf(text(1024), 0, maxItems, true)
const idSet = (maxItems = 256) => arrayOf(id, 0, maxItems, true)
const nonemptyStringSet = (maxItems = 256) => arrayOf(text(1024), 1, maxItems, true)
const nonemptyIdSet = (maxItems = 256) => arrayOf(id, 1, maxItems, true)

const defs = {
  rational: closed({
    numerator: { type: 'integer', minimum: -1_000_000_000_000_000, maximum: 1_000_000_000_000_000 },
    denominator: { type: 'integer', minimum: 1, maximum: 1_000_000_000_000_000 },
  }),
  rationalBinding: closed({ id: bindingId, value: { $ref: '#/$defs/rational' } }),
  booleanBinding: closed({ id: bindingId, value: { type: 'boolean' } }),
  setBinding: closed({ id: bindingId, members: stringSet() }),
  labelBinding: closed({ id: bindingId, value: text(1024) }),
  bindings: closed({
    rationals: arrayOf({ $ref: '#/$defs/rationalBinding' }, 0, 64),
    booleans: arrayOf({ $ref: '#/$defs/booleanBinding' }, 0, 64),
    sets: arrayOf({ $ref: '#/$defs/setBinding' }, 0, 64),
    labels: arrayOf({ $ref: '#/$defs/labelBinding' }, 0, 64),
  }),
  term: closed({ id, lane, definition: text(), nonclaims: nonemptyStringSet(32) }),
  keyKind: closed({ id: upperId, lane, role: upperId, containsMaterial: falseValue, executable: falseValue }),
  lockKind: closed({ id: upperId, lane, kindClass: upperId, threatModel: text(4096), authoritySemantics: text(4096), containsMechanism: falseValue, executable: falseValue }),
  symbol: closed({ symbol: text(256), meaning: text(2048), units: upperId }),
  equationCard: closed({
    id,
    lane,
    equation: text(8192),
    linearReading: text(8192),
    symbols: arrayOf({ $ref: '#/$defs/symbol' }, 1, 32),
    assumptions: nonemptyStringSet(32),
    claimClass: upperId,
    computationStatus: upperId,
    fixtureIds: idSet(64),
    falsifierIds: nonemptyIdSet(64),
    nonclaims: nonemptyStringSet(32),
  }),
  syntheticFixture: closed({
    id,
    title: text(512),
    lane,
    kind: { type: 'string', enum: ['GOVERNANCE', 'MATHEMATICAL'] },
    ruleId: upperId,
    premises: nonemptyStringSet(32),
    inputs: { $ref: '#/$defs/bindings' },
    expected: { $ref: '#/$defs/bindings' },
    lesson: text(4096),
    falsifies: nonemptyIdSet(64),
    nonclaims: nonemptyStringSet(32),
    synthetic: trueValue,
    humanSubjects: falseValue,
    executableAction: falseValue,
  }),
  nonEquivalence: closed({
    id,
    fromTerm: upperId,
    fromLane: lane,
    toTerm: upperId,
    toLane: lane,
    relation: { type: 'string', const: 'NON_EQUIVALENT' },
    declaredAssumptions: nonemptyStringSet(32),
    informationLost: nonemptyStringSet(32),
    reason: text(4096),
    forbiddenInference: text(4096),
    fixtureIds: nonemptyIdSet(64),
  }),
  conversion: closed({
    id,
    fromLane: lane,
    toLane: lane,
    relation: { type: 'string', enum: [...relationTypes] },
    declaredAssumptions: nonemptyStringSet(32),
    informationLost: nonemptyStringSet(32),
    forbiddenInference: text(4096),
  }),
  freedomAxis: closed({ id: { type: 'string', enum: ['NEGATIVE_LIBERTY', 'POSITIVE_CAPABILITY', 'NON_DOMINATION', 'EXIT_REFUSAL'] }, observations: stringSet(32), unresolved: stringSet(32) }),
  freedomEnvelope: closed({
    id,
    timeLabel: upperId,
    declaredModel: text(4096),
    capableActions: stringSet(),
    permittedActions: stringSet(),
    consentedActions: stringSet(),
    safeActions: stringSet(),
    rightsCompatibleActions: stringSet(),
    accessibleActions: stringSet(),
    privacyCompatibleActions: stringSet(),
    reversibleActions: stringSet(),
    exitOptions: stringSet(),
    appealOptions: stringSet(),
    contestationOptions: stringSet(),
    recoveryOptions: stringSet(),
    returnOptions: stringSet(),
    nonDominationConditions: stringSet(),
    unknownConstraints: stringSet(),
    jointlyAdmissibleActionsUnderDeclaredModel: stringSet(),
    axes: arrayOf({ $ref: '#/$defs/freedomAxis' }, 4, 4),
    nonclaims: stringSet(32),
  }),
  declaredRight: closed({ id: upperId, scope: upperId, rule: text(4096), sourceClass: { type: 'string', const: 'PRODUCER_DECLARED_PHASE_0_CONSTRAINT' }, legalAuthority: falseValue, applicabilityToRealCaseDetermined: falseValue }),
  constitutionalAssertion: closed({ id, rule: text(4096), fixtureIds: idSet(64) }),
  kingdomOrientation: closed({
    id,
    repository: { type: 'string', const: 'cambridgetcg/KINGDOM-OS' },
    baseCommit: { type: 'string', const: '9b07ac26da03cac79709437aeea3f53b808321e1' },
    baseTree: { type: 'string', const: 'd99577d666551e605271ead5c49482213347c071' },
    repositoryPath: { type: 'string', minLength: 1, maxLength: 512, pattern: '^(?!/)(?!.*(?:^|/)\\.\\.(?:/|$)).+$' },
    bytes: { type: 'integer', minimum: 1, maximum: 10_000_000 },
    byteSha256: { type: 'string', pattern: '^sha256:[a-f0-9]{64}$' },
    hasDirectPublicRoute: { type: 'boolean' },
    publicRoute: { type: 'string', minLength: 1, maxLength: 512, pattern: '^(?:NONE|/[^?#]*)$' },
    orientationUse: text(4096),
    copiesContent: falseValue,
    importsAuthority: falseValue,
    establishesTruth: falseValue,
    runtimeDependency: falseValue,
  }),
  sourceTarget: closed({ kind: { type: 'string', enum: ['CONSTITUTIONAL_BOUNDARIES', 'EQUATION_CARD', 'SYNTHETIC_FIXTURE'] }, id }),
  sourceBinding: closed({
    id,
    authors: nonemptyStringSet(32),
    publicationDate: { type: 'string', minLength: 4, maxLength: 10, pattern: '^\\d{4}(?:-\\d{2}(?:-\\d{2})?)?$' },
    title: text(1024),
    venueOrOriginalPublisher: text(1024),
    host: text(1024),
    url: { type: 'string', minLength: 9, maxLength: 2048, pattern: '^https://[^\\s]+$' },
    sourceKind: upperId,
    versionScope: text(4096),
    rightsOrReuseStatus: upperId,
    appliesTo: arrayOf({ $ref: '#/$defs/sourceTarget' }, 1, 32),
    orientation: text(4096),
    caveat: text(4096),
    use: { type: 'string', const: 'LINK_ONLY_ORIENTATION' },
    copiesContent: falseValue,
    importsAuthority: falseValue,
    establishesTruth: falseValue,
    establishesCurrentness: falseValue,
    establishesCompliance: falseValue,
    endorsementClaimed: falseValue,
  }),
  sourceReceipt: closed({ path: { type: 'string', pattern: '^(?!/)(?!.*(?:^|/)\\.\\.(?:/|$)).+$', maxLength: 512 }, bytes: { type: 'integer', minimum: 1, maximum: 10_000_000 }, byteSha256: { type: 'string', pattern: '^sha256:[a-f0-9]{64}$' } }),
  publicRoute: closed({
    route: { type: 'string', minLength: 2, maxLength: 512, pattern: '^/[^?#]+$' },
    absoluteUrl: { type: 'string', minLength: 9, maxLength: 2048, pattern: '^https://thekingdom\\.dev/[^?#]+$' },
    mimeType: { type: 'string', enum: ['application/json; charset=utf-8', 'text/markdown; charset=utf-8'] },
    role: { type: 'string', enum: ['ACCESSIBLE_LINEAR_GUIDE', 'CANONICAL_RECORD', 'CLOSED_SCHEMA'] },
    immutable: trueValue,
  }),
}

export const publicSchema = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  $id: identity.schemaId,
  title: identity.title,
  description: 'Closed schema for one immutable static-synthetic Phase-0 relations atlas. Every object is recursively closed.',
  ...closed({
    $schema: { type: 'string', const: identity.schemaId },
    protocol: { type: 'string', const: identity.protocol },
    artifact: closed({
      id: { type: 'string', const: identity.artifactId },
      title: { type: 'string', const: identity.title },
      asOf: { type: 'string', const: identity.asOf },
      lifecyclePhase: { type: 'string', enum: ['DRAFT_SYNTHETIC', 'REVIEWED_DESIGN_ONLY', 'FROZEN_STATIC_FIXTURE', 'RETIRED'] },
      releaseState: { type: 'string', enum: ['PRE_FREEZE_REVIEW_CANDIDATE', 'FROZEN_FOR_IMMUTABLE_HANDOFF', 'RETIRED'] },
      immutableCandidate: trueValue,
      synthetic: trueValue,
      authorship: closed({
        humanDirected: trueValue,
        modelAssisted: trueValue,
        assistanceDisclosure: text(4096),
        independentModelReviewCompleted: { type: 'boolean' },
        humanReviewCompleted: falseValue,
        userPublicationPermissionRecorded: trueValue,
        releaseGateSatisfied: { type: 'boolean' },
      }),
    }),
    scope: closed({
      staticArtifact: trueValue,
      syntheticOnly: trueValue,
      realPeople: falseValue,
      personalData: falseValue,
      liveObservation: falseValue,
      liveOptimization: falseValue,
      runtimeAgent: falseValue,
      rewardRuntime: falseValue,
      controlActuation: falseValue,
      privateKeys: falseValue,
      credentials: falseValue,
      keyGeneration: falseValue,
      authenticationAdapter: falseValue,
      authorizationAdapter: falseValue,
      enforcementAdapter: falseValue,
      accessDecision: falseValue,
      policyDeployment: falseValue,
      automaticAction: falseValue,
      recommendation: falseValue,
      punishmentRecommendation: falseValue,
      censorship: falseValue,
      humanTraining: falseValue,
      behavioralDiagnosis: falseValue,
      intentInference: falseValue,
      consciousnessInference: falseValue,
      personScore: falseValue,
      communityScore: falseValue,
      freedomScore: falseValue,
      moralScore: falseValue,
      alignmentScore: falseValue,
      reinforcementScore: falseValue,
      lockStrengthScore: falseValue,
      unconstrainedAction: falseValue,
      network: falseValue,
      mcp: falseValue,
    }),
    vocabularies: closed({
      lanes: arrayOf(lane, lanes.length, lanes.length, true),
      relationTypes: arrayOf({ type: 'string', enum: [...relationTypes] }, relationTypes.length, relationTypes.length, true),
      terms: arrayOf({ $ref: '#/$defs/term' }, 1, 128),
      keyAndAuthenticatorKinds: arrayOf({ $ref: '#/$defs/keyKind' }, 4, 16),
      lockKinds: arrayOf({ $ref: '#/$defs/lockKind' }, 6, 16),
      behavioralContingencyQuadrants: arrayOf(closed({ operation: { type: 'string', enum: ['ADD', 'REMOVE'] }, responseDirection: { type: 'string', enum: ['DECREASE', 'INCREASE'] }, classification: { type: 'string', enum: ['NEGATIVE_PUNISHMENT', 'NEGATIVE_REINFORCEMENT', 'POSITIVE_PUNISHMENT', 'POSITIVE_REINFORCEMENT'] } }), 4, 4),
      unresolvedBehavioralClassification: { type: 'string', const: 'UNCLASSIFIED' },
    }),
    equationCards: arrayOf({ $ref: '#/$defs/equationCard' }, 1, 128),
    syntheticFixtures: arrayOf({ $ref: '#/$defs/syntheticFixture' }, 1, 256),
    nonEquivalences: arrayOf({ $ref: '#/$defs/nonEquivalence' }, 1, 256),
    conversionRegister: arrayOf({ $ref: '#/$defs/conversion' }, 1, 128),
    freedomRelevantEnvelopes: arrayOf({ $ref: '#/$defs/freedomEnvelope' }, 1, 32),
    constitutionalBoundaries: closed({
      freedomFoundation: closed({ definition: text(8192), status: upperId, independentAxes: arrayOf({ type: 'string', enum: ['NEGATIVE_LIBERTY', 'POSITIVE_CAPABILITY', 'NON_DOMINATION', 'EXIT_REFUSAL'] }, 4, 4, true), principles: stringSet(64) }),
      precedence: arrayOf(upperId, 5, 5, true),
      nonCompensableFloors: arrayOf(upperId, 1, 64, true),
      declaredRightsRegister: arrayOf({ $ref: '#/$defs/declaredRight' }, 1, 32),
      lifecycle: closed({ allowed: arrayOf({ type: 'string', enum: ['DRAFT_SYNTHETIC', 'REVIEWED_DESIGN_ONLY', 'FROZEN_STATIC_FIXTURE', 'RETIRED'] }, 4, 4, true), current: { type: 'string', enum: ['DRAFT_SYNTHETIC', 'REVIEWED_DESIGN_ONLY', 'FROZEN_STATIC_FIXTURE', 'RETIRED'] }, activeRuntimeAllowed: falseValue }),
      forbiddenCapabilities: arrayOf(upperId, 1, 128, true),
      forbiddenFieldNames: arrayOf(text(128), 1, 128, true),
      assertions: arrayOf({ $ref: '#/$defs/constitutionalAssertion' }, 1, 64),
    }),
    kingdomSemanticOrientations: arrayOf({ $ref: '#/$defs/kingdomOrientation' }, 1, 32),
    sourceBindings: arrayOf({ $ref: '#/$defs/sourceBinding' }, 1, 64),
    counts: closed({
      lanes: { type: 'integer', minimum: 1 },
      terms: { type: 'integer', minimum: 1 },
      lockKinds: { type: 'integer', minimum: 1 },
      equationCards: { type: 'integer', minimum: 1 },
      syntheticFixtures: { type: 'integer', minimum: 1 },
      mathematicalFixtures: { type: 'integer', minimum: 1 },
      governanceFixtures: { type: 'integer', minimum: 1 },
      nonEquivalences: { type: 'integer', minimum: 1 },
      conversions: { type: 'integer', minimum: 1 },
      freedomRelevantEnvelopes: { type: 'integer', minimum: 1 },
      sourceBindings: { type: 'integer', minimum: 1 },
      kingdomSemanticOrientations: { type: 'integer', minimum: 1 },
    }),
    buildReceipt: closed({
      semanticPayloadSha256: { type: 'string', pattern: '^sha256:[a-f0-9]{64}$' },
      verifierState: { type: 'string', const: 'ALL_STATIC_SYNTHETIC_FIXTURES_RECOMPUTED' },
      verifiedFixtureCount: { type: 'integer', minimum: 1 },
      arithmetic: { type: 'string', const: 'EXACT_BOUNDED_BIGINT_RATIONAL_AND_FINITE_SYMBOLIC_RULES' },
      clockRead: falseValue,
      networkUsed: falseValue,
      externalInputUsed: falseValue,
      generatorInputReceipts: arrayOf({ $ref: '#/$defs/sourceReceipt' }, 1, 32),
    }),
    publicHandoff: closed({
      routes: arrayOf({ $ref: '#/$defs/publicRoute' }, 3, 3),
      mutableAlias: falseValue,
      page: falseValue,
      runtime: falseValue,
      publicationAuthorized: { type: 'boolean' },
      reviewGate: { type: 'string', const: 'INDEPENDENT_MODEL_GREEN_AND_RELEASE_OWNER_EXACT_BYTE_CONFIRMATION' },
      currentState: { type: 'string', enum: ['PRE_FREEZE_REVIEW_CANDIDATE', 'FROZEN_FOR_IMMUTABLE_HANDOFF', 'RETIRED'] },
    }),
  }),
  $defs: defs,
}

function pointer(root, fragment) {
  if (!fragment.startsWith('#/')) throw new Error(`unsupported schema reference ${fragment}`)
  let current = root
  for (const raw of fragment.slice(2).split('/')) {
    const token = raw.replaceAll('~1', '/').replaceAll('~0', '~')
    if (current === null || typeof current !== 'object' || !Object.hasOwn(current, token)) throw new Error(`unresolved schema reference ${fragment}`)
    current = current[token]
  }
  return current
}

function typeMatches(value, type) {
  if (type === 'object') return value !== null && typeof value === 'object' && !Array.isArray(value)
  if (type === 'array') return Array.isArray(value)
  if (type === 'integer') return Number.isSafeInteger(value)
  if (type === 'boolean' || type === 'string') return typeof value === type
  return false
}

function validateNode(value, schema, root, path, depth = 0) {
  if (depth > 128) return [`${path}: schema depth exceeded`]
  if (schema.$ref !== undefined) return validateNode(value, pointer(root, schema.$ref), root, path, depth + 1)
  const issues = []
  if (schema.type !== undefined && !typeMatches(value, schema.type)) return [`${path}: expected ${schema.type}`]
  if (Object.hasOwn(schema, 'const') && canonicalJson(value) !== canonicalJson(schema.const)) issues.push(`${path}: value differs from constant`)
  if (schema.enum !== undefined && !schema.enum.some((candidate) => canonicalJson(candidate) === canonicalJson(value))) issues.push(`${path}: value outside enum`)
  if (typeof value === 'string') {
    const length = [...value].length
    if (schema.minLength !== undefined && length < schema.minLength) issues.push(`${path}: string shorter than ${schema.minLength}`)
    if (schema.maxLength !== undefined && length > schema.maxLength) issues.push(`${path}: string longer than ${schema.maxLength}`)
    if (schema.pattern !== undefined && !new RegExp(schema.pattern, 'u').test(value)) issues.push(`${path}: string does not match pattern`)
  }
  if (Number.isSafeInteger(value)) {
    if (schema.minimum !== undefined && value < schema.minimum) issues.push(`${path}: integer below minimum`)
    if (schema.maximum !== undefined && value > schema.maximum) issues.push(`${path}: integer above maximum`)
  }
  if (Array.isArray(value)) {
    if (schema.minItems !== undefined && value.length < schema.minItems) issues.push(`${path}: array shorter than ${schema.minItems}`)
    if (schema.maxItems !== undefined && value.length > schema.maxItems) issues.push(`${path}: array longer than ${schema.maxItems}`)
    if (schema.uniqueItems && new Set(value.map(canonicalJson)).size !== value.length) issues.push(`${path}: array items not unique`)
    value.forEach((entry, index) => issues.push(...validateNode(entry, schema.items, root, `${path}/${index}`, depth + 1)))
  }
  if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
    const properties = schema.properties ?? {}
    for (const key of schema.required ?? []) if (!Object.hasOwn(value, key)) issues.push(`${path}/${key}: required property missing`)
    for (const [key, entry] of Object.entries(value)) {
      if (!Object.hasOwn(properties, key)) {
        if (schema.additionalProperties === false || schema.unevaluatedProperties === false) issues.push(`${path}/${key}: undeclared property`)
      } else issues.push(...validateNode(entry, properties[key], root, `${path}/${key}`, depth + 1))
    }
  }
  return issues
}

export function validateRecord(value) {
  return validateNode(value, publicSchema, publicSchema, '$').sort()
}

const supportedKeywords = new Set(['$defs', '$id', '$ref', '$schema', 'additionalProperties', 'const', 'description', 'enum', 'items', 'maxItems', 'maxLength', 'maximum', 'minItems', 'minLength', 'minimum', 'pattern', 'properties', 'required', 'title', 'type', 'unevaluatedProperties', 'uniqueItems'])

function inspectSchema(node, path, root, issues) {
  if (node === null || typeof node !== 'object' || Array.isArray(node)) { issues.push(`${path}: schema node is not object`); return }
  for (const key of Object.keys(node)) if (!supportedKeywords.has(key)) issues.push(`${path}/${key}: unsupported keyword`)
  if (node.$ref !== undefined) {
    if (typeof node.$ref !== 'string' || Object.keys(node).length !== 1) issues.push(`${path}: $ref must be sole string keyword`)
    else try { pointer(root, node.$ref) } catch (error) { issues.push(`${path}: ${error.message}`) }
    return
  }
  if (node.type === 'object') {
    if (node.additionalProperties !== false || node.unevaluatedProperties !== false) issues.push(`${path}: object must set both closure keywords false`)
    if (node.properties === null || typeof node.properties !== 'object' || Array.isArray(node.properties)) issues.push(`${path}: properties map missing`)
    if (!Array.isArray(node.required) || canonicalJson([...node.required].sort()) !== canonicalJson(Object.keys(node.properties ?? {}).sort())) issues.push(`${path}: every property must be required exactly once`)
  }
  if (node.type === 'array' && (node.items === null || typeof node.items !== 'object' || Array.isArray(node.items))) issues.push(`${path}: array items schema missing`)
  if (node.pattern !== undefined) try { new RegExp(node.pattern, 'u') } catch { issues.push(`${path}: invalid regex`) }
  for (const [key, child] of Object.entries(node.properties ?? {})) inspectSchema(child, `${path}/properties/${key}`, root, issues)
  for (const [key, child] of Object.entries(node.$defs ?? {})) inspectSchema(child, `${path}/$defs/${key}`, root, issues)
  if (node.items !== undefined) inspectSchema(node.items, `${path}/items`, root, issues)
}

export function schemaIssues(schema = publicSchema) {
  const issues = []
  if (schema.$schema !== 'https://json-schema.org/draft/2020-12/schema') issues.push('wrong JSON Schema dialect')
  if (schema.$id !== identity.schemaId) issues.push('wrong schema id')
  inspectSchema(schema, '$', schema, issues)
  return [...new Set(issues)].sort()
}
