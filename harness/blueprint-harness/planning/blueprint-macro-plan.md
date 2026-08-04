# Macro plan: primera implementación de `blueprint-harness`

> Basado en `blueprint-initial-idea.md` + `blueprint-analysis.md` (todas las decisiones D1–D12 congeladas, 2026-08-03).
> Alcance del MVP: los 3 flujos completos (F1 `bug-triage`, F2 `requirements-refinement`, F3 `code-consultation`).
> Ejecución controlada: cada sección se implementa y valida antes de pasar a la siguiente; cada una tiene criterio de salida explícito.

---

## Principios rectores (no negociables durante la implementación)

1. **Una sola fuente por regla**: cada norma vive en exactamente un archivo; el resto referencia con una línea. Nada de repetir invariantes en README + orquestador + skills.
2. **Orquestador mínimo**: event loop que lee evidencia persistida mínima, decide, arma envelope, despacha, procesa resultado. No lee docs amplios en runtime.
3. **Envelope pre-resuelto**: el orquestador inyecta contexto; la lectura directa de contratos por parte de las skills es solo fallback (con `context_resolution` para detectarlo).
4. **Budgets antes que features**: presupuesto de tokens de launch stack y de palabras por artefacto fijados en Sección 1, medidos en Sección 6.
5. **Read-only estructural**: workers nunca escriben; solo el orquestador escribe, y solo dentro de `bp-workspace/`. Worker que escribió = incidente.
6. **Digest-first**: todo artefacto abre con un digest de campos planos; es el ancla de routing y resume.
7. **Artefactos persistidos en inglés**; chat es/en (compatibilidad de handoff con sdd-lite).
8. **Rúbricas cuantitativas**: toda decisión de routing/severidad/complejidad tiene tabla de umbrales, nunca "evaluar a criterio".

---

## Sección 0 — Congelar la spec (v1)

**Objetivo**: que `blueprint-initial-idea.md` deje de ser la referencia y exista una spec v1 coherente con las decisiones.

- 0.1. Redactar `blueprint-spec.md` (v1) incorporando D1–D12 y las 10 correcciones puntuales de `blueprint-analysis.md` §5 (F1 con interviewer consistente con el diagrama, guardrail por clase de efecto, heurísticas de delegación en vez de "una skill por turno", budgets de mapper/analyzer, allowlist de `git log/show/diff`, templates user-owned, `state_mutations` aplicadas solo por el orquestador, inglés persistido, definición de "logs", naming de artefactos).
- 0.2. Definir el layout definitivo de ambos árboles:
  - Motor (fuente en `ai-tools/sdd/blueprint-harness/`, copia embebida `.bp-harness/` en el repo destino): `orchestrator/`, `skills/bp-*/`, `skills/_shared/`, `schemas/`, `templates/` (artifacts, wrappers, bootstrap), `VERSION` estampada.
  - Workspace: `bp-workspace/config.yaml`, `objectives/{slug}/` (state + intermedios), `ideas/`, `bugs/`, `audits/` (artefactos finales con estado en digest), `templates/` (user-owned), `index.yaml` (índice liviano de objetivos).
- 0.3. Marcar `blueprint-initial-idea.md` como superseded (nota al inicio apuntando a la spec v1).

**Entregables**: `blueprint-spec.md`, layout congelado.
**Criterio de salida**: la spec no contiene ninguna de las contradicciones C1–C4 del análisis; revisión de consistencia manual OK.

---

## Sección 1 — Fundaciones: schemas, contratos y templates

**Objetivo**: todo el vocabulario y las estructuras de datos existen antes de escribir la primera skill.

