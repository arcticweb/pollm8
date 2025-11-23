import { useState, useEffect } from 'react';
import { Plus, Play, Trash2, Edit2, CheckCircle, XCircle, Clock } from 'lucide-react';
import { dataSourceService, type DataSource, type SourceType, type SyncFrequency } from '../../services/dataSourceService';

export function DataSourcesManager() {
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSource, setNewSource] = useState<Partial<DataSource>>({
    source_type: 'api',
    is_active: true,
    is_trusted: false,
    sync_frequency: 'manual',
    config: {},
  });

  useEffect(() => {
    loadDataSources();
  }, []);

  const loadDataSources = async () => {
    try {
      const data = await dataSourceService.getAllDataSources();
      setDataSources(data);
    } catch (error) {
      console.error('Error loading data sources:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newSource.name || !newSource.source_type) {
      alert('Name and source type are required');
      return;
    }

    try {
      await dataSourceService.createDataSource(newSource);
      setShowAddForm(false);
      setNewSource({
        source_type: 'api',
        is_active: true,
        is_trusted: false,
        sync_frequency: 'manual',
        config: {},
      });
      await loadDataSources();
    } catch (error) {
      console.error('Error creating data source:', error);
      alert('Failed to create data source');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this data source?')) return;

    try {
      await dataSourceService.deleteDataSource(id);
      await loadDataSources();
    } catch (error) {
      console.error('Error deleting data source:', error);
      alert('Failed to delete data source');
    }
  };

  const handleTriggerImport = async (id: string) => {
    if (!confirm('Start importing data from this source?')) return;

    try {
      setLoading(true);
      await dataSourceService.triggerImport(id);
      alert('Import started! Check back shortly for results.');
      await loadDataSources();
    } catch (error) {
      console.error('Error triggering import:', error);
      alert('Failed to start import');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTrusted = async (source: DataSource) => {
    try {
      await dataSourceService.updateDataSource(source.id, {
        is_trusted: !source.is_trusted,
      });
      await loadDataSources();
    } catch (error) {
      console.error('Error updating data source:', error);
      alert('Failed to update data source');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Data Sources</h2>
          <p className="text-sm text-base-content/60">
            Manage external data sources for populating topics
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn btn-primary btn-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Data Source
        </button>
      </div>

      {showAddForm && (
        <div className="card bg-base-200">
          <div className="card-body">
            <h3 className="card-title text-lg">New Data Source</h3>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Name"
                value={newSource.name || ''}
                onChange={(e) => setNewSource({ ...newSource, name: e.target.value })}
                className="input input-bordered"
              />
              <select
                value={newSource.source_type}
                onChange={(e) => setNewSource({ ...newSource, source_type: e.target.value as SourceType })}
                className="select select-bordered"
              >
                <option value="api">API</option>
                <option value="rss">RSS Feed</option>
                <option value="json">JSON URL</option>
                <option value="csv">CSV URL</option>
                <option value="scraper">Web Scraper</option>
                <option value="python_script">Python Script</option>
              </select>
            </div>
            <input
              type="url"
              placeholder="Source URL"
              value={newSource.source_url || ''}
              onChange={(e) => setNewSource({ ...newSource, source_url: e.target.value })}
              className="input input-bordered"
            />
            <textarea
              placeholder="Description"
              value={newSource.description || ''}
              onChange={(e) => setNewSource({ ...newSource, description: e.target.value })}
              className="textarea textarea-bordered"
              rows={2}
            />
            <div className="grid grid-cols-2 gap-4">
              <select
                value={newSource.sync_frequency || 'manual'}
                onChange={(e) => setNewSource({ ...newSource, sync_frequency: e.target.value as SyncFrequency })}
                className="select select-bordered"
              >
                <option value="manual">Manual</option>
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
              <label className="label cursor-pointer justify-start gap-4">
                <input
                  type="checkbox"
                  checked={newSource.is_trusted || false}
                  onChange={(e) => setNewSource({ ...newSource, is_trusted: e.target.checked })}
                  className="checkbox checkbox-primary"
                />
                <span className="label-text">Trusted Source (auto-approve imports)</span>
              </label>
            </div>
            <div className="card-actions justify-end">
              <button
                onClick={() => setShowAddForm(false)}
                className="btn btn-ghost btn-sm"
              >
                Cancel
              </button>
              <button onClick={handleCreate} className="btn btn-primary btn-sm">
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {dataSources.map((source) => (
          <div key={source.id} className="card bg-base-100 border border-base-300">
            <div className="card-body">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="card-title text-lg">{source.name}</h3>
                    <span className="badge badge-sm">{source.source_type}</span>
                    {source.is_trusted && (
                      <span className="badge badge-success badge-sm">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Trusted
                      </span>
                    )}
                    {!source.is_active && (
                      <span className="badge badge-error badge-sm">
                        <XCircle className="w-3 h-3 mr-1" />
                        Inactive
                      </span>
                    )}
                  </div>
                  {source.description && (
                    <p className="text-sm text-base-content/70 mb-2">{source.description}</p>
                  )}
                  {source.source_url && (
                    <p className="text-xs text-base-content/60 mb-2 font-mono truncate">
                      {source.source_url}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-base-content/60">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {source.sync_frequency || 'manual'}
                    </span>
                    {source.last_sync_at && (
                      <span>
                        Last sync: {new Date(source.last_sync_at).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleTriggerImport(source.id)}
                    className="btn btn-primary btn-sm btn-square"
                    disabled={!source.is_active}
                    title="Trigger import"
                  >
                    <Play className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleToggleTrusted(source)}
                    className={`btn btn-sm btn-square ${source.is_trusted ? 'btn-success' : 'btn-ghost'}`}
                    title="Toggle trusted status"
                  >
                    <CheckCircle className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(source.id)}
                    className="btn btn-ghost btn-sm btn-square text-error"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {dataSources.length === 0 && (
        <div className="text-center py-12 text-base-content/60">
          <p className="mb-4">No data sources configured yet.</p>
          <p className="text-sm">
            Data sources allow you to automatically import topics from external APIs, RSS feeds, and more.
          </p>
        </div>
      )}
    </div>
  );
}
