# SDD-LIET Improvements Review

Generated on: 2026-04-15

## Purpose

This document reviews `examples/` as the reliable reference for orchestration, delegation, sub-agents, and token economics, then contrasts that reference with the current `sdd-lite` design.

The goal is to identify how `sdd-lite` can become:

- more context-efficient
- more delegation-first
- more reliable when using sub-agents for stage execution
- less dependent on large runtime prompt stacks
- easier to resume after compaction or long-running work

## Sources Reviewed

Reference sources from `examples/`:

- `examples/orchestrator-skills-deep-dive.md`
- `examples/token-economics.md`
- `examples/sub-agents.md`
- `examples/concepts.md`

Current `sdd-lite` sources:

- `sdd/sdd-lite/README.md`
- `sdd/sdd-lite/orchestrator/SDDL-ORCHESTRATOR.md`
- `sdd/sdd-lite/skills/_shared/*.md`
- `sdd/sdd-lite/skills/sddl-*/SKILL.md`
- `sdd/sdd-lite/templates/bootstrap/*`
- `sdd/sdd-lite/templates/artifacts/*`
- `sdd/sdd-lite/templates/wrappers/*`
- `sdd/sdd-lite/schemas/*.yaml`

## Executive Summary

`examples/` describes a very specific runtime model:

- the orchestrator is a thin event loop
- deep work is delegated to fresh-context sub-agents
- the orchestrator passes compact rules and artifact references, not large bodies
- sub-agents execute phases, not orchestration
- fixed prompt overhead matters, so repeated multi-hop document loading is a real cost

Current `sdd-lite` already has strong foundations:

- mandatory bootstrap
- persisted runtime state
- explicit approvals
- stage ownership
- resumable artifacts
- a bounded lite lifecycle

The main issue is not lifecycle safety. The main issue is runtime shape.

Today `sdd-lite` is still too documentation-heavy and too orchestration-heavy for the model described in `examples/`. The orchestrator is documented as a router with broad reading responsibilities, while the stage skills still depend on multiple shared documents at runtime. That makes each delegated stage more expensive than it should be and weakens the "thin orchestrator + fresh worker" pattern.

The recommended direction is:

1. keep the current lite lifecycle
2. redesign runtime behavior around a thin orchestrator
3. make stage execution explicitly sub-agent-first
4. replace repeated contract discovery with injected compact rules
5. reduce multi-hop runtime documentation
6. add artifact budgets and summary/digest fields

Do not fully converge `sdd-lite` to `sdd-v2` unless the product goal changes. The better path is a lighter orchestration redesign, not a heavier phase graph.

## What The Reference Docs Establish

The reviewed `examples/` material establishes these rules as the reliable baseline:

1. The orchestrator should coordinate, not execute.
   It should behave like a small event loop and dependency manager.

2. Context growth is the main enemy.
   The system should delegate when work would inflate context unnecessarily.

3. Delegation should be based on task shape, not intuition.
   The reference rules are explicit:
   - reading 1 to 3 files inline is acceptable
   - reading 4 or more files to understand a problem should be delegated
   - read-plus-write work should be delegated together
   - multi-file logic changes should be delegated
   - tests, builds, and installs should be delegated

4. Phase skills are executor contracts.
   A phase agent should do the phase itself and should not become a second orchestrator.

5. Fresh-context sub-agents need compact standards injection.
   The orchestrator should resolve skills and project conventions once, then pass short "Project Standards" rules into each delegation.

6. Artifact references are better than artifact bodies.
   The orchestrator should pass paths, keys, and short summaries instead of large artifact content.

7. Structured result envelopes are mandatory.
   The orchestrator should be able to decide the next step without reading a full artifact body inline.

8. Token overhead is a first-class design constraint.
   Large orchestrator docs, repeated shared-contract reads, and verbose artifacts directly reduce the benefit of delegation.

9. Host wrappers matter.
   The runtime behavior must be expressed in the host-specific wrapper or agent prompt, not only in deep documentation.

## What `sdd-lite` Already Does Well

These current `sdd-lite` traits should be preserved:

- bootstrap is mandatory before change routing
- runtime state lives under `./sdd-lite/`
- persisted artifacts are English-only
- approvals are explicit
- execution is stage-scoped
- `sddl-deep-explorer` is read-only
- final completion is restricted to QA final mode
- resume is anchored in `state.yaml` and owned artifacts

