# SDD-Lite Review -- Relevamiento Completo

> Fecha: 2026-05-12
> Scope: Análisis de cambios staged + estado general del sistema
> Método: Lectura completa de todos los archivos del paquete (3,710 líneas)

---

## Parte 1: Análisis de Cambios Recientes (Staged)

### Tema principal: Sistema de Preferencias de Usuario

Todos los cambios giran alrededor de un único feature: permitir que cada desarrollador personalice cómo sdd-lite interactúa con él, sin debilitar la seguridad del flujo.

### Archivos modificados

| Archivo | Tipo de cambio | Impacto |
|---------|---------------|---------|
| `README.md` | Sección nueva "Personal Preferences" (~16 líneas) | Documental |
| `SDDL-ORCHESTRATOR.md` | Lectura de prefs + sección "User Preferences" + "Preference Capture" (~50 líneas) | **Alto** - define cómo el orquestador consume y propaga preferencias |
| `config.schema.yaml` | Campo `user_prefs_path` en `paths` (~3 líneas) | Esquema |
| `sddl-flow-contract.md` | `user-prefs.yaml` en escalera de contexto + regla de respeto (~5 líneas) | Contrato |
| `sddl-persistence-contract.md` | `user-prefs.yaml` en tabla de artefactos globales (~4 líneas) | Contrato |
| `sddl-project-standards-contract.md` | Sección "Relation to user preferences" (~12 líneas) | Contrato |
| `sddl-user-interaction-contract.md` | Nuevo checkpoint `preference_capture` + tuning via knobs (~40 líneas) | Contrato |
| `sddl-deep-explorer/SKILL.md` | Lectura de prefs + respeto de knobs (~3 líneas) | Menor |
| `sddl-design-plan/SKILL.md` | Lectura de prefs + respeto de knobs (~3 líneas) | Menor |
| `sddl-executor/SKILL.md` | Lectura de prefs + respeto de knobs (~3 líneas) | Menor |
| `sddl-init/SKILL.md` | Step 11 completo para configuración interactiva de prefs (~70 líneas) | **Alto** |
| `sddl-proposal-spec/SKILL.md` | Lectura de prefs + respeto de knobs (~3 líneas) | Menor |
| `sddl-qa-review/SKILL.md` | Lectura de prefs + respeto de knobs (~3 líneas) | Menor |
| `templates/bootstrap/config.yaml` | Campo `user_prefs_path` (~1 línea) | Template |
| `claude-orchestrator.md` | `user-prefs.yaml` en lista de lectura + bloque handoff (~3 líneas) | Wrapper |
| `codex-orchestrator.md` | Cambio idéntico al anterior (~3 líneas) | Wrapper |

### Archivos nuevos

| Archivo | Líneas | Propósito |
|---------|--------|-----------|
| `schemas/user-prefs.schema.yaml` | 208 | Schema JSON completo para `user-prefs.yaml` con presets, knobs, captured_decisions, free_rules |
| `skills/_shared/sddl-user-preferences-contract.md` | 201 | Contrato central del feature: knobs, mapeo por stage, flujo de captura, invariantes |

### Patrones detectados en los cambios

1. **Propagación sistemática.** Cada skill, contrato, wrapper y template fue actualizado. Aplicación disciplinada del cambio a través de toda la superficie.

2. **Invariantes defensivas.** Cada punto de integración repite explícitamente que las preferencias "never bypass stage_approval, escalation triggers, persisted-artifact language, or write-scope invariants". Intencional pero excesivamente redundante.

3. **Opcionalidad total.** La ausencia de `user-prefs.yaml` es válida en todos los puntos; el sistema default es `preset: balanced`.

4. **Captura adaptativa.** Mecanismo de aprendizaje supervisado donde el orquestador puede proponer persistir preferencias observadas, pero nunca auto-escribe.

### Problemas detectados en los cambios

| # | Problema | Severidad | Detalle |
|---|----------|-----------|---------|
| C1 | Repetición excesiva de invariantes | Media | La misma frase de "no bypass" aparece en ~10 archivos. Si las invariantes cambian, hay que actualizar todos manualmente. Debería centralizarse en una sola referencia al contrato. |
| C2 | `pending_proposals[]` sin flujo claro | Media | El schema define `pending_proposals` con patrón `pp-NNN`, pero el contrato y el flujo de captura solo mencionan `captured_decisions` y `free_rules` como destinos. No hay instrucciones de cuándo se escribe a `pending_proposals`. |
| C3 | Wrappers idénticos | Baja | `claude-orchestrator.md` y `codex-orchestrator.md` recibieron exactamente el mismo cambio. Si son idénticos, deberían ser un solo archivo parametrizado. |
| C4 | `preset: null` semántica ambigua | Baja | El schema usa `oneOf` con `type: "null"` para indicar custom. Algunos validadores YAML tratan `null` y ausencia de key diferente. |
| C5 | Paths hardcodeados en sddl-init | Baja | Step 11 referencia paths como `<package-root>/skills/_shared/sddl-user-preferences-contract.md`. Si la estructura cambia, se rompen silenciosamente. |

