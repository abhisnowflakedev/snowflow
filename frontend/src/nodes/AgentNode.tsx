import { Handle, Position } from 'reactflow';
import { Brain, Sparkles, Wrench } from 'lucide-react';

/**
 * AgentNode - 1:1 mapping to SNOWFLAKE.CORTEX.COMPLETE()
 * 
 * All properties mirror the Cortex Complete function parameters.
 * Reference: https://docs.snowflake.com/en/sql-reference/functions/complete-snowflake-cortex
 * 
 * Also includes TOOLS configuration - Agent can use:
 * - Cortex Analyst: Natural language to SQL via Semantic Model
 * - SQL Executor: Run arbitrary SQL
 * - Web Search: Search the web for information
 */

// Analyst tool configuration (STRUCTURED data - NL to SQL)
export interface AnalystToolConfig {
  enabled: boolean;
  semanticModelDatabase: string;
  semanticModelSchema: string;
  semanticModelStage: string;
  semanticModelFile: string;  // YAML file name
}

// Search tool configuration (UNSTRUCTURED data - vector search)
export interface SearchToolConfig {
  enabled: boolean;
  searchServiceName: string;   // Cortex Search Service name
  database: string;
  schema: string;
  columns: string[];           // Columns to search
  limit: number;               // Max results
}

// MCP tool configuration (Model Context Protocol - external tools)
export interface MCPToolConfig {
  enabled: boolean;
  serverUrl: string;           // MCP server endpoint
  authToken: string;           // Optional auth
  enabledTools: string[];      // Which MCP tools to enable
}

export interface AgentNodeData {
  // Display
  label: string;
  
  // Required parameters
  model: 'mistral-large2' | 'mistral-large' | 'mixtral-8x7b' | 'mistral-7b' | 
         'llama3.1-405b' | 'llama3.1-70b' | 'llama3.1-8b' | 
         'llama3-70b' | 'llama3-8b' | 
         'snowflake-arctic' | 'reka-flash' | 'reka-core' |
         'jamba-instruct' | 'jamba-1.5-mini' | 'jamba-1.5-large' |
         'gemma-7b';
  
  // Prompt configuration
  systemPrompt: string;       // System message (instructions)
  userPromptTemplate: string; // Template for user message, can include {{data}} placeholder
  
  // Generation parameters (all optional, have Snowflake defaults)
  temperature: number;        // 0-1, default 0.7 - controls randomness
  maxTokens: number;          // Max tokens to generate, default 4096
  topP: number;              // 0-1, nucleus sampling, default 1.0
  
  // Guardrails (Cortex Guard)
  enableGuardrails: boolean;  // Enable Cortex Guard for safety
  
  // Response format
  responseFormat: 'text' | 'json'; // Output format
  
  // Advanced
  seed: number | null;        // For reproducibility
  
  // TOOLS - Agent can use these to accomplish tasks
  // Can be either array format (from templates): ['Analyst', 'Search', 'SQL']
  // Or object format (from UI): { analyst: { enabled: true }, ... }
  tools: string[] | {
    analyst?: AnalystToolConfig;      // Structured data (NL → SQL)
    search?: SearchToolConfig;        // Unstructured data (vector search)
    mcp?: MCPToolConfig;              // External tools via MCP
    sqlExecutor?: boolean;
    webSearch?: boolean;
  };
}

const modelDisplayNames: Record<string, string> = {
  'mistral-large2': 'Mistral Large 2',
  'mistral-large': 'Mistral Large',
  'mixtral-8x7b': 'Mixtral 8x7B',
  'mistral-7b': 'Mistral 7B',
  'llama3.1-405b': 'Llama 3.1 405B',
  'llama3.1-70b': 'Llama 3.1 70B',
  'llama3.1-8b': 'Llama 3.1 8B',
  'llama3-70b': 'Llama 3 70B',
  'llama3-8b': 'Llama 3 8B',
  'snowflake-arctic': 'Snowflake Arctic',
  'reka-flash': 'Reka Flash',
  'reka-core': 'Reka Core',
  'jamba-instruct': 'Jamba Instruct',
  'jamba-1.5-mini': 'Jamba 1.5 Mini',
  'jamba-1.5-large': 'Jamba 1.5 Large',
  'gemma-7b': 'Gemma 7B',
};

