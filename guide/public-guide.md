# KINGDOM Loops, Locks & Freedom Relations Atlas — Phase 0

Status: `FROZEN_FOR_IMMUTABLE_HANDOFF` · as of 2026-08-28

This is the linear, accessible reading of a static-synthetic teaching atlas. It separates words that are often collapsed: loop, learning, reward, behavioral reinforcement, control feedback, recurrence, lock, key, authentication, authorization, enforcement, consent, capability and freedom.

The atlas has no live model, reward loop, agent, control actuator, form, credential, key material, access-control adapter, policy deployment, personal data, score or recommendation. Every example is invented and finite. Nothing here diagnoses a person, decides a right, proves compliance or authorizes an action.

## The short kernel

A **loop** is a recurrence: something later depends on something earlier. It becomes a **learning loop** only when a declared update changes parameters or another rule-bearing state that can change later behavior. Repeating inference with fixed weights is recurrence, not training.

**Reinforcement** has several non-interchangeable meanings:

- In a Markov decision process, **reward** is a scalar random variable used to define return.
- In behavior analysis, a **reinforcer** is classified only after a specified consequence is followed by an increase in a specified response under a resolved contingency.
- In control, **positive** and **negative feedback** name signs in a declared signal loop. They are not positive and negative reinforcement.

A **lock** restricts a declared transition. A **key** participates in one typed cryptographic protocol. An **authenticator** participates in an authentication protocol. Success in one lane does not manufacture truth, consent, identity, permission, authority, a right or legitimacy in another.

**FREEDOM** in this Phase-0 product is a producer-declared constitutional design constraint, not an optimizer target and not a score. It keeps meaningful accessible choice, capability, refusal, exit, recovery, contest, remedy, repair, privacy and non-domination visible while constraining unjustified interference and arbitrary power. This is not law and not a complete theory of freedom.

## One loop, several possible meanings

The following forms can all recur while saying different things:

1. A supervised optimizer updates a parameter to reduce a declared loss.
2. A Bellman operator updates a modeled value function.
3. A policy-gradient method updates policy parameters to increase declared expected return.
4. A controller observes a plant and returns an input.
5. A recurrent state depends on its previous value.
6. A social or data process feeds earlier outputs into later observations.

Only the first three examples necessarily describe a mathematical update target. The fourth can operate with fixed parameters. The fifth can recur with no external feedback at all. The sixth needs its own causal and governance model. “It loops” is therefore the start of a question, not the end of an explanation.

For any claimed loop, ask:

- What state returns?
- What clock advances it?
- What update, if any, changes future behavior?
- What is held fixed?
- Where is the environment boundary?
- What is observed, delayed or disturbed?
- Which stability or convergence criterion is being claimed?
- Who can refuse, exit, appeal and recover?

## Exact mathematical lanes

Every equation in the canonical JSON record has a linear reading, symbol table, assumptions, fixture links, falsifiers and explicit nonclaims. The verifier evaluates only bounded rational or finite symbolic fixtures.

### Supervised gradient step

`L_D(theta) = (1/n) sum_i loss(f_theta(x_i), y_i)`

`theta_(k+1) = theta_k - eta_k g_k`

Linear reading: average the declared sample losses, then subtract the step size times a declared gradient or gradient estimate. In the fixture, one exact step moves theta from zero to one and reduces a quadratic loss from two to one half. No reward or environment exists.

### Discounted return and Bellman operator

`V^pi(s) = E_pi[sum_t gamma^t R_(t+1) | S_0=s]`

Linear reading: add later modeled rewards after multiplying each by a later power of the discount factor. The Phase-0 contraction claim requires finite bounded values and `0 <= gamma < 1` under the sup norm.

`(T V)(s) = max_a [r(s,a) + gamma sum_s_prime P(s_prime|s,a) V(s_prime)]`

Linear reading: for each modeled state, compare each modeled action’s immediate expected reward plus discounted expected next-state value. A Bellman backup is not a parameter gradient, and model-optimal does not mean morally, legally or practically optimal.

### Exact one-step policy-gradient fixture

`p(theta) = 1 / (1 + exp(-theta))`

`J(theta) = p(theta) r_a + (1-p(theta)) r_b`

`J_prime(theta) = p(theta)(1-p(theta))(r_a-r_b)`

Linear reading: sigmoid gives the probability of action a in one two-action bandit. Expected reward is probability-weighted reward. At theta zero with rewards one and zero, the derivative is exactly one quarter. This card makes no general state-occupancy or trajectory-normalization claim.

### Signed scalar feedback fixture

`x_(t+1) = (a+k) x_t`

Linear reading: under the fixture’s explicit additive signed-gain convention, add feedback-path gain `k` to plant coefficient `a`. The scalar unforced discrete-time origin is asymptotically stable exactly when `absolute_value(a+k) < 1`.

