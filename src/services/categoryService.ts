import { supabase } from '../lib/supabase';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parent_id: string | null;
  icon: string | null;
  color: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const categoryService = {
  async getAllCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) throw error;
    return data as Category[];
  },

  async getCategoryById(id: string) {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data as Category | null;
  },

  async createCategory(category: Partial<Category>) {
    const { data, error } = await supabase
      .from('categories')
      .insert(category)
      .select()
      .single();

    if (error) throw error;
    return data as Category;
  },

  async updateCategory(id: string, updates: Partial<Category>) {
    const { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Category;
  },

  async deleteCategory(id: string) {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getAllTags() {
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) throw error;
    return data as Tag[];
  },

  async getTagById(id: string) {
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data as Tag | null;
  },

  async createTag(tag: Partial<Tag>) {
    const { data, error } = await supabase
      .from('tags')
      .insert(tag)
      .select()
      .single();

    if (error) throw error;
    return data as Tag;
  },

  async updateTag(id: string, updates: Partial<Tag>) {
    const { data, error } = await supabase
      .from('tags')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Tag;
  },

  async deleteTag(id: string) {
    const { error } = await supabase
      .from('tags')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async assignCategoryToTopic(topicId: string, categoryId: string, isTrusted = false) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('topic_categories')
      .insert({
        topic_id: topicId,
        category_id: categoryId,
        assigned_by: user.id,
        is_trusted: isTrusted,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async assignTagToTopic(topicId: string, tagId: string, isTrusted = false) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('topic_tags')
      .insert({
        topic_id: topicId,
        tag_id: tagId,
        assigned_by: user.id,
        is_trusted: isTrusted,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getTopicCategories(topicId: string, trustedOnly = true) {
    let query = supabase
      .from('topic_categories')
      .select('*, categories(*)')
      .eq('topic_id', topicId);

    if (trustedOnly) {
      query = query.eq('is_trusted', true);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getTopicTags(topicId: string, trustedOnly = true) {
    let query = supabase
      .from('topic_tags')
      .select('*, tags(*)')
      .eq('topic_id', topicId);

    if (trustedOnly) {
      query = query.eq('is_trusted', true);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },
};
