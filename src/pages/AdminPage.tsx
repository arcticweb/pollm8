import { useEffect, useState } from 'react';
import { Shield, Users, FileText, CheckCircle, XCircle, Activity, Trash2, Search, Folder, Tag, Database as DatabaseIcon } from 'lucide-react';
import { adminService } from '../services/adminService';
import { CategoriesManager } from '../components/admin/CategoriesManager';
import { DataSourcesManager } from '../components/admin/DataSourcesManager';
import type { Database } from '../types/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type VerificationRequest = Database['public']['Tables']['verification_requests']['Row'];

interface AdminPageProps {
  onNavigate: (page: string) => void;
}

export function AdminPage({ onNavigate }: AdminPageProps) {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'topics' | 'verifications' | 'logs' | 'categories' | 'data-sources'>('dashboard');
  const [stats, setStats] = useState({ totalUsers: 0, totalTopics: 0, totalVotes: 0, pendingVerifications: 0 });
  const [users, setUsers] = useState<Profile[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [verifications, setVerifications] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    checkAdminAndLoad();
  }, []);

  const checkAdminAndLoad = async () => {
    try {
      const isAdmin = await adminService.isAdmin();
      if (!isAdmin) {
        onNavigate('topics');
        return;
      }

      await loadStats();
      setLoading(false);
    } catch (error) {
      console.error('Error checking admin status:', error);
      onNavigate('topics');
    }
  };

  const loadStats = async () => {
    const data = await adminService.getStats();
    setStats(data);
  };

  const loadUsers = async () => {
    const data = await adminService.getAllUsers(100);
    setUsers(data);
  };

  const loadTopics = async () => {
    const data = await adminService.getAllTopics(50);
    setTopics(data);
  };

  const loadVerifications = async () => {
    const data = await adminService.getVerificationRequests();
    setVerifications(data);
  };

  const loadLogs = async () => {
    const data = await adminService.getAdminActions(50);
    setLogs(data);
  };

  const handleTabChange = async (tab: typeof activeTab) => {
    setActiveTab(tab);
    setLoading(true);

    try {
      switch (tab) {
        case 'users':
          await loadUsers();
          break;
        case 'topics':
          await loadTopics();
          break;
        case 'verifications':
          await loadVerifications();
          break;
        case 'logs':
          await loadLogs();
          break;
        default:
          await loadStats();
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveVerification = async (requestId: string) => {
    if (!confirm('Approve this verification request?')) return;

    try {
      await adminService.approveVerificationRequest(requestId);
      await loadVerifications();
      await loadStats();
    } catch (error) {
      console.error('Error approving verification:', error);
      alert('Failed to approve verification');
    }
  };

  const handleRejectVerification = async (requestId: string) => {
    const reason = prompt('Reason for rejection:');
    if (!reason) return;

    try {
      await adminService.rejectVerificationRequest(requestId, reason);
      await loadVerifications();
      await loadStats();
    } catch (error) {
      console.error('Error rejecting verification:', error);
      alert('Failed to reject verification');
    }
  };

  const handleSearchUsers = async () => {
    if (!searchQuery.trim()) {
      await loadUsers();
      return;
    }

    try {
      const results = await adminService.searchUsers(searchQuery);
      setUsers(results);
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  if (loading && activeTab === 'dashboard') {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex items-center gap-3 mb-8">
        <Shield className="w-10 h-10 text-primary" />
        <h1 className="text-4xl font-bold">Admin Dashboard</h1>
      </div>

      <div className="tabs tabs-boxed mb-8 bg-base-200 p-2 shadow-lg">
        <button
          className={`tab tab-lg transition-all ${activeTab === 'dashboard' ? 'tab-active bg-primary text-primary-content' : 'hover:bg-base-300'}`}
          onClick={() => handleTabChange('dashboard')}
        >
          <Activity className="w-4 h-4 mr-2" />
          Dashboard
        </button>
        <button
          className={`tab tab-lg transition-all ${activeTab === 'users' ? 'tab-active bg-primary text-primary-content' : 'hover:bg-base-300'}`}
          onClick={() => handleTabChange('users')}
        >
          <Users className="w-4 h-4 mr-2" />
          Users
        </button>
        <button
          className={`tab tab-lg transition-all ${activeTab === 'topics' ? 'tab-active bg-primary text-primary-content' : 'hover:bg-base-300'}`}
          onClick={() => handleTabChange('topics')}
        >
          <FileText className="w-4 h-4 mr-2" />
          Topics
        </button>
        <button
          className={`tab tab-lg transition-all ${activeTab === 'verifications' ? 'tab-active bg-primary text-primary-content' : 'hover:bg-base-300'}`}
          onClick={() => handleTabChange('verifications')}
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          Verifications
          {stats.pendingVerifications > 0 && (
            <span className="badge badge-error ml-2">{stats.pendingVerifications}</span>
          )}
        </button>
        <button
          className={`tab tab-lg transition-all ${activeTab === 'logs' ? 'tab-active bg-primary text-primary-content' : 'hover:bg-base-300'}`}
          onClick={() => handleTabChange('logs')}
        >
          <Activity className="w-4 h-4 mr-2" />
          Activity Log
        </button>
        <button
          className={`tab tab-lg transition-all ${activeTab === 'categories' ? 'tab-active bg-primary text-primary-content' : 'hover:bg-base-300'}`}
          onClick={() => handleTabChange('categories')}
        >
          <Folder className="w-4 h-4 mr-2" />
          Categories
        </button>
        <button
          className={`tab tab-lg transition-all ${activeTab === 'data-sources' ? 'tab-active bg-primary text-primary-content' : 'hover:bg-base-300'}`}
          onClick={() => handleTabChange('data-sources')}
        >
          <DatabaseIcon className="w-4 h-4 mr-2" />
          Data Sources
        </button>
      </div>

      {activeTab === 'dashboard' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="stats shadow-xl hover:shadow-2xl transition-shadow bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
            <div className="stat">
              <div className="stat-figure text-primary">
                <Users className="w-8 h-8" />
              </div>
              <div className="stat-title">Total Users</div>
              <div className="stat-value text-primary">{stats.totalUsers}</div>
            </div>
          </div>

          <div className="stats shadow-xl hover:shadow-2xl transition-shadow bg-gradient-to-br from-secondary/10 to-secondary/5 border border-secondary/20">
            <div className="stat">
              <div className="stat-figure text-secondary">
                <FileText className="w-8 h-8" />
              </div>
              <div className="stat-title">Total Topics</div>
              <div className="stat-value text-secondary">{stats.totalTopics}</div>
            </div>
          </div>

          <div className="stats shadow-xl hover:shadow-2xl transition-shadow bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20">
            <div className="stat">
              <div className="stat-figure text-accent">
                <CheckCircle className="w-8 h-8" />
              </div>
              <div className="stat-title">Total Votes</div>
              <div className="stat-value text-accent">{stats.totalVotes}</div>
            </div>
          </div>

          <div className="stats shadow-xl hover:shadow-2xl transition-shadow bg-gradient-to-br from-warning/10 to-warning/5 border border-warning/20">
            <div className="stat">
              <div className="stat-figure text-warning">
                <Activity className="w-8 h-8" />
              </div>
              <div className="stat-title">Pending Verifications</div>
              <div className="stat-value text-warning">{stats.pendingVerifications}</div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div>
          <div className="flex gap-4 mb-6">
            <div className="form-control flex-1">
              <div className="input-group">
                <input
                  type="text"
                  placeholder="Search by username or email"
                  className="input input-bordered w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchUsers()}
                />
                <button className="btn btn-primary" onClick={handleSearchUsers}>
                  <Search className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Verified</th>
                  <th>Level</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="hover">
                    <td className="font-semibold">{user.username}</td>
                    <td>{user.email}</td>
                    <td>
                      {user.is_verified ? (
                        <span className="badge badge-success">Verified</span>
                      ) : (
                        <span className="badge badge-ghost">Not Verified</span>
                      )}
                    </td>
                    <td>
                      <span className="badge badge-primary">{user.verification_level}</span>
                    </td>
                    <td>{new Date(user.created_at).toLocaleDateString()}</td>
                    <td>
                      <button className="btn btn-xs btn-outline hover:btn-primary transition-all">
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'topics' && (
        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th>Title</th>
                <th>Creator</th>
                <th>Vote Type</th>
                <th>Votes</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {topics.map((topic: any) => (
                <tr key={topic.id} className="hover">
                  <td className="font-semibold">{topic.title}</td>
                  <td>{topic.creator?.username}</td>
                  <td>
                    <span className="badge badge-primary">{topic.vote_type?.display_name}</span>
                  </td>
                  <td>{topic.vote_count}</td>
                  <td>{new Date(topic.created_at).toLocaleDateString()}</td>
                  <td>
                    <div className="flex gap-2">
                      <button className="btn btn-xs btn-outline hover:btn-primary transition-all">
                        View
                      </button>
                      <button className="btn btn-xs btn-outline btn-error hover:btn-error transition-all">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'verifications' && (
        <div className="space-y-4">
          {verifications.map((request: any) => (
            <div key={request.id} className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
              <div className="card-body">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="card-title text-xl">{request.profile?.username}</h3>
                    <p className="text-base-content/70">{request.profile?.email}</p>
                    <div className="flex gap-2 mt-2">
                      <span className="badge badge-primary">{request.request_type}</span>
                      <span className={`badge ${
                        request.status === 'pending' ? 'badge-warning' :
                        request.status === 'approved' ? 'badge-success' :
                        'badge-error'
                      }`}>
                        {request.status}
                      </span>
                    </div>
                    <p className="text-sm mt-2 text-base-content/60">
                      Requested: {new Date(request.created_at).toLocaleString()}
                    </p>
                  </div>
                  {request.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApproveVerification(request.id)}
                        className="btn btn-success btn-sm shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleRejectVerification(request.id)}
                        className="btn btn-error btn-sm shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          {verifications.length === 0 && (
            <div className="text-center py-12">
              <p className="text-xl text-base-content/70">No verification requests found</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th>Admin</th>
                <th>Action</th>
                <th>Target</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log: any) => (
                <tr key={log.id} className="hover">
                  <td>{log.admin?.username}</td>
                  <td>
                    <span className="badge badge-info">{log.action_type}</span>
                  </td>
                  <td>
                    {log.target_type}: {log.target_id?.slice(0, 8)}...
                  </td>
                  <td>{new Date(log.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'categories' && <CategoriesManager />}

      {activeTab === 'data-sources' && <DataSourcesManager />}
    </div>
  );
}