- 1.1. `schemas/bp-config.schema.yaml`: identidad del producto, dominio/glosario, `rigor_level` **con semántica operativa definida** (qué cambia en cada nivel), idioma de chat, `engine_version`, `sdd_lite_integration` (paths detectados), capabilities detectadas (`rg`, `gh`, AST parsers).
- 1.2. `schemas/bp-state.schema.yaml` (por objetivo): `objective_slug`, `objective_type` (`bug-triage | requirements-refinement | code-consultation`), `lifecycle_status` (enum + transiciones válidas documentadas), `current_phase`, `decisions[]`, `checkpoints[]` (reutilizando shapes de sdd-lite: `decisionOption` con `recommended`, checkpoint con `response`), `key_files[]`, `artifacts{}` con digests, `next_action`, timestamps. Regla: **ningún campo entra al schema sin flujo que lo escriba y lo consuma**.
- 1.3. Contratos `skills/_shared/` (4, compactos — budget total ≤ ~1.500 palabras entre los cuatro):
  - `bp-flow-contract.md`: ids canónicos, result envelope (`status/executive_summary/user_message/state_mutations/artifacts/next_action/open_risks` + `context_resolution/standards_source/artifact_digests_used/recommended_next_step`), worker execution boundary literal, flow rules, resume rules.
  - `bp-persistence-contract.md`: layout runtime, ownership por artefacto (tabla), naming (`^[a-z0-9]+(?:-[a-z0-9]+)*$`), estados de artefacto (`draft/approved/handed-off/superseded`) en digest, budgets de palabras por artefacto, y shape de `index.yaml` (índice global: slug, tipo, lifecycle_status, last_updated, digest de una línea por objetivo).
  - `bp-findings-contract.md`: modelo de severidad único, `evidence_class: deterministic|inferential`, clasificación `fact/inference/unknown`, precision gate ("silencio ante la duda"), formato de fila de hallazgo.
  - `bp-user-interaction-contract.md`: checkpoint types del harness (mínimo: `missing_context`, `scope_change`, `phase_validation`, `artifact_approval`, `handoff_gate`, `audit_persist_offer`, `deep_interview_suggestion`), smart skip, protocolo de lista interactiva, registro en `decisions[]`.
- 1.4. Templates de artefactos (`templates/artifacts/`), cada uno con su digest inicial y budget:
  - Intermedios (D4): `interview-notes.md`, `analysis.md`, `alternatives.md`.
  - Finales: `rfc.md` (`## Decision Digest`), `bug-report.md` (`## Triage Digest`), `audit.md` (`## Audit Digest`), `handoff-seed.md` (formato inbox para sdd-lite).
- 1.5. Doc de mapeo `_shared/sdd-lite-mapping.md` (D9): correspondencia envelope/checkpoints/severidad entre `bp-*` y `sddl-*`, una página.

**Entregables**: 2 schemas, 4 contratos, 7+ templates, doc de mapeo.
**Criterio de salida**: schemas validan las semillas de bootstrap; ningún template referencia estructura no definida; suma de contratos dentro del budget.

---

## Sección 2 — Orquestador (`BP-ORCHESTRATOR`)

**Objetivo**: el cerebro del harness, mínimo y determinista.

- 2.1. Estructura del doc: session init (detección de workspace, resume desde `index.yaml` + digests), guardrails (read-only por clase de efecto, allowlist de comandos de lectura), heurísticas de delegación por costo (regla de N+ archivos → delegar; consultas triviales → inline).
- 2.2. **Routing tables por flujo** (F1/F2/F3): formato `Situation | Next skill or action | Approval required | Notes`. La tabla es la autoridad; `recommended_next_step` del worker es señal, no override. Incluye rutas de abort, cambio de flujo y escalación ("esto ya no es discovery → derivar a sdd-lite").
- 2.3. **Result Processing Protocol** (adaptado de sdd-lite): check status → verificar que el worker **no escribió archivos** (incidente si lo hizo) → aplicar `state_mutations` (orquestador = único escritor) → ingestar findings → check `context_resolution` → superficializar `open_risks` → validar next step contra la tabla → phase summary de 3–5 líneas.
- 2.4. **Protocolo de entrevista inline** (D1): rúbrica de completitud de información (qué falta para cada `objective_type`), máximo de preguntas por ronda, cierre con consolidación en `interview-notes.md` + `state.yaml`.
- 2.5. **Protocolo deep-interview** (D1, modo paralelo): rúbrica de sugerencia (cuándo la entrevista inline no alcanza), instrucciones para abrir la sesión dedicada, y **contrato de cierre**: la sesión paralela termina formalizando decisiones en el `state.yaml` del objetivo; el orquestador principal hace resume solo desde el state, nunca desde el chat ajeno.
- 2.6. **Consolidación por checkpoint de fase** (D8): al cerrar entrevista/análisis/estrategia se persiste y se sugiere `/compact`; definir qué se conserva (state, digests, envelope siguiente) y qué se descarta (cuerpos de artefactos).
- 2.7. Rúbrica cuantitativa de complejidad por flujo (umbrales medibles: archivos afectados, módulos, incertidumbre declarada) para decidir profundidad de análisis y sugerencia de deep-interview.

