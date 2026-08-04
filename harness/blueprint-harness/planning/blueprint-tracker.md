# Tracker: implementación `blueprint-harness`

> Estado vivo del macro plan (`blueprint-macro-plan.md`). Se actualiza al abrir/cerrar cada gate y al completar substeps.
> Última actualización: 2026-08-04.

## Protocolo por sección (obligatorio)

Cada sección pasa por 4 estados, en orden. **No se escriben cambios de una sección sin cerrar su gate de entrada.**

1. **`gate`** — Gate de entrada (revalidación): se releen los supuestos de la sección contra lo ya construido, se listan las definiciones pendientes (naming, formatos, umbrales, etc.) y se resuelven con el usuario. El resultado queda registrado en "Gate notes" de la sección.
2. **`in-progress`** — Implementación de los substeps.
3. **`validating`** — Se verifica el criterio de salida del macro plan + revisión del usuario.
4. **`done`** — Confirmado por el usuario. Recién ahí se abre el gate de la siguiente sección.

Estados adicionales: `pending` (no arrancó), `blocked` (impedimento registrado en notas).

## Estado global

| Sección | Estado | Gate cerrado | Substeps | Notas |
|---|---|---|---|---|
| S0 — Congelar la spec v1 | `done` | 2026-08-03 | 3/3 | Confirmada por el usuario 2026-08-03 |
| S1 — Fundaciones (schemas/contratos/templates) | `done` | 2026-08-03 | 5/5 | Confirmada por el usuario 2026-08-03 |
| S2 — Orquestador | `done` | 2026-08-03 | 7/7 | Confirmado por el usuario 2026-08-03 |
| S3 — Workers de análisis | `done` | 2026-08-03 | 4/4 | Confirmada por el usuario 2026-08-03 |
| S4 — Skills de síntesis | `done` | 2026-08-03 | 3/3 | Confirmada por el usuario 2026-08-03 |
| S5 — Ciclo de vida (init/handoff/wrappers) | `done` | 2026-08-03 | 3/3 | Confirmada por el usuario 2026-08-03 |
| S6 — Validación y cierre | `done` | 2026-08-03 | 4/5 | Cerrada 2026-08-03 (usuario avanzó a commit); 6.e queda como field-testing diferido del usuario |

---

## S0 — Congelar la spec v1

**Estado**: `done` (confirmada por el usuario 2026-08-03)

- [x] 0.1. `blueprint-spec.md` v1 con D1–D12 + 10 correcciones → `../blueprint-spec.md`
- [x] 0.2. Layout definitivo de motor y workspace → spec §2
- [x] 0.3. Marcar `blueprint-initial-idea.md` como superseded → banner agregado

**Gate notes** (cerrado 2026-08-03):
- Definiciones pendientes detectadas: (1) idioma de spec y motor; (2) ubicación de artefactos finales en el workspace; (3) ubicación de `blueprint-spec.md`.
- Resoluciones: (1) **todo en inglés** (spec + motor; chat sigue en español); (2) **categorías top-level** `ideas/`, `bugs/`, `audits/` para finales, `objectives/{slug}/` solo estado + intermedios; (3) spec en la **raíz del paquete** `blueprint-harness/blueprint-spec.md`.
- Nota de diseño registrada en la spec: el catálogo queda en **7 skills** (el interviewer deja de ser skill y pasa a protocolo del orquestador, por D1); naming de finales: `rfc-{slug}.md`, `bug-{slug}.md`, `audit-{slug}.md`.

---

## S1 — Fundaciones

**Estado**: `validating` (gate cerrado 2026-08-03; implementación completa; falta confirmación del usuario)

- [x] 1.1. `bp-config.schema.yaml` → `schemas/` (con `$id` + semver; semántica de rigor referenciada al flow contract)
- [x] 1.2. `bp-state.schema.yaml` → `schemas/` (transiciones de lifecycle documentadas en `$comment`)
- [x] 1.3. Contratos `_shared` (flow, persistence incl. `index.yaml`, findings, user-interaction) — **1.194 palabras** (budget ≤ 1.500 ✓)
- [x] 1.4. Templates: 3 intermedios + rfc/bug-report/audit + handoff-seed + bootstrap config (validada contra el schema ✓)
- [x] 1.5. `sdd-lite-mapping.md` → `skills/_shared/`

