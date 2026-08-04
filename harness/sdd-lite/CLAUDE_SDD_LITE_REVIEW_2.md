# SDD-Lite Review 2 -- Análisis Sin User-Preferences

> Fecha: 2026-05-16
> Scope: Estado actual del SDD-Lite post-eliminación del sistema de preferencias de usuario
> Método: Lectura completa de 17 archivos core (3,222 líneas) + archivos auxiliares
> Foco: Alucinaciones, retención de contexto, diferencias entre IAs, optimización

---

## Parte 1: Puntos que Pueden Causar Alucinaciones

### A1. Evaluación de complejidad sin criterios medibles [CRÍTICO]

**Archivo:** `orchestrator/SDDL-ORCHESTRATOR.md:88-94`

El orquestador debe evaluar "scope span, ambiguity, blast radius, execution depth, risk profile" para elegir ruta (`continue-lite` vs `macro-plan-first` vs `escalate-to-sdd-v2`), pero **no hay umbrales cuantitativos ni rúbrica**. Cada IA inventará su propia escala.

**Riesgo:** Un modelo puede decidir `continue-lite` donde otro escalaría. La decisión es subjetiva y no verificable.

**Recomendación:** Agregar rúbrica concreta. Ej: "blast-radius > 10 archivos = macro-plan-first; > 30 archivos = escalate-to-sdd-v2".

---

### A2. Generación de `skill-catalog.md` sin template concreto [CRÍTICO]

**Archivo:** `skills/sddl-init/SKILL.md:196-198`

La instrucción dice "Generate `skill-catalog.md` through an internal helper flow as the runtime standards registry." No hay template en `templates/bootstrap/` (solo existe `config.yaml` y `project-context.md`). 

**Riesgo:** El agente fabricará estructura, contenido y formato. Cada ejecución producirá un archivo diferente. Los skills downstream que buscan bloques como `## Project Standards (auto-resolved)` pueden no encontrarlos.

**Recomendación:** Crear `templates/bootstrap/skill-catalog.md` con la estructura exacta esperada.

---

### A3. Template `project-context.md` referenciado pero sin contenido auditable [ALTO]

**Archivo:** `skills/sddl-init/SKILL.md:193`, `README.md:88`

El init dice "Generate from the bootstrap template". Si ese template es vago o minimal, el agente inventará el contenido del contexto del proyecto.

**Recomendación:** Verificar que `templates/bootstrap/project-context.md` tenga estructura clara con placeholders explícitos, no instrucciones abiertas.

---

### A4. Inferencia de stack sin validación cruzada [ALTO]

**Archivo:** `skills/sddl-init/SKILL.md:189`

La instrucción dice "infer project identity, canonical runtime paths, and bootstrap metadata". El verbo es **inferir**, no **confirmar**. 

**Riesgo:** El agente puede detectar TypeScript pero inventar el framework (React vs Next vs Nest) si hay señales ambiguas. Las preguntas de confirmación son opcionales ("ask only when material").

**Recomendación:** Cambiar a "infer and validate with user when confidence < 90%" o listar explícitamente qué se infiere silenciosamente vs qué requiere confirmación.

---

### A5. `design-plan.md` debe ser "directly executable without reinterpretation" [MEDIO]

**Archivo:** `skills/sddl-design-plan/SKILL.md:17`

No define qué significa "executable". Sin un schema o ejemplo concreto de la tabla de stages, cada agente inventará diferentes niveles de granularidad.

**Recomendación:** Agregar ejemplo de stage table mínimo en el template `templates/artifacts/design-plan.md`.

---

### A6. Templates de artefactos referenciados pero no cargados en contexto [ALTO]

**Archivo:** `skills/sddl-proposal-spec/SKILL.md:68` (y equivalentes en cada skill)

Cada skill dice "Use `templates/artifacts/proposal-spec.md` as the baseline shape", pero esos templates no se cargan automáticamente en el contexto del worker.

**Riesgo:** Si el agente no los lee (por economizar tokens), inventará la estructura.

**Recomendación:** O inyectar el template en el envelope de delegación, o hacer la lectura mandatoria en la sección "Reads" del skill.

---

### A7. "Support agents" referenciados sin implementación [BAJO]

**Archivo:** `skills/_shared/sddl-project-standards-contract.md:112-114`

Menciona "support agents" como "reusable patterns" en `skill-catalog.md`. No hay implementación real.

**Riesgo:** Un agente podría intentar invocar un "support agent" que no existe.

---

### A8. Digests sin formato definido [MEDIO]