This is a good safety baseline. The redesign should keep these properties.

## Main Gaps Against The Reference Model

| Area | Reference model | Current `sdd-lite` | Impact |
|---|---|---|---|
| Orchestrator role | Thin coordinator | Broad router with many reads and decisions | Orchestrator context grows too easily |
| Delegation rules | Explicit thresholds and triggers | No strong runtime delegation policy | Delegation is optional instead of structural |
| Standards resolution | Skill registry + compact rules injection | `skill-catalog.md` is descriptive, not a real registry | Sub-agents must rediscover rules |
| Shared contracts | Critical rules inlined in stage prompts | Stage skills point to multiple shared docs | Multi-hop runtime reads increase cost and fragility |
| Artifact transfer | References plus short summaries | Mostly path-based, but no digest/budget protocol | Resume is workable but still heavier than needed |
| Result envelope | Includes routing-friendly metadata | Lite result contract is smaller and lacks delegation metadata | Harder to detect compaction or standards-loss issues |
| Support agents | Real sub-agent topology | Support agents are only logical notes in `skill-catalog.md` | The design suggests workers, but does not operationalize them |
| Host wrappers | Explain how to delegate in each host | Wrappers mostly point to the canonical docs | Host runtime behavior is underspecified |
| Token economics | Measured and optimized | No explicit prompt-budget discipline | Runtime docs can dominate delegated work |
| Compaction recovery | Registry re-resolution and artifact references | Resume is good, but standards/cache recovery is not modeled | More re-reading after long work |
| Model routing | Per-agent model selection is supported | No lite-level routing model in config/schema | Cannot tune cheap vs expensive workers cleanly |

## Prompt Weight And Token Cost Observations

Using the same rough estimation method described in `examples/token-economics.md` (`bytes / 3.5 chars per token`):

| Runtime document | Bytes | Approx. tokens |
|---|---:|---:|
| `orchestrator/SDDL-ORCHESTRATOR.md` | 18,238 | ~5,211 |
| `README.md` | 12,242 | ~3,498 |
| `skills/sddl-executor/SKILL.md` | 9,048 | ~2,585 |
| `skills/sddl-qa-review/SKILL.md` | 10,286 | ~2,939 |
| shared contracts + `skill-catalog` total | 16,156 | ~4,616 |

Practical implication:

- an `sddl-executor` sub-agent that loads its own skill, the orchestrator doc, the shared contracts, and `skill-catalog.md` can consume roughly `~12.4k` tokens before reading any repo files, artifacts, or test outputs
- an `sddl-qa-review` sub-agent can consume roughly `~12.1k` tokens before repo-specific validation begins

This matches the warning from `examples/token-economics.md`: delegation only wins when the launch stack stays compact. The current `sdd-lite` launch stack is too expensive for a "thin orchestrator" story.

## Root Cause Diagnosis

The central mismatch is this:

- `examples/` assumes runtime instructions are small, pre-resolved, and delegation-oriented
- `sdd-lite` currently assumes runtime instructions can be recovered by reading several docs during execution

That makes `sdd-lite` safe, but not especially thin.

The biggest structural causes are:

1. `skill-catalog.md` is not a real skill registry.
   It lists skills and support agents, but it does not provide:
   - trigger mapping
   - compact rules by skill
   - project conventions digest
   - delegation-ready standards blocks

2. Stage skills still depend on multi-hop contract reading.
   Several stage skills tell the agent to follow shared contracts plus the orchestrator doc. This is a human-friendly structure, but it is expensive at runtime.

3. The orchestrator is defined as a broad reader.
   It is allowed to load bootstrap, state, artifacts, maintained docs, executable config, and user clarification. That is safe, but it is not the same as "keep its own context small."

4. Host wrappers are too thin.
   They activate `sdd-lite`, but they do not define explicit sub-agent launch behavior, delegation thresholds, or compact prompt assembly rules.

5. Artifacts do not have strong size budgets.
   The templates are already compact in shape, but there is no enforced word budget or digest convention that keeps downstream stages cheap.

## Recommended Target Runtime Architecture

The recommended target is:

```text
orchestrator = thin event loop
  reads:
    - config.yaml
    - state.yaml
    - standards registry summary
    - artifact summaries or references
  delegates:
    - deep analysis
    - proposal/spec writing
    - design planning
    - execution
    - QA
  never owns:
    - deep repo exploration
    - multi-file implementation
    - heavy tests/builds/installs
```

Recommended flow:

```text
preflight
  -> sddl-init if bootstrap is missing or stale in a material way
  -> load standards registry once
  -> if routing needs >3 repo files: delegate sddl-deep-explorer
  -> delegate sddl-proposal-spec
  -> delegate sddl-design-plan
  -> delegate sddl-executor one approved stage at a time
  -> delegate sddl-qa-review in stage or final mode
```

Recommended orchestration rule:

- the orchestrator should only inspect source files directly when the answer is available from 1 to 3 files and the decision is local
- otherwise it should delegate

Recommended stage boundary rule:

- stage skills execute
- they do not orchestrate other stages
- nested workers should be off by default
- nested workers may be allowed only as an explicit optional policy for very large approved execution or QA work

## Recommended Launch Envelope For Sub-Agents

Every delegated stage should receive a compact, predictable envelope like this:

```text
Stage: sddl-executor
Change: {change-name}
Objective: {objective}
Route: {route}
Approved Scope: {stage-id + files/modules}
Artifacts:
- state: ./sdd-lite/openspec/changes/{change-name}/state.yaml
- proposal-spec: ...
- design-plan: ...
- execution-log: ...

## Project Standards (auto-resolved)
- ...
- ...

Expected Output
- status
- executive_summary
- artifacts
- next_action
- open_risks
- context_resolution
```

The orchestrator should pass:

- artifact paths
- short artifact digests
- compact standards
- stage goal
- approved scope
- expected result schema

The orchestrator should not pass:

- the full README
- the full orchestrator doc
- multiple shared contracts by path
- long copied artifact bodies unless strictly necessary

## Priority Recommendations

### P0: Required For A Thin Orchestrator

1. Reframe the orchestrator as a thin event loop.
   It should default to reading only `config.yaml`, `state.yaml`, the standards registry, and artifact summaries.

2. Add explicit delegation thresholds to the orchestrator and wrappers.
   Adopt the reference heuristics:
   - inline: 1 to 3 files
   - delegate: 4 or more files
   - always delegate multi-file edits
   - always delegate tests, builds, and installs

3. Turn `skill-catalog.md` into a real runtime registry, or replace it with one.
   It should include:
   - discovered skills
   - triggers
   - compact rules
   - project conventions digest
   - support-agent mapping

4. Inline critical runtime rules inside each stage skill.
   Shared contracts can remain as human-maintained canonical docs, but runtime-critical instructions should not require multi-hop reads.

5. Add artifact budgets and digest sections.
   Each artifact should have:
   - a short top summary
   - a small list of decisions/risks
   - a word budget

6. Add delegation-aware result metadata.
   Recommended new fields:
   - `context_resolution`
   - `standards_source`
   - `artifact_digests_used`
   - `recommended_next_stage`

### P1: Strongly Recommended

1. Add delegation and model-routing settings to `config.yaml`.
2. Make support agents operational, not just conceptual.
3. Add compaction-loss recovery behavior.
4. Compress runtime docs and move human-only detail out of the hot path.
5. Add tests or fixtures for routing, handoff, and prompt-budget behavior.

### P2: Optional Or Strategic

1. Allow optional stage-bundle approval to reduce chat overhead on low-risk work.
2. Allow nested workers only under strict policy for `sddl-executor` or `sddl-qa-review`.
3. Add an optional explicit `sddl-explore` phase only if lite starts handling broader work classes.
4. Add archive or dual persistence only if lite intentionally grows toward `sdd-v2`.

## File-By-File Change Recommendations

