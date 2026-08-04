# Análisis pre-implementación: `blueprint-harness`

> Síntesis del análisis en profundidad (3 subagentes: arquitectura sdd-lite, lecciones de reviews, crítica del blueprint) sobre `blueprint-initial-idea.md`. Fecha: 2026-08-03.
> Objetivo: validar decisiones abiertas antes de generar el macro plan de implementación.

---

## 1. Veredicto general

La spec acierta en el **qué** y está inmadura en el **cómo**:

- **Listo tal cual**: identidad read-only pre-implementación, nomenclatura (`bp-`), catálogo de skills por capacidad (mapper/analyzer/strategist/diff-parser/exporter/handoff), flujos F1–F3 como rutas de alto nivel, campos de los templates RFC/bug-report, condición y direccionalidad del handoff.
- **Inmaduro**: contratos sin shape concreto, persistencia contradictoria, `state.yaml` como único canal de contexto, instalación inexistente, y tres guardrails que un LLM no puede auto-enforcarse tal como están escritos (read-only por prompt, "una skill por turno", purga a 20 turnos).

Casi todos los huecos tienen solución ya implementada y probada en sdd-lite. La decisión de mayor apalancamiento es **cuánta infraestructura compartir en vez de reinventar**.

---

## 2. Problemas detectados en la spec

### 2.1. Contradicciones internas

| # | Contradicción | Detalle |
|---|---|---|
| C1 | Workspace efímero vs memoria obligatoria | §2.2 gitignorea `bp-workspace/`, pero §4.2 obliga a `bp-context-mapper` a indexar RFCs pasados como memoria institucional. Los RFCs desaparecen entre clones/máquinas. Una premisa debe ceder. |
| C2 | "Una skill por turno" vs diagramas | §5.1 lo impone, pero §8.2 encadena mapper→analyzer→strategist sin intervención del usuario. Si turno = mensaje de usuario, F1 exige ~5 pings (UX inaceptable); si turno = inferencia, la restricción no aporta nada. |
| C3 | F1 con/sin interviewer | §5.2 lista `bp-chat-interviewer` como paso 1; el diagrama §8.2 lo omite. |
| C4 | Handoff rompe el contrato de sdd-lite | §7 escribe `proposal.md` directo en `changes/{slug}/` — viola el Artifact Ownership de sdd-lite (`proposal.md` es de `sddl-proposal`), deja un change sin `state.yaml`, y no respeta template/budget (200–400 palabras). |

### 2.2. Huecos operativos

- **Schemas nombrados pero vacíos**: ni un campo definido para `bp-config` / `bp-state`. "Nivel de rigor" sin semántica operativa.
- **Envelope sin serialización definida**: ¿quién aplica `state_mutations`? (debería ser solo el orquestador — un único escritor de estado).
- **Instalación inexistente**: `bp-init` no dice cómo llega el motor al repo destino. `.bp-harness/` embebido por repo = N copias divergiendo sin ruta de update (sdd-lite ya resolvió esto: paquete central + symlink/copy + wrapper injection con marcadores).
- **Sin artefactos intermedios**: todo el conocimiento vive en resúmenes de 2 líneas en `state.yaml` o en un chat que se purga. Los RFCs del exporter saldrán pobres o alucinados. Falta la capa `interview-notes / analysis / alternatives` con digest.
- **Sin ciclo de vida de artefactos**: `ideas/`, `bugs/`, `audits/` sin naming, sin estados (`draft/approved/handed-off/superseded`). El handoff exige "aprobación explícita" pero nada la persiste.
- **Multi-objetivo no contemplado**: state global singular; una consulta F3 en medio de un F2 abierto pisaría el estado.
- **`bp-analyzer` sin budget** de archivos/tokens → sumidero de tokens.
- **Flujo huérfano**: "auditoría histórica" tiene template pero no flujo (F3 termina inline sin persistir en `audits/`).
- **Sin flujo de resume** tras purga/corte de sesión.
- **Menores**: origen de "trazas de logs" sin definir; `bp-diff-parser` con PRs implica `gh`/red no contemplado; idioma de artefactos sin regla (mismatch con sdd-lite English-only en el handoff); "FSM" anunciada pero sin estados/transiciones enumerados.

---

## 3. Lecciones de sdd-lite (de los 4 reviews)

### Errores que NO repetir

