# SnowFlow Session Log

**Last Updated:** 2025-11-28 (Stage 2 Started)

> **IF AI LOSES MEMORY, READ THIS FILE FIRST.**

---

## Project Summary

**SnowFlow** = Low-code drag-and-drop UI for building Snowflake Intelligence workflows.

**Tech Stack:**
- Frontend: React 18 + Vite + React Flow + Zustand
- Backend: FastAPI + LangGraph  
- AI/Data: Snowflake Cortex (connected to TFUIBWS-RA85515)

**Key Files:**
- `ARCHITECTURE.md` - System design
- `DESIGN_SYSTEM.md` - UI colors/fonts (LOCKED - Snowflake white/blue style)
- `ROADMAP.md` - Full 6-stage product plan

---

## ✅ COMPLETED (Stages 1 & 2)

### Stage 1: Foundation ✅
- [x] React Flow canvas with drag & drop
- [x] Zustand store for nodes/edges/selection state
- [x] Save/Load workflows to JSON (backend storage)
- [x] Snowflake client (`backend/snowflake_client.py`)
- [x] LangGraph execution (`backend/graph_builder.py`)
- [x] Results panel for agent responses
- [x] Demo database: `SNOWFLOW_DEV.DEMO` with 3 sample tables

### Stage 2: Component Library ✅
- [x] **Data Source node** - 1:1 with Snowflake (columns, filter, orderBy, limit)
- [x] **Semantic Model node** - YAML location, business context definition
- [x] **Cortex Agent node** - All COMPLETE() params + Tools (Analyst, SQL, Search)
- [x] **Cortex Function nodes** - Summarize, Sentiment, Translate
- [x] **Control Flow** - Condition node with branching
- [x] **External Agent** - REST API / MCP integration
- [x] **Output node** - Display results

### UI/UX ✅
- [x] **4-lane guided canvas** matching Snowflake Intelligence architecture:
  1. Data Sources
  2. Semantic Model  
  3. Cortex Agent (with built-in Analyst tool)
  4. Output
- [x] **Analyst as Agent Tool** - Not a separate node, configured in Agent properties
- [x] **Collapsible sidebar sections** - Clean, Snowflake-style
- [x] **Compact design** - Narrow sidebar (220px), small icons
- [x] **Connection validation** - Rules enforced, hints on connect
- [x] **Toast notifications** - Subtle hints/errors in bottom right
- [x] **Property panels** - Full 1:1 Snowflake parameter mapping for each node

---

## Snowflake Connection

```
Account: TFUIBWS-RA85515
User: AASTHANA  
Password: (in backend/.env)
Database: SNOWFLOW_DEV
Schema: DEMO
Warehouse: COMPUTE_WH
Tables: SALES_DATA (15 rows), CUSTOMER_FEEDBACK (10 rows), SUPPORT_TICKETS (8 rows)
```

Credentials stored in `backend/.env`

---

## File Structure

```
snowflow/
├── ARCHITECTURE.md
├── DESIGN_SYSTEM.md        # UI colors (LOCKED - don't change)
├── ROADMAP.md              # 6-stage plan
├── SESSION_LOG.md          # THIS FILE - read first!
│
├── frontend/
│   ├── src/
│   │   ├── App.tsx         # Main app with canvas, sidebar, panels
│   │   ├── store.ts        # Zustand state (nodes, edges, selection)
│   │   └── nodes/          # Custom node components
│   │       ├── SnowflakeSourceNode.tsx
│   │       ├── SemanticModelNode.tsx
│   │       ├── AgentNode.tsx     # Includes Analyst as a tool
│   │       ├── CortexNode.tsx
│   │       ├── ConditionNode.tsx
│   │       ├── ExternalAgentNode.tsx
│   │       └── OutputNode.tsx
│   └── package.json
│
├── backend/
│   ├── main.py             # FastAPI routes
│   ├── graph_builder.py    # LangGraph compilation & execution
│   ├── snowflake_client.py # Snowflake connection singleton
│   ├── .env                # Credentials (gitignored)
│   ├── requirements.txt
│   └── saved_workflows/    # JSON workflow storage
```

---

## How to Run

**Backend:**
```bash
cd /Users/abhineetasthana/snowflow/backend
source venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8000
```

