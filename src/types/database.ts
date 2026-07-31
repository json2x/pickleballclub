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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
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
    }
    Enums: {
      club_role:
        | "administrator"
        | "event_organizer"
        | "court_marshal"
        | "scorekeeper"
        | "member"
        | "guest"
      club_status: "active" | "archived"
      dominant_hand: "left" | "right" | "ambidextrous"
      gender_category: "female" | "male" | "non_binary" | "prefer_not_to_say"
      membership_status: "invited" | "active" | "inactive" | "suspended"
      play_preference: "competitive" | "balanced" | "social"
      preferred_format: "singles" | "doubles" | "either"
      preferred_side: "left" | "right" | "either"
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
      club_role: [
        "administrator",
        "event_organizer",
        "court_marshal",
        "scorekeeper",
        "member",
        "guest",
      ],
      club_status: ["active", "archived"],
      dominant_hand: ["left", "right", "ambidextrous"],
      gender_category: ["female", "male", "non_binary", "prefer_not_to_say"],
      membership_status: ["invited", "active", "inactive", "suspended"],
      play_preference: ["competitive", "balanced", "social"],
      preferred_format: ["singles", "doubles", "either"],
      preferred_side: ["left", "right", "either"],
      skill_level: ["beginner", "novice", "intermediate", "advanced", "expert"],
    },
  },
} as const
