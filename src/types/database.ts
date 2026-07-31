export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      announcements: {
        Row: {
          body: string
          club_id: string
          created_at: string
          created_by: string
          event_id: string | null
          id: string
          published_at: string | null
          status: Database["public"]["Enums"]["announcement_status"]
          title: string
          updated_at: string
        }
        Insert: {
          body: string
          club_id: string
          created_at?: string
          created_by: string
          event_id?: string | null
          id?: string
          published_at?: string | null
          status?: Database["public"]["Enums"]["announcement_status"]
          title: string
          updated_at?: string
        }
        Update: {
          body?: string
          club_id?: string
          created_at?: string
          created_by?: string
          event_id?: string | null
          id?: string
          published_at?: string | null
          status?: Database["public"]["Enums"]["announcement_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcements_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "announcements_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "announcements_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      club_invitations: {
        Row: {
          accepted_at: string | null
          accepted_by: string | null
          club_id: string
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string
          role: Database["public"]["Enums"]["club_role"]
          token_hash: string
        }
        Insert: {
          accepted_at?: string | null
          accepted_by?: string | null
          club_id: string
          created_at?: string
          email: string
          expires_at: string
          id?: string
          invited_by: string
          role?: Database["public"]["Enums"]["club_role"]
          token_hash: string
        }
        Update: {
          accepted_at?: string | null
          accepted_by?: string | null
          club_id?: string
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          role?: Database["public"]["Enums"]["club_role"]
          token_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "club_invitations_accepted_by_fkey"
            columns: ["accepted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "club_invitations_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "club_invitations_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      club_memberships: {
        Row: {
          club_id: string
          created_at: string
          display_name: string
          email: string | null
          gender_category: Database["public"]["Enums"]["gender_category"] | null
          id: string
          is_guest: boolean
          joined_at: string | null
          member_number: string | null
          membership_status: Database["public"]["Enums"]["membership_status"]
          phone: string | null
          profile_id: string | null
          updated_at: string
        }
        Insert: {
          club_id: string
          created_at?: string
          display_name: string
          email?: string | null
          gender_category?:
            | Database["public"]["Enums"]["gender_category"]
            | null
          id?: string
          is_guest?: boolean
          joined_at?: string | null
          member_number?: string | null
          membership_status?: Database["public"]["Enums"]["membership_status"]
          phone?: string | null
          profile_id?: string | null
          updated_at?: string
        }
        Update: {
          club_id?: string
          created_at?: string
          display_name?: string
          email?: string | null
          gender_category?:
            | Database["public"]["Enums"]["gender_category"]
            | null
          id?: string
          is_guest?: boolean
          joined_at?: string | null
          member_number?: string | null
          membership_status?: Database["public"]["Enums"]["membership_status"]
          phone?: string | null
          profile_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "club_memberships_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "club_memberships_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      club_role_assignments: {
        Row: {
          club_id: string
          created_at: string
          granted_by: string | null
          id: string
          membership_id: string
          role: Database["public"]["Enums"]["club_role"]
        }
        Insert: {
          club_id: string
          created_at?: string
          granted_by?: string | null
          id?: string
          membership_id: string
          role: Database["public"]["Enums"]["club_role"]
        }
        Update: {
          club_id?: string
          created_at?: string
          granted_by?: string | null
          id?: string
          membership_id?: string
          role?: Database["public"]["Enums"]["club_role"]
        }
        Relationships: [
          {
            foreignKeyName: "club_role_assignments_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "club_role_assignments_membership_id_club_id_fkey"
            columns: ["membership_id", "club_id"]
            isOneToOne: false
            referencedRelation: "club_memberships"
            referencedColumns: ["id", "club_id"]
          },
        ]
      }
      clubs: {
        Row: {
          country_code: string
          created_at: string
          description: string | null
          id: string
          logo_url: string | null
          name: string
          owner_user_id: string
          slug: string
          status: Database["public"]["Enums"]["club_status"]
          timezone: string
          updated_at: string
        }
        Insert: {
          country_code: string
          created_at?: string
          description?: string | null
          id?: string
          logo_url?: string | null
          name: string
          owner_user_id: string
          slug: string
          status?: Database["public"]["Enums"]["club_status"]
          timezone: string
          updated_at?: string
        }
        Update: {
          country_code?: string
          created_at?: string
          description?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          owner_user_id?: string
          slug?: string
          status?: Database["public"]["Enums"]["club_status"]
          timezone?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clubs_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      courts: {
        Row: {
          created_at: string
          event_id: string
          id: string
          name: string
          notes: string | null
          sort_order: number
          status: Database["public"]["Enums"]["court_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          name: string
          notes?: string | null
          sort_order?: number
          status?: Database["public"]["Enums"]["court_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          name?: string
          notes?: string | null
          sort_order?: number
          status?: Database["public"]["Enums"]["court_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "courts_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_registrations: {
        Row: {
          availability: Database["public"]["Enums"]["availability_status"]
          checked_in_at: string | null
          created_at: string
          event_id: string
          games_played: number
          id: string
          last_played_at: string | null
          membership_id: string
          queue_priority: number
          status: Database["public"]["Enums"]["registration_status"]
          updated_at: string
        }
        Insert: {
          availability?: Database["public"]["Enums"]["availability_status"]
          checked_in_at?: string | null
          created_at?: string
          event_id: string
          games_played?: number
          id?: string
          last_played_at?: string | null
          membership_id: string
          queue_priority?: number
          status?: Database["public"]["Enums"]["registration_status"]
          updated_at?: string
        }
        Update: {
          availability?: Database["public"]["Enums"]["availability_status"]
          checked_in_at?: string | null
          created_at?: string
          event_id?: string
          games_played?: number
          id?: string
          last_played_at?: string | null
          membership_id?: string
          queue_priority?: number
          status?: Database["public"]["Enums"]["registration_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_registrations_membership_id_fkey"
            columns: ["membership_id"]
            isOneToOne: false
            referencedRelation: "club_memberships"
            referencedColumns: ["id"]
          },
        ]
      }
      event_rounds: {
        Row: {
          confirmed_by: string | null
          created_at: string
          event_id: string
          explanation: string | null
          id: string
          quality_score: number | null
          round_number: number
          status: Database["public"]["Enums"]["round_status"]
          strategy: string
          updated_at: string
        }
        Insert: {
          confirmed_by?: string | null
          created_at?: string
          event_id: string
          explanation?: string | null
          id?: string
          quality_score?: number | null
          round_number: number
          status?: Database["public"]["Enums"]["round_status"]
          strategy?: string
          updated_at?: string
        }
        Update: {
          confirmed_by?: string | null
          created_at?: string
          event_id?: string
          explanation?: string | null
          id?: string
          quality_score?: number | null
          round_number?: number
          status?: Database["public"]["Enums"]["round_status"]
          strategy?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_rounds_confirmed_by_fkey"
            columns: ["confirmed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_rounds_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          capacity: number
          check_in_open: boolean
          club_id: string
          created_at: string
          created_by: string
          current_round_number: number
          description: string | null
          ends_at: string
          format: Database["public"]["Enums"]["event_format"]
          id: string
          name: string
          starts_at: string
          status: Database["public"]["Enums"]["event_status"]
          updated_at: string
          venue: string
        }
        Insert: {
          capacity?: number
          check_in_open?: boolean
          club_id: string
          created_at?: string
          created_by: string
          current_round_number?: number
          description?: string | null
          ends_at: string
          format?: Database["public"]["Enums"]["event_format"]
          id?: string
          name: string
          starts_at: string
          status?: Database["public"]["Enums"]["event_status"]
          updated_at?: string
          venue: string
        }
        Update: {
          capacity?: number
          check_in_open?: boolean
          club_id?: string
          created_at?: string
          created_by?: string
          current_round_number?: number
          description?: string | null
          ends_at?: string
          format?: Database["public"]["Enums"]["event_format"]
          id?: string
          name?: string
          starts_at?: string
          status?: Database["public"]["Enums"]["event_status"]
          updated_at?: string
          venue?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      match_participants: {
        Row: {
          confirmed_at: string | null
          created_at: string
          disputed_at: string | null
          id: string
          match_id: string
          membership_id: string
          position: number
          team: number
        }
        Insert: {
          confirmed_at?: string | null
          created_at?: string
          disputed_at?: string | null
          id?: string
          match_id: string
          membership_id: string
          position: number
          team: number
        }
        Update: {
          confirmed_at?: string | null
          created_at?: string
          disputed_at?: string | null
          id?: string
          match_id?: string
          membership_id?: string
          position?: number
          team?: number
        }
        Relationships: [
          {
            foreignKeyName: "match_participants_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_participants_membership_id_fkey"
            columns: ["membership_id"]
            isOneToOne: false
            referencedRelation: "club_memberships"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          best_of: number
          completed_at: string | null
          confirmed_at: string | null
          confirmed_by: string | null
          court_id: string | null
          created_at: string
          dispute_reason: string | null
          disputed_at: string | null
          disputed_by: string | null
          event_id: string
          finalized_at: string | null
          id: string
          match_number: number
          round_id: string
          serving_team: number | null
          started_at: string | null
          status: Database["public"]["Enums"]["match_status"]
          submitted_at: string | null
          submitted_by: string | null
          team_one_score: number
          team_two_score: number
          updated_at: string
          version: number
          winner_team: number | null
        }
        Insert: {
          best_of?: number
          completed_at?: string | null
          confirmed_at?: string | null
          confirmed_by?: string | null
          court_id?: string | null
          created_at?: string
          dispute_reason?: string | null
          disputed_at?: string | null
          disputed_by?: string | null
          event_id: string
          finalized_at?: string | null
          id?: string
          match_number: number
          round_id: string
          serving_team?: number | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["match_status"]
          submitted_at?: string | null
          submitted_by?: string | null
          team_one_score?: number
          team_two_score?: number
          updated_at?: string
          version?: number
          winner_team?: number | null
        }
        Update: {
          best_of?: number
          completed_at?: string | null
          confirmed_at?: string | null
          confirmed_by?: string | null
          court_id?: string | null
          created_at?: string
          dispute_reason?: string | null
          disputed_at?: string | null
          disputed_by?: string | null
          event_id?: string
          finalized_at?: string | null
          id?: string
          match_number?: number
          round_id?: string
          serving_team?: number | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["match_status"]
          submitted_at?: string | null
          submitted_by?: string | null
          team_one_score?: number
          team_two_score?: number
          updated_at?: string
          version?: number
          winner_team?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "matches_confirmed_by_fkey"
            columns: ["confirmed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_court_id_fkey"
            columns: ["court_id"]
            isOneToOne: false
            referencedRelation: "courts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_disputed_by_fkey"
            columns: ["disputed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_round_id_fkey"
            columns: ["round_id"]
            isOneToOne: false
            referencedRelation: "event_rounds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      player_profiles: {
        Row: {
          dominant_hand: Database["public"]["Enums"]["dominant_hand"] | null
          doubles_rating: number
          initial_skill_level: Database["public"]["Enums"]["skill_level"]
          membership_id: string
          play_preference: Database["public"]["Enums"]["play_preference"]
          preferred_format: Database["public"]["Enums"]["preferred_format"]
          preferred_side: Database["public"]["Enums"]["preferred_side"]
          rating_confidence: number
          singles_rating: number
          updated_at: string
        }
        Insert: {
          dominant_hand?: Database["public"]["Enums"]["dominant_hand"] | null
          doubles_rating?: number
          initial_skill_level?: Database["public"]["Enums"]["skill_level"]
          membership_id: string
          play_preference?: Database["public"]["Enums"]["play_preference"]
          preferred_format?: Database["public"]["Enums"]["preferred_format"]
          preferred_side?: Database["public"]["Enums"]["preferred_side"]
          rating_confidence?: number
          singles_rating?: number
          updated_at?: string
        }
        Update: {
          dominant_hand?: Database["public"]["Enums"]["dominant_hand"] | null
          doubles_rating?: number
          initial_skill_level?: Database["public"]["Enums"]["skill_level"]
          membership_id?: string
          play_preference?: Database["public"]["Enums"]["play_preference"]
          preferred_format?: Database["public"]["Enums"]["preferred_format"]
          preferred_side?: Database["public"]["Enums"]["preferred_side"]
          rating_confidence?: number
          singles_rating?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_profiles_membership_id_fkey"
            columns: ["membership_id"]
            isOneToOne: true
            referencedRelation: "club_memberships"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string
          email: string
          id: string
          timezone: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name: string
          email: string
          id: string
          timezone?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string
          email?: string
          id?: string
          timezone?: string
          updated_at?: string
        }
        Relationships: []
      }
      rating_history: {
        Row: {
          created_at: string
          delta: number
          format: Database["public"]["Enums"]["event_format"]
          id: number
          match_id: string
          membership_id: string
          new_rating: number
          previous_rating: number
        }
        Insert: {
          created_at?: string
          delta: number
          format: Database["public"]["Enums"]["event_format"]
          id?: never
          match_id: string
          membership_id: string
          new_rating: number
          previous_rating: number
        }
        Update: {
          created_at?: string
          delta?: number
          format?: Database["public"]["Enums"]["event_format"]
          id?: never
          match_id?: string
          membership_id?: string
          new_rating?: number
          previous_rating?: number
        }
        Relationships: [
          {
            foreignKeyName: "rating_history_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rating_history_membership_id_fkey"
            columns: ["membership_id"]
            isOneToOne: false
            referencedRelation: "club_memberships"
            referencedColumns: ["id"]
          },
        ]
      }
      score_events: {
        Row: {
          created_at: string
          delta: number
          id: number
          match_id: string
          recorded_by: string
          score_one: number
          score_two: number
          team: number
        }
        Insert: {
          created_at?: string
          delta: number
          id?: never
          match_id: string
          recorded_by: string
          score_one: number
          score_two: number
          team: number
        }
        Update: {
          created_at?: string
          delta?: number
          id?: never
          match_id?: string
          recorded_by?: string
          score_one?: number
          score_two?: number
          team?: number
        }
        Relationships: [
          {
            foreignKeyName: "score_events_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "score_events_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      adjust_registration_priority: {
        Args: { p_delta: number; p_registration_id: string }
        Returns: {
          availability: Database["public"]["Enums"]["availability_status"]
          checked_in_at: string | null
          created_at: string
          event_id: string
          games_played: number
          id: string
          last_played_at: string | null
          membership_id: string
          queue_priority: number
          status: Database["public"]["Enums"]["registration_status"]
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "event_registrations"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      confirm_match_result: {
        Args: { p_match_id: string }
        Returns: {
          best_of: number
          completed_at: string | null
          confirmed_at: string | null
          confirmed_by: string | null
          court_id: string | null
          created_at: string
          dispute_reason: string | null
          disputed_at: string | null
          disputed_by: string | null
          event_id: string
          finalized_at: string | null
          id: string
          match_number: number
          round_id: string
          serving_team: number | null
          started_at: string | null
          status: Database["public"]["Enums"]["match_status"]
          submitted_at: string | null
          submitted_by: string | null
          team_one_score: number
          team_two_score: number
          updated_at: string
          version: number
          winner_team: number | null
        }
        SetofOptions: {
          from: "*"
          to: "matches"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      create_club: {
        Args: {
          p_country_code: string
          p_description?: string
          p_name: string
          p_slug: string
          p_timezone: string
        }
        Returns: {
          country_code: string
          created_at: string
          description: string | null
          id: string
          logo_url: string | null
          name: string
          owner_user_id: string
          slug: string
          status: Database["public"]["Enums"]["club_status"]
          timezone: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "clubs"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      dispute_match_result: {
        Args: { p_match_id: string; p_reason: string }
        Returns: {
          best_of: number
          completed_at: string | null
          confirmed_at: string | null
          confirmed_by: string | null
          court_id: string | null
          created_at: string
          dispute_reason: string | null
          disputed_at: string | null
          disputed_by: string | null
          event_id: string
          finalized_at: string | null
          id: string
          match_number: number
          round_id: string
          serving_team: number | null
          started_at: string | null
          status: Database["public"]["Enums"]["match_status"]
          submitted_at: string | null
          submitted_by: string | null
          team_one_score: number
          team_two_score: number
          updated_at: string
          version: number
          winner_team: number | null
        }
        SetofOptions: {
          from: "*"
          to: "matches"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      generate_event_round: {
        Args: { p_event_id: string; p_strategy?: string }
        Returns: {
          confirmed_by: string | null
          created_at: string
          event_id: string
          explanation: string | null
          id: string
          quality_score: number | null
          round_number: number
          status: Database["public"]["Enums"]["round_status"]
          strategy: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "event_rounds"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      record_match_point: {
        Args: {
          p_delta: number
          p_expected_version: number
          p_match_id: string
          p_team: number
        }
        Returns: {
          best_of: number
          completed_at: string | null
          confirmed_at: string | null
          confirmed_by: string | null
          court_id: string | null
          created_at: string
          dispute_reason: string | null
          disputed_at: string | null
          disputed_by: string | null
          event_id: string
          finalized_at: string | null
          id: string
          match_number: number
          round_id: string
          serving_team: number | null
          started_at: string | null
          status: Database["public"]["Enums"]["match_status"]
          submitted_at: string | null
          submitted_by: string | null
          team_one_score: number
          team_two_score: number
          updated_at: string
          version: number
          winner_team: number | null
        }
        SetofOptions: {
          from: "*"
          to: "matches"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      register_event_member: {
        Args: { p_event_id: string; p_membership_id: string }
        Returns: {
          availability: Database["public"]["Enums"]["availability_status"]
          checked_in_at: string | null
          created_at: string
          event_id: string
          games_played: number
          id: string
          last_played_at: string | null
          membership_id: string
          queue_priority: number
          status: Database["public"]["Enums"]["registration_status"]
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "event_registrations"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      resolve_match_dispute: {
        Args: {
          p_match_id: string
          p_team_one_score: number
          p_team_two_score: number
        }
        Returns: {
          best_of: number
          completed_at: string | null
          confirmed_at: string | null
          confirmed_by: string | null
          court_id: string | null
          created_at: string
          dispute_reason: string | null
          disputed_at: string | null
          disputed_by: string | null
          event_id: string
          finalized_at: string | null
          id: string
          match_number: number
          round_id: string
          serving_team: number | null
          started_at: string | null
          status: Database["public"]["Enums"]["match_status"]
          submitted_at: string | null
          submitted_by: string | null
          team_one_score: number
          team_two_score: number
          updated_at: string
          version: number
          winner_team: number | null
        }
        SetofOptions: {
          from: "*"
          to: "matches"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      set_registration_availability: {
        Args: {
          p_availability: Database["public"]["Enums"]["availability_status"]
          p_registration_id: string
        }
        Returns: {
          availability: Database["public"]["Enums"]["availability_status"]
          checked_in_at: string | null
          created_at: string
          event_id: string
          games_played: number
          id: string
          last_played_at: string | null
          membership_id: string
          queue_priority: number
          status: Database["public"]["Enums"]["registration_status"]
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "event_registrations"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      set_registration_check_in: {
        Args: { p_checked_in: boolean; p_registration_id: string }
        Returns: {
          availability: Database["public"]["Enums"]["availability_status"]
          checked_in_at: string | null
          created_at: string
          event_id: string
          games_played: number
          id: string
          last_played_at: string | null
          membership_id: string
          queue_priority: number
          status: Database["public"]["Enums"]["registration_status"]
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "event_registrations"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      submit_match_result: {
        Args: { p_expected_version: number; p_match_id: string }
        Returns: {
          best_of: number
          completed_at: string | null
          confirmed_at: string | null
          confirmed_by: string | null
          court_id: string | null
          created_at: string
          dispute_reason: string | null
          disputed_at: string | null
          disputed_by: string | null
          event_id: string
          finalized_at: string | null
          id: string
          match_number: number
          round_id: string
          serving_team: number | null
          started_at: string | null
          status: Database["public"]["Enums"]["match_status"]
          submitted_at: string | null
          submitted_by: string | null
          team_one_score: number
          team_two_score: number
          updated_at: string
          version: number
          winner_team: number | null
        }
        SetofOptions: {
          from: "*"
          to: "matches"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      announcement_status: "draft" | "published" | "archived"
      availability_status:
        | "waiting"
        | "on_deck"
        | "playing"
        | "resting"
        | "unavailable"
        | "finished"
      club_role:
        | "administrator"
        | "event_organizer"
        | "court_marshal"
        | "scorekeeper"
        | "member"
        | "guest"
      club_status: "active" | "archived"
      court_status: "available" | "in_use" | "paused" | "unavailable"
      dominant_hand: "left" | "right" | "ambidextrous"
      event_format: "singles" | "doubles" | "mixed_doubles" | "open_play"
      event_status:
        | "draft"
        | "published"
        | "check_in_open"
        | "active"
        | "paused"
        | "completed"
        | "cancelled"
      gender_category: "female" | "male" | "non_binary" | "prefer_not_to_say"
      match_status:
        | "scheduled"
        | "in_progress"
        | "awaiting_confirmation"
        | "completed"
        | "disputed"
        | "cancelled"
      membership_status: "invited" | "active" | "inactive" | "suspended"
      play_preference: "competitive" | "balanced" | "social"
      preferred_format: "singles" | "doubles" | "either"
      preferred_side: "left" | "right" | "either"
      registration_status:
        | "registered"
        | "waitlisted"
        | "checked_in"
        | "withdrawn"
        | "no_show"
      round_status: "draft" | "confirmed" | "active" | "completed" | "cancelled"
      skill_level:
        | "beginner"
        | "novice"
        | "intermediate"
        | "advanced"
        | "expert"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      announcement_status: ["draft", "published", "archived"],
      availability_status: [
        "waiting",
        "on_deck",
        "playing",
        "resting",
        "unavailable",
        "finished",
      ],
      club_role: [
        "administrator",
        "event_organizer",
        "court_marshal",
        "scorekeeper",
        "member",
        "guest",
      ],
      club_status: ["active", "archived"],
      court_status: ["available", "in_use", "paused", "unavailable"],
      dominant_hand: ["left", "right", "ambidextrous"],
      event_format: ["singles", "doubles", "mixed_doubles", "open_play"],
      event_status: [
        "draft",
        "published",
        "check_in_open",
        "active",
        "paused",
        "completed",
        "cancelled",
      ],
      gender_category: ["female", "male", "non_binary", "prefer_not_to_say"],
      match_status: [
        "scheduled",
        "in_progress",
        "awaiting_confirmation",
        "completed",
        "disputed",
        "cancelled",
      ],
      membership_status: ["invited", "active", "inactive", "suspended"],
      play_preference: ["competitive", "balanced", "social"],
      preferred_format: ["singles", "doubles", "either"],
      preferred_side: ["left", "right", "either"],
      registration_status: [
        "registered",
        "waitlisted",
        "checked_in",
        "withdrawn",
        "no_show",
      ],
      round_status: ["draft", "confirmed", "active", "completed", "cancelled"],
      skill_level: ["beginner", "novice", "intermediate", "advanced", "expert"],
    },
  },
} as const