**Archivos:** `skills/_shared/sddl-persistence-contract.md:86`, `README.md:263`

El sistema requiere "short digest at the top of each artifact" pero no define qué debe contener, cuántas líneas, ni su formato.

**Riesgo:** Cada agente generará digests de tamaños y contenidos impredecibles. Skills downstream que esperan parsear el digest podrían fallar.

**Recomendación:** Definir formato: "Digest: 2-3 líneas. Línea 1: qué es. Línea 2: estado actual. Línea 3: decisión clave."

---

## Parte 2: Retención de Contexto

### B1. state.yaml robusto pero sin snapshots de decisiones clave

El schema registra checkpoints y decisions con campo `rationale` (string libre). Tras compactación del contexto, un agente puede leer el rationale pero no tener suficiente contexto para entender **por qué** se tomó esa decisión.

**Recomendación:** Agregar campo `context_snapshot` en checkpoints que capture el estado relevante al momento de la decisión.

---

### B2. Resume depende de coherencia entre state.yaml y artefactos

**Archivo:** `orchestrator/SDDL-ORCHESTRATOR.md:163-180`

Si un artefacto fue parcialmente escrito (crash mid-write) o tiene un digest inconsistente con el body, **no hay mecanismo de detección**. El agente leerá un artefacto corrupto como válido.

**Recomendación:** Agregar un checksum o timestamp en state.yaml que se pueda contrastar con el artefacto real.

---

### B3. La "context ladder" asume lectura progresiva

**Archivo:** `skills/_shared/sddl-flow-contract.md:68-86`

Define 8 niveles de recuperación de contexto. En la práctica, un agente con ventana de contexto compactada no puede seguir esta escala progresiva: o lee todo de golpe o pierde la estrategia incremental.

**Impacto diferencial por IA:**
- **Claude Code:** Puede seguir la escala gracias al sistema de compactación progresiva
- **Codex:** Sesiones más cortas, tiende a leer todo de golpe
- **Otros LLMs:** Sin mecanismo de compactación, la escala es inaplicable

---

### B4. Digests no persistidos de forma estructurada

Los digests son texto libre al inicio de cada artefacto Markdown. No tienen campo dedicado en state.yaml. Si el agente no los encuentra en las primeras líneas, leerá el artefacto completo inflando contexto.

**Recomendación:** Agregar campo `digest` en `state.yaml > artifacts > {artifact}` con el digest más reciente. El worker lee primero el digest de state.yaml antes de abrir el artefacto.

---

### B5. Sin detección de límite de contexto

No hay mecanismo para que el orquestador detecte que está cerca del límite y tome acciones preventivas (resumir, delegar, o persistir estado intermedio).

**Impacto diferencial por IA:**
- **Claude Code:** El harness maneja compactación automáticamente; menor riesgo
- **Codex:** Ventana más limitada, riesgo alto de overflow sin aviso
- **Otros LLMs:** Riesgo crítico, contexto se trunca silenciosamente

---

### B6. Workers frescos sin verificación de integridad

Un worker delegado recibe un "compact envelope" pero no puede verificar si los artifact digests son vigentes. Si el orquestador pasó un digest de una versión anterior, el worker procederá con información desactualizada.

**Recomendación:** Incluir hash o timestamp del artefacto en el envelope. El worker verifica antes de proceder.

---

## Parte 3: Diferencias entre Plataformas de IA

### C1. Wrappers idénticos — sin adaptación real

**Archivos:** `templates/wrappers/claude-orchestrator.md` y `codex-orchestrator.md`

Son 64 líneas idénticas carácter por carácter. No hay diferenciación real para cada plataforma.

| Capacidad | Claude Code | Codex | Otros LLMs |
|-----------|-------------|-------|------------|
| Subagentes (Agent tool) | Sí, nativos | No directo — sesiones independientes | Generalmente no |
| Bash/Shell | Sí, directo | Sí, con restricciones | Variable |
| Symlinks | Sí | Sí | Variable |
| Compactación automática | Sí (harness) | No | No |
| Contexto máximo | ~200K tokens | ~128K tokens | 8K-200K variable |
| Persistencia entre sesiones | Via CLAUDE.md | Via AGENTS.md | Variable |

**Recomendación:** Crear diferenciaciones reales en los wrappers:
- **Claude:** Enfatizar uso de Agent tool para delegación, compactación disponible
- **Codex:** Modelo de "todo inline" o delegación via archivos de instrucciones separados
- **Genérico:** Fallback mode sin delegación, orquestador hace todo inline

