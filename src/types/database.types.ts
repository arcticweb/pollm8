export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          email: string
          avatar_url: string | null
          bio: string | null
          is_verified: boolean
          verification_level: 'none' | 'email' | 'phone' | 'id' | 'full'
          is_admin: boolean
          admin_level: 'none' | 'moderator' | 'admin' | 'super_admin'
          admin_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          email: string
          avatar_url?: string | null
          bio?: string | null
          is_verified?: boolean
          verification_level?: 'none' | 'email' | 'phone' | 'id' | 'full'
          is_admin?: boolean
          admin_level?: 'none' | 'moderator' | 'admin' | 'super_admin'
          admin_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          email?: string
          avatar_url?: string | null
          bio?: string | null
          is_verified?: boolean
          verification_level?: 'none' | 'email' | 'phone' | 'id' | 'full'
          is_admin?: boolean
          admin_level?: 'none' | 'moderator' | 'admin' | 'super_admin'
          admin_notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      profile_demographics: {
        Row: {
          id: string
          profile_id: string
          age_range: string | null
          gender: string | null
          location_country: string | null
          location_region: string | null
          location_city: string | null
          education_level: string | null
          employment_status: string | null
          income_range: string | null
          is_verified: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          age_range?: string | null
          gender?: string | null
          location_country?: string | null
          location_region?: string | null
          location_city?: string | null
          education_level?: string | null
          employment_status?: string | null
          income_range?: string | null
          is_verified?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          age_range?: string | null
          gender?: string | null
          location_country?: string | null
          location_region?: string | null
          location_city?: string | null
          education_level?: string | null
          employment_status?: string | null
          income_range?: string | null
          is_verified?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      vote_type_configs: {
        Row: {
          id: string
          name: string
          display_name: string
          description: string | null
          config_schema: Json
          default_config: Json
          is_active: boolean
          version: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          display_name: string
          description?: string | null
          config_schema?: Json
          default_config?: Json
          is_active?: boolean
          version?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          display_name?: string
          description?: string | null
          config_schema?: Json
          default_config?: Json
          is_active?: boolean
          version?: number
          created_at?: string
          updated_at?: string
        }
      }
      topics: {
        Row: {
          id: string
          created_by: string | null
          title: string
          description: string | null
          vote_type_id: string
          vote_config: Json
          require_verification: boolean
          min_verification_level: string
          expires_at: string | null
          is_active: boolean
          is_closed: boolean
          linked_topic_id: string | null
          view_count: number
          vote_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          created_by?: string | null
          title: string
          description?: string | null
          vote_type_id: string
          vote_config?: Json
          require_verification?: boolean
          min_verification_level?: string
          expires_at?: string | null
          is_active?: boolean
          is_closed?: boolean
          linked_topic_id?: string | null
          view_count?: number
          vote_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          created_by?: string | null
          title?: string
          description?: string | null
          vote_type_id?: string
          vote_config?: Json
          require_verification?: boolean
          min_verification_level?: string
          expires_at?: string | null
          is_active?: boolean
          is_closed?: boolean
          linked_topic_id?: string | null
          view_count?: number
          vote_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      topic_similarity_suggestions: {
        Row: {
          id: string
          topic_id: string
          similar_topic_id: string
          similarity_score: number
          suggestion_method: 'ai' | 'manual' | 'user_report'
          status: 'pending' | 'accepted' | 'rejected'
          reviewed_by: string | null
          reviewed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          topic_id: string
          similar_topic_id: string
          similarity_score?: number
          suggestion_method?: 'ai' | 'manual' | 'user_report'
          status?: 'pending' | 'accepted' | 'rejected'
          reviewed_by?: string | null
          reviewed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          topic_id?: string
          similar_topic_id?: string
          similarity_score?: number
          suggestion_method?: 'ai' | 'manual' | 'user_report'
          status?: 'pending' | 'accepted' | 'rejected'
          reviewed_by?: string | null
          reviewed_at?: string | null
          created_at?: string
        }
      }
      votes: {
        Row: {
          id: string
          topic_id: string
          profile_id: string
          vote_data: Json
          is_verified_vote: boolean
          verification_level: string
          ip_address: string | null
          user_agent: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          topic_id: string
          profile_id: string
          vote_data: Json
          is_verified_vote?: boolean
          verification_level?: string
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          topic_id?: string
          profile_id?: string
          vote_data?: Json
          is_verified_vote?: boolean
          verification_level?: string
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      vote_results_cache: {
        Row: {
          id: string
          topic_id: string
          all_votes: Json
          verified_votes: Json
          demographic_breakdown: Json
          last_calculated: string
          vote_count_all: number
          vote_count_verified: number
        }
        Insert: {
          id?: string
          topic_id: string
          all_votes?: Json
          verified_votes?: Json
          demographic_breakdown?: Json
          last_calculated?: string
          vote_count_all?: number
          vote_count_verified?: number
        }
        Update: {
          id?: string
          topic_id?: string
          all_votes?: Json
          verified_votes?: Json
          demographic_breakdown?: Json
          last_calculated?: string
          vote_count_all?: number
          vote_count_verified?: number
        }
      }
      notification_channels: {
        Row: {
          id: string
          profile_id: string
          channel_type: 'email' | 'webhook' | 'sms'
          channel_config: Json
          is_active: boolean
          is_verified: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          channel_type: 'email' | 'webhook' | 'sms'
          channel_config?: Json
          is_active?: boolean
          is_verified?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          channel_type?: 'email' | 'webhook' | 'sms'
          channel_config?: Json
          is_active?: boolean
          is_verified?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      notification_preferences: {
        Row: {
          id: string
          profile_id: string
          topic_created_on_mine: boolean
          topic_trending: boolean
          verification_status: boolean
          similar_topic_suggested: boolean
          weekly_summary: boolean
          custom_rules: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          topic_created_on_mine?: boolean
          topic_trending?: boolean
          verification_status?: boolean
          similar_topic_suggested?: boolean
          weekly_summary?: boolean
          custom_rules?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          topic_created_on_mine?: boolean
          topic_trending?: boolean
          verification_status?: boolean
          similar_topic_suggested?: boolean
          weekly_summary?: boolean
          custom_rules?: Json
          created_at?: string
          updated_at?: string
        }
      }
      analytics_events: {
        Row: {
          id: string
          profile_id: string | null
          event_type: string
          event_name: string
          event_data: Json
          session_id: string | null
          page_url: string | null
          referrer: string | null
          created_at: string
        }
        Insert: {
          id?: string
          profile_id?: string | null
          event_type: string
          event_name: string
          event_data?: Json
          session_id?: string | null
          page_url?: string | null
          referrer?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          profile_id?: string | null
          event_type?: string
          event_name?: string
          event_data?: Json
          session_id?: string | null
          page_url?: string | null
          referrer?: string | null
          created_at?: string
        }
      }
      api_keys: {
        Row: {
          id: string
          profile_id: string
          key_hash: string
          name: string
          permissions: Json
          last_used_at: string | null
          expires_at: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          key_hash: string
          name: string
          permissions?: Json
          last_used_at?: string | null
          expires_at?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          key_hash?: string
          name?: string
          permissions?: Json
          last_used_at?: string | null
          expires_at?: string | null
          is_active?: boolean
          created_at?: string
        }
      }
      verification_requests: {
        Row: {
          id: string
          profile_id: string
          request_type: 'email' | 'phone' | 'id' | 'full'
          request_data: Json
          status: 'pending' | 'approved' | 'rejected'
          reviewed_by: string | null
          reviewed_at: string | null
          review_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          request_type: 'email' | 'phone' | 'id' | 'full'
          request_data?: Json
          status?: 'pending' | 'approved' | 'rejected'
          reviewed_by?: string | null
          reviewed_at?: string | null
          review_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          request_type?: 'email' | 'phone' | 'id' | 'full'
          request_data?: Json
          status?: 'pending' | 'approved' | 'rejected'
          reviewed_by?: string | null
          reviewed_at?: string | null
          review_notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      admin_actions: {
        Row: {
          id: string
          admin_id: string
          action_type: string
          target_type: string
          target_id: string | null
          action_data: Json
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          admin_id: string
          action_type: string
          target_type: string
          target_id?: string | null
          action_data?: Json
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          admin_id?: string
          action_type?: string
          target_type?: string
          target_id?: string | null
          action_data?: Json
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}