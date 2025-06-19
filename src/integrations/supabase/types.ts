export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      investment_packages: {
        Row: {
          created_at: string | null
          daily_return_rate: number
          description: string | null
          duration_days: number
          features: string[] | null
          id: string
          is_active: boolean | null
          level_commissions: number[]
          name: string
          price: number
          referral_bonus_rate: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          daily_return_rate: number
          description?: string | null
          duration_days: number
          features?: string[] | null
          id?: string
          is_active?: boolean | null
          level_commissions: number[]
          name: string
          price: number
          referral_bonus_rate: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          daily_return_rate?: number
          description?: string | null
          duration_days?: number
          features?: string[] | null
          id?: string
          is_active?: boolean | null
          level_commissions?: number[]
          name?: string
          price?: number
          referral_bonus_rate?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          title: string
          type: string | null
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          title: string
          type?: string | null
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          title?: string
          type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          city: string | null
          country: string | null
          created_at: string | null
          date_of_birth: string | null
          email: string
          first_name: string
          id: string
          is_active: boolean | null
          kyc_documents: Json | null
          kyc_status: Database["public"]["Enums"]["kyc_status"] | null
          last_name: string
          phone: string | null
          postal_code: string | null
          referral_code: string
          referred_by: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email: string
          first_name: string
          id: string
          is_active?: boolean | null
          kyc_documents?: Json | null
          kyc_status?: Database["public"]["Enums"]["kyc_status"] | null
          last_name: string
          phone?: string | null
          postal_code?: string | null
          referral_code: string
          referred_by?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string
          first_name?: string
          id?: string
          is_active?: boolean | null
          kyc_documents?: Json | null
          kyc_status?: Database["public"]["Enums"]["kyc_status"] | null
          last_name?: string
          phone?: string | null
          postal_code?: string | null
          referral_code?: string
          referred_by?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_referred_by_fkey"
            columns: ["referred_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          commission_rate: number | null
          created_at: string | null
          id: string
          level: number
          referred_id: string
          referrer_id: string
          total_commissions: number | null
        }
        Insert: {
          commission_rate?: number | null
          created_at?: string | null
          id?: string
          level?: number
          referred_id: string
          referrer_id: string
          total_commissions?: number | null
        }
        Update: {
          commission_rate?: number | null
          created_at?: string | null
          id?: string
          level?: number
          referred_id?: string
          referrer_id?: string
          total_commissions?: number | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          description: string | null
          from_user_id: string | null
          id: string
          investment_id: string | null
          reference_id: string | null
          status: string | null
          type: Database["public"]["Enums"]["transaction_type"]
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          description?: string | null
          from_user_id?: string | null
          id?: string
          investment_id?: string | null
          reference_id?: string | null
          status?: string | null
          type: Database["public"]["Enums"]["transaction_type"]
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          description?: string | null
          from_user_id?: string | null
          id?: string
          investment_id?: string | null
          reference_id?: string | null
          status?: string | null
          type?: Database["public"]["Enums"]["transaction_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_investment_id_fkey"
            columns: ["investment_id"]
            isOneToOne: false
            referencedRelation: "user_investments"
            referencedColumns: ["id"]
          },
        ]
      }
      user_investments: {
        Row: {
          amount: number
          created_at: string | null
          daily_return: number | null
          end_date: string | null
          id: string
          package_id: string
          start_date: string | null
          status: Database["public"]["Enums"]["investment_status"] | null
          total_returns: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          daily_return?: number | null
          end_date?: string | null
          id?: string
          package_id: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["investment_status"] | null
          total_returns?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          daily_return?: number | null
          end_date?: string | null
          id?: string
          package_id?: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["investment_status"] | null
          total_returns?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_investments_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "investment_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      user_levels: {
        Row: {
          achieved_at: string | null
          created_at: string | null
          direct_referrals: number | null
          id: string
          level_name: string
          team_size: number | null
          total_investment: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          achieved_at?: string | null
          created_at?: string | null
          direct_referrals?: number | null
          id?: string
          level_name: string
          team_size?: number | null
          total_investment?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          achieved_at?: string | null
          created_at?: string | null
          direct_referrals?: number | null
          id?: string
          level_name?: string
          team_size?: number | null
          total_investment?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      withdrawals: {
        Row: {
          account_details: Json | null
          amount: number
          created_at: string | null
          currency: string | null
          id: string
          notes: string | null
          processed_at: string | null
          status: Database["public"]["Enums"]["withdrawal_status"] | null
          updated_at: string | null
          user_id: string
          withdrawal_method: string
        }
        Insert: {
          account_details?: Json | null
          amount: number
          created_at?: string | null
          currency?: string | null
          id?: string
          notes?: string | null
          processed_at?: string | null
          status?: Database["public"]["Enums"]["withdrawal_status"] | null
          updated_at?: string | null
          user_id: string
          withdrawal_method: string
        }
        Update: {
          account_details?: Json | null
          amount?: number
          created_at?: string | null
          currency?: string | null
          id?: string
          notes?: string | null
          processed_at?: string | null
          status?: Database["public"]["Enums"]["withdrawal_status"] | null
          updated_at?: string | null
          user_id?: string
          withdrawal_method?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_referral_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      investment_status: "active" | "completed" | "cancelled"
      kyc_status: "pending" | "verified" | "rejected"
      transaction_type:
        | "deposit"
        | "withdrawal"
        | "commission"
        | "daily_return"
        | "referral_bonus"
      withdrawal_status: "pending" | "processing" | "completed" | "cancelled"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
      investment_status: ["active", "completed", "cancelled"],
      kyc_status: ["pending", "verified", "rejected"],
      transaction_type: [
        "deposit",
        "withdrawal",
        "commission",
        "daily_return",
        "referral_bonus",
      ],
      withdrawal_status: ["pending", "processing", "completed", "cancelled"],
    },
  },
} as const