---

### C2. Delegación asume Agent tool de Claude Code [CRÍTICO]

**Archivo:** `README.md:41`, `orchestrator/SDDL-ORCHESTRATOR.md:79`

El modelo "delegate as fresh workers" **requiere** un mecanismo de sub-agente con contexto limpio. Solo Claude Code tiene esto nativamente.

| Plataforma | Cómo debería delegar | Estado actual |
|---|---|---|
| Claude Code | Agent tool → subagente fresco | Soportado correctamente |
| Codex | Archivo de instrucciones en workspace + nueva sesión | **No documentado** |
| GPT/Gemini/Local | Sin delegación — todo inline con cuidado de contexto | **No contemplado** |

**Recomendación:** Agregar sección "Platform-specific delegation" en el orquestador con estrategias por plataforma.

---

### C3. Sin instrucciones para plataformas sin delegación

Si se usa sdd-lite con un LLM que no tiene Agent tool, **todo el modelo thin-orchestrator + delegated workers se rompe**. El orquestador haría todo inline consumiendo todo el contexto disponible.

**Recomendación:** Definir un "inline mode" donde el orquestador ejecuta cada skill secuencialmente en la misma sesión, con puntos de persistencia entre stages para poder recuperarse de overflow de contexto.

---

### C4. Ventanas de contexto no consideradas

Los skills consumen ~4,200-6,000 tokens solo en prompt overhead (sin contar archivos del proyecto). En un modelo con 8K tokens de contexto, esto deja ~2K-4K para el trabajo real.

**Recomendación por plataforma:**
- **Claude (200K):** Comportamiento actual es viable
- **Codex (128K):** Viable pero comprimir contratos ayudaría
- **Modelos <32K:** Necesita "contract-lite" obligatorio (~800 palabras)
- **Modelos <8K:** Incompatible sin rediseño fundamental

---

### C5. Acceso a herramientas no uniforme

`sddl-executor` usa `quality_commands` para quick checks (lint, test, build). En Claude Code, Bash está disponible directamente. En Codex, la ejecución tiene restricciones diferentes.

**Recomendación:** Condicionar quality_commands al capability del runtime: "If shell access available, run quality_commands. Otherwise, instruct user to run and report results."

---

### C6. Symlinks en init

El paso 5 de `sddl-init` ofrece symlinks. Funciona en macOS/Linux pero puede fallar en Windows o entornos sandboxed.

**Recomendación:** Detectar OS y ofrecer copy como default en Windows. Menor prioridad.

---

## Parte 4: Optimización de Tokens y Redundancia

### Mapa de Redundancia Principal

| Concepto repetido | Apariciones | Tokens desperdiciados |
|---|---|---|
| Reglas de delegación (inline ≤3, delegate ≥4) | 5 archivos | ~640 |
| Lista de archivos de bootstrap | 11 apariciones | ~720 |
| Regla de idioma (artifacts in English) | 10 apariciones | ~180 |
| "Stage mode never closes" | 6 apariciones | ~170 |
| "No git side effects" | 4 apariciones | ~65 |
| Runtime layout completo | 2 copias idénticas | ~105 |
| Artifact budget table | 5 apariciones | ~160 |
| **TOTAL REDUNDANTE** | | **~2,040 tokens** |

### Token Budget por Invocación

| Operación | Tokens estimados |
|---|---|
| Orchestrator cold start | ~8,960 |
| Invocación skill promedio | ~4,800 |
| Flujo completo (init → qa-final, ~7 invocaciones) | ~41,960 |
| Resume desde state.yaml | ~7,300 |

**Problema clave:** Los 4 contratos compartidos (~3,330 tokens) se cargan en **cada** invocación de skill. En un flujo completo de 7 invocaciones = **~23,300 tokens solo en contratos repetidos**.

### Oportunidades de Compresión

| Optimización | Ahorro por invocación | Ahorro en flujo completo |
|---|---|---|
| Contract-lite (~800 palabras vs ~2,500 actuales) | ~2,260 tokens | ~15,800 tokens |
| No cargar README en runtime | ~1,680 tokens | ~1,680 tokens |
| Carga on-demand de schemas | ~700 tokens | ~4,900 tokens |
| Unificar "Expected Output" y "Runtime rules" | ~100 tokens | ~700 tokens |
| Eliminar duplicación README vs contratos | ~600 tokens | ~600 tokens |
| **TOTAL AHORRO POTENCIAL** | **~5,340 tokens** | **~23,680 tokens** |

---

## Parte 5: Facilidad de Uso y Seguridad