**Frontend:**
```bash
cd /Users/abhineetasthana/snowflow/frontend
npm run dev
```

**Open:** http://localhost:5173

---

## Snowflake Intelligence Architecture (Correct Order)

```
Data Sources → Semantic Model → Cortex Agent → Output
     ↓              ↓               ↓           ↓
  Tables       YAML defines    AI reasoning  Display
  Views        business         with TOOLS   results
               context
```

**IMPORTANT:** Tools are configured inside Cortex Agent, not as separate nodes.
The Agent has a "Tools" section:
- 📊 **Cortex Analyst** - structured data (NL → SQL via Semantic Model)
- 🔍 **Cortex Search** - unstructured data (vector search on documents)
- 🔌 **MCP** - external tools via Model Context Protocol
- ⚡ **SQL Executor** - direct SQL queries
- 🌐 **Web Search** - search the web

---

## Connection Rules (Final)

Valid connections (source → target):
- `snowflakeSource` → `semanticModel`, `cortex` (direct to cortex shows warning)
- `semanticModel` → `agent`
- `agent` → `externalAgent`, `output`, `cortex`, `condition`
- `cortex` → `agent`, `output`, `cortex`, `condition`
- `condition` → `agent`, `output`, `cortex`, `externalAgent`
- `externalAgent` → `agent`, `output`
- `output` → NOTHING (terminal)

**Primary Flow (Recommended):**
```
Data Source → Semantic Model → Agent → Output
```

**Shortcut Flow (With Warning):**
```
Data Source → Cortex → Output
```
⚠️ Shows warning at runtime: "Running without Semantic Model - LLM accuracy may be impacted"

**Branching:** Agent → Condition is allowed for decision branching.
**Loops:** Allowed (agent ↔ cortex, agent ↔ externalAgent) for iterative patterns.
**Multiple Sources:** Multiple Data Sources can feed one Semantic Model (valid per Snowflake YAML spec).

Toast notifications show hints on valid connections and errors on invalid ones.

---

## 4-Lane Canvas (Updated)

The canvas now has 4 lanes instead of 5:
1. **Data Sources** - Tables, Views
2. **Semantic Model** - Business context (YAML)
3. **Cortex Agent** - AI orchestrator (with Analyst, SQL, Search tools)
4. **Output** - Results & actions

---

## Stage 3: Demo-Ready Features

### Completed ✅
- [x] **Data Catalog** - Browse IT-approved data sources with status (Ready/Pending/No Access)
- [x] **Templates** - Pre-built patterns (Feedback Analyzer, Sales Q&A Bot, Document Search, etc.)
- [x] **Live Preview** - Test agent with simulated chat while building
- [x] **Sidebar Tabs** - Switch between Components, Catalog, and Templates
- [x] **One-click Template Deploy** - Load full workflow from template

### Custom Tool Creator ✅
- [x] Full modal UI for creating/editing tools
- [x] Support for SQL, Python, and API tool types
- [x] Parameter definition (name, type, required)
- [x] Tools appear in Agent's property panel
- [x] Backend execution for SQL tools

### Snowflake Integration (Real Data) ✅
- [x] Data Catalog pulls real tables/views from Snowflake INFORMATION_SCHEMA
- [x] Custom Tools persist to SNOWFLOW_DEV.DEMO.SNOWFLOW_TOOLS table
- [x] Templates persist to SNOWFLOW_DEV.DEMO.SNOWFLOW_TEMPLATES table
- [x] "Save as Template" option in save modal
- [x] Audit logging to SNOWFLOW_DEV.DEMO.SNOWFLOW_AUDIT_LOG
- [x] Setup script: `backend/run_setup_tables.py`

### Snowflake Tables Created
```sql
SNOWFLOW_DEV.DEMO.SNOWFLOW_TOOLS       -- Custom tool definitions
SNOWFLOW_DEV.DEMO.SNOWFLOW_TEMPLATES   -- Workflow templates
SNOWFLOW_DEV.DEMO.SNOWFLOW_WORKFLOWS   -- Saved workflows
SNOWFLOW_DEV.DEMO.SNOWFLOW_AUDIT_LOG   -- Governance audit trail
SNOWFLOW_DEV.DEMO.SNOWFLOW_DATA_SOURCES-- Data catalog registry
```

