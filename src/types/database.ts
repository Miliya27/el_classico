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
    PostgrestVersion: "14.5"
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
      admins: {
        Row: {
          created_at: string
          display_name: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          user_id?: string
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          action: string
          created_at: string
          id: number
          new_data: Json | null
          old_data: Json | null
          record_id: string | null
          table_name: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: never
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: never
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      groups: {
        Row: {
          created_at: string
          id: string
          name: string
          year: number
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          year: number
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          year?: number
        }
        Relationships: []
      }
      match_events: {
        Row: {
          assist_player_id: string | null
          created_at: string
          created_by: string | null
          id: string
          match_id: string
          minute: number | null
          player_id: string | null
          team_id: string
          type: Database["public"]["Enums"]["event_type"]
          updated_at: string
          voided_at: string | null
        }
        Insert: {
          assist_player_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          match_id: string
          minute?: number | null
          player_id?: string | null
          team_id: string
          type: Database["public"]["Enums"]["event_type"]
          updated_at?: string
          voided_at?: string | null
        }
        Update: {
          assist_player_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          match_id?: string
          minute?: number | null
          player_id?: string | null
          team_id?: string
          type?: Database["public"]["Enums"]["event_type"]
          updated_at?: string
          voided_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "match_events_assist_player_id_fkey"
            columns: ["assist_player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_events_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_events_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_events_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_events_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "v_group_standings"
            referencedColumns: ["team_id"]
          },
        ]
      }
      match_keepers: {
        Row: {
          created_at: string
          match_id: string
          player_id: string
          team_id: string
        }
        Insert: {
          created_at?: string
          match_id: string
          player_id: string
          team_id: string
        }
        Update: {
          created_at?: string
          match_id?: string
          player_id?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "match_keepers_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_keepers_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_keepers_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_keepers_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "v_group_standings"
            referencedColumns: ["team_id"]
          },
        ]
      }
      matches: {
        Row: {
          away_pens: number
          away_score: number
          away_team_id: string | null
          bracket_slot: number | null
          clock_offset_seconds: number
          clock_started_at: string | null
          created_at: string
          group_id: string | null
          home_pens: number
          home_score: number
          home_team_id: string | null
          id: string
          kickoff_at: string | null
          motm_player_id: string | null
          next_match_id: string | null
          next_match_side: string | null
          round: number
          status: Database["public"]["Enums"]["match_status"]
          updated_at: string
          venue: string | null
          winner_team_id: string | null
          year: number | null
        }
        Insert: {
          away_pens?: number
          away_score?: number
          away_team_id?: string | null
          bracket_slot?: number | null
          clock_offset_seconds?: number
          clock_started_at?: string | null
          created_at?: string
          group_id?: string | null
          home_pens?: number
          home_score?: number
          home_team_id?: string | null
          id?: string
          kickoff_at?: string | null
          motm_player_id?: string | null
          next_match_id?: string | null
          next_match_side?: string | null
          round: number
          status?: Database["public"]["Enums"]["match_status"]
          updated_at?: string
          venue?: string | null
          winner_team_id?: string | null
          year?: number | null
        }
        Update: {
          away_pens?: number
          away_score?: number
          away_team_id?: string | null
          bracket_slot?: number | null
          clock_offset_seconds?: number
          clock_started_at?: string | null
          created_at?: string
          group_id?: string | null
          home_pens?: number
          home_score?: number
          home_team_id?: string | null
          id?: string
          kickoff_at?: string | null
          motm_player_id?: string | null
          next_match_id?: string | null
          next_match_side?: string | null
          round?: number
          status?: Database["public"]["Enums"]["match_status"]
          updated_at?: string
          venue?: string | null
          winner_team_id?: string | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "matches_away_team_id_fkey"
            columns: ["away_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_away_team_id_fkey"
            columns: ["away_team_id"]
            isOneToOne: false
            referencedRelation: "v_group_standings"
            referencedColumns: ["team_id"]
          },
          {
            foreignKeyName: "matches_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_home_team_id_fkey"
            columns: ["home_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_home_team_id_fkey"
            columns: ["home_team_id"]
            isOneToOne: false
            referencedRelation: "v_group_standings"
            referencedColumns: ["team_id"]
          },
          {
            foreignKeyName: "matches_motm_player_id_fkey"
            columns: ["motm_player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_next_match_id_fkey"
            columns: ["next_match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_winner_team_id_fkey"
            columns: ["winner_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_winner_team_id_fkey"
            columns: ["winner_team_id"]
            isOneToOne: false
            referencedRelation: "v_group_standings"
            referencedColumns: ["team_id"]
          },
        ]
      }
      media: {
        Row: {
          caption: string | null
          created_at: string
          created_by: string | null
          id: string
          kind: Database["public"]["Enums"]["media_kind"]
          match_id: string | null
          storage_path: string | null
          url: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          kind: Database["public"]["Enums"]["media_kind"]
          match_id?: string | null
          storage_path?: string | null
          url: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["media_kind"]
          match_id?: string | null
          storage_path?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      players: {
        Row: {
          created_at: string
          id: string
          is_gk: boolean
          jersey_no: number | null
          name: string
          team_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_gk?: boolean
          jersey_no?: number | null
          name: string
          team_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_gk?: boolean
          jersey_no?: number | null
          name?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "players_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "players_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "v_group_standings"
            referencedColumns: ["team_id"]
          },
        ]
      }
      teams: {
        Row: {
          batch: string | null
          code: string
          created_at: string
          group_id: string | null
          id: string
          name: string
          tiebreak_rank: number | null
          year: number | null
        }
        Insert: {
          batch?: string | null
          code: string
          created_at?: string
          group_id?: string | null
          id?: string
          name: string
          tiebreak_rank?: number | null
          year?: number | null
        }
        Update: {
          batch?: string | null
          code?: string
          created_at?: string
          group_id?: string | null
          id?: string
          name?: string
          tiebreak_rank?: number | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "teams_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      v_group_standings: {
        Row: {
          code: string | null
          drawn: number | null
          ga: number | null
          gd: number | null
          gf: number | null
          group_id: string | null
          lost: number | null
          name: string | null
          needs_tiebreak: boolean | null
          played: number | null
          points: number | null
          rank: number | null
          team_id: string | null
          tiebreak_rank: number | null
          won: number | null
          year: number | null
        }
        Relationships: [
          {
            foreignKeyName: "teams_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      get_best_players: {
        Args: { p_round?: number; p_year?: number }
        Returns: {
          assists: number
          goals: number
          motm_count: number
          player_id: string
          player_name: string
          team_code: string
          team_id: string
          team_name: string
          total_contributions: number
        }[]
      }
      get_golden_glove: {
        Args: { p_round?: number; p_year?: number }
        Returns: {
          clean_sheets: number
          goals_conceded: number
          matches_played: number
          player_id: string
          player_name: string
          saves: number
          team_code: string
          team_id: string
          team_name: string
        }[]
      }
      get_top_scorers: {
        Args: { p_round?: number; p_year?: number }
        Returns: {
          assists: number
          goals: number
          player_id: string
          player_name: string
          team_code: string
          team_id: string
          team_name: string
        }[]
      }
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      event_type:
        | "goal"
        | "own_goal"
        | "yellow_card"
        | "blue_card"
        | "red_card"
        | "save"
        | "shootout_scored"
        | "shootout_missed"
      match_status: "scheduled" | "live" | "half_time" | "finished"
      media_kind: "photo" | "video"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      event_type: [
        "goal",
        "own_goal",
        "yellow_card",
        "blue_card",
        "red_card",
        "save",
        "shootout_scored",
        "shootout_missed",
      ],
      match_status: ["scheduled", "live", "half_time", "finished"],
      media_kind: ["photo", "video"],
    },
  },
} as const
