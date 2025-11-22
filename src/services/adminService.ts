import { supabase } from '../lib/supabase';
import type { Database } from '../types/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type VerificationRequest = Database['public']['Tables']['verification_requests']['Row'];
type AdminAction = Database['public']['Tables']['admin_actions']['Row'];

export const adminService = {
  async isAdmin(): Promise<boolean> {
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', (await supabase.auth.getUser()).data.user?.id || '')
      .single();

    return profile?.is_admin || false;
  },

  async getAdminLevel(): Promise<string> {
    const { data: profile } = await supabase
      .from('profiles')
      .select('admin_level')
      .eq('id', (await supabase.auth.getUser()).data.user?.id || '')
      .single();

    return profile?.admin_level || 'none';
  },

  async getAllUsers(limit: number = 50, offset: number = 0): Promise<Profile[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data || [];
  },

  async searchUsers(query: string): Promise<Profile[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .or(`username.ilike.%${query}%,email.ilike.%${query}%`)
      .limit(20);

    if (error) throw error;
    return data || [];
  },

  async updateUserVerification(
    userId: string,
    isVerified: boolean,
    verificationLevel: string,
    notes?: string
  ): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .update({
        is_verified: isVerified,
        verification_level: verificationLevel,
        admin_notes: notes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) throw error;

    await this.logAction('update_verification', 'profile', userId, {
      is_verified: isVerified,
      verification_level: verificationLevel,
    });
  },

  async getVerificationRequests(status?: string): Promise<VerificationRequest[]> {
    let query = supabase
      .from('verification_requests')
      .select(`
        *,
        profile:profiles(id, username, email, is_verified)
      `)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  },

  async approveVerificationRequest(
    requestId: string,
    reviewNotes?: string
  ): Promise<void> {
    const { data: request, error: fetchError } = await supabase
      .from('verification_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (fetchError) throw fetchError;

    const adminId = (await supabase.auth.getUser()).data.user?.id;

    const { error: updateError } = await supabase
      .from('verification_requests')
      .update({
        status: 'approved',
        reviewed_by: adminId,
        reviewed_at: new Date().toISOString(),
        review_notes: reviewNotes,
      })
      .eq('id', requestId);

    if (updateError) throw updateError;

    await this.updateUserVerification(
      request.profile_id,
      true,
      request.request_type,
      reviewNotes
    );
  },

  async rejectVerificationRequest(
    requestId: string,
    reviewNotes?: string
  ): Promise<void> {
    const adminId = (await supabase.auth.getUser()).data.user?.id;

    const { error } = await supabase
      .from('verification_requests')
      .update({
        status: 'rejected',
        reviewed_by: adminId,
        reviewed_at: new Date().toISOString(),
        review_notes: reviewNotes,
      })
      .eq('id', requestId);

    if (error) throw error;

    await this.logAction('reject_verification', 'verification_request', requestId, {
      review_notes: reviewNotes,
    });
  },

  async getAllTopics(limit: number = 50): Promise<any[]> {
    const { data, error } = await supabase
      .from('topics')
      .select(`
        *,
        creator:profiles(username, email),
        vote_type:vote_type_configs(display_name)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  async getAllVotes(topicId?: string): Promise<any[]> {
    let query = supabase
      .from('votes')
      .select(`
        *,
        topic:topics(title),
        profile:profiles(username, email)
      `)
      .order('created_at', { ascending: false });

    if (topicId) {
      query = query.eq('topic_id', topicId);
    }

    const { data, error } = await query.limit(100);

    if (error) throw error;
    return data || [];
  },

  async deleteUser(userId: string, reason: string): Promise<void> {
    await this.logAction('delete_user', 'profile', userId, { reason });

    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (error) throw error;
  },

  async deleteTopic(topicId: string, reason: string): Promise<void> {
    await this.logAction('delete_topic', 'topic', topicId, { reason });

    const { error } = await supabase
      .from('topics')
      .delete()
      .eq('id', topicId);

    if (error) throw error;
  },

  async logAction(
    actionType: string,
    targetType: string,
    targetId: string,
    actionData?: any
  ): Promise<void> {
    const adminId = (await supabase.auth.getUser()).data.user?.id;

    await supabase.from('admin_actions').insert({
      admin_id: adminId,
      action_type: actionType,
      target_type: targetType,
      target_id: targetId,
      action_data: actionData || {},
    });
  },

  async getAdminActions(limit: number = 50): Promise<AdminAction[]> {
    const { data, error } = await supabase
      .from('admin_actions')
      .select(`
        *,
        admin:profiles!admin_actions_admin_id_fkey(username, email)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  async getStats(): Promise<{
    totalUsers: number;
    totalTopics: number;
    totalVotes: number;
    pendingVerifications: number;
  }> {
    const [users, topics, votes, verifications] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('topics').select('*', { count: 'exact', head: true }),
      supabase.from('votes').select('*', { count: 'exact', head: true }),
      supabase
        .from('verification_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending'),
    ]);

    return {
      totalUsers: users.count || 0,
      totalTopics: topics.count || 0,
      totalVotes: votes.count || 0,
      pendingVerifications: verifications.count || 0,
    };
  },
};