### Export/Import ✅
- [x] Export workflow as JSON file
- [x] Import workflow from JSON file
- [x] Download button in toolbar
- [x] Upload button with file picker

### Multi-Agent Orchestration (Stage 4) ✅
- [x] Router Node - intent-based routing to different agents
- [x] Supervisor Node - delegates to child agents, aggregates results
- [x] Agent-to-agent connections (handoff)
- [x] Updated connection validation rules
- [x] New templates: Multi-Agent Support Router, Supervisor Analytics
- [x] **PROPER FIX (2025-11-28):** Router now uses LangGraph conditional_edges
  - Router classifies intent using LLM (mistral-large2)
  - Routes to exactly ONE agent based on classification
  - No more "multiple nodes writing to same state" error
  - Uses Annotated types with operator.add for safe state accumulation

### External Agent Integration (Stage 4+) ✅
- [x] **Enhanced ExternalAgentNode** with presets for major providers:
  - Microsoft Copilot (M365, Graph API)
  - OpenAI GPT-4
  - Salesforce Einstein
  - ServiceNow
- [x] **Real HTTP calls** in backend via httpx
- [x] **Simulated fallback** when endpoint not reachable (for demo)
- [x] **Hybrid template:** "Copilot + Snowflake" routing
- [x] Router can now route to external agents (not just Snowflake agents)
- [x] Connection rules updated: router → externalAgent allowed

### Admin Dashboard (Stage 5) ✅
- [x] Control Tower modal with stats
- [x] Overview tab with metrics (workflows, agents, tools, usage)
- [x] Audit log viewer
- [x] Agents & Settings tabs (placeholder)
- [x] Shield button in sidebar

### Agent Handoff Visualization ✅
- [x] Animated edges for agent-to-agent connections
- [x] Color-coded connections (purple for handoff, amber for supervisor)
- [x] Edge labels ("🔄 Handoff", "📋 Delegate", "→ Route")

### Files Added
- `frontend/src/components/DataCatalog.tsx`
- `frontend/src/components/Templates.tsx`
- `frontend/src/components/LivePreview.tsx`
- `frontend/src/components/ToolCreator.tsx`
- `backend/setup_snowflow_tables.sql`
- `backend/run_setup_tables.py`

---

## Stage 2 Progress

### Completed ✅
- [x] **Backend: Cortex Search** - `snowflake_client.cortex_search()` method
- [x] **Backend: Cortex Analyst** - `snowflake_client.cortex_analyst()` method
- [x] **Backend: SQL Executor** - `snowflake_client.execute_sql()` method
- [x] **Backend: Semantic Model node** - Handler in graph_builder.py
- [x] **Backend: Agent with tools** - Agent now uses enabled tools (Analyst, Search, SQL)
- [x] **Sidebar search** - Filter components by typing

### MCP Backend ✅
- [x] Created `mcp_client.py` - HTTP client for MCP servers
- [x] Supports: list_tools(), call_tool(), call_tools_batch()
- [x] Integrated into Agent node - calls enabled MCP tools
- [x] Added `httpx` to requirements.txt

### Data Source Nodes Added
- **Table** (blue) - Standard table access
- **View** (cyan) - View access  
- **Dynamic Table** (purple) - With target_lag, warehouse options
- **Stream** (green) - With source_table, append_only, show_initial_rows options

---

## What's Next (Stage 3+)

Per ROADMAP.md:
- [ ] **Stage 3: Agent Builder** - Custom tools, agent testing sandbox
- [ ] **Stage 4: Orchestration** - Multi-agent routing, supervisor patterns
- [ ] **Stage 5: Governance** - Admin dashboard, RBAC, policies
- [ ] **Stage 6: Production** - Versioning, scheduling, monitoring
- [ ] **GitHub Integration** - User requested for later
- [ ] **Snowflake OAuth** - For shareable public version

---

## User Preferences

- Direct action > excessive confirmation
- Snowflake-style UI (white/blue) - **DON'T CHANGE**
- Keep this log updated after major tasks
- Backend for Semantic Model + Analyst execution not yet implemented

