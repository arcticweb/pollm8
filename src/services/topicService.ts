import { supabase } from '../lib/supabase';
import type { Database } from '../types/database.types';

type Topic = Database['public']['Tables']['topics']['Row'];
type TopicInsert = Database['public']['Tables']['topics']['Insert'];
type TopicUpdate = Database['public']['Tables']['topics']['Update'];
type VoteTypeConfig = Database['public']['Tables']['vote_type_configs']['Row'];
type SimilaritySuggestion = Database['public']['Tables']['topic_similarity_suggestions']['Row'];

export const topicService = {
  async getVoteTypes(): Promise<VoteTypeConfig[]> {
    const { data, error } = await supabase
      .from('vote_type_configs')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) throw error;
    return data || [];
  },

  async createTopic(topic: TopicInsert): Promise<Topic> {
    const { data, error } = await supabase
      .from('topics')
      .insert(topic)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateTopic(id: string, updates: TopicUpdate): Promise<Topic> {
    const { data, error } = await supabase
      .from('topics')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getTopic(id: string): Promise<Topic | null> {
    const { data, error } = await supabase
      .from('topics')
      .select(`
        *,
        vote_type:vote_type_configs(*),
        creator:profiles(id, username, avatar_url, is_verified)
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getTopics(filters?: {
    createdBy?: string;
    isActive?: boolean;
    search?: string;
    limit?: number;
    offset?: number;
    orderBy?: 'created_at' | 'vote_count' | 'view_count';
    orderDirection?: 'asc' | 'desc';
  }): Promise<Topic[]> {
    let query = supabase
      .from('topics')
      .select(`
        *,
        vote_type:vote_type_configs(display_name),
        creator:profiles(username, avatar_url, is_verified)
      `);

    if (filters?.createdBy) {
      query = query.eq('created_by', filters.createdBy);
    }

    if (filters?.isActive !== undefined) {
      query = query.eq('is_active', filters.isActive);
    }

    if (filters?.search) {
      query = query.ilike('title', `%${filters.search}%`);
    }

    const orderBy = filters?.orderBy || 'created_at';
    const orderDirection = filters?.orderDirection || 'desc';
    query = query.order(orderBy, { ascending: orderDirection === 'asc' });

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  },

  async incrementViewCount(topicId: string): Promise<void> {
    const { error } = await supabase.rpc('increment_view_count', { topic_id: topicId });

    if (error) {
      const { data: topic } = await supabase
        .from('topics')
        .select('view_count')
        .eq('id', topicId)
        .single();

      if (topic) {
        await supabase
          .from('topics')
          .update({ view_count: (topic.view_count || 0) + 1 })
          .eq('id', topicId);
      }
    }
  },

  async findSimilarTopics(title: string, excludeId?: string): Promise<Topic[]> {
    const { data, error } = await supabase
      .from('topics')
      .select('*')
      .ilike('title', `%${title}%`)
      .eq('is_active', true)
      .limit(5);

    if (error) throw error;

    let results = data || [];

    if (excludeId) {
      results = results.filter(t => t.id !== excludeId);
    }

    return results;
  },

  async createSimilaritySuggestion(
    topicId: string,
    similarTopicId: string,
    score: number = 0.8,
    method: 'ai' | 'manual' | 'user_report' = 'manual'
  ): Promise<SimilaritySuggestion> {
    const { data, error } = await supabase
      .from('topic_similarity_suggestions')
      .insert({
        topic_id: topicId,
        similar_topic_id: similarTopicId,
        similarity_score: score,
        suggestion_method: method,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getSimilaritySuggestions(topicId: string): Promise<SimilaritySuggestion[]> {
    const { data, error } = await supabase
      .from('topic_similarity_suggestions')
      .select(`
        *,
        similar_topic:topics(*)
      `)
      .eq('topic_id', topicId)
      .eq('status', 'pending');

    if (error) throw error;
    return data || [];
  },

  async linkTopics(topicId: string, linkedTopicId: string): Promise<void> {
    const { error } = await supabase
      .from('topics')
      .update({ linked_topic_id: linkedTopicId, is_active: false })
      .eq('id', topicId);

    if (error) throw error;
  },
};