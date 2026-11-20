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
  public: {
    Tables: {
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
          revoked_at: string | null
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
          revoked_at?: string | null
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
          revoked_at?: string | null
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
      club_membership_role_audit: {
        Row: {
          changed_by: string
          club_id: string
          created_at: string
          id: string
          membership_id: string
          new_role: Database["public"]["Enums"]["club_role"]
          previous_role: Database["public"]["Enums"]["club_role"]
          reason: string
          user_id: string
        }
        Insert: {
          changed_by: string
          club_id: string
          created_at?: string
          id?: string
          membership_id: string
          new_role: Database["public"]["Enums"]["club_role"]
          previous_role: Database["public"]["Enums"]["club_role"]
          reason: string
          user_id: string
        }
        Update: {
          changed_by?: string
          club_id?: string
          created_at?: string
          id?: string
          membership_id?: string
          new_role?: Database["public"]["Enums"]["club_role"]
          previous_role?: Database["public"]["Enums"]["club_role"]
          reason?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "club_membership_role_audit_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "club_membership_role_audit_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "club_membership_role_audit_membership_id_fkey"
            columns: ["membership_id"]
            isOneToOne: false
            referencedRelation: "club_memberships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "club_membership_role_audit_user_id_fkey"
            columns: ["user_id"]
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
          id: string
          joined_at: string | null
          role: Database["public"]["Enums"]["club_role"]
          status: Database["public"]["Enums"]["club_membership_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          club_id: string
          created_at?: string
          id?: string
          joined_at?: string | null
          role?: Database["public"]["Enums"]["club_role"]
          status?: Database["public"]["Enums"]["club_membership_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          club_id?: string
          created_at?: string
          id?: string
          joined_at?: string | null
          role?: Database["public"]["Enums"]["club_role"]
          status?: Database["public"]["Enums"]["club_membership_status"]
          updated_at?: string
          user_id?: string
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
            foreignKeyName: "club_memberships_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      club_player_profiles: {
        Row: {
          avatar_path: string | null
          bio: string | null
          club_id: string
          created_at: string
          id: string
          losses: number
          matches_played: number
          preferred_side: Database["public"]["Enums"]["court_side"]
          rating_points: number
          rating_trend_30d: number
          skill_level: Database["public"]["Enums"]["skill_level"]
          updated_at: string
          user_id: string
          wins: number
        }
        Insert: {
          avatar_path?: string | null
          bio?: string | null
          club_id: string
          created_at?: string
          id?: string
          losses?: number
          matches_played?: number
          preferred_side?: Database["public"]["Enums"]["court_side"]
          rating_points?: number
          rating_trend_30d?: number
          skill_level?: Database["public"]["Enums"]["skill_level"]
          updated_at?: string
          user_id: string
          wins?: number
        }
        Update: {
          avatar_path?: string | null
          bio?: string | null
          club_id?: string
          created_at?: string
          id?: string
          losses?: number
          matches_played?: number
          preferred_side?: Database["public"]["Enums"]["court_side"]
          rating_points?: number
          rating_trend_30d?: number
          skill_level?: Database["public"]["Enums"]["skill_level"]
          updated_at?: string
          user_id?: string
          wins?: number
        }
        Relationships: [
          {
            foreignKeyName: "club_player_profiles_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "club_player_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      clubs: {
        Row: {
          created_at: string
          created_by: string
          currency: string
          description: string | null
          id: string
          join_policy: Database["public"]["Enums"]["club_join_policy"]
          location: string
          logo_path: string | null
          name: string
          slug: string
          timezone: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          currency?: string
          description?: string | null
          id?: string
          join_policy?: Database["public"]["Enums"]["club_join_policy"]
          location: string
          logo_path?: string | null
          name: string
          slug: string
          timezone?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          currency?: string
          description?: string | null
          id?: string
          join_policy?: Database["public"]["Enums"]["club_join_policy"]
          location?: string
          logo_path?: string | null
          name?: string
          slug?: string
          timezone?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clubs_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          active_club_id: string | null
          avatar_url: string | null
          created_at: string
          display_name: string
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          timezone: string
          updated_at: string
        }
        Insert: {
          active_club_id?: string | null
          avatar_url?: string | null
          created_at?: string
          display_name: string
          email?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          phone?: string | null
          timezone?: string
          updated_at?: string
        }
        Update: {
          active_club_id?: string | null
          avatar_url?: string | null
          created_at?: string
          display_name?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          timezone?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_active_club_fk"
            columns: ["active_club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_club_invitation: {
        Args: { p_token: string }
        Returns: {
          club_id: string
          created_at: string
          id: string
          joined_at: string | null
          role: Database["public"]["Enums"]["club_role"]
          status: Database["public"]["Enums"]["club_membership_status"]
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "club_memberships"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      approve_club_membership: {
        Args: { p_membership_id: string }
        Returns: {
          club_id: string
          created_at: string
          id: string
          joined_at: string | null
          role: Database["public"]["Enums"]["club_role"]
          status: Database["public"]["Enums"]["club_membership_status"]
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "club_memberships"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      club_asset_club_id: { Args: { p_name: string }; Returns: string }
      club_asset_path_is_valid: { Args: { p_name: string }; Returns: boolean }
      create_club: {
        Args: {
          p_description?: string
          p_join_policy?: Database["public"]["Enums"]["club_join_policy"]
          p_location: string
          p_name: string
          p_slug: string
          p_timezone?: string
        }
        Returns: {
          created_at: string
          created_by: string
          currency: string
          description: string | null
          id: string
          join_policy: Database["public"]["Enums"]["club_join_policy"]
          location: string
          logo_path: string | null
          name: string
          slug: string
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
      deactivate_member: {
        Args: { p_club_id: string; p_reason?: string; p_user_id: string }
        Returns: Json
      }
      get_club_invitations: {
        Args: { p_club_id: string; p_status_filter?: string }
        Returns: Json
      }
      get_club_member_detail: {
        Args: { p_club_id: string; p_user_id: string }
        Returns: Json
      }
      get_club_members: {
        Args: {
          p_club_id: string
          p_page?: number
          p_page_size?: number
          p_role?: string
          p_search?: string
          p_skill?: string
          p_sort_by?: string
          p_sort_order?: string
          p_status?: string
        }
        Returns: Json
      }
      get_my_profile: {
        Args: never
        Returns: {
          active_club_id: string | null
          avatar_url: string | null
          created_at: string
          display_name: string
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          timezone: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "profiles"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      has_club_role: {
        Args: {
          p_club_id: string
          p_roles: Database["public"]["Enums"]["club_role"][]
        }
        Returns: boolean
      }
      is_club_member: { Args: { p_club_id: string }; Returns: boolean }
      issue_club_invitation: {
        Args: {
          p_club_id: string
          p_email: string
          p_expires_at?: string
          p_role?: Database["public"]["Enums"]["club_role"]
        }
        Returns: {
          invitation_expires_at: string
          invitation_id: string
          raw_token: string
        }[]
      }
      join_club_by_slug: {
        Args: { p_slug: string }
        Returns: {
          club_id: string
          created_at: string
          id: string
          joined_at: string | null
          role: Database["public"]["Enums"]["club_role"]
          status: Database["public"]["Enums"]["club_membership_status"]
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "club_memberships"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      member_avatar_club_id: { Args: { object_path: string }; Returns: string }
      member_avatar_path_is_valid: {
        Args: { object_path: string }
        Returns: boolean
      }
      member_avatar_user_id: { Args: { object_path: string }; Returns: string }
      revoke_club_invitation: {
        Args: { p_club_id: string; p_invitation_id: string }
        Returns: Json
      }
      search_joinable_clubs: {
        Args: { p_query?: string }
        Returns: {
          id: string
          join_policy: Database["public"]["Enums"]["club_join_policy"]
          location: string
          logo_path: string
          name: string
          slug: string
        }[]
      }
      set_active_club: {
        Args: { p_club_id: string }
        Returns: {
          active_club_id: string | null
          avatar_url: string | null
          created_at: string
          display_name: string
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          timezone: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "profiles"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      transfer_club_ownership: {
        Args: {
          p_club_id: string
          p_confirm: boolean
          p_new_owner_user_id: string
          p_reason: string
        }
        Returns: {
          club_id: string
          created_at: string
          id: string
          joined_at: string | null
          role: Database["public"]["Enums"]["club_role"]
          status: Database["public"]["Enums"]["club_membership_status"]
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "club_memberships"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      update_member_role: {
        Args: {
          p_club_id: string
          p_new_role: string
          p_reason?: string
          p_user_id: string
        }
        Returns: Json
      }
      update_player_profile: {
        Args: {
          p_bio?: string
          p_club_id: string
          p_preferred_side?: string
          p_skill_level?: string
        }
        Returns: Json
      }
    }
    Enums: {
      club_join_policy: "open" | "approval" | "invite_only"
      club_membership_status: "pending" | "active" | "inactive"
      club_role: "owner" | "admin" | "member"
      court_side: "left" | "right" | "both" | "no_preference"
      skill_level: "beginner" | "intermediate" | "advanced" | "pro"
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
  public: {
    Enums: {
      club_join_policy: ["open", "approval", "invite_only"],
      club_membership_status: ["pending", "active", "inactive"],
      club_role: ["owner", "admin", "member"],
      court_side: ["left", "right", "both", "no_preference"],
      skill_level: ["beginner", "intermediate", "advanced", "pro"],
    },
  },
} as const