**Last Updated:** 2025-11-28 (Stage 2 Started)

> **IF AI LOSES MEMORY, READ THIS FILE FIRST.**

---

## Project Summary

**SnowFlow** = Low-code drag-and-drop UI for building Snowflake Intelligence workflows.

**Tech Stack:**
- Frontend: React 18 + Vite + React Flow + Zustand
- Backend: FastAPI + LangGraph  
- AI/Data: Snowflake Cortex (connected to TFUIBWS-RA85515)

**Key Files:**
- `ARCHITECTURE.md` - System design
- `DESIGN_SYSTEM.md` - UI colors/fonts (LOCKED - Snowflake white/blue style)
- `ROADMAP.md` - Full 6-stage product plan

---

## ✅ COMPLETED (Stages 1 & 2)

### Stage 1: Foundation ✅
- [x] React Flow canvas with drag & drop
- [x] Zustand store for nodes/edges/selection state
- [x] Save/Load workflows to JSON (backend storage)
- [x] Snowflake client (`backend/snowflake_client.py`)
- [x] LangGraph execution (`backend/graph_builder.py`)
- [x] Results panel for agent responses
- [x] Demo database: `SNOWFLOW_DEV.DEMO` with 3 sample tables

### Stage 2: Component Library ✅
- [x] **Data Source node** - 1:1 with Snowflake (columns, filter, orderBy, limit)
- [x] **Semantic Model node** - YAML location, business context definition
- [x] **Cortex Agent node** - All COMPLETE() params + Tools (Analyst, SQL, Search)
- [x] **Cortex Function nodes** - Summarize, Sentiment, Translate
- [x] **Control Flow** - Condition node with branching
- [x] **External Agent** - REST API / MCP integration
- [x] **Output node** - Display results

### UI/UX ✅
- [x] **4-lane guided canvas** matching Snowflake Intelligence architecture:
  1. Data Sources
  2. Semantic Model  
  3. Cortex Agent (with built-in Analyst tool)
  4. Output
- [x] **Analyst as Agent Tool** - Not a separate node, configured in Agent properties
- [x] **Collapsible sidebar sections** - Clean, Snowflake-style
- [x] **Compact design** - Narrow sidebar (220px), small icons
- [x] **Connection validation** - Rules enforced, hints on connect
- [x] **Toast notifications** - Subtle hints/errors in bottom right
- [x] **Property panels** - Full 1:1 Snowflake parameter mapping for each node

---

## Snowflake Connection

```
Account: TFUIBWS-RA85515
User: AASTHANA  
Password: (in backend/.env)
Database: SNOWFLOW_DEV
Schema: DEMO
Warehouse: COMPUTE_WH
Tables: SALES_DATA (15 rows), CUSTOMER_FEEDBACK (10 rows), SUPPORT_TICKETS (8 rows)
```

Credentials stored in `backend/.env`

---

## File Structure

```
snowflow/
├── ARCHITECTURE.md
├── DESIGN_SYSTEM.md        # UI colors (LOCKED - don't change)
├── ROADMAP.md              # 6-stage plan
├── SESSION_LOG.md          # THIS FILE - read first!
│
├── frontend/
│   ├── src/
│   │   ├── App.tsx         # Main app with canvas, sidebar, panels
│   │   ├── store.ts        # Zustand state (nodes, edges, selection)
│   │   └── nodes/          # Custom node components
│   │       ├── SnowflakeSourceNode.tsx
│   │       ├── SemanticModelNode.tsx
│   │       ├── AgentNode.tsx     # Includes Analyst as a tool
│   │       ├── CortexNode.tsx
│   │       ├── ConditionNode.tsx
│   │       ├── ExternalAgentNode.tsx
│   │       └── OutputNode.tsx
│   └── package.json
│
├── backend/
│   ├── main.py             # FastAPI routes
│   ├── graph_builder.py    # LangGraph compilation & execution
│   ├── snowflake_client.py # Snowflake connection singleton
│   ├── .env                # Credentials (gitignored)
│   ├── requirements.txt
│   └── saved_workflows/    # JSON workflow storage
```

---

## How to Run

**Backend:**
```bash
cd /Users/abhineetasthana/snowflow/backend
source venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8000
```