**Entregables**: `orchestrator/BP-ORCHESTRATOR.md`.
**Criterio de salida**: walkthrough en seco de los 3 flujos sobre los diagramas de la spec v1 sin pasos indefinidos; todo criterio de decisión tiene umbral.

---

## Sección 3 — Workers de análisis (read-only)

**Objetivo**: las tres skills que tocan el repo, con budgets duros.

- 3.1. `bp-context-mapper`: scan superficial de topología; budget duro (≤ 6 archivos leídos, estilo convention-scan de sddl-init); indexa artefactos previos del workspace local (D2: solo lo que exista en esta máquina); salida = mapa de superficie + `key_files[]` + escalada explícita a `bp-analyzer` si no alcanza.
- 3.2. `bp-analyzer`: inspección profunda acotada; budget propio (N archivos / profundidad declarada en el envelope); entrada de "logs" = archivos del repo o texto pegado por el usuario, nunca ejecución; salida clasificada `fact/inference/unknown` según `bp-findings-contract`.
- 3.3. `bp-diff-parser`: pre-procesador de historial; allowlist `git log/show/diff` (read-only); target congelado por SHA antes de analizar; PRs vía `gh` solo si `bp-init` detectó la capability; salida = firmas de métodos y archivos modificados, no cuerpos completos.
- 3.4. Formato de skill homogéneo y corto (budget ≤ ~150 líneas por SKILL.md): frontmatter `name`/`description` con triggers, `Goal / Runtime operating rules (referencia, no copia) / Scope / Reads / Writes (none — read-only) / Budgets / Workflow / Expected Output` con degradación `partial/blocked`.

**Entregables**: 3 skills + sus secciones de envelope en el orquestador.
**Criterio de salida**: dry-run de cada worker sobre este mismo repo (`ai-tools`) respetando budget y devolviendo el envelope completo; verificación de que no escribieron nada.

---

## Sección 4 — Skills de síntesis

**Objetivo**: convertir análisis en artefactos con valor.

- 4.1. `bp-strategist`: modela viabilidad y trade-offs; consume `interview-notes.md` + salidas de análisis (por digest, no cuerpos); produce `alternatives.md` (2–3 alternativas con riesgos, esfuerzo relativo, recomendación marcada); nivel de detalle modulado por `rigor_level`.
- 4.2. `bp-doc-exporter`: toma template de `bp-workspace/templates/` (user-owned, sembrados por `bp-init`) + artefactos intermedios del objetivo y genera el artefacto final (`rfc.md` / `bug-report.md` / `audit.md`) dentro del budget de palabras; actualiza estado en el digest (`draft` → `approved` tras checkpoint `artifact_approval`).
- 4.3. Cierre de F3 con oferta de auditoría (D10): checkpoint `audit_persist_offer` — una sola oferta, respuesta registrada como decisión, nunca bloquea.

**Entregables**: 2 skills + templates finales conectados.
**Criterio de salida**: a partir de intermedios de prueba, el exporter produce un RFC y un bug-report completos, en inglés, dentro de budget, sin inventar secciones.

---

## Sección 5 — Ciclo de vida: `bp-init` y `bp-handoff`

**Objetivo**: instalación reproducible y salida limpia hacia sdd-lite.

- 5.1. `bp-init` — instalación (D5, D12):
  - Copia el motor desde el paquete fuente a `.bp-harness/` con `VERSION` estampada; re-init detecta versión y ofrece update (re-copy del motor **preservando `bp-workspace/` completo**, templates incluidos).
  - Detección de AI setup (señales `CLAUDE.md`/`.claude/` → claude_code; `AGENTS.md`/`.agents/` → agents) e instalación de skills (symlink/copy, directorio completo).
  - Detección de capabilities (`rg`, `gh`, parsers) → registradas en config con fallback documentado.
  - Lee `./sdd-lite/project-context.md` y `config.yaml` si existen; no re-pregunta identidad del proyecto.
  - Crea `bp-workspace/`, siembra `config.yaml` y `templates/`, inyecta entrada en `.gitignore` **con confirmación explícita** (es una escritura fuera del workspace).
  - Fricción mínima: defaults inteligentes, máximo ~2 preguntas (AIs a configurar, symlink vs copy).