export const AgentNode = ({ data, selected }: { data: AgentNodeData; selected?: boolean }) => {
  const modelName = modelDisplayNames[data.model] || data.model || 'Mistral Large 2';
  const hasCustomParams = (data.temperature !== undefined && data.temperature !== 0.7) || 
                          (data.maxTokens !== undefined && data.maxTokens !== 4096);
  
  // Count enabled tools - handle both array format (from templates) and object format (from UI)
  const enabledTools: string[] = [];
  
  // Check if tools is an array (template format: ['Analyst', 'Search', 'SQL'])
  if (Array.isArray(data.tools)) {
    enabledTools.push(...data.tools);
  } else if (data.tools) {
    // Object format from UI configuration
    if (data.tools.analyst?.enabled) enabledTools.push('Analyst');
    if (data.tools.search?.enabled) enabledTools.push('Search');
    if (data.tools.mcp?.enabled) enabledTools.push('MCP');
    if (data.tools.sqlExecutor) enabledTools.push('SQL');
    if (data.tools.webSearch) enabledTools.push('Web');
  }

  return (
    <div 
      style={{
        background: '#FFFFFF',
        border: selected ? '2px solid #8B5CF6' : '1px solid #E5E9F0',
        borderRadius: 8,
        padding: 12,
        width: 240,
        fontFamily: 'Inter, -apple-system, sans-serif',
        boxShadow: selected ? '0 4px 12px rgba(139,92,246,0.25)' : '0 1px 3px rgba(0,0,0,0.1)',
      }}
    >
      <Handle type="target" position={Position.Left} style={{ background: '#8B5CF6', width: 10, height: 10, border: '2px solid white' }} />
      
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ 
          width: 36, 
          height: 36, 
          borderRadius: 8, 
          background: '#EDE9FE', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}>
          <Brain size={18} color="#8B5CF6" />
        </div>
        <div>
          <div style={{ fontSize: 10, fontWeight: 500, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Cortex Agent
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#1F2937' }}>{data.label}</div>
        </div>
      </div>
      
      {/* Model info */}
      <div style={{ marginTop: 10, padding: 8, background: '#F5F7FA', borderRadius: 6 }}>
        <div style={{ fontSize: 11, color: '#6B7280', display: 'flex', alignItems: 'center', gap: 4 }}>
          <Sparkles size={12} /> 
          <span style={{ fontWeight: 500 }}>{modelName}</span>
        </div>
        {hasCustomParams && (
          <div style={{ fontSize: 10, color: '#9CA3AF', marginTop: 4 }}>
            temp: {data.temperature ?? 0.7} | max: {data.maxTokens ?? 4096}
          </div>
        )}
      </div>
      
      {/* Tools indicator */}
      {enabledTools.length > 0 && (
        <div style={{ marginTop: 8, padding: '6px 8px', background: '#F0F9FF', borderRadius: 6, border: '1px solid #BAE6FD' }}>
          <div style={{ fontSize: 10, color: '#0369A1', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Wrench size={11} />
            <span style={{ fontWeight: 500 }}>Tools:</span>
            <span>{enabledTools.join(', ')}</span>
          </div>
        </div>
      )}
      
      {/* System prompt preview */}
      {data.systemPrompt && (
        <div style={{ marginTop: 8, fontSize: 11, color: '#6B7280', lineHeight: 1.4 }}>
          {data.systemPrompt.length > 60 ? data.systemPrompt.slice(0, 60) + '...' : data.systemPrompt}
        </div>
      )}
      
      {/* Indicators */}
      <div style={{ marginTop: 6, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {data.enableGuardrails && (
          <span style={{ fontSize: 9, background: '#D1FAE5', color: '#065F46', padding: '2px 6px', borderRadius: 4 }}>
            🛡️ Guardrails
          </span>
        )}
        {data.responseFormat === 'json' && (
          <span style={{ fontSize: 9, background: '#E0E7FF', color: '#4338CA', padding: '2px 6px', borderRadius: 4 }}>
            JSON
          </span>
        )}
      </div>
      
      <Handle type="source" position={Position.Right} style={{ background: '#8B5CF6', width: 10, height: 10, border: '2px solid white' }} />
    </div>
  );
};