**Gate notes** (cerrado 2026-08-03):
- Definiciones pendientes detectadas: (1) semántica operativa de `rigor_level` (única decisión del usuario); (2) internas: estilo de schema, serialización del envelope, formato de digest, ownership de escritura.
- Resoluciones: (1) **3 niveles** light/standard/deep con tabla de umbrales (analyzer files/pasadas, alternativas, barra de evidencia, deep-interview) — vive como única fuente en `bp-flow-contract.md`; (2) schemas JSON Schema draft 2020-12 en YAML con `$id` + semver; envelope = un bloque YAML fenced al final de la respuesta del worker; digest = bloque fijo de 3–6 campos planos; ownership: orquestador escribe state/index/intermedios, `bp-doc-exporter` los finales, `bp-handoff` el seed, `bp-init` config/templates/wrappers.

---

## S2 — Orquestador

**Estado**: `validating` (gate cerrado 2026-08-03; implementación completa; falta confirmación del usuario)

- [x] 2.1. Session init (interactive/auto ask-once) + guardrails + delegación (tabla + 3 triggers + anti-patterns)
- [x] 2.2. Routing tables: común + F1/F2/F3, con escalation valve y scope_change
- [x] 2.3. Result Processing Protocol de 7 pasos — verificación de escritura como paso 1 para *todo* worker
- [x] 2.4. Entrevista inline (rúbrica de completitud por objetivo, máx 3 preguntas × 2 rondas, smart skip)
- [x] 2.5. Deep-interview (sesión paralela con contrato de cierre: formaliza en state, main resume solo desde state)
- [x] 2.6. Consolidación por cierre de fase (reemplaza purga por turnos)
- [x] 2.7. Rúbrica de complejidad: 3 dimensiones × 0-2 pts, bandas simple/standard/complex

**Gate notes** (cerrado 2026-08-03):
- Definiciones pendientes detectadas: (1) rúbrica cuantitativa de complejidad; (2) heredar o no el modo de sesión interactive/auto; (3) qué prompts/guards de `SDDL-ORCHESTRATOR.md` heredar (pedido explícito del usuario).
- Resoluciones: (1) **score de 3 dimensiones** (superficie, preguntas abiertas, concerns transversales; 0-6 pts, bandas 0-2/3-4/5-6) — la banda se registra como decisión en state; (2) **sí, interactive/auto** con pregunta única cacheada y frases de confirmación de sdd-lite; (3) heredados adaptados: Thin Runtime Model, Hot-Path Reads, tabla de delegación + 4-file/long-session/incident rules + anti-patterns, preflight de 4 estados, Result Processing, Resume/Stop/Guardrails por clase de efecto. NO heredados: Review Operations, Closeout/Accumulation (sin archive en MVP), Complexity Assessment cualitativa (reemplazada por la rúbrica), excepción de `git add` (blueprint no tiene ninguna mutación git).

---

## S3 — Workers de análisis

**Estado**: `validating` (gate cerrado 2026-08-03 sin decisiones de usuario; dry-runs completos; falta confirmación)

- [x] 3.1. `bp-context-mapper` (60 líneas; budget ≤ 6 archivos + listados/greps gratuitos)
- [x] 3.2. `bp-analyzer` (59 líneas; budget por fila de rigor; fact/inference/unknown con proof refs)
- [x] 3.3. `bp-diff-parser` (63 líneas; allowlist `git log/show/diff/status/blame`; freeze por SHA; ≤ 20 commits)
- [x] 3.4. Formato homogéneo aplicado: frontmatter name/description+triggers, Runtime operating rules (4 líneas referenciando contratos), Scope should/should-not, Budgets, Workflow, Expected output con degradación partial/blocked

