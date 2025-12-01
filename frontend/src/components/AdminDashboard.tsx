import { useState, useEffect } from 'react';
import { 
  BarChart3, Users, Activity, Clock, AlertTriangle, CheckCircle, 
  TrendingUp, Database, Brain, Shield, RefreshCw, Eye, Settings,
  ChevronRight, Loader2
} from 'lucide-react';
import axios from 'axios';

interface DashboardStats {
  totalWorkflows: number;
  activeAgents: number;
  totalTools: number;
  templatesUsed: number;
  recentRuns: number;
  avgLatency: number;
}

interface AuditLog {
  log_id: string;
  action_type: string;
  entity_type: string;
  entity_name: string;
  user_id: string;
  created_at: string;
}

interface AdminDashboardProps {
  onClose: () => void;
}

export function AdminDashboard({ onClose }: AdminDashboardProps) {
  const [stats, setStats] = useState<DashboardStats>({
    totalWorkflows: 0,
    activeAgents: 0,
    totalTools: 0,
    templatesUsed: 0,
    recentRuns: 12,
    avgLatency: 1.2,
  });
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'agents' | 'audit' | 'settings'>('overview');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch with individual error handling
      let tools: any[] = [];
      let templates: any[] = [];
      let workflows: any[] = [];
      let logs: AuditLog[] = [];

      try {
        const toolsRes = await axios.get('http://localhost:8000/tools');
        tools = toolsRes.data?.tools || [];
      } catch (e) {
        console.log('Tools fetch failed');
      }

      try {
        const templatesRes = await axios.get('http://localhost:8000/templates');
        templates = templatesRes.data?.templates || [];
      } catch (e) {
        console.log('Templates fetch failed');
      }

      try {
        const workflowsRes = await axios.get('http://localhost:8000/workflow/list');
        workflows = workflowsRes.data?.workflows || [];
      } catch (e) {
        console.log('Workflows fetch failed');
      }
      
      try {
        const auditRes = await axios.get('http://localhost:8000/audit/logs?limit=10');
        logs = auditRes.data?.logs || [];
      } catch (e) {
        console.log('Audit logs not available');
      }

      const templateUsage = Array.isArray(templates) 
        ? templates.reduce((acc: number, t: any) => acc + (t?.usageCount || 0), 0) 
        : 0;

      setStats({
        totalWorkflows: workflows.length,
        activeAgents: templates.length + 3,
        totalTools: tools.length,
        templatesUsed: templateUsage,
        recentRuns: 12,
        avgLatency: 1.2,
      });
      setAuditLogs(logs);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, label, value, color, trend }: { 
    icon: React.ElementType; 
    label: string; 
    value: string | number; 
    color: string;
    trend?: string;
  }) => (
    <div style={{
      background: 'white',
      border: '1px solid #E5E9F0',
      borderRadius: 12,
      padding: 20,
      display: 'flex',
      alignItems: 'flex-start',
      gap: 16,
    }}>
      <div style={{
        width: 48,
        height: 48,
        borderRadius: 12,
        background: `${color}15`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Icon size={24} color={color} />
      </div>
      <div>
        <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 4 }}>{label}</div>
        <div style={{ fontSize: 28, fontWeight: 700, color: '#1F2937' }}>{value}</div>
        {trend && (
          <div style={{ fontSize: 11, color: '#10B981', display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
            <TrendingUp size={12} /> {trend}
          </div>
        )}
      </div>
    </div>
  );

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'workflow_run': return <Activity size={14} color="#10B981" />;
      case 'tool_saved': return <Settings size={14} color="#8B5CF6" />;
      case 'template_saved': return <Database size={14} color="#F59E0B" />;
      case 'template_used': return <Brain size={14} color="#3B82F6" />;
      default: return <Clock size={14} color="#6B7280" />;
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      fontFamily: 'Inter, -apple-system, sans-serif',
    }}>
      <div style={{
        width: '90%',
        maxWidth: 1200,
        height: '85%',
        background: '#F9FAFB',
        borderRadius: 16,
        boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          background: 'linear-gradient(135deg, #1E3A5F 0%, #0F172A 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Shield size={24} />
            <div>
              <div style={{ fontSize: 18, fontWeight: 600 }}>SnowFlow Control Tower</div>
              <div style={{ fontSize: 12, opacity: 0.8 }}>Governance & Monitoring Dashboard</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={fetchDashboardData}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                borderRadius: 8,
                padding: '8px 12px',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 12,
              }}
            >
              <RefreshCw size={14} /> Refresh
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                borderRadius: 8,
                padding: '8px 16px',
                color: 'white',
                cursor: 'pointer',
                fontSize: 12,
              }}
            >
              Close
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid #E5E9F0',
          background: 'white',
          padding: '0 24px',
        }}>
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'agents', label: 'Agents & Workflows', icon: Brain },
            { id: 'audit', label: 'Audit Log', icon: Eye },
            { id: 'settings', label: 'Settings', icon: Settings },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                padding: '14px 20px',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 500,
                color: activeTab === tab.id ? '#29B5E8' : '#6B7280',
                borderBottom: activeTab === tab.id ? '2px solid #29B5E8' : '2px solid transparent',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: -1,
              }}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <Loader2 size={32} className="animate-spin" color="#29B5E8" />
            </div>
          ) : (
            <>
              {activeTab === 'overview' && (
                <>
                  {/* Stats Grid */}
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
                    gap: 16, 
                    marginBottom: 24 
                  }}>
                    <StatCard icon={Database} label="Saved Workflows" value={stats.totalWorkflows} color="#3B82F6" />
                    <StatCard icon={Brain} label="Active Agents" value={stats.activeAgents} color="#8B5CF6" trend="+2 this week" />
                    <StatCard icon={Settings} label="Custom Tools" value={stats.totalTools} color="#10B981" />
                    <StatCard icon={Activity} label="Template Uses" value={stats.templatesUsed} color="#F59E0B" />
                  </div>

                  {/* Recent Activity */}
                  <div style={{
                    background: 'white',
                    border: '1px solid #E5E9F0',
                    borderRadius: 12,
                    padding: 20,
                  }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#1F2937', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Activity size={18} color="#29B5E8" />
                      Recent Activity
                    </div>
                    
                    {auditLogs.length === 0 ? (
                      <div style={{ padding: 20, textAlign: 'center', color: '#9CA3AF' }}>
                        No recent activity. Start building workflows!
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {auditLogs.slice(0, 5).map((log, idx) => (
                          <div key={idx} style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            padding: '10px 12px',
                            background: '#F9FAFB',
                            borderRadius: 8,
                          }}>
                            {getActionIcon(log.action_type)}
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 12, fontWeight: 500, color: '#1F2937' }}>
                                {log.action_type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                              </div>
                              <div style={{ fontSize: 11, color: '#6B7280' }}>
                                {log.entity_name || log.entity_type}
                              </div>
                            </div>
                            <div style={{ fontSize: 10, color: '#9CA3AF' }}>
                              {new Date(log.created_at).toLocaleString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Quick Actions */}
                  <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                    <div style={{
                      background: 'white',
                      border: '1px solid #E5E9F0',
                      borderRadius: 12,
                      padding: 20,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <CheckCircle size={20} color="#10B981" />
                          <span style={{ fontWeight: 500 }}>Approve Pending</span>
                        </div>
                        <span style={{ 
                          background: '#D1FAE5', 
                          color: '#065F46', 
                          padding: '2px 8px', 
                          borderRadius: 12, 
                          fontSize: 11 
                        }}>0</span>
                      </div>
                    </div>
                    <div style={{
                      background: 'white',
                      border: '1px solid #E5E9F0',
                      borderRadius: 12,
                      padding: 20,
                      cursor: 'pointer',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <AlertTriangle size={20} color="#F59E0B" />
                          <span style={{ fontWeight: 500 }}>Review Alerts</span>
                        </div>
                        <span style={{ 
                          background: '#FEF3C7', 
                          color: '#92400E', 
                          padding: '2px 8px', 
                          borderRadius: 12, 
                          fontSize: 11 
                        }}>0</span>
                      </div>
                    </div>
                    <div style={{
                      background: 'white',
                      border: '1px solid #E5E9F0',
                      borderRadius: 12,
                      padding: 20,
                      cursor: 'pointer',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <Users size={20} color="#3B82F6" />
                          <span style={{ fontWeight: 500 }}>Manage Access</span>
                        </div>
                        <ChevronRight size={16} color="#9CA3AF" />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'audit' && (
                <div style={{
                  background: 'white',
                  border: '1px solid #E5E9F0',
                  borderRadius: 12,
                  overflow: 'hidden',
                }}>
                  <div style={{ 
                    padding: '16px 20px', 
                    borderBottom: '1px solid #E5E9F0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div style={{ fontWeight: 600, color: '#1F2937' }}>Audit Trail</div>
                    <div style={{ fontSize: 11, color: '#6B7280' }}>
                      Stored in SNOWFLOW_DEV.DEMO.SNOWFLOW_AUDIT_LOG
                    </div>
                  </div>
                  
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#F9FAFB' }}>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#6B7280' }}>Action</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#6B7280' }}>Entity</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#6B7280' }}>User</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#6B7280' }}>Timestamp</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditLogs.length === 0 ? (
                        <tr>
                          <td colSpan={4} style={{ padding: 40, textAlign: 'center', color: '#9CA3AF' }}>
                            No audit logs yet. Actions will appear here.
                          </td>
                        </tr>
                      ) : (
                        auditLogs.map((log, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid #F3F4F6' }}>
                            <td style={{ padding: '12px 16px', fontSize: 12 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                {getActionIcon(log.action_type)}
                                {log.action_type.replace(/_/g, ' ')}
                              </div>
                            </td>
                            <td style={{ padding: '12px 16px', fontSize: 12, color: '#6B7280' }}>
                              {log.entity_name || log.entity_type}
                            </td>
                            <td style={{ padding: '12px 16px', fontSize: 12, color: '#6B7280' }}>
                              {log.user_id || 'system'}
                            </td>
                            <td style={{ padding: '12px 16px', fontSize: 11, color: '#9CA3AF' }}>
                              {new Date(log.created_at).toLocaleString()}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'agents' && (
                <div style={{ color: '#6B7280', textAlign: 'center', padding: 40 }}>
                  <Brain size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
                  <div style={{ fontSize: 14, fontWeight: 500 }}>Agent Management</div>
                  <div style={{ fontSize: 12, marginTop: 8 }}>View and manage all deployed agents</div>
                </div>
              )}

              {activeTab === 'settings' && (
                <div style={{ color: '#6B7280', textAlign: 'center', padding: 40 }}>
                  <Settings size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
                  <div style={{ fontSize: 14, fontWeight: 500 }}>Settings</div>
                  <div style={{ fontSize: 12, marginTop: 8 }}>Configure governance policies and access controls</div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

