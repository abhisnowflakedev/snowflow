import { Handle, Position } from 'reactflow';
import { FileOutput, Eye, Download, Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface OutputNodeData {
  label: string;
  outputType?: 'display' | 'table' | 'chart' | 'json' | 'yaml' | 'text';
  generatedContent?: string;
}

export const OutputNode = ({ data, selected }: { data: OutputNodeData; selected?: boolean }) => {
  const [showPreview, setShowPreview] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const hasContent = Boolean(data.generatedContent);
  
  // Green theme for output nodes - consistent with FileOutputNode
  const config = { color: '#10B981', label: data.outputType || 'Display' };
  
  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!data.generatedContent) return;
    
    let ext = 'txt';
    let mimeType = 'text/plain';
    if (data.outputType === 'json') { ext = 'json'; mimeType = 'application/json'; }
    else if (data.outputType === 'yaml') { ext = 'yaml'; mimeType = 'text/yaml'; }
    
    const blob = new Blob([data.generatedContent], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${data.label?.replace(/\s+/g, '_').toLowerCase() || 'output'}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!data.generatedContent) return;
    navigator.clipboard.writeText(data.generatedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handlePreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowPreview(!showPreview);
  };

  return (
    <div 
      style={{
        background: '#FFFFFF',
        border: selected ? `2px solid ${config.color}` : '1px solid #E5E9F0',
        borderRadius: 10,
        padding: 14,
        width: 260,
        fontFamily: 'Inter, -apple-system, sans-serif',
        boxShadow: selected ? `0 4px 12px ${config.color}40` : '0 2px 8px rgba(0,0,0,0.08)',
      }}
    >
      <Handle type="target" position={Position.Left} style={{ background: config.color, width: 10, height: 10, border: '2px solid white' }} />
      
      {/* Header - EXACT same style as FileOutputNode */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <div style={{ 
          width: 40, 
          height: 40, 
          borderRadius: 10, 
          background: `${config.color}15`, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}>
          <FileOutput size={20} color={config.color} />
        </div>
        <div>
          <div style={{ fontSize: 9, fontWeight: 600, color: config.color, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Output
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#1F2937' }}>{data.label}</div>
        </div>
      </div>
      
      {/* Output info - EXACT same style as FileOutputNode */}
      <div style={{ padding: 10, background: '#F8FAFC', borderRadius: 8, fontSize: 11, marginBottom: 8 }}>
        <div style={{ marginBottom: 6 }}>
          <span style={{ 
            background: config.color,
            color: 'white',
            padding: '2px 6px',
            borderRadius: 4,
            fontSize: 9,
            fontWeight: 600
          }}>
            {config.label}
          </span>
        </div>
        {hasContent ? (
          <div style={{ color: '#10B981', display: 'flex', alignItems: 'center', gap: 4 }}>
            ✓ Ready ({data.generatedContent?.length} chars)
          </div>
        ) : (
          <div style={{ color: '#9CA3AF', fontStyle: 'italic' }}>
            Waiting for input...
          </div>
        )}
      </div>
      
      {/* Action Buttons - EXACT same style as FileOutputNode */}
      <div style={{ display: 'flex', gap: 6 }}>
        <button
          onClick={handlePreview}
          disabled={!hasContent}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
            padding: '6px 8px',
            borderRadius: 6,
            border: 'none',
            background: hasContent ? '#F3F4F6' : '#F9FAFB',
            color: hasContent ? '#374151' : '#9CA3AF',
            fontSize: 10,
            fontWeight: 500,
            cursor: hasContent ? 'pointer' : 'not-allowed',
          }}
        >
          <Eye size={12} />
          Preview
        </button>
        <button
          onClick={handleCopy}
          disabled={!hasContent}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
            padding: '6px 8px',
            borderRadius: 6,
            border: 'none',
            background: copied ? config.color : (hasContent ? '#F3F4F6' : '#F9FAFB'),
            color: copied ? 'white' : (hasContent ? '#374151' : '#9CA3AF'),
            fontSize: 10,
            fontWeight: 500,
            cursor: hasContent ? 'pointer' : 'not-allowed',
          }}
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
        </button>
        <button
          onClick={handleDownload}
          disabled={!hasContent}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
            padding: '6px 8px',
            borderRadius: 6,
            border: 'none',
            background: hasContent ? config.color : '#F9FAFB',
            color: hasContent ? 'white' : '#9CA3AF',
            fontSize: 10,
            fontWeight: 500,
            cursor: hasContent ? 'pointer' : 'not-allowed',
          }}
        >
          <Download size={12} />
          Download
        </button>
      </div>
      
      {/* Preview Panel - EXACT same style as FileOutputNode */}
      {showPreview && hasContent && (
        <div 
          onClick={(e) => e.stopPropagation()}
          onWheel={(e) => e.stopPropagation()}
          style={{
            marginTop: 8,
            padding: 8,
            background: '#1F2937',
            borderRadius: 6,
            maxHeight: 150,
            overflow: 'auto',
          }}
        >
          <pre style={{
            margin: 0,
            fontSize: 9,
            fontFamily: 'Monaco, monospace',
            color: '#10B981',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all',
          }}>
            {data.generatedContent?.substring(0, 500)}
            {(data.generatedContent?.length || 0) > 500 && '\n...'}
          </pre>
        </div>
      )}
    </div>
  );
};
