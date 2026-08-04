# Documento de Especificación Arquitectónica: `blueprint-harness`

> ⚠️ **SUPERSEDED (2026-08-03)**: este documento es el relevamiento inicial y quedó reemplazado por la spec congelada **`../blueprint-spec.md`** (v1), que incorpora las decisiones D1–D12 registradas en `blueprint-analysis.md`. Se conserva solo como referencia histórica; ante cualquier diferencia, vale la spec v1.

Este documento consolida el relevamiento, diseño y restricciones operativas para la implementación del sistema agéntico de gestión y diseño de producto, denominado `blueprint-harness`.

## 1. Definición y Alcance

### 1.1. Propósito y Límites

El `blueprint-harness` opera exclusivamente en la fase de descubrimiento, ideación y diagnóstico. Actúa como una capa de separación entre el análisis funcional/arquitectónico y la implementación técnica.

- **Alcance:** Formalización de requerimientos, auditoría histórica, triaje de errores y planificación arquitectónica.
    
- **Límites de Ejecución:** Operación estrictamente de solo lectura (Read-Only) sobre el código fuente y el historial de versiones. Prohibición de escritura de código funcional o ejecución de pruebas.
    
- **Autonomía de Entorno:** Capacidad de operar con herramientas CLI avanzadas (ej. `ripgrep`, parsers AST) si están disponibles, con retroceso automático (fallback) a deducción y lectura estándar del LLM en caso de ausencia.
    

### 1.2. Nomenclatura del Sistema

- **Harness:** `blueprint-harness`
    
- **Prefijo de Skills:** `bp-`
    
- **Motor (Lógica):** Directorio oculto `.bp-harness/`
    
- **Espacio de Trabajo (Datos):** Directorio visible `bp-workspace/`
    

## 2. Topología del Sistema

La arquitectura impone una separación estricta entre la lógica inmutable del orquestador y los artefactos mutables del proyecto.

### 2.1. Estructura del Motor (Inmutable)

Plaintext

```
.bp-harness/
├── orchestrator/
│   └── BP-ORCHESTRATOR.agent.md       # Máquina de estados finitos (FSM)
├── skills/
│   ├── bp-init/
│   ├── bp-context-mapper/
│   ├── bp-analyzer/
│   ├── bp-strategist/
│   ├── bp-diff-parser/
│   ├── bp-doc-exporter/
│   ├── bp-handoff/
│   ├── bp-chat-interviewer/
│   └── _shared/                       # Contratos de I/O y envelopes
└── schemas/
    ├── bp-config.schema.yaml
    └── bp-state.schema.yaml
```

### 2.2. Estructura del Workspace y Persistencia (Mutable)

Los artefactos generados se consideran efímeros o de uso interno por defecto. Se asume que el directorio `bp-workspace/` está excluido del control de versiones (`.gitignore`), salvo petición explícita del usuario.

Plaintext

```
bp-workspace/
├── config.yaml                        # Identidad del producto y preferencias
├── state.yaml                         # Memoria operativa de la sesión actual
├── bugs/                              # Reportes de triaje y causa raíz
├── ideas/                             # RFCs, propuestas, análisis de deuda
├── audits/                            # Informes de consultas al repositorio
└── templates/                         # Plantillas Markdown vacías para exportación
```

## 3. Contratos y Estado

### 3.1. Configuración Global (`config.yaml`)

Define el contexto macro del proyecto. Incluye el dominio de negocio, glosario de términos, nivel de rigor para la validación de ideas y preferencias de idioma.

### 3.2. Memoria Operativa (`state.yaml`)

Actúa como el único mecanismo de transferencia de contexto entre el orquestador y las skills. Almacena:

- Objetivo actual (`bug-fix`, `requirements-refinement`, `code-consultation`).
    
- Resúmenes de decisiones tomadas (máximo 2 líneas por decisión).
    
- Punteros a rutas de archivos clave identificados en el repositorio.
    
- Punteros a artefactos previamente aprobados en `bp-workspace/ideas/` para mantener consistencia.
    