1. **Repetición normativa entre capas** — el error #1: la misma regla en README+orquestador+wrappers+contratos+skills produjo ~23K tokens repetidos por flujo y drift garantizado. → Cada regla vive en exactamente un archivo; el resto referencia. Diseñar el "contract-lite" desde el día 1.
2. **Skills que recuperan contexto leyendo docs en runtime** en vez de recibir envelope pre-resuelto. → El orquestador resuelve una vez e inyecta; lectura directa solo como fallback.
3. **Criterios de decisión cualitativos sin rúbrica** ("evaluar blast radius"). En triaje/auditoría es letal. → Tablas de umbrales desde el inicio (el triage de `review-protocols.md` es el modelo).
4. **Referenciar templates que no existen o no se cargan** → la IA fabrica estructura. Todo artefacto nace con template concreto + formato de digest fijo + lectura mandatoria.
5. **Asumir el Agent tool de Claude Code como delegación universal** → definir modo delegado y modo inline-secuencial desde el inicio, con degradación documentada.
6. **Campos de schema sin flujo que los escriba/consuma** (`pending_proposals[]`, `preference_capture`).
7. **Prometer autonomía que las invariantes contradicen**.
8. **Init con fricción y preguntas obvias** — para un harness de discovery mataría la adopción. Defaults inteligentes, mínimas preguntas.
9. **Sin presupuesto de tokens como constraint de diseño** (launch stack de sdd-lite: ~12,4k tokens antes de leer un archivo del repo). Fijar budgets de prompt y artefacto antes de escribir la primera skill.
10. **Skills demasiado largas** (~250–330 líneas) con bloques duplicados.

### Fortalezas probadas a heredar

- **Workers read-only + orquestador único escritor** (patrón review-protocols: workers devuelven filas, el orquestador escribe el ledger). Es exactamente la arquitectura de blueprint.
- **Target congelado** (SHA/digest) antes de analizar → triaje/auditoría reproducibles.
- **Salida clasificada** `fact/inference/unknown`, `evidence_class: deterministic|inferential`, precision gate ("silencio ante la duda").
- **Result envelope estándar** (`status/executive_summary/artifacts/next_action/open_risks` + `context_resolution/standards_source/recommended_next_stage`) + **Result Processing Protocol** de 6 pasos + tabla de routing como autoridad final ("worker recommendation is a signal, not an override").
- **Worker execution boundary literal** en cada envelope (prohibición de sub-agentes anidados).
- **Digest-first**: todo artefacto abre con digest de campos planos; para artefactos standalone el digest es el único ancla de resume.
- **Checkpoints tipados persistidos + smart skip** ("si el usuario ya indicó avanzar, saltar y registrar como implicitly approved") — resuelve la "lógica de detección" del interviewer.
- **Protocolo de lista interactiva** (`all/none/índices/inspect N/done`, input no reconocido re-enuncia el action set).
- **Budgets duros** (máx N archivos por scan, máx rondas de refinamiento).
- **Instalación symlink|copy** con reescritura de paths en copy mode, wrapper injection idempotente con marcadores.
- **Regla de idioma**: artefactos persistidos en inglés, chat es/en.
- **Escalación documentada**: el equivalente blueprint es "esto ya no es discovery, es un cambio → derivar a sdd-lite".
- **Verificación read-only en Result Processing**: "un worker que escribió algo es un incidente" — en blueprint debe ser el default para *todo* worker.

### Ventaja estructural de blueprint

Al ser read-only desaparecen las clases de problema más pesadas de sdd-lite (stage_approval por escritura, rollback mid-write, whitelist del executor). La lección agregada: sdd-lite falló en ser "lite" por su *runtime shape*, no por su lifecycle — "la mejor mejora no es hacer el orquestador más inteligente, es hacerlo más pequeño". Blueprint debe nacer así: orquestador-event-loop mínimo, envelope compacto único, workers read-only con salida tipada, una sola fuente normativa por regla.

---

## 4. Decisiones

### 4.1. Resueltas por el usuario (2026-08-03)

| # | Decisión | Resolución | Implicancias de diseño |
|---|---|---|---|
| D1 | Modelo del `bp-chat-interviewer` | **Protocolo inline** del orquestador por defecto. En casos complejos, el sistema sugiere (o el usuario puede abrir) una **conversación paralela dedicada** con ida y vuelta cerrado, que al terminar formaliza sus conclusiones en `state.yaml`. | Diseñar dos modos: (1) entrevista inline liviana; (2) "deep interview" como sesión paralela con protocolo de cierre que consolida decisiones en `state.yaml` — el orquestador principal hace resume desde el state, nunca desde el chat de la otra sesión. Definir el criterio de sugerencia (rúbrica de complejidad) y el contrato de cierre. |
| D2 | Persistencia de `bp-workspace/` | **Gitignoreado por defecto** (spec). Los RFCs/docs finales los documenta el usuario manualmente en otro lado; el workspace se mantiene solo local por usuario. | La "memoria institucional" (§4.2 de la spec) es local por máquina: `bp-context-mapper` indexa lo que exista en el workspace local, sin asumir historial compartido entre máquinas/colegas. `bp-doc-exporter` genera artefactos pensados para copiar/exportar afuera. |
| D3 | Contrato de handoff | **Inbox/seed**: `bp-handoff` deja el paquete en un inbox (p.ej. `./sdd-lite/openspec/inbox/{slug}.md`); `sddl-proposal` lo consume como input y crea el change canónicamente. | Requiere un cambio menor coordinado en sdd-lite: que `sddl-proposal`/orquestador detecten el inbox como fuente de un nuevo change. No rompe ownership ni schemas. |
| D5 | Distribución del motor | **Embebido por repo** (spec): `.bp-harness/` copiado completo a cada proyecto destino. | Mitigar la divergencia: el motor lleva versión estampada (`version` en config o marcador), y `bp-init` re-ejecutado sobre una copia existente detecta versión y ofrece update (re-copy) preservando `bp-workspace/`. El paquete fuente sigue viviendo en `ai-tools/sdd/blueprint-harness/` como origen de la copia. |