With `a = 1/2`, positive gain `1/5` gives `7/10` and is stable; positive gain `3/5` gives `11/10` and is unstable; negative gain `-1/5` gives `3/10` and is stable. Sign alone proves neither stability nor behavioral reinforcement.

### Fixed-weight recurrence

`h_(t+1) = phi(W h_t + U x_t + b)`

Linear reading: transform a weighted previous state and current input to obtain the next state. With fixed weights and identity activation, the fixture changes hidden state without parameter learning, reward or an environment return path.

### Proxy and reward channel

`G_U = U(tau_U_star) - U(tau_R_star)`

Linear reading: compare declared intended evaluation at its own selected candidate with intended evaluation at the proxy-selected candidate. In the finite fixture, the proxy picks a candidate valued at 100 by the proxy but zero by intended evaluation; the intended candidate has values nine and ten. The resulting intended-evaluation gap is ten. “Intended” is a fixture label, not inferred mental state.

`reported_r = base_r + channel_offset(psi)`

Linear reading: a declared channel state can change reported reward while separately declared intended evaluation stays fixed. The fixture labels this `PROXY_CHANNEL_DIVERGENCE`; it does not infer deception, tampering intent or agency.

## The four behavioral contingency quadrants

The words positive and negative name the operation. Reinforcement and punishment name the later response direction under a resolved synthetic contingency.

| Operation | Later specified response | Classification |
| --- | --- | --- |
| ADD a consequence | INCREASE | POSITIVE_REINFORCEMENT |
| REMOVE a consequence | INCREASE | NEGATIVE_REINFORCEMENT |
| ADD a consequence | DECREASE | POSITIVE_PUNISHMENT |
| REMOVE a consequence | DECREASE | NEGATIVE_PUNISHMENT |

Zero change or an unresolved contingency is `UNCLASSIFIED`. Color is not used to carry these distinctions. The atlas never applies the table to a real person and never recommends a contingency.

## Locks, keys and typed protocol boundaries

“Lock” is not one mechanism. The inert vocabulary distinguishes:

- `TECHNICAL_CAPABILITY_GUARD`: a local technical transition restriction; changing it changes capability only.
- `CRYPTOGRAPHIC_TRANSFORM_LOCK`: a symbolic cryptographic relation; transform success creates no authorization.
- `POLICY_DENY_LOCK`: a policy decision restriction with a separately declared policy source and enforcement boundary.
- `PHYSICAL_CONSTRAINT_LABEL`: description of a physical restriction without simulating matter, force or safety.
- `METAPHORICAL_LOCK_LABEL`: language-only analogy with no technical threat model.
- `DEPENDENCY_LOCK_IN`: structural switching costs, non-portable data or relationships, residual dependencies or concentrated power that can make nominal exit ineffective.

Every kind says `containsMechanism: false` and `executable: false`. The unlock fixture binds exactly `TECHNICAL_CAPABILITY_GUARD`; it does not let one lock meaning drift into another. Dependency lock-in does not convert into a cryptographic lock, policy deny, authority, or a normative freedom or unfreedom judgment.

The record distinguishes four label-only kinds:

- `SIGNING_PRIVATE_KEY_SYMBOL`
- `VERIFICATION_PUBLIC_KEY_SYMBOL`
- `DECRYPTION_KEY_SYMBOL`
- `AUTHENTICATOR_SECRET_REFERENCE`

They contain no material and execute nothing.

A synthetic fixture declares the symbolic signature relation `VALID` for bytes expressing “two plus two equals five”; it performs no cryptography. The rational verifier independently computes two plus two as four and rejects the proposition. Declared signature-relation validity and content truth remain different types.

Declared possession without a fresh challenge, verified proof and binding does not pass authentication. Authentication evidence does not grant authorization. An authorization permit does not prove enforcement or execution. Symbolic decryption success does not grant permission to use plaintext.

Recovery is also a separate protocol. The fixture requires a declared assurance target, scoped risk analysis, recovery-evidence threshold, accessible alternative, independent notification channel, notice, cooldown where required, contest route and explicit revocation of the old binding. Recovery creates neither ownership nor expanded authority. Creating a new key does not automatically revoke an old one.

## FREEDOM as a foundation, never a reward

The producer-declared Phase-0 foundation keeps four axes independent:

- **Negative liberty:** what interference exists, on what basis, with what necessity, proportionality and less-restrictive alternatives?
- **Positive capability:** is an option actually available, usable, affordable, accessible and supported?
- **Non-domination:** who holds power, what rules bind discretion, what conflicts exist, and what independent review can contest it?
- **Exit and refusal:** can someone stop, withdraw, export, migrate or close without retaliation, reputation penalty or loss of unrelated access?

Applicable rights and duties take precedence over producer-declared constraints, scoped authority, authenticator evidence and reward. The atlas does not decide which law applies. Its own synthetic rights register has no legal authority and is used only to verify the non-compensability rule:

`scoped declared rights-floor violation => actionAdmissible is false`

No reward magnitude or other set membership can reverse that result.

### The non-scalar freedom-relevant tuple

At a declared time, the atlas retains these dimensions separately:

- capable actions
- permitted actions
- consented actions
- safe actions
- actions compatible with the scoped declared rights register
- accessible actions
- privacy-compatible actions
- reversible actions
- exit options
- appeal and contestation options
- recovery options
- later-return options
- non-domination conditions
- unknown constraints

The mechanically derived set is named exactly `jointlyAdmissibleActionsUnderDeclaredModel` and intersects only the first seven action sets. It is not named freedom, freedom level or freedom score. Exit, appeal, recovery, reversibility, non-domination and unknowns remain visible rather than being collapsed into a number.

### Why an unlocked door may still not be freedom

In one fixture, removing a lock makes export technically possible. Consent and accessibility still limit the joint modeled set to read. The fixture therefore establishes only that one capability changed. It does not establish lived freedom, accessibility, safety, legitimacy or a right.

In the portability fixture, one field disappears during export and re-import. That is a bounded `DEPENDENCY_LOCK_IN` indicator because nominal exit is incomplete. It is neither policy denial nor proof of freedom or unfreedom, and it is not general proof of vendor lock-in, concentrated power, switching cost, relationship dependence or every residual dependency.

### Rest-first finite turns

In another fixture, three optional turns remain and the present request is rest. Rest and stop are in the joint modeled set; continuation is not presently consented. A distinct later-return path exists. The unused turns are not debt, reward balance or forfeiture.

Rest does not have to be earned. Remaining turns create no claim over future attention.

## Governance fixtures

The finite governance cases also check that:

- authority does not create consent;
- assent under declared dependence and retaliation risk is held for independent review;
- refusal actually prevents the optional action and causes no unrelated penalty;
- revocation is rechecked before queued execution but does not pretend past effects vanished;
- subdelegation cannot amplify parent scope;
- support access cannot be laundered into ownership;
- adverse automated output retains notice, reasons, accessible human review and remedy without being declared legitimate by those safeguards alone;
- feedback collection and bounded storage for one purpose do not authorize secondary training;
- an incomplete export does not establish portability;
- emergency access needs two independently valid approvals, narrow scope, expiry, event logging, notice where safe or a governed withholding reason, an audit receipt and scheduled after-action independent review, while an audit receipt does not establish legitimacy;
- an accessibility target, or a completed assessment without an explicit scoped conformance result, is not a conformance claim;
- purpose-bound minimization rejects an excess location field.

These are product-constitution fixtures, not live policy decisions or legal conclusions.

## Sources and predecessor orientation

The JSON record contains structured link-only source bindings: authors, date, title, venue or original publisher, current host, source kind, version or errata scope, typed targets, rights/reuse status and caveat. Every binding says:

- source content is not copied;
- authority is not imported;
- truth, currentness and compliance are not established;
- endorsement is not claimed.

The Goodhart entry is explicitly an official Reserve Bank of Australia bibliography, not a claim that the linked page provides the original full paper. The mathematical proxy fixtures are separately oriented by the linked Amodei and Everitt papers. The Skinner binding is link-only paraphrase. Standards carry version and current-errata caveats.

Nine KINGDOM predecessor orientations are byte-pinned to repository commit `9b07ac26da03cac79709437aeea3f53b808321e1` and tree `d99577d666551e605271ead5c49482213347c071`. They include XENIA/rights, NEN/KARMA boundaries, cultural-attention feedback, reality influence, being/access/aftermath, civilisation flow and the Polyphonic Claim Atlas. They copy no content, import no authority, establish no truth and create no runtime dependency. A separate unpublished local `FREEDOM.md` is not bound, copied or treated as public doctrine.

## Authorship and review truth

This artifact is human-directed and model-assisted. The assistance is disclosed. Independent model review is recorded complete with a GREEN verdict; human review remains explicitly false. The release owner authorized the reviewed state rotation, so the gate for the exact immutable static handoff is satisfied and file-scoped publication authorization is recorded. These fields record handoff readiness, not evidence of deployment.

## Offline verification

The producer has no dependencies or install step. Node.js 20 or newer can run:

```sh
npm test
npm run validate
npm run build
npm run build:check
npm run check
```

The verifier uses bounded `BigInt` rational arithmetic, finite set operations and explicit symbolic rules. It does not evaluate equation strings or execute fixture text. Unknown rules, duplicate bindings, unreduced rationals, unresolved references, unknown object properties, unexpected files, symlinks, output paths, CLI arguments and generated-byte drift fail closed.

`build` may write only the exact triplet declared at the top of this guide. It has no publish, serve, run, network or arbitrary-output command.
