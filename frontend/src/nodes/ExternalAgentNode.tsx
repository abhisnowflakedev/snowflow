import { Handle, Position } from 'reactflow';
import { Globe, Webhook, Cloud, Bot, Sparkles, Building2 } from 'lucide-react';

interface ExternalAgentNodeData {
  label: string;
  agentType: 'rest' | 'mcp' | 'webhook' | 'copilot' | 'openai' | 'salesforce' | 'servicenow';
  endpoint?: string;
  method?: 'GET' | 'POST' | 'PUT';
  authType?: 'none' | 'bearer' | 'api_key' | 'oauth';
  provider?: string;
}

const agentConfig: Record<string, { icon: any; label: string; color: string; bgColor: string }> = {
  rest: { icon: Globe, label: 'REST API', color: '#EF4444', bgColor: '#FEE2E2' },
  mcp: { icon: Webhook, label: 'MCP Agent', color: '#8B5CF6', bgColor: '#EDE9FE' },
  webhook: { icon: Webhook, label: 'Webhook', color: '#F59E0B', bgColor: '#FEF3C7' },
  copilot: { icon: Sparkles, label: 'Microsoft Copilot', color: '#0078D4', bgColor: '#E1F0FF' },
  openai: { icon: Bot, label: 'OpenAI GPT', color: '#10A37F', bgColor: '#D1FAE5' },
  salesforce: { icon: Cloud, label: 'Salesforce Einstein', color: '#00A1E0', bgColor: '#E0F4FF' },
  servicenow: { icon: Building2, label: 'ServiceNow', color: '#81B5A1', bgColor: '#E6F4EF' },
};

// Preset configurations for common external agents
export const externalAgentPresets = {
  copilot: {
    label: 'Copilot Agent',
    agentType: 'copilot',
    endpoint: 'https://graph.microsoft.com/v1.0/me/chat/messages',
    method: 'POST',
    authType: 'oauth',
    provider: 'Microsoft',
    headers: { 'Content-Type': 'application/json' },
    description: 'Microsoft Copilot for M365 - access emails, calendar, Teams, documents'
  },
  openai: {
    label: 'GPT-4 Agent',
    agentType: 'openai',
    endpoint: 'https://api.openai.com/v1/chat/completions',
    method: 'POST',
    authType: 'bearer',
    provider: 'OpenAI',
    model: 'gpt-4-turbo',
    description: 'OpenAI GPT-4 for general reasoning and complex tasks'
  },
  salesforce: {
    label: 'Einstein Agent',
    agentType: 'salesforce',
    endpoint: 'https://api.salesforce.com/einstein/predictions',
    method: 'POST',
    authType: 'oauth',
    provider: 'Salesforce',
    description: 'Salesforce Einstein for CRM insights and predictions'
  },
  servicenow: {
    label: 'ServiceNow Agent',
    agentType: 'servicenow',
    endpoint: 'https://instance.service-now.com/api/now/table/incident',
    method: 'POST',
    authType: 'bearer',
    provider: 'ServiceNow',
    description: 'ServiceNow for ITSM ticket creation and management'
  }
};

export const ExternalAgentNode = ({ data, selected }: { data: ExternalAgentNodeData; selected?: boolean }) => {
  const config = agentConfig[data.agentType] || agentConfig.rest;
  const Icon = config.icon;

  return (
    <div 
      style={{
        background: '#FFFFFF',
        border: selected ? `2px solid ${config.color}` : '1px solid #E5E9F0',
        borderRadius: 10,
        padding: 14,
        width: 240,
        fontFamily: 'Inter, -apple-system, sans-serif',
        boxShadow: selected ? `0 4px 12px ${config.color}40` : '0 2px 8px rgba(0,0,0,0.08)',
      }}
    >
      <Handle type="target" position={Position.Left} style={{ background: config.color, width: 10, height: 10, border: '2px solid white' }} />
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <div style={{ 
          width: 40, 
          height: 40, 
          borderRadius: 10, 
          background: config.bgColor, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}>
          <Icon size={20} color={config.color} />
        </div>
        <div>
          <div style={{ fontSize: 9, fontWeight: 600, color: config.color, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {config.label}
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#1F2937' }}>{data.label}</div>
        </div>
      </div>
      
      {/* Endpoint info */}
      <div style={{ padding: 10, background: '#F8FAFC', borderRadius: 8, fontSize: 11 }}>
        {data.endpoint ? (
          <>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 6 }}>
              <span style={{ 
                background: data.method === 'POST' ? '#3B82F6' : '#10B981', 
                color: 'white', 
                padding: '2px 6px', 
                borderRadius: 4, 
                fontSize: 9,
                fontWeight: 600
              }}>
                {data.method || 'POST'}
              </span>
              <span style={{ 
                background: data.authType === 'oauth' ? '#F59E0B' : '#6B7280',
                color: 'white',
                padding: '2px 6px',
                borderRadius: 4,
                fontSize: 9,
                fontWeight: 600
              }}>
                {data.authType?.toUpperCase() || 'AUTH'}
              </span>
            </div>
            <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#64748B', wordBreak: 'break-all' }}>
              {data.endpoint.length > 40 ? data.endpoint.slice(0, 40) + '...' : data.endpoint}
            </div>
          </>
        ) : (
          <div style={{ color: '#9CA3AF', fontStyle: 'italic' }}>Configure endpoint →</div>
        )}
      </div>

      {/* Provider badge */}
      {data.provider && (
        <div style={{ 
          marginTop: 8, 
          fontSize: 10, 
          color: '#6B7280',
          display: 'flex',
          alignItems: 'center',
          gap: 4
        }}>
          <span style={{ 
            width: 6, 
            height: 6, 
            borderRadius: '50%', 
            background: '#10B981',
            display: 'inline-block'
          }} />
          {data.provider} Connected
        </div>
      )}
      
      <Handle type="source" position={Position.Right} style={{ background: config.color, width: 10, height: 10, border: '2px solid white' }} />
    </div>
  );
};