### 4.2. Resueltas por el usuario (2026-08-03, segunda ronda — todas con la recomendación)

| # | Decisión | Resolución |
|---|---|---|
| D4 | Artefactos intermedios | **Artefactos de trabajo owned-por-skill con digest** (notas de entrevista, análisis, alternativas) — insumo real del doc-exporter |
| D6 | Multi-objetivo | **`bp-workspace/objectives/{slug}/`** con `state.yaml` propio + índice global liviano (modelo `changes/` de sdd-lite) |
| D7 | Enforcement read-only | **Permisos de plataforma en wrappers** (deny writes fuera del workspace, allowlist git read) + **verificación post-worker** en Result Processing ("un worker que escribió algo es un incidente") |
| D8 | Purga a 20 turnos | **Consolidación por checkpoint de fase** (cierre de entrevista, cierre de análisis) + sugerencia de `/compact`; se elimina la purga por conteo |
| D9 | Contratos compartidos | **Contratos `bp-*` propios** espejando vocabulario de sdd-lite (envelope shape, checkpoint types, regla English-artifacts) con doc de mapeo; migrar a `sdd/_shared/` común si se estabilizan |
| D10 | Auditoría histórica | **Subcaso de F3**: al cerrar una consulta se ofrece persistir como audit en `audits/`; sin flujo F4 dedicado en el MVP |
| D11 | Routing entre harnesses | Objetivo renombrado a **`bug-triage`** + regla de routing en wrappers (blueprint = diagnóstico read-only; sdd-lite = fix) |
| D12 | Config solapada | `bp-init` **lee** `./sdd-lite/project-context.md` y `config.yaml` si existen y no re-pregunta |

**Alcance del MVP** (decidido en la misma ronda): los **3 flujos completos** (F1 `bug-triage`, F2 `requirements-refinement`, F3 `code-consultation`) desde la primera implementación — las skills son compartidas y el costo marginal es routing + dry-runs.

---

## 5. Correcciones puntuales a incorporar a la spec

1. F1 (§5.2) y diagrama §8.2 deben coincidir (interviewer inline al inicio del triaje).
2. Guardrail de mutación formulado por *clase de efecto* ("cualquier comando que cambie historia, working tree o remoto"), no por lista — copiar formulación de sdd-lite.
3. Reemplazar "una skill por turno" por heurísticas de delegación por costo (regla de 4+ archivos, etc.).
4. `bp-context-mapper` y `bp-analyzer` con budgets duros (N archivos máx., escalada explícita).
5. `bp-diff-parser`: allowlist explícita de `git log/show/diff`; PRs vía `gh` como capability opcional detectada por `bp-init`.
6. `bp-doc-exporter`: los templates los copia `bp-init` del motor a `bp-workspace/templates/`, que después es user-owned (nunca se pisa en re-init).
7. `state_mutations` del envelope las aplica **solo el orquestador** (único escritor de estado) — esto es incluso una mejora sobre sdd-lite.
8. Artefactos persistidos en inglés (compatibilidad handoff), chat es/en.
9. "Trazas de logs" = archivos del repo o pegados por el usuario en el chat; nunca ejecución.
10. Definir naming de artefactos: `{tipo}/{slug}.md` con estado en el digest (`draft/approved/handed-off/superseded`).

---

## 6. Insumos para el macro plan

Orden de construcción sugerido (a detallar en el macro plan tras validación):

1. **Fundaciones**: schemas reales (`bp-config`, `bp-state`), contratos `_shared` (flow/persistence/findings/user-interaction), templates de artefactos con digest, budgets.
2. **Orquestador mínimo**: event loop, routing tables por flujo, Result Processing Protocol, protocolo de entrevista inline, guardrails.
3. **Skills de análisis**: `bp-context-mapper`, `bp-analyzer`, `bp-diff-parser` (workers read-only).
4. **Skills de síntesis**: `bp-strategist`, `bp-doc-exporter`.
5. **Ciclo de vida**: `bp-init` (copia versionada del motor al repo destino + detección de AI setup + wrapper injection con marcadores, con update path en re-init), `bp-handoff` (contrato inbox/seed acordado con sdd-lite, incluye el ajuste menor en `sddl-proposal`).
6. **Validación**: dry-run de F1/F2/F3 sobre un repo real, medición de token budget, ajustes.