### 3.3. Contratos de Intercomunicación

Todas las skills retornan un objeto estandarizado (`envelope`) que contiene:

- `status`: Éxito, falla, requiere decisión.
    
- `executive_summary`: Resumen de la acción realizada (para el LLM).
    
- `user_message`: Mensaje a mostrar al usuario (opcional).
    
- `state_mutations`: Actualizaciones a aplicar en `state.yaml`.
    

## 4. Catálogo de Skills Modulares

Las skills operan por capacidad, no por flujo.

1. **`bp-init`**: Verifica dependencias del entorno, inicializa `bp-workspace/` e inyecta `.gitignore`.
    
2. **`bp-context-mapper`**: Ejecuta escaneo superficial de topología. Busca nombres de archivos, funciones y dependencias estructurales. **Obligatorio:** Indexa por defecto los documentos persistidos en `bp-workspace/` para evitar colisiones arquitectónicas con RFCs pasados.
    
3. **`bp-analyzer`**: Ejecuta inspección profunda. Procesa lógica interna de módulos, trazas de logs y árboles sintácticos.
    
4. **`bp-strategist`**: Motor lógico. Modela viabilidad, compara trade-offs técnicos y de negocio, y propone alternativas arquitectónicas de alto nivel (C4 Model).
    
5. **`bp-diff-parser`**: Pre-procesador de metadatos de Git. Aísla firmas de métodos y archivos modificados entre commits/PRs para evitar el consumo masivo de tokens.
    
6. **`bp-doc-exporter`**: Recibe un template vacío de `bp-workspace/templates/` y lo completa semánticamente utilizando el LLM, basándose en la información acumulada en `state.yaml`.
    
7. **`bp-handoff`**: Traduce un artefacto aprobado (RFC o Bug Report) al formato semilla (`proposal.md`) requerido por herramientas de desarrollo (ej. `sdd-lite`), ubicándolo en el directorio destino.
    
8. **`bp-chat-interviewer`**: Skill inteligente de interacción.
    
    - **Lógica de detección:** Evalúa si el usuario proporcionó información completa, si muestra dudas, o si requiere investigación previa antes de confirmar.
        
    - **Ciclo de vida (Modelo Ping-Pong):** Formula la pregunta, registra la intención de espera en `state.yaml` y devuelve el control al orquestador. _(Nota: Arquitectura sujeta a reevaluación continua para optimizar latencia vs. consumo de tokens)._
        

## 5. Máquina de Estados del Orquestador (`BP-ORCHESTRATOR`)

El orquestador coordina transiciones basadas en intenciones, restringido por _guardrails_ estrictos.

### 5.1. Restricciones Operativas (Guardrails)

- **Bloqueo de Mutación:** Prohibición absoluta de comandos de escritura sobre código fuente.
    
- **Restricción de Aislamiento:** Ejecución máxima de una skill por turno de inferencia.
    
- **Prevención de Deriva:** Forzado de purga de contexto de chat tras 20 turnos, consolidando acuerdos en `state.yaml`.
    

### 5.2. Flujo F1: Triaje de Bugs (`bug-fix`)

Orientado a aislar fallos sin comprometer desarrollo.

1. Entrevista diagnóstica (`bp-chat-interviewer`).
    
2. Mapeo de superficie afectada (`bp-context-mapper`).
    
3. Validación de hipótesis y causa raíz (`bp-analyzer`).
    
4. Evaluación de alternativas de resolución (`bp-strategist`).
    
5. Cierre opcional en `bp-doc-exporter`.
    

### 5.3. Flujo F2: Refinamiento de Requerimientos (`requirements-refinement`)

Unifica el análisis de nuevas funcionalidades y refactorización de deuda técnica.

1. Validación de alcance y objetivo de negocio (`bp-chat-interviewer`).
    
2. Contraste contra código actual y RFCs previos (`bp-context-mapper`).
    
3. Propuesta arquitectónica y evaluación de riesgos (`bp-strategist`).
    
4. Cierre formal y documentación (`bp-doc-exporter`).
    