**Gate notes** (cerrado 2026-08-03):
- Definiciones pendientes detectadas: ninguna del usuario (budgets ya congelados en flow contract; formato en macro plan; allowlist en guardrails). Internas: listados/greps no cuentan contra el budget de lecturas del mapper; digests de workspace tampoco; diff-parser reporta `target_frozen_at` y trata working tree sucio congelando en el último commit.
- Resoluciones de validación (dry-runs sobre este repo, con agentes read-only):
  - **mapper**: 1/6 archivos leídos, envelope completo, `artifacts: []`, no afirmó causa raíz (la marcó `inference` y delegó al analyzer) ✓
  - **analyzer**: 7/8 archivos, refutó la hipótesis de prueba con evidencia determinística (precision gate ✓), contenido de `analysis.md` listo para persistir ✓
  - **diff-parser**: SHAs congelados, 10/20 commits, solo comandos allowlisted, `partial` correcto con gaps declarados (tree sucio, `gh` no disponible) ✓
  - Los tres detectaron correctamente `context_resolution: fallback/injected` según qué inyectaba el envelope de prueba.
- Hallazgos colaterales sobre sdd-lite (fuera de alcance, para decisión futura): (1) **mismatch de marcadores en wrapper injection** — `sddl-init` busca el literal `<!-- sdd-lite:start -->` pero los templates emiten marcador con atributos → riesgo real de bloques duplicados en re-init (severidad alta); (2) árbol del `README.md` omite `templates/wrappers/` y `docs/`; (3) conviven dos skills de code-review (sdd-lite y generic-skills) sin precedencia documentada.

---

## S4 — Skills de síntesis

**Estado**: `validating` (gate cerrado 2026-08-03 sin decisiones de usuario; dry-run completo; falta confirmación)

- [x] 4.1. `bp-strategist` (read-only; alternativas por fila de rigor; máx 3 lecturas de verificación; detección de contradicciones con artefactos previos)
- [x] 4.2. `bp-doc-exporter` (único escritor de finales; modos `export` / `update-status` para el flip de status sin romper ownership; audits nacen `approved`)
- [x] 4.3. Cierre de F3: `audit_persist_offer` en routing del orquestador + modo audit del exporter

**Gate notes** (cerrado 2026-08-03):
- Definiciones pendientes detectadas: ninguna del usuario. Interna: quién flipea `draft → approved → handed-off` sin romper el ownership de finales → modo `update-status` del exporter, invocado solo por el orquestador tras el checkpoint correspondiente, que reescribe únicamente el digest.
- Resoluciones de validación (dry-run del exporter con fixtures de los 2 escenarios canónicos):
  - RFC `query-cache-layer`: 437 palabras (budget 400–800 ✓), 6/6 secciones desde fuentes, digest `draft` ✓
  - Bug report `google-login-500`: 372 palabras (budget 300–600 ✓), 5/5 secciones, clasificaciones fact/inference inline, "diagnosis only" respetado ✓
  - Escrituras: exactamente los 2 paths owned, `state_mutations` correctas, `recommended_next_step: artifact_approval` ✓
- **Gap detectado por el dry-run y corregido**: el campo `severity` del digest de bug-report no tenía fuente definida (el worker lo infirió y lo marcó). Fix aplicado en única fuente: el orquestador lo provee en el envelope de export desde el hallazgo confirmado de mayor severidad (`BP-ORCHESTRATOR.md` Worker Envelope + `bp-doc-exporter` Scope: "never infer it here").

---

## S5 — Ciclo de vida

**Estado**: `validating` (gate cerrado 2026-08-03; implementación + dry-run completos; falta confirmación)

- [x] 5.1. `bp-init` (VERSION como autoridad, update mode, reuso de identidad sdd-lite, defaults sin contexto, máx 2 preguntas, **nunca toca `.gitignore`**)
- [x] 5.2. Wrappers claude/agents (routing cross-harness, set de permisos documentado + oferta confirmada, modos de ejecución divergentes reales)
- [x] 5.3. `bp-handoff` (seed pasivo en inbox, born `handed-off`, `overwrite: true` explícito, blocked sin sdd-lite)
- ~~5.4. Patch en sdd-lite~~ — eliminado: blueprint no modifica sdd-lite; consumo del seed es manual