### Impacto en tokens

- **Operación normal:** +5-15 líneas por stage en el envelope (knobs filtrados + free rules aplicables). Impacto bajo.
- **Durante init:** +~400 tokens por carga del contrato completo + schema. Impacto moderado pero justificado.
- **Carga inicial del orquestador:** +~100 líneas distribuidas en contratos modificados. Impacto menor.

---

## Parte 2: Análisis del SDD Completo (Estado Actual)

### A. Optimización de Tokens

**Resultado: NECESITA MEJORA**

El problema estructural más serio del paquete es la redundancia entre capas:

1. **Redundancia cross-file masiva.** Las "delegation thresholds" (inline 1-3 files, delegate 4+) aparecen en: README, orchestrator, flow-contract, ambos wrappers, y improvements doc. Son al menos 5 repeticiones del mismo bloque.

2. **Runtime operating rules duplicadas.** Cada SKILL.md contiene un bloque "Runtime operating rules" esencialmente idéntico (~5-8 líneas × 6 skills = ~40 líneas desperdiciadas). Debería ser un header compartido inyectado.

3. **Preferencias de usuario en ~12 lugares.** La frase "absence equals preset: balanced" aparece literalmente en al menos 10 archivos. El contrato de user-preferences tiene ~209 líneas, pero una fracción significativa se re-explica en otros archivos.

4. **Skills demasiado extensos para subagentes.** Un executor sub-agent consume ~12.4k tokens antes de leer un solo archivo del repo (según el propio SDD-LIET-IMPROVMENTS.md). Se podrían reducir a ~60% extrayendo reglas comunes a un header compartido.

5. **Schemas pesados.** 882 líneas solo en schemas (config: 325, state: 349, user-prefs: 208). Los schemas son necesarios pero no necesitan cargarse completos en cada invocación — solo la parte relevante al stage actual.

### B. Uso de Subagentes

**Resultado: DISEÑO CORRECTO, EJECUCIÓN PARCIAL**

- **Modelo thin-orchestrator + fresh workers:** bien definido en teoría. Las reglas de delegación son claras.
- **Sin paralelización.** Todo es secuencial: proposal -> design -> executor -> qa. No se contempla que stages del executor sin dependencias se preparen en paralelo, ni que deep-explorer corra en paralelo con la recuperación de contexto.
- **Launch stack pesado.** Un subagente necesita cargar: SKILL.md + contratos referenciados + skill-catalog + config + state + artefactos. El diseño dice "inject compact standards" pero no hay mecanismo concreto de resolución.
- **Executor limitado a 1 stage por invocación.** Seguro pero ineficiente para stages triviales y secuenciales sin riesgo.

### C. Respeto al Usuario

**Resultado: BIEN DISEÑADO**

Este es probablemente el aspecto mejor logrado del sistema:

- `stage_approval` mandatorio para stages que tocan código — no bypasseable por preferencias.
- Sin side effects de git: sin commits, stashes, rebases implícitos.
- Checkpoints bien tipados (9 tipos) con contenido mínimo definido.
- Stop conditions claras: contradicción, scope drift, blast-radius expansion.
- Sistema de preferencias completo con 3 presets + 7 knobs individuales + free_rules.
- Mecanismo de captura adaptativa que propone pero nunca auto-escribe.

**Gaps menores:**
- No hay knob para granularidad de artefactos (verbose vs minimal artifacts).
- No hay preferencia "skip proposal-spec for trivial bug fixes" (útil en modo autonomous).
- La definición de "reversible" en preset `autonomous` (execute-if-reversible) no está formalizada.

### D. Verbosidad y Comunicación

**Resultado: CONFIGURACIÓN EXISTE, IMPLEMENTACIÓN MEJOREABLE**

- `communication.explanation_depth` (brief/standard/detailed) y `communication.style` (technical-direct/learning/non-technical) cubren las necesidades principales.
- Regla clara: "ask only when the answer materially changes scope, risk, direction, quality, or the chosen execution path".
- Lista explícita de "avoided patterns" (no preguntar hechos del repo, no micro-confirmaciones).
- **Problema indirecto:** un agente que lee 12k tokens de instrucciones antes de empezar genera más meta-comunicación que uno que lee 4k. La verbosidad del sistema contamina la verbosidad de las respuestas.

### E. Facilidad de Uso y Dinamismo

**Resultado: BUENO CON MEJORAS POSIBLES**

- **Init:** 12 pasos detallados pero razonables. Detección automática de AI, preset picker de 4 opciones.
- **USER-GUIDE.md:** el mejor documento del paquete — claro, con ejemplos, sin repetición.
- **Pregunta potencialmente obvia en init:** la selección de AI cuando solo hay una detectada (pregunta con [y/n] sabiendo la respuesta).
- **Memoria de contexto:** bien manejado con la regla "persisted state beats chat memory".
- **Resume robusto:** desde state.yaml con cadena de prioridad (unresolved checkpoint -> missing artifact -> next approved stage -> stop state).
- **Seguridad:** excelente. Sin commits implícitos, deep-explorer es read-only, QA no cierra cambios.

### F. Calidad como Agente Profesional

**Resultado: SÓLIDO**

- El flujo proposal -> design -> execute -> review simula bien el workflow de un equipo profesional.
- Separación entre formalización funcional y técnica es valiosa.
- Transiciones de estado formalizadas en el state schema.
- Stop conditions del executor concretas con ejemplos (contradicción, scope drift, blast-radius).
- Escalation a sdd-v2 como válvula de escape bien diseñada.
- **Documentación excesiva:** la calidad individual es alta, pero la cantidad total trabaja en contra de la usabilidad.

### G. Problemas Concretos Encontrados

| # | Problema | Severidad | Detalle |
|---|----------|-----------|---------|
| G1 | Wrappers idénticos | Media | `claude-orchestrator.md` y `codex-orchestrator.md` son idénticos carácter por carácter. No hay diferenciación real para Codex (que no soporta subagentes igual que Claude Code). Identificado en improvements doc pero no resuelto. |
| G2 | Package layout en README desactualizado | Media | No incluye `user-prefs.schema.yaml` ni `user-prefs.yaml` en el layout. |
| G3 | `generated_by` forzado a `sddl-init` en schema user-prefs | Baja | El contrato dice que el orchestrator puede actualizar el archivo, pero no hay campo `last_updated_by`. |
| G4 | Referencia circular de standards | Media | Si el orchestrator no inyecta `skill-catalog.md`, cada skill lo lee completo, anulando el beneficio de delegación. No hay fallback eficiente documentado. |
| G5 | Status mapping inconsistente | Media | El flow contract define `status: success | partial | blocked`. El state schema define `stageState.status: pending | in_progress | completed | blocked | skipped`. No hay mapping formal entre ambos. |
| G6 | `config.schema.yaml`: `user_prefs_path` no es required | Baja | Está bajo `paths` (que sí es required), pero el campo en sí es opcional. sddl-init dice que debe incluirlo. Inconsistencia menor. |
| G7 | Typo en nombre de archivo | Baja | `SDD-LIET-IMPROVMENTS.md` debería ser `SDD-LITE-IMPROVEMENTS.md`. Si algún skill referencia por nombre, fallaría. |
| G8 | Artifact templates posiblemente inexistentes | Media | Los skills referencian `templates/artifacts/proposal-spec.md`, etc. Si no existen, los skills no tienen shape guidance real. |
| G9 | Sin versionado formal de schemas | Baja | `config.schema.yaml` no tiene `$id` ni versión semántica. Incompatibilidad silenciosa ante cambios. |
| G10 | Re-ejecución de sddl-init | Baja | Correr init dos veces podría duplicar wrapper blocks si la detección de `<!-- sdd-lite:start -->` falla (espacios extra). |
| G11 | Fricción excesiva en cambios grandes | Media | Un cambio con 8+ stages del executor generaría aprobación obligatoria por cada uno, incluso en modo autonomous (stage_approval no se bypasea). |
| G12 | `communication.language` limitado a `es`/`en` | Baja | Hardcodeado en schema. Decisión consciente pero limitante para otros contextos. |

---

## Parte 3: Resumen y Recomendaciones

### Resumen General

El sistema sdd-lite está bien diseñado conceptualmente. El flujo de trabajo es profesional, la seguridad es sólida, y el respeto al usuario es el punto más fuerte. Los cambios staged (sistema de preferencias) son una adición valiosa y bien propagada.

Los problemas principales son de **eficiencia operativa**, no de diseño:

| Área | Estado | Prioridad de mejora |
|------|--------|-------------------|
| Seguridad y respeto al usuario | Excelente | - |
| Flujo de trabajo profesional | Sólido | - |
| Sistema de preferencias | Bien diseñado | Baja |
| Documentación (calidad) | Alta | - |
| Redundancia / tokens | Excesiva | **Alta** |
| Uso de subagentes | Parcial | **Alta** |
| Verbosidad del sistema | Mejoreable | Media |
| Facilidad de uso | Buena | Baja |

### Recomendaciones Puntuales

#### Alta Prioridad

1. **Extraer runtime operating rules a un header compartido.**
   - Crear `skills/_shared/sddl-runtime-header.md` (~10 líneas) con las reglas comunes.
   - En cada SKILL.md reemplazar el bloque repetido por una referencia: "Apply rules from `sddl-runtime-header.md`".
   - Ahorro estimado: ~40 líneas repetidas → ~10 líneas compartidas.

2. **Reducir redundancia de invariantes de preferencias.**
   - Mantener las invariantes solo en `sddl-user-preferences-contract.md`.
   - En todos los demás archivos, reemplazar la frase repetida por: "Preference invariants per `sddl-user-preferences-contract.md` apply."
   - Ahorro estimado: ~30 repeticiones → 1 fuente + ~12 referencias de una línea.

3. **Comprimir SKILL.md de cada skill.**
   - Mover contexto defensivo genérico a contratos compartidos.
   - Reducir cada SKILL.md a: propósito, inputs/outputs, pasos operativos, y referencia a contratos.
   - Objetivo: reducir de ~250-300 líneas a ~150-180 líneas por skill.
   - Impacto: ~600 tokens menos por invocación de subagente.

4. **Unificar wrappers o parametrizarlos.**
   - Fusionar `claude-orchestrator.md` y `codex-orchestrator.md` en un solo archivo con variables condicionales, o documentar las diferencias reales que justifican dos archivos separados.

5. **Definir mapping formal de status.**
   - Crear tabla explícita en el flow contract: `success → completed`, `partial → completed (with notes)`, `blocked → blocked`.

#### Media Prioridad

6. **Agregar paralelización condicional en el executor.**
   - Permitir que stages sin dependencias se ejecuten en paralelo cuando el usuario está en modo `autonomous` o `balanced`.
   - Mantener secuencial para modo `cautious`.

7. **Implementar inyección eficiente de standards.**
   - El orchestrator debe resolver `skill-catalog.md` + `project-standards` una sola vez y pasar el resultado compacto en el envelope, no dejar que cada skill lo resuelva independientemente.

8. **Resolver `pending_proposals[]`.**
   - Documentar el flujo completo: cuándo se escribe, cuándo pasa a `captured_decisions`, quién lo hace.
   - O eliminar del schema si no tiene uso definido.

9. **Actualizar package layout en README.**
   - Agregar `schemas/user-prefs.schema.yaml` y `skills/_shared/sddl-user-preferences-contract.md`.
   - Agregar `user-prefs.yaml` al runtime layout.

10. **Definir "reversible" formalmente.**
    - Agregar criterios explícitos de qué constituye una acción reversible en el contexto del executor (ej: crear archivo = reversible, modificar archivo existente = requiere aprobación, eliminar = siempre aprobación).

#### Baja Prioridad

11. **Agregar campo `last_updated_by` al schema de user-prefs.**
    - Para distinguir escrituras del init vs del orchestrator.

12. **Corregir typo en `SDD-LIET-IMPROVMENTS.md`.**
    - Renombrar a `SDD-LITE-IMPROVEMENTS.md`.

13. **Agregar `$id` y versión a schemas.**
    - Permitir detección de incompatibilidad formal.

14. **Considerar skip de proposal-spec para fixes triviales.**
    - En modo `autonomous`, permitir que bug fixes de 1-2 archivos salten directamente a design-plan.

15. **Fusionar contratos complementarios.**
    - Evaluar si `flow-contract` + `persistence-contract` pueden ser uno solo.
    - Evaluar si `user-interaction-contract` + `user-preferences-contract` pueden ser uno solo.
    - Ahorro potencial: de 5 contratos a 3, reduciendo carga de contexto.

---

### Conclusión

El SDD-Lite es un sistema bien concebido con buen diseño de seguridad y respeto al usuario. Los cambios recientes (preferencias de usuario) son una adición valiosa, bien propagada pero con redundancia excesiva. Las mejoras más impactantes están en **reducir tokens** (redundancia entre archivos) y **mejorar el uso de subagentes** (paralelización, launch stack más liviano). Estas mejoras no requieren cambios de arquitectura — son optimizaciones de contenido y organización dentro del diseño existente.
