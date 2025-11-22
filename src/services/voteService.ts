import { supabase } from '../lib/supabase';
import type { Database } from '../types/database.types';

type Vote = Database['public']['Tables']['votes']['Row'];
type VoteInsert = Database['public']['Tables']['votes']['Insert'];
type VoteResultsCache = Database['public']['Tables']['vote_results_cache']['Row'];

export const voteService = {
  async castVote(
    topicId: string,
    profileId: string,
    voteData: Record<string, any>,
    isVerified: boolean = false,
    verificationLevel: string = 'none'
  ): Promise<Vote> {
    const { data, error } = await supabase
      .from('votes')
      .upsert(
        {
          topic_id: topicId,
          profile_id: profileId,
          vote_data: voteData,
          is_verified_vote: isVerified,
          verification_level: verificationLevel,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'topic_id,profile_id',
        }
      )
      .select()
      .single();

    if (error) throw error;

    await this.updateTopicVoteCount(topicId);
    await this.invalidateResultsCache(topicId);

    return data;
  },

  async getVote(topicId: string, profileId: string): Promise<Vote | null> {
    const { data, error } = await supabase
      .from('votes')
      .select('*')
      .eq('topic_id', topicId)
      .eq('profile_id', profileId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getTopicVotes(topicId: string, verifiedOnly: boolean = false): Promise<Vote[]> {
    let query = supabase
      .from('votes')
      .select('*')
      .eq('topic_id', topicId);

    if (verifiedOnly) {
      query = query.eq('is_verified_vote', true);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  },

  async updateTopicVoteCount(topicId: string): Promise<void> {
    const { count, error } = await supabase
      .from('votes')
      .select('*', { count: 'exact', head: true })
      .eq('topic_id', topicId);

    if (error) throw error;

    await supabase
      .from('topics')
      .update({ vote_count: count || 0 })
      .eq('id', topicId);
  },

  async calculateResults(topicId: string): Promise<VoteResultsCache> {
    const votes = await this.getTopicVotes(topicId);
    const verifiedVotes = votes.filter(v => v.is_verified_vote);

    const allVotesData = this.aggregateVotes(votes);
    const verifiedVotesData = this.aggregateVotes(verifiedVotes);
    const demographicData = await this.calculateDemographicBreakdown(topicId);

    const { data, error } = await supabase
      .from('vote_results_cache')
      .upsert(
        {
          topic_id: topicId,
          all_votes: allVotesData,
          verified_votes: verifiedVotesData,
          demographic_breakdown: demographicData,
          last_calculated: new Date().toISOString(),
          vote_count_all: votes.length,
          vote_count_verified: verifiedVotes.length,
        },
        {
          onConflict: 'topic_id',
        }
      )
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  aggregateVotes(votes: Vote[]): Record<string, any> {
    if (votes.length === 0) return {};

    const firstVote = votes[0];
    const voteData = firstVote.vote_data as Record<string, any>;

    if ('answer' in voteData) {
      const counts: Record<string, number> = {};
      votes.forEach(vote => {
        const answer = (vote.vote_data as any).answer;
        counts[answer] = (counts[answer] || 0) + 1;
      });
      return counts;
    }

    if ('choice' in voteData) {
      const counts: Record<string, number> = {};
      votes.forEach(vote => {
        const choice = (vote.vote_data as any).choice;
        counts[choice] = (counts[choice] || 0) + 1;
      });
      return counts;
    }

    if ('rating' in voteData) {
      const ratings = votes.map(vote => (vote.vote_data as any).rating);
      const sum = ratings.reduce((a: number, b: number) => a + b, 0);
      const avg = sum / ratings.length;
      const distribution: Record<number, number> = {};
      ratings.forEach((rating: number) => {
        distribution[rating] = (distribution[rating] || 0) + 1;
      });
      return { average: avg, distribution, count: ratings.length };
    }

    if ('response' in voteData) {
      return { responses: votes.map(v => (v.vote_data as any).response), count: votes.length };
    }

    return { count: votes.length };
  },

  async calculateDemographicBreakdown(topicId: string): Promise<Record<string, any>> {
    const { data: votes, error } = await supabase
      .from('votes')
      .select(`
        *,
        profile:profiles!inner(
          demographics:profile_demographics(*)
        )
      `)
      .eq('topic_id', topicId);

    if (error || !votes) return {};

    const breakdown: Record<string, any> = {
      by_age: {},
      by_gender: {},
      by_location: {},
    };

    votes.forEach((vote: any) => {
      if (vote.profile?.demographics?.[0]) {
        const demo = vote.profile.demographics[0];

        if (demo.age_range) {
          breakdown.by_age[demo.age_range] = (breakdown.by_age[demo.age_range] || 0) + 1;
        }

        if (demo.gender) {
          breakdown.by_gender[demo.gender] = (breakdown.by_gender[demo.gender] || 0) + 1;
        }

        if (demo.location_country) {
          breakdown.by_location[demo.location_country] = (breakdown.by_location[demo.location_country] || 0) + 1;
        }
      }
    });

    return breakdown;
  },

  async getResults(topicId: string, forceRecalculate: boolean = false): Promise<VoteResultsCache | null> {
    if (forceRecalculate) {
      return await this.calculateResults(topicId);
    }

    const { data, error } = await supabase
      .from('vote_results_cache')
      .select('*')
      .eq('topic_id', topicId)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return await this.calculateResults(topicId);
    }

    const cacheAge = Date.now() - new Date(data.last_calculated).getTime();
    if (cacheAge > 60000) {
      return await this.calculateResults(topicId);
    }

    return data;
  },

  async invalidateResultsCache(topicId: string): Promise<void> {
    await this.calculateResults(topicId);
  },
};