import { useState, useEffect } from 'react';
import { Database, Table, Eye, Lock, CheckCircle, Clock, Search, RefreshCw, Loader2, AlertCircle } from 'lucide-react';
import axios from 'axios';

interface DataSource {
  id: string;
  name: string;
  type: 'table' | 'view' | 'dynamic_table' | 'stream';
  database: string;
  schema: string;
  hasSemanticModel: boolean;
  hasAccess: boolean;
  rowCount?: number;
  lastUpdated?: string;
  description?: string;
}

interface DataCatalogProps {
  onSelectSource: (source: DataSource) => void;
}

// Mock data for fallback
const mockDataSources: DataSource[] = [
  { id: '1', name: 'SALES_DATA', type: 'table', database: 'SNOWFLOW_DEV', schema: 'DEMO', hasSemanticModel: true, hasAccess: true, rowCount: 50000 },
  { id: '2', name: 'CUSTOMER_360', type: 'view', database: 'SNOWFLOW_DEV', schema: 'DEMO', hasSemanticModel: true, hasAccess: true, rowCount: 12000 },
  { id: '3', name: 'INVENTORY_STREAM', type: 'stream', database: 'SNOWFLOW_DEV', schema: 'DEMO', hasSemanticModel: false, hasAccess: true },
];

export function DataCatalog({ onSelectSource }: DataCatalogProps) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'ready' | 'pending'>('all');
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch real data from Snowflake
  const fetchSources = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get('http://localhost:8000/catalog/sources');
      const sources = response.data.sources.map((s: any) => ({
        id: s.id,
        name: s.name,
        type: s.type === 'base table' ? 'table' : s.type,
        database: s.database,
        schema: s.schema,
        hasSemanticModel: s.hasSemanticModel || false,
        hasAccess: s.status !== 'no_access',
        rowCount: s.rowCount,
        lastUpdated: s.lastUpdated,
        description: s.description,
      }));
      setDataSources(sources);
    } catch (err: any) {
      console.error('Failed to fetch catalog:', err);
      setError(err.response?.data?.detail || 'Failed to connect to Snowflake');
      // Fall back to mock data
      setDataSources(mockDataSources);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSources();
  }, []);

  const filteredSources = dataSources.filter(source => {
    const matchesSearch = source.name.toLowerCase().includes(search.toLowerCase()) ||
                          source.database.toLowerCase().includes(search.toLowerCase());
    
    if (filter === 'ready') return matchesSearch && source.hasSemanticModel && source.hasAccess;
    if (filter === 'pending') return matchesSearch && (!source.hasSemanticModel || !source.hasAccess);
    return matchesSearch;
  });

  const readyCount = dataSources.filter(s => s.hasSemanticModel && s.hasAccess).length;
  const pendingCount = dataSources.filter(s => !s.hasSemanticModel || !s.hasAccess).length;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'view': return <Eye size={14} color="#0EA5E9" />;
      case 'dynamic_table': return <RefreshCw size={14} color="#8B5CF6" />;
      case 'stream': return <Database size={14} color="#10B981" />;
      default: return <Table size={14} color="#29B5E8" />;
    }
  };

  const getStatusBadge = (source: DataSource) => {
    if (!source.hasAccess) {
      return (
        <span style={{ 
          fontSize: 9, 
          background: '#FEE2E2', 
          color: '#991B1B', 
          padding: '2px 6px', 
          borderRadius: 4,
          display: 'flex',
          alignItems: 'center',
          gap: 3
        }}>
          <Lock size={10} /> No Access
        </span>
      );
    }
    if (!source.hasSemanticModel) {
      return (
        <span style={{ 
          fontSize: 9, 
          background: '#FEF3C7', 
          color: '#92400E', 
          padding: '2px 6px', 
          borderRadius: 4,
          display: 'flex',
          alignItems: 'center',
          gap: 3
        }}>
          <Clock size={10} /> No Semantic Model
        </span>
      );
    }
    return (
      <span style={{ 
        fontSize: 9, 
        background: '#D1FAE5', 
        color: '#065F46', 
        padding: '2px 6px', 
        borderRadius: 4,
        display: 'flex',
        alignItems: 'center',
        gap: 3
      }}>
        <CheckCircle size={10} /> Ready
      </span>
    );
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%',
      fontFamily: 'Inter, -apple-system, sans-serif',
    }}>
      {/* Header */}
      <div style={{ 
        padding: '12px 16px', 
        borderBottom: '1px solid #E5E9F0',
        background: '#F9FAFB'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 8,
          marginBottom: 12
        }}>
          <Database size={18} color="#29B5E8" />
          <span style={{ fontWeight: 600, color: '#1F2937', fontSize: 14 }}>Data Catalog</span>
          <button
            onClick={fetchSources}
            disabled={loading}
            style={{
              marginLeft: 'auto',
              background: 'none',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              padding: 4,
              display: 'flex',
              alignItems: 'center',
            }}
            title="Refresh from Snowflake"
          >
            <RefreshCw size={14} color={loading ? '#9CA3AF' : '#29B5E8'} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        {/* Connection status */}
        {error && (
          <div style={{
            background: '#FEF3C7',
            border: '1px solid #F59E0B',
            borderRadius: 6,
            padding: '6px 10px',
            marginBottom: 10,
            fontSize: 11,
            color: '#92400E',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}>
            <AlertCircle size={12} />
            <span>{error} (showing cached data)</span>
          </div>
        )}
        
        {/* Search */}
        <div style={{ position: 'relative', marginBottom: 10 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: 8, color: '#9CA3AF' }} />
          <input
            type="text"
            placeholder="Search data sources..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 10px 8px 32px',
              border: '1px solid #E5E9F0',
              borderRadius: 6,
              fontSize: 12,
              boxSizing: 'border-box',
              outline: 'none',
            }}
          />
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={() => setFilter('all')}
            style={{
              flex: 1,
              padding: '6px 8px',
              border: 'none',
              borderRadius: 4,
              fontSize: 11,
              fontWeight: 500,
              cursor: 'pointer',
              background: filter === 'all' ? '#29B5E8' : '#F3F4F6',
              color: filter === 'all' ? 'white' : '#6B7280',
            }}
          >
            All ({dataSources.length})
          </button>
          <button
            onClick={() => setFilter('ready')}
            style={{
              flex: 1,
              padding: '6px 8px',
              border: 'none',
              borderRadius: 4,
              fontSize: 11,
              fontWeight: 500,
              cursor: 'pointer',
              background: filter === 'ready' ? '#10B981' : '#F3F4F6',
              color: filter === 'ready' ? 'white' : '#6B7280',
            }}
          >
            Ready ({readyCount})
          </button>
          <button
            onClick={() => setFilter('pending')}
            style={{
              flex: 1,
              padding: '6px 8px',
              border: 'none',
              borderRadius: 4,
              fontSize: 11,
              fontWeight: 500,
              cursor: 'pointer',
              background: filter === 'pending' ? '#F59E0B' : '#F3F4F6',
              color: filter === 'pending' ? 'white' : '#6B7280',
            }}
          >
            Pending ({pendingCount})
          </button>
        </div>
      </div>

      {/* Data source list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 12px' }}>
        {loading ? (
          <div style={{ 
            textAlign: 'center', 
            padding: 40, 
            color: '#9CA3AF',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12,
          }}>
            <Loader2 size={24} className="animate-spin" />
            <span style={{ fontSize: 12 }}>Loading from Snowflake...</span>
          </div>
        ) : (
          <>
            {filteredSources.map((source, idx) => (
              <div
                key={source.id || idx}
                onClick={() => source.hasAccess && onSelectSource(source)}
                draggable={source.hasAccess}
                onDragStart={(e) => {
                  e.dataTransfer.setData('application/reactflow', 'snowflakeSource');
                  e.dataTransfer.setData('sourceData', JSON.stringify({
                    label: source.name,
                    database: source.database,
                    schema: source.schema,
                    objectType: source.type,
                  }));
                }}
                style={{
                  padding: '10px 12px',
                  marginBottom: 8,
                  background: source.hasAccess ? '#FFFFFF' : '#F9FAFB',
                  border: '1px solid #E5E9F0',
                  borderRadius: 8,
                  cursor: source.hasAccess ? 'grab' : 'not-allowed',
                  opacity: source.hasAccess ? 1 : 0.7,
                  transition: 'all 0.15s ease',
                }}
                onMouseOver={(e) => {
                  if (source.hasAccess) {
                    e.currentTarget.style.borderColor = '#29B5E8';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(41,181,232,0.15)';
                  }
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = '#E5E9F0';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <div style={{ 
                    width: 32, 
                    height: 32, 
                    borderRadius: 6, 
                    background: '#F0F9FF', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {getTypeIcon(source.type)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ 
                      fontSize: 13, 
                      fontWeight: 600, 
                      color: '#1F2937',
                      marginBottom: 2,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {source.name}
                    </div>
                    <div style={{ 
                      fontSize: 10, 
                      color: '#6B7280',
                      marginBottom: 4
                    }}>
                      {source.database}.{source.schema}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      {getStatusBadge(source)}
                      {source.rowCount && (
                        <span style={{ fontSize: 9, color: '#9CA3AF' }}>
                          {source.rowCount.toLocaleString()} rows
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {filteredSources.length === 0 && (
              <div style={{ 
                textAlign: 'center', 
                padding: 40, 
                color: '#9CA3AF',
                fontSize: 12
              }}>
                No data sources match your filter
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
