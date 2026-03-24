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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      api_keys: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          key_hash: string
          last_used: string | null
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_hash: string
          last_used?: string | null
          name: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_hash?: string
          last_used?: string | null
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      customer_drive_files: {
        Row: {
          created_time: string | null
          customer_id: string
          file_id: string
          file_name: string
          id: string
          is_deleted: boolean | null
          last_seen_at: string | null
          modified_time: string | null
        }
        Insert: {
          created_time?: string | null
          customer_id: string
          file_id: string
          file_name: string
          id?: string
          is_deleted?: boolean | null
          last_seen_at?: string | null
          modified_time?: string | null
        }
        Update: {
          created_time?: string | null
          customer_id?: string
          file_id?: string
          file_name?: string
          id?: string
          is_deleted?: boolean | null
          last_seen_at?: string | null
          modified_time?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_drive_files_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          address: string | null
          birth_date: string | null
          company: string | null
          created_at: string | null
          deleted_at: string | null
          email: string | null
          gender: string | null
          google_contact_id: string | null
          google_drive_folder_id: string | null
          id: string
          is_blacklist: boolean | null
          is_google_contact_synced: boolean | null
          job_title: string | null
          memo: string | null
          name: string
          order_index: number | null
          phone: string
          source: string | null
          stage: string
          tags: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          address?: string | null
          birth_date?: string | null
          company?: string | null
          created_at?: string | null
          deleted_at?: string | null
          email?: string | null
          gender?: string | null
          google_contact_id?: string | null
          google_drive_folder_id?: string | null
          id?: string
          is_blacklist?: boolean | null
          is_google_contact_synced?: boolean | null
          job_title?: string | null
          memo?: string | null
          name: string
          order_index?: number | null
          phone: string
          source?: string | null
          stage?: string
          tags?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          address?: string | null
          birth_date?: string | null
          company?: string | null
          created_at?: string | null
          deleted_at?: string | null
          email?: string | null
          gender?: string | null
          google_contact_id?: string | null
          google_drive_folder_id?: string | null
          id?: string
          is_blacklist?: boolean | null
          is_google_contact_synced?: boolean | null
          job_title?: string | null
          memo?: string | null
          name?: string
          order_index?: number | null
          phone?: string
          source?: string | null
          stage?: string
          tags?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      interactions: {
        Row: {
          content: string | null
          customer_id: string
          duration: number | null
          id: string
          occurred_at: string | null
          stage_changed_to: string | null
          type: string
          user_id: string
        }
        Insert: {
          content?: string | null
          customer_id: string
          duration?: number | null
          id?: string
          occurred_at?: string | null
          stage_changed_to?: string | null
          type: string
          user_id: string
        }
        Update: {
          content?: string | null
          customer_id?: string
          duration?: number | null
          id?: string
          occurred_at?: string | null
          stage_changed_to?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "interactions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          from_user_id: string | null
          id: string
          is_read: boolean | null
          team_id: string | null
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          from_user_id?: string | null
          id?: string
          is_read?: boolean | null
          team_id?: string | null
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          from_user_id?: string | null
          id?: string
          is_read?: boolean | null
          team_id?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      pipeline_stages: {
        Row: {
          color: string
          created_at: string | null
          id: string
          is_default: boolean | null
          name: string
          order_index: number
          stage_type: string
          user_id: string
        }
        Insert: {
          color?: string
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          order_index: number
          stage_type?: string
          user_id: string
        }
        Update: {
          color?: string
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          order_index?: number
          stage_type?: string
          user_id?: string
        }
        Relationships: []
      }
      reminders: {
        Row: {
          created_at: string | null
          customer_id: string
          due_date: string
          google_event_id: string | null
          id: string
          is_done: boolean | null
          memo: string | null
          start_time: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          customer_id: string
          due_date: string
          google_event_id?: string | null
          id?: string
          is_done?: boolean | null
          memo?: string | null
          start_time?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          customer_id?: string
          due_date?: string
          google_event_id?: string | null
          id?: string
          is_done?: boolean | null
          memo?: string | null
          start_time?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reminders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      team_invite_codes: {
        Row: {
          code: string
          created_at: string | null
          created_by: string
          expires_at: string
          id: string
          is_active: boolean | null
          team_id: string
          used_at: string | null
          used_by: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          created_by: string
          expires_at: string
          id?: string
          is_active?: boolean | null
          team_id: string
          used_at?: string | null
          used_by?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          created_by?: string
          expires_at?: string
          id?: string
          is_active?: boolean | null
          team_id?: string
          used_at?: string | null
          used_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_invite_codes_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          created_at: string | null
          id: string
          invited_by: string | null
          joined_at: string | null
          role: string
          status: string
          team_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          invited_by?: string | null
          joined_at?: string | null
          role?: string
          status?: string
          team_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          invited_by?: string | null
          joined_at?: string | null
          role?: string
          status?: string
          team_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string | null
          id: string
          manager_id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          manager_id: string
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          manager_id?: string
          name?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_team_member_profiles: {
        Args: { member_ids: string[] }
        Returns: {
          email: string
          full_name: string
          user_id: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