- 5.2. Wrappers (`templates/wrappers/claude-orchestrator.md`, `agents-orchestrator.md`) con marcadores idempotentes `<!-- bp-harness:start -->` / `<!-- bp-harness:end -->`:
  - Routing entre harnesses (D11): "tengo un bug" → `bug-triage` (diagnóstico) vs `bug-fix` de sdd-lite (implementación); regla escrita en el wrapper.
  - Enforcement read-only por plataforma (D7): deny de Edit/Write fuera de `bp-workspace/` y `./sdd-lite/openspec/inbox/`, allowlist de comandos git de lectura.
  - Modos de ejecución: workers nativos vs inline-sequential con degradación documentada.
- 5.3. `bp-handoff` — inbox/seed (D3):
  - Escribe `./sdd-lite/openspec/inbox/{slug}.md` usando `handoff-seed.md` (contenido alineado al template `proposal.md` de sdd-lite: problema, outcome, scope sketch, feasibility, open questions).
  - Solo dispara tras checkpoint `handoff_gate` sobre un artefacto `approved`; marca el artefacto `handed-off`.
  - Fallback si `./sdd-lite/` no existe o no está inicializado (informar, no crear).
- ~~5.4. Ajuste coordinado en sdd-lite~~ — **ELIMINADO (decisión del usuario, 2026-08-03)**: blueprint no modifica sdd-lite. El handoff es unidireccional y pasivo: el seed queda en el inbox y su consumo es manual (el usuario se lo indica a sdd-lite). Fallback sin sdd-lite ya especificado.

**Entregables**: 2 skills, 2 wrappers.
**Criterio de salida**: init end-to-end en un repo de prueba limpio (con y sin sdd-lite presente); re-init idempotente; seed generado y consumido por `sddl-proposal` creando un change válido contra sus schemas.

---

## Sección 6 — Validación end-to-end y documentación

**Objetivo**: probar el harness completo en condiciones reales antes de darlo por MVP.

- 6.1. Dry-run F1 (`bug-triage`) sobre un repo real con un bug conocido: entrevista → mapper → analyzer → strategist → bug-report exportado.
- 6.2. Dry-run F2 (`requirements-refinement`) con un requerimiento real: entrevista → mapper (contraste con artefactos previos del workspace) → strategist → RFC → handoff a sdd-lite → change creado.
- 6.3. Dry-run F3 (`code-consultation`): consulta con historial (`bp-diff-parser`) + respuesta inline + oferta de audit.
- 6.4. Medición de token budget: launch stack por worker y overhead por flujo; comparar contra los budgets de Sección 1; ajustar contratos/skills si se exceden.
- 6.5. Pruebas de robustez: resume tras corte de sesión (solo desde state + digests), dos objetivos concurrentes (F3 durante un F2 abierto), re-init/update de motor, intento de escritura por un worker (debe detectarse como incidente).
- 6.6. Documentación mínima (una fuente por concepto, sin duplicar la spec): `README.md` del paquete + guía de uso breve. No crear árbol de `docs/` paralelo en el MVP.

**Entregables**: 3 dry-runs registrados, medición de tokens, README.
**Criterio de salida**: los 3 flujos completos sin intervención manual fuera de los checkpoints diseñados; budgets cumplidos o desvío justificado y corregido.

---

## Dependencias y orden

```
S0 → S1 → S2 → S3 → S4 → S5 → S6
              └─ S3 y S4 pueden solaparse parcialmente (strategist no depende de diff-parser)
S5.4 (patch sdd-lite) puede adelantarse en paralelo desde que S1 congela el formato del seed.
```

## Fuera del MVP (explícito)

- Flujo F4 de auditoría dedicado (D10: queda como subcaso de F3).
- Contratos compartidos físicos `sdd/_shared/` (D9: solo doc de mapeo por ahora).
- Versionado git del workspace (D2: gitignoreado; export manual del usuario).
- Integración con PRs remotos más allá de la capability `gh` opcional.
- Cualquier automatización de escritura de código (fuera del alcance del harness por definición).