**Frontend:**
```bash
cd /Users/abhineetasthana/snowflow/frontend
npm run dev
```

**Open:** http://localhost:5173

---

## Snowflake Intelligence Architecture (Correct Order)

```
Data Sources → Semantic Model → Cortex Agent → Output
     ↓              ↓               ↓           ↓
  Tables       YAML defines    AI reasoning  Display
  Views        business         with TOOLS   results
               context
```

**IMPORTANT:** Tools are configured inside Cortex Agent, not as separate nodes.
The Agent has a "Tools" section:
- 📊 **Cortex Analyst** - structured data (NL → SQL via Semantic Model)
- 🔍 **Cortex Search** - unstructured data (vector search on documents)
- 🔌 **MCP** - external tools via Model Context Protocol
- ⚡ **SQL Executor** - direct SQL queries
- 🌐 **Web Search** - search the web

---

## Connection Rules (Final)

Valid connections (source → target):
- `snowflakeSource` → `semanticModel`, `cortex` (direct to cortex shows warning)
- `semanticModel` → `agent`
- `agent` → `externalAgent`, `output`, `cortex`, `condition`
- `cortex` → `agent`, `output`, `cortex`, `condition`
- `condition` → `agent`, `output`, `cortex`, `externalAgent`
- `externalAgent` → `agent`, `output`
- `output` → NOTHING (terminal)

**Primary Flow (Recommended):**
```
Data Source → Semantic Model → Agent → Output
```

**Shortcut Flow (With Warning):**
```
Data Source → Cortex → Output
```
⚠️ Shows warning at runtime: "Running without Semantic Model - LLM accuracy may be impacted"

**Branching:** Agent → Condition is allowed for decision branching.
**Loops:** Allowed (agent ↔ cortex, agent ↔ externalAgent) for iterative patterns.
**Multiple Sources:** Multiple Data Sources can feed one Semantic Model (valid per Snowflake YAML spec).

Toast notifications show hints on valid connections and errors on invalid ones.

---

## 4-Lane Canvas (Updated)

The canvas now has 4 lanes instead of 5:
1. **Data Sources** - Tables, Views
2. **Semantic Model** - Business context (YAML)
3. **Cortex Agent** - AI orchestrator (with Analyst, SQL, Search tools)
4. **Output** - Results & actions

---

## Stage 3: Demo-Ready Features

### Completed ✅
- [x] **Data Catalog** - Browse IT-approved data sources with status (Ready/Pending/No Access)
- [x] **Templates** - Pre-built patterns (Feedback Analyzer, Sales Q&A Bot, Document Search, etc.)
- [x] **Live Preview** - Test agent with simulated chat while building
- [x] **Sidebar Tabs** - Switch between Components, Catalog, and Templates
- [x] **One-click Template Deploy** - Load full workflow from template

### Custom Tool Creator ✅
- [x] Full modal UI for creating/editing tools
- [x] Support for SQL, Python, and API tool types
- [x] Parameter definition (name, type, required)
- [x] Tools appear in Agent's property panel
- [x] Backend execution for SQL tools

### Snowflake Integration (Real Data) ✅
- [x] Data Catalog pulls real tables/views from Snowflake INFORMATION_SCHEMA
- [x] Custom Tools persist to SNOWFLOW_DEV.DEMO.SNOWFLOW_TOOLS table
- [x] Templates persist to SNOWFLOW_DEV.DEMO.SNOWFLOW_TEMPLATES table
- [x] "Save as Template" option in save modal
- [x] Audit logging to SNOWFLOW_DEV.DEMO.SNOWFLOW_AUDIT_LOG
- [x] Setup script: `backend/run_setup_tables.py`

### Snowflake Tables Created
```sql
SNOWFLOW_DEV.DEMO.SNOWFLOW_TOOLS       -- Custom tool definitions
SNOWFLOW_DEV.DEMO.SNOWFLOW_TEMPLATES   -- Workflow templates
SNOWFLOW_DEV.DEMO.SNOWFLOW_WORKFLOWS   -- Saved workflows
SNOWFLOW_DEV.DEMO.SNOWFLOW_AUDIT_LOG   -- Governance audit trail
SNOWFLOW_DEV.DEMO.SNOWFLOW_DATA_SOURCES-- Data catalog registry
```