### Puntos de Fricción

1. **Init tiene 3 preguntas consecutivas sobre AI setup** (pasos 4, 5, 6) que podrían reducirse a 1 con defaults inteligentes.
2. **Sin fast-track para cambios triviales.** Un bug fix de 1 archivo pasa por: proposal-spec → design-plan → executor → qa-review. Desproporcionado.
3. **No se pueden saltar etapas.** El usuario no puede decir "ya tengo claro el scope, salteemos proposal-spec".
4. **Sin visibilidad de etapa actual.** No hay mecanismo explícito para que el usuario pregunte "¿en qué etapa estoy?" — depende de comunicación proactiva de la IA.

### Seguridad — Puntos Fuertes

- No git side effects (sin commits, stashes, rebases)
- `stage_approval` mandatorio para stages que tocan código
- Solo QA final puede cerrar un cambio
- Stop rules claras (contradicción, scope drift, blast-radius)
- Deep-explorer es read-only

### Seguridad — Riesgos

| # | Riesgo | Detalle |
|---|--------|---------|
| S1 | `stage_approval` bypass semántico | Si el design-plan clasifica mal un stage como "non-code", el approval podría ser más ligero |
| S2 | Sin protección contra dirty working tree | La evaluación de "conflicto material" es subjetiva de la IA |
| S3 | Sin whitelist de paths | El executor no tiene límites explícitos sobre qué archivos puede tocar más allá del scope aprobado |

---

## Parte 6: Robustez del Flujo

| # | Problema | Impacto |
|---|----------|---------|
| E1 | Sin rollback si un skill falla mid-write | Archivos parcialmente modificados sin recovery |
| E2 | `state.yaml` corrupto no tiene fallback | Flujo completo se detiene, sin reconstrucción desde artefactos |
| E3 | Sin state machine formal de transiciones | Un agente podría saltar de `draft` a `implementing` sin pasar por `planning` |
| E4 | Múltiples cambios simultáneos no contemplados | Si hay 2+ cambios no-completados, se bloquea |
| E5 | `macro-plan.md` sin validación de existencia condicional | Se podría crear en un flujo `continue-lite` donde no corresponde |

---

## Parte 7: Referencias Obsoletas (User-Preferences)

El sistema de preferencias fue eliminado correctamente de los archivos core, pero persisten restos:

| Archivo | Problema | Acción requerida |
|---|---|---|
| `USER-GUIDE.md` L16, L140, L151-191 | Sección 5.1 completa documenta feature eliminado | Eliminar sección |
| `USER_GUIDE_ES.md` L136, L146 | Referencias a `user-prefs.yaml` y schema | Limpiar |
| `orchestrator/SDDL-ORCHESTRATOR-temp.md` L28, L94, L124-148, L411, L470 | Instrucciones extensas sobre user-prefs | Eliminar archivo temporal o limpiarlo |
| `CLAUDE_SDD_LITE_REVIEW.md` | Review anterior que analiza el feature eliminado | Mantener como histórico o eliminar |

**Riesgo:** Un agente que lee USER-GUIDE.md intentará buscar `user-prefs.yaml`, `schemas/user-prefs.schema.yaml`, o `skills/_shared/sddl-user-preferences-contract.md`. Al no encontrarlos, podría intentar crearlos o alucinar su contenido.

---

## RESUMEN EJECUTIVO

### Los 5 Problemas Más Críticos

| # | Problema | Impacto | Esfuerzo de fix |
|---|----------|---------|-----------------|
| 1 | **Evaluación de complejidad sin rúbrica** — el orquestador toma decisiones de routing sin criterios medibles | La IA inventa criterios diferentes cada vez, flujos inconsistentes | Medio — definir tabla de umbrales |
| 2 | **~23K tokens de contratos repetidos** en un flujo completo — cada skill carga los 4 contratos completos | Desperdicio masivo, especialmente en IAs con contexto limitado | Medio — crear contract-lite |
| 3 | **Delegación asume Agent tool** — solo funciona en Claude Code, se rompe en Codex y otros | El sistema es inusable fuera de Claude Code sin workarounds manuales | Alto — rediseñar delegación por plataforma |
| 4 | **`skill-catalog.md` sin template** — la IA genera el archivo desde cero cada vez | Inconsistencia entre ejecuciones, skills downstream pueden no parsear | Bajo — crear template |
| 5 | **Sin fast-track para cambios triviales** — un fix de 1 línea pasa por 4 stages obligatorios | Fricciona adopción, usuario se frustra con ceremonial excesivo | Medio — agregar ruta trivial/quick-fix |