| Surface | Recommended change | Why | Priority |
|---|---|---|---|
| `README.md` | Rewrite the mental model around "thin orchestrator + delegated stages" | Current README is safe but not delegation-first | P0 |
| `orchestrator/SDDL-ORCHESTRATOR.md` | Shrink and refocus around event-loop behavior, delegation thresholds, launch envelope, and artifact-reference rules | This is the main runtime contract and is currently too heavy | P0 |
| `templates/wrappers/codex-orchestrator.md` | Add explicit Codex sub-agent routing behavior and delegation thresholds | Current wrapper only activates the system | P0 |
| `templates/wrappers/claude-orchestrator.md` | Add explicit Claude delegation behavior with the same thin-context rules | Same gap as Codex wrapper | P0 |
| `templates/bootstrap/skill-catalog.md` | Convert into a real standards registry or dual-write a registry file | Current content is descriptive, not delegation-ready | P0 |
| `templates/bootstrap/project-context.md` | Add compact project conventions, risk zones, and "hot paths" for code lookup | Better injected context for workers | P1 |
| `templates/bootstrap/config.yaml` | Add `delegation` and optional `agents` sections | Needed for host-aware runtime configuration | P1 |
| `schemas/config.schema.yaml` | Validate delegation thresholds, registry path, and optional per-agent model settings | Keeps bootstrap and runtime aligned | P1 |
| `schemas/state.schema.yaml` | Add optional fields for `context_resolution`, `standards_version`, `artifact_digests`, and `delegation_notes` | Better recovery after long-running work or compaction | P1 |
| `skills/_shared/sddl-flow-contract.md` | Expand the common result contract and thin-orchestrator rules | Central place to standardize routing-friendly outputs | P0 |
| `skills/_shared/sddl-persistence-contract.md` | Add artifact digest policy, size budgets, and artifact reference rules | Needed to keep handoffs cheap | P0 |
| `skills/_shared/sddl-project-standards-contract.md` | Define compact standards injection protocol | Replaces repeated standards discovery | P0 |
| `skills/_shared/sddl-user-interaction-contract.md` | Add optional batch approval pattern and shorter approval envelope guidance | Reduces orchestration chat overhead | P2 |
| `skills/sddl-init/SKILL.md` | Generate the real registry, detect support-agent availability, and persist delegation settings | Bootstrap should prepare the thin orchestration model | P0 |
| `skills/sddl-proposal-spec/SKILL.md` | Inline critical rules, reduce external contract references, add result metadata and budget guidance | Cuts prompt overhead for the first planning stage | P0 |
| `skills/sddl-design-plan/SKILL.md` | Same as above, plus stronger stage-scope and digest output | Keeps planning precise and cheap | P0 |
| `skills/sddl-executor/SKILL.md` | Explicitly prohibit recursive orchestration by default, inline critical rules, require compact handoff output | Keeps execution worker-shaped | P0 |
| `skills/sddl-deep-explorer/SKILL.md` | Promote as the default path for bounded uncertainty and define stronger fact/inference/unknown output | This should be the main context-control valve | P0 |
| `skills/sddl-qa-review/SKILL.md` | Inline critical runtime rules, add tighter targeted-check behavior, and improve compact result reporting | QA launch stack is currently large | P0 |
| `templates/artifacts/proposal-spec.md` | Add summary budget and digest fields | Helps downstream stages read less | P0 |
| `templates/artifacts/design-plan.md` | Add summary budget, affected-path digest, and stage-summary digest | Makes execution handoff cheaper | P0 |
| `templates/artifacts/execution-log.md` | Add concise stage digest fields before long narrative details | Makes QA and resume cheaper | P1 |
| `templates/artifacts/qa-report.md` | Add compact verdict digest and unresolved-risk digest | Makes final routing cheaper | P1 |

## Recommended Registry Shape

If `skill-catalog.md` remains the file name for compatibility, its content should evolve toward this structure:

1. Metadata
2. Canonical lite skills
3. Support agents actually available in this host
4. Trigger map
5. Compact rules by skill
6. Compact project conventions
7. Delegation heuristics
8. Registry freshness metadata

Recommended minimum compact rules blocks:

- `execution`
- `testing`
- `review`
- `repo_conventions`
- `risk_zones`

That would let the orchestrator inject a short `## Project Standards (auto-resolved)` block without asking each sub-agent to rediscover local rules.

## Artifact Budget Recommendations

The reference docs strongly support explicit artifact size control. Recommended maximum sizes:

| Artifact | Recommended budget |
|---|---|
| `proposal-spec.md` | 300 to 500 words |
| `design-plan.md` | 500 to 800 words |
| one `execution-log` stage entry | 150 to 300 words plus tables |
| `qa-report.md` stage mode summary | 300 to 500 words |
| `qa-report.md` final summary | 500 to 800 words |

These are not strict product limits, but they are good runtime targets.

The important rule is:

- every artifact should start with a short digest that downstream phases can use without reading the entire body

## Recommended Delegation Rules For `sdd-lite`

These should be added explicitly to the orchestrator and wrappers:

1. Inline only local decisions that require at most 3 files.
2. Delegate bounded repo analysis to `sddl-deep-explorer` when routing or planning needs 4 or more files.
3. Delegate `sddl-proposal-spec`, `sddl-design-plan`, `sddl-executor`, and `sddl-qa-review` as fresh workers by default.
4. Never run tests, builds, installs, or broad verification inline in the orchestrator.
5. Do not delegate per file. Delegate per phase or per approved stage.
6. Prefer passing artifact paths and digests over artifact bodies.
7. Re-resolve standards from the registry after compaction or stale-cache detection.

## Recommended Changes To Stage Output

The current lite result structure is useful, but too small for delegation diagnostics.

Recommended additions:

- `context_resolution`
  - `injected_registry`
  - `fallback_registry`
  - `fallback_path`
  - `none`

- `standards_source`
  - registry version or file path

- `artifact_digests_used`
  - short list of digests or summary sections consulted

- `recommended_next_stage`
  - canonical stage id or stop condition

These additions would make the orchestrator more robust after long threads, compaction, or wrapper-level cache loss.

## Alternatives

### Option A: Compatibility-First Retrofit

Keep the current lite lifecycle and file names.

Change only:

- orchestrator runtime rules
- wrappers
- skill-catalog content
- stage skill prompt compaction
- artifact budgets

Pros:

- lowest migration risk
- minimal schema churn
- easiest rollout

Cons:

- terminology remains slightly mismatched
- `skill-catalog` becomes a registry in practice while keeping an older name

### Option B: Balanced Lite Redesign

Keep the lite lifecycle, but introduce a real registry and delegation-aware config/state extensions.

Change:

- thin orchestrator contract
- registry-backed standards injection
- explicit host routing
- config/schema support for delegation
- compact artifact digests

Pros:

- strongest alignment with `examples/`
- preserves lite identity
- better long-term base for Codex and Claude wrappers

Cons:

- moderate documentation and schema changes
- bootstrap outputs need a migration path

This is the recommended option.

### Option C: Full Convergence With The Reference Multi-Phase Model

Move closer to the broader `agent-teams-lite` shape by adding more explicit phases such as `explore`, `verify`, or archive-like behavior.

Pros:

- highest conceptual alignment with the reference docs
- cleaner mapping to a full SDD pipeline

Cons:

- increases lifecycle weight
- weakens `sdd-lite` differentiation
- more approvals, more artifacts, more surface area

This should only be chosen if the product goal is to make `sdd-lite` substantially less lite.

## Other Recommended Improvements

These are not all directly about the orchestrator, but they would improve the package:

1. Add a worked example change directory under `./sdd-lite/openspec/changes/`.
2. Add an automated consistency check across contracts, templates, schemas, and wrappers.
3. Add routing fixtures:
   - small bug fix
   - bounded feature
   - ambiguous request needing deep exploration
   - macro-plan-first case
   - escalate-to-sdd-v2 case
4. Add prompt-budget checks or at least documentation budgets for hot-path files.
5. Add wrapper-specific usage examples for Codex and Claude.
6. Add migration notes for older `skill-catalog.md` or state files if schemas change.
7. Add a "compaction recovery" walkthrough to the docs.

## Recommended Implementation Order

1. Rewrite the orchestrator contract and wrapper behavior first.
2. Convert `skill-catalog.md` into a usable registry or add a real registry file.
3. Inline critical rules inside stage skills and reduce multi-hop dependencies.
4. Add artifact digests and word budgets.
5. Extend config/state schemas for delegation-aware metadata.
6. Add fixtures, consistency checks, and worked examples.

## Final Recommendation

The best path is not to make the `sdd-lite` orchestrator smarter.

The best path is to make it smaller.

Specifically:

- keep bootstrap, approvals, state, and artifact ownership
- make the orchestrator a thin router with explicit delegation thresholds
- make every real phase run in a fresh sub-agent
- stop requiring stage workers to load several supporting docs at runtime
- inject compact standards once
- pass references and digests instead of large bodies

That would bring `sdd-lite` much closer to the proven model in `examples/` while preserving the package's current lite identity.