**Gate notes** (cerrado 2026-08-03):
- Decisiones del usuario: (1) permisos **ofrecidos con confirmación** (bp-init puede escribir settings solo con yes explícito; si no, documentado en wrapper); (2) skills **siempre por copy** (no symlink) a `.claude/`/`.agents/`, refrescadas en update; (3) **`bp-init` nunca toca `.gitignore`** — todo vive en las carpetas del harness y las copias; versionarlas es responsabilidad de cada usuario. Propagado a spec §2.2/§4 y persistence contract.
- Resoluciones de validación (dry-run en 2 repos falsos): **12/12 checks PASS** — instalación completa, config schema-valid con identidad reusada de sdd-lite sin preguntar, exactamente 1 par de marcadores, `.gitignore` intacto, re-init no-op byte a byte (md5 del árbol completo), update 0.0.9→0.1.0 preservando edits de usuario en templates, repo sin AI setups manejado como `partial` claro, seed de handoff 276 palabras como única escritura, handoff `blocked` sin sdd-lite sin crear nada.
- **13 gaps de redacción detectados por el dry-run y corregidos**: contradicción del worker boundary con skills que escriben (variante para writers en flow contract), orden de pasos vs creación de config, allowlist explícita de copia del motor, defaults de identidad sin sdd-lite, camino cero-AI-setups, consentimiento de wrapper en update mode, repair-run como no-op, timestamps de ai_setups en update, guía de envelope para éxito limpio, budget cuenta archivo completo (persistence contract), seed born `handed-off`, flag `overwrite: true`, prohibición de leer state.yaml en handoff.

---

## S6 — Validación y cierre (redefinida 2026-08-03)

**Estado**: `in-progress`

Redefinición del usuario: sin instalación ni ejecución en vivo ahora. Cierre = auditoría estática con contexto fresco + medición de tokens + README con guía de instalación/prueba manual. Los flujos F1/F2/F3 en vivo (ex 6.1–6.3) y la robustez (ex 6.5) quedan **diferidos al field-testing manual del usuario**, con checklist en el README.

- [x] 6.a. Auditoría de consistencia cruzada (agente fresco, 11 dimensiones) — **5 blockers, 13 should-fix, 7 cosméticos**; 11 dimensiones estructurales confirmadas consistentes (ids, checkpoints, budgets numéricos exactos, paths, digests, allowlist git, marker-prefix, ownership del seed)
- [x] 6.b. Medición estática de token budget (ex 6.4) — ver resultados abajo
- [x] 6.c. Fixes de la auditoría — **los 25 aplicados**: (blockers) rows de `update-status` en F1/F2/Común (draft→approved→handed-off ahora alcanzables), audit template born `approved` + trigger en persistence contract, allow-scope de setup paths en wrappers (re-init ya no se auto-bloquea), tabla de Lifecycle Transitions en el orquestador (los 7 estados con escritor); (should-fix) bp-init como writer skill verificado, `info` en enum de riesgos, light-vs-complex resuelto, handoff usa template user-owned, wrapper Claude sin contradicción Agent/Task, worker-mode integrado al ask único, `user_message` relay en Result Processing, `standards_source` eliminado de spec, rows abort/flow-switch/interview-incomplete, campos muertos de schema eliminados (`symlink`, `halt`, `project_context`, `notes`), trigger de `superseded`; (cosméticos) fase `none`, `<version>` placeholder, nota snake_case/hyphen, `git tag` en deny, update con oferta, `target_frozen_at` como prosa, `update-status` en catálogo de spec. Re-validado: schemas OK, contratos 1.275 palabras (≤1.500 ✓), orquestador 239 líneas.
- [x] 6.d. `README.md` + guía de instalación manual + checklist de field-testing (7 ítems)
- [ ] 6.e. (usuario, diferido) Field-testing real de F1/F2/F3 + robustez — checklist en README