### Export/Import ✅
- [x] Export workflow as JSON file
- [x] Import workflow from JSON file
- [x] Download button in toolbar
- [x] Upload button with file picker

### Multi-Agent Orchestration (Stage 4) ✅
- [x] Router Node - intent-based routing to different agents
- [x] Supervisor Node - delegates to child agents, aggregates results
- [x] Agent-to-agent connections (handoff)
- [x] Updated connection validation rules
- [x] New templates: Multi-Agent Support Router, Supervisor Analytics
- [x] **PROPER FIX (2025-11-28):** Router now uses LangGraph conditional_edges
  - Router classifies intent using LLM (mistral-large2)
  - Routes to exactly ONE agent based on classification
  - No more "multiple nodes writing to same state" error
  - Uses Annotated types with operator.add for safe state accumulation

### External Agent Integration (Stage 4+) ✅
- [x] **Enhanced ExternalAgentNode** with presets for major providers:
  - Microsoft Copilot (M365, Graph API)
  - OpenAI GPT-4
  - Salesforce Einstein
  - ServiceNow
- [x] **Real HTTP calls** in backend via httpx
- [x] **Simulated fallback** when endpoint not reachable (for demo)
- [x] **Hybrid template:** "Copilot + Snowflake" routing
- [x] Router can now route to external agents (not just Snowflake agents)
- [x] Connection rules updated: router → externalAgent allowed

### Admin Dashboard (Stage 5) ✅
- [x] Control Tower modal with stats
- [x] Overview tab with metrics (workflows, agents, tools, usage)
- [x] Audit log viewer
- [x] Agents & Settings tabs (placeholder)
- [x] Shield button in sidebar

### Agent Handoff Visualization ✅
- [x] Animated edges for agent-to-agent connections
- [x] Color-coded connections (purple for handoff, amber for supervisor)
- [x] Edge labels ("🔄 Handoff", "📋 Delegate", "→ Route")

### Files Added
- `frontend/src/components/DataCatalog.tsx`
- `frontend/src/components/Templates.tsx`
- `frontend/src/components/LivePreview.tsx`
- `frontend/src/components/ToolCreator.tsx`
- `backend/setup_snowflow_tables.sql`
- `backend/run_setup_tables.py`

---

## Stage 2 Progress

### Completed ✅
- [x] **Backend: Cortex Search** - `snowflake_client.cortex_search()` method
- [x] **Backend: Cortex Analyst** - `snowflake_client.cortex_analyst()` method
- [x] **Backend: SQL Executor** - `snowflake_client.execute_sql()` method
- [x] **Backend: Semantic Model node** - Handler in graph_builder.py
- [x] **Backend: Agent with tools** - Agent now uses enabled tools (Analyst, Search, SQL)
- [x] **Sidebar search** - Filter components by typing

### MCP Backend ✅
- [x] Created `mcp_client.py` - HTTP client for MCP servers
- [x] Supports: list_tools(), call_tool(), call_tools_batch()
- [x] Integrated into Agent node - calls enabled MCP tools
- [x] Added `httpx` to requirements.txt

### Data Source Nodes Added
- **Table** (blue) - Standard table access
- **View** (cyan) - View access  
- **Dynamic Table** (purple) - With target_lag, warehouse options
- **Stream** (green) - With source_table, append_only, show_initial_rows options

---

## What's Next (Stage 3+)

Per ROADMAP.md:
- [ ] **Stage 3: Agent Builder** - Custom tools, agent testing sandbox
- [ ] **Stage 4: Orchestration** - Multi-agent routing, supervisor patterns
- [ ] **Stage 5: Governance** - Admin dashboard, RBAC, policies
- [ ] **Stage 6: Production** - Versioning, scheduling, monitoring
- [ ] **GitHub Integration** - User requested for later
- [ ] **Snowflake OAuth** - For shareable public version

---

## User Preferences

- Direct action > excessive confirmation
- Snowflake-style UI (white/blue) - **DON'T CHANGE**
- Keep this log updated after major tasks
- Backend for Semantic Model + Analyst execution not yet implemented
