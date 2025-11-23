import { supabase } from '../lib/supabase';

export type SourceType = 'api' | 'scraper' | 'rss' | 'csv' | 'json' | 'manual' | 'python_script';
export type SyncFrequency = 'hourly' | 'daily' | 'weekly' | 'manual';
export type ImportStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface DataSource {
  id: string;
  name: string;
  description: string | null;
  source_type: SourceType;
  source_url: string | null;
  config: Record<string, unknown>;
  is_active: boolean;
  is_trusted: boolean;
  last_sync_at: string | null;
  sync_frequency: SyncFrequency | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface DataSourceImport {
  id: string;
  data_source_id: string;
  status: ImportStatus;
  topics_imported: number;
  topics_updated: number;
  topics_skipped: number;
  error_message: string | null;
  started_at: string;
  completed_at: string | null;
  metadata: Record<string, unknown>;
}

export const dataSourceService = {
  async getAllDataSources() {
    const { data, error } = await supabase
      .from('data_sources')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) throw error;
    return data as DataSource[];
  },

  async getMyDataSources() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('data_sources')
      .select('*')
      .eq('created_by', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as DataSource[];
  },

  async getDataSourceById(id: string) {
    const { data, error } = await supabase
      .from('data_sources')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data as DataSource | null;
  },

  async createDataSource(dataSource: Partial<DataSource>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('data_sources')
      .insert({
        ...dataSource,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) throw error;
    return data as DataSource;
  },

  async updateDataSource(id: string, updates: Partial<DataSource>) {
    const { data, error } = await supabase
      .from('data_sources')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as DataSource;
  },

  async deleteDataSource(id: string) {
    const { error } = await supabase
      .from('data_sources')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getDataSourceImports(dataSourceId: string) {
    const { data, error } = await supabase
      .from('data_source_imports')
      .select('*')
      .eq('data_source_id', dataSourceId)
      .order('started_at', { ascending: false })
      .limit(20);

    if (error) throw error;
    return data as DataSourceImport[];
  },

  async createImport(dataSourceId: string) {
    const { data, error } = await supabase
      .from('data_source_imports')
      .insert({
        data_source_id: dataSourceId,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;
    return data as DataSourceImport;
  },

  async triggerImport(dataSourceId: string) {
    const importRecord = await this.createImport(dataSourceId);

    // Call the Edge Function to process the import
    const { data, error } = await supabase.functions.invoke('import-data', {
      body: {
        importId: importRecord.id,
        dataSourceId,
      },
    });

    if (error) throw error;
    return data;
  },
};