**Resultados 6.b** (palabras; ×~1,35 ≈ tokens):
- Launch stack por worker: SKILL 411–512 palabras (≈550–690 tokens) + envelope ≈ **~1.000–1.200 tokens por worker** — ~10× menor que el baseline negativo de sdd-lite (~12,4k).
- Cold start del orquestador: 1.967 palabras ≈ ~2.700 tokens (+ config/index/state) vs ~9k de sdd-lite.
- Contratos (solo fallback): 1.241 palabras los 4 (budget ≤1.500 ✓; 1.487 con el mapping doc).
- `bp-init`: 773 palabras — el más pesado, aceptable por ser one-shot.

**Gate notes** (cerrado 2026-08-03):
- Definiciones pendientes detectadas: repo target y modo de checkpoints para e2e en vivo.
- Resolución del usuario: **no configurar ni probar ahora** — cierre estático + instalación manual propia; el e2e vivo lo hace el usuario usándolo de verdad.

---

## Registro de cambios al plan

| Fecha | Cambio | Motivo |
|---|---|---|
| 2026-08-03 | Plan creado; docs movidos a `planning/`; shape de `index.yaml` agregado a S1.3 | Revalidación inicial: `index.yaml` aparecía en el layout sin substep que lo definiera |
| 2026-08-03 | S0 ejecutada: spec v1 en `../blueprint-spec.md` (inglés), initial-idea marcado superseded | Gate S0: idioma EN, finales en categorías top-level, spec en raíz del paquete |
| 2026-08-03 | S0 confirmada (`done`). S1 ejecutada: schemas, 4 contratos (1.194 palabras), 8 templates, mapping doc | Gate S1: rigor de 3 niveles con tabla de umbrales |
| 2026-08-03 | S1 confirmada (`done`). S2 ejecutada: `orchestrator/BP-ORCHESTRATOR.md` basado en análisis del orquestador real de sdd-lite | Gate S2: rúbrica 3 dimensiones, modo interactive/auto heredado |
| 2026-08-03 | S2 confirmada (`done`). S3 ejecutada: 3 workers (60/59/63 líneas) + dry-runs sobre este repo, los 3 OK | Gate S3 sin decisiones de usuario; 3 hallazgos colaterales sobre sdd-lite anotados |
| 2026-08-03 | **Ajuste de alcance**: blueprint no modifica sdd-lite. S5.4 eliminado; handoff pasivo (seed en inbox, consumo manual); hallazgos colaterales sin acción | Decisión del usuario: harness separado, vínculos solo read-only/pasivos |
| 2026-08-03 | S3 confirmada (`done`). S4 ejecutada: strategist + exporter; dry-run del exporter OK; fix de `severity` en envelope | Gap detectado por el propio dry-run |
| 2026-08-03 | S4 confirmada (`done`). S5 ejecutada: bp-init, bp-handoff, wrappers, VERSION 0.1.0; dry-run 12/12 PASS; 13 fixes de redacción | Gate S5: permisos ofrecidos, skills por copy, sin tocar `.gitignore` |
| 2026-08-03 | S5 confirmada (`done`). S6 redefinida (cierre estático) y ejecutada: auditoría fresca (5 blockers + 20 menores, todos corregidos), tokens ~1.1k/worker, README con guía manual | El e2e vivo queda como field-testing del usuario (6.e) |
| 2026-08-03 | S6 cerrada. Pre-commit: análisis de fidelidad OK, verificación final OK, paquete staged (29 archivos, sin `planning/`), `USER-GUIDE.md` (EN, 12 secciones) escrita y staged | Pendiente: `USER_GUIDE_ES.md` (traducción 1:1, etapa aparte) y el commit (a pedido del usuario) |
| 2026-08-03 | `USER_GUIDE_ES.md` escrita (traducción 1:1, identificadores del sistema en EN) y staged — paquete en 30 archivos | Cierra el pendiente de traducción; el commit sigue esperando orden del usuario |
| 2026-08-04 | `docs/` creada: `01-how-it-works.md` (209 ln), `02-flows.md` (193 ln), `03-skills-and-customization.md` (142 ln, renombrado: el nombre original matcheaba `*-temp*` del `.gitignore`) — 11 diagramas mermaid; punteros agregados en `README.md` y `USER-GUIDE.md` | Pedido del usuario: documentación simple del funcionamiento; complementa USER-GUIDE (EN); staged 2026-08-04 a pedido |