### 5.4. Flujo F3: Consulta de Código (`code-consultation`)

Modo oráculo para resolución de dudas técnicas ágiles.

1. Ingesta de duda puntual.
    
2. Pre-procesado de historial si involucra versiones pasadas (`bp-diff-parser`).
    
3. Lectura de lógica específica (`bp-analyzer`).
    
4. Respuesta inmediata _inline_ en el chat.
    

## 6. Plantillas y Entregables

Los documentos finales son generados por `bp-doc-exporter` mediante inyección semántica (LLM) sobre estructuras predefinidas.

- `rfc-template.md`: Contexto, alternativas evaluadas, riesgos, arquitectura propuesta, casos fuera de alcance.
    
- `bug-report-template.md`: Síntomas, reproducibilidad, línea de código/módulo afectado, hipótesis de causa raíz, recomendaciones de solución.
    
- `audit-template.md`: Hashes de commits involucrados, estado de despliegue, resumen de cambios en lógica de negocio.
    

## 7. Punto de Integración (Handoff)

Transición unidireccional hacia la etapa de ejecución.

- Condición de disparo: Aprobación explícita del usuario de un RFC o Reporte de Bug.
    
- Acción: Invocación de `bp-handoff`.
    
- Resultado: Creación de `./sdd-lite/openspec/changes/{slug}/proposal.md`.
    
- Cierre: El `blueprint-harness` notifica al usuario que el paquete está listo para su ingesta por el orquestador de desarrollo.
    

## 8. Ejemplos de Flujos de Ejecución

### 8.1. Diagrama: Flujo de Refinamiento de Requerimientos (F2)

Fragmento de código

```
sequenceDiagram
    participant U as Usuario
    participant O as Orquestador (FSM)
    participant SK as Skills Modulares
    participant ST as state.yaml

    U->>O: "Quiero agregar caché a las consultas"
    O->>ST: Registra intención: requirements-refinement
    O->>SK: bp-chat-interviewer (Validar requerimiento)
    SK-->>O: Faltan detalles (Redis vs Memoria)
    O->>U: "¿Prefieres caché distribuida o en memoria local?"
    U->>O: "Redis, el sistema va a escalar"
    O->>ST: Guarda decisión: Redis
    O->>SK: bp-context-mapper (Buscar queries actuales y RFCs)
    SK-->>O: Mapeo completado (archivos afectados detectados)
    O->>SK: bp-strategist (Diseñar alternativas)
    SK-->>O: Alternativas generadas
    O->>U: Presenta Arquitectura A y B.
    U->>O: "Aprobar Arquitectura A"
    O->>ST: Actualiza estado a: Aprobado
    O->>SK: bp-doc-exporter (Renderizar RFC)
    SK-->>ST: Guarda ruta rfc-cache.md
    O->>SK: bp-handoff (Opcional: Crear semilla SDD)
    SK-->>O: proposal.md creado
    O->>U: "RFC generado y paquete transferido a desarrollo."
```

### 8.2. Diagrama: Flujo de Triaje de Bugs (F1)

Fragmento de código

```
sequenceDiagram
    participant U as Usuario
    participant O as Orquestador (FSM)
    participant SK as Skills Modulares
    
    U->>O: "El login con Google falla con error 500"
    O->>SK: bp-context-mapper (Localizar módulo Auth)
    SK-->>O: auth.controller.ts localizado
    O->>SK: bp-analyzer (Leer lógica profunda / logs recientes)
    SK-->>O: Detecta null pointer en validación de token
    O->>SK: bp-strategist (Evaluar impacto de parche)
    SK-->>O: Propone Hotfix rápido vs Refactor de validación
    O->>U: "Causa encontrada: Token nulo. Opciones: Parche condicional o refactor de middleware."
    U->>O: "Solo parche, exporta el bug"
    O->>SK: bp-doc-exporter (Generar bug-report.md)
    SK-->>O: Reporte generado
    O->>U: "Bug documentado en bp-workspace/bugs/login-500.md"
```