### Estado por Área

| Área | Calificación | Nota |
|------|-------------|------|
| Seguridad | ★★★★☆ | Sólida con gaps menores (bypass semántico, dirty tree) |
| Respeto al usuario | ★★★★☆ | Bueno, pero sin fast-track ni skip paths |
| Retención de contexto | ★★★☆☆ | Buen modelo de persistencia, débil en detección de corrupción |
| Anti-alucinaciones | ★★☆☆☆ | Múltiples puntos donde la IA puede inventar sin guía |
| Eficiencia de tokens | ★★☆☆☆ | ~2,040 tokens redundantes + ~23K en contratos repetidos por flujo |
| Multi-plataforma | ★☆☆☆☆ | Solo funciona correctamente en Claude Code |
| Facilidad de uso | ★★★☆☆ | Buen diseño pero rígido, sin adaptación a complejidad del cambio |

---

## RECOMENDACIONES PRIORIZADAS

### Impacto Alto — Hacer Primero

| # | Recomendación | Tokens ahorrados | Alucinaciones prevenidas |
|---|---|---|---|
| R1 | **Crear contract-lite** (~800 palabras) con reglas críticas fusionadas de los 4 contratos. Skills cargan solo este archivo. | ~15,800/flujo | - |
| R2 | **Agregar rúbrica cuantitativa** en orquestador: tabla con umbrales numéricos para routing (archivos, LOC, riesgo) | - | Elimina A1 |
| R3 | **Crear template de `skill-catalog.md`** con estructura exacta y placeholders | - | Elimina A2 |
| R4 | **Definir estrategia de delegación por plataforma** en orquestador (Agent tool / inline / file-based) | - | Habilita Codex+otros |
| R5 | **Agregar ruta fast-track/trivial** para cambios de ≤2 archivos con scope evidente (colapsa proposal+design en 1 paso) | - | Reduce fricción |
| R6 | **Limpiar referencias stale** — eliminar sección 5.1 de USER-GUIDE, eliminar SDDL-ORCHESTRATOR-temp.md | - | Elimina F |

### Impacto Medio — Siguiente Iteración

| # | Recomendación | Beneficio |
|---|---|---|
| R7 | No cargar README en runtime del orquestador (solo doc humana) | ~1,680 tokens cold start |
| R8 | Carga on-demand de schemas (solo secciones relevantes) | ~700 tokens/invocación |
| R9 | Definir formato de digest (2-3 líneas, estructura fija) | Previene A8, mejora B4 |
| R10 | Agregar hash/timestamp de artefactos en state.yaml y envelopes | Previene B2, B6 |
| R11 | Definir transiciones válidas de estado (state machine formal) | Previene E3 |
| R12 | Hacer lectura de templates de artefactos mandatoria en "Reads" | Previene A6 |

### Impacto Bajo — Cuando se pueda

| # | Recomendación | Beneficio |
|---|---|---|
| R13 | Unificar wrappers con parametrización | Menos mantenimiento |
| R14 | Agregar campo `context_snapshot` en checkpoints | Mejora B1 |
| R15 | Agregar "¿en qué etapa estoy?" como comando del usuario al orquestador | Mejora UX |
| R16 | Cambiar "infer" por "infer and confirm" en init para campos ambiguos | Previene A4 |
| R17 | Definir "reversible" formalmente para el executor | Previene ambigüedad |
| R18 | Agregar fallback de reconstrucción de state.yaml desde artefactos | Previene E2 |

### Recomendaciones Específicas por Plataforma

#### Para Claude Code
- El sistema actual funciona razonablemente bien
- Priorizar: reducción de tokens (R1, R7, R8) y anti-alucinación (R2, R3)
- Aprovechar compactación automática del harness para flujos largos

#### Para Codex
- **Crítico:** Definir modelo de delegación sin Agent tool (R4)
- Comprimir contratos es más urgente (ventana de contexto menor)
- Considerar que las sesiones son más cortas — persistencia entre sesiones es vital
- El wrapper debe indicar "todo inline, persistir estado frecuentemente"

#### Para otros LLMs (GPT, Gemini, modelos locales)
- Implementar "inline mode" donde el orquestador ejecuta skills secuencialmente sin delegación
- Contract-lite es **obligatorio** para modelos con <32K de contexto
- Agregar puntos de persistencia explícitos entre cada stage (para poder resumir en nueva sesión)
- Considerar que no hay compactación automática — el overflow trunca silenciosamente
