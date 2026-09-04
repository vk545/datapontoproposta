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
  public: {
    Tables: {
      clients: {
        Row: {
          city: string | null
          cnpj: string | null
          company_name: string
          contact_name: string | null
          contact_role: string | null
          created_at: string
          email: string | null
          employees: number | null
          id: string
          owner_id: string
          phone: string | null
          state: string | null
        }
        Insert: {
          city?: string | null
          cnpj?: string | null
          company_name: string
          contact_name?: string | null
          contact_role?: string | null
          created_at?: string
          email?: string | null
          employees?: number | null
          id?: string
          owner_id?: string
          phone?: string | null
          state?: string | null
        }
        Update: {
          city?: string | null
          cnpj?: string | null
          company_name?: string
          contact_name?: string | null
          contact_role?: string | null
          created_at?: string
          email?: string | null
          employees?: number | null
          id?: string
          owner_id?: string
          phone?: string | null
          state?: string | null
        }
        Relationships: []
      }
      company_settings: {
        Row: {
          address: string | null
          color_institutional: string
          color_primary: string
          company_name: string
          email: string | null
          footer: string | null
          id: boolean
          logo_url: string | null
          phone: string | null
          site: string | null
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          address?: string | null
          color_institutional?: string
          color_primary?: string
          company_name?: string
          email?: string | null
          footer?: string | null
          id?: boolean
          logo_url?: string | null
          phone?: string | null
          site?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          address?: string | null
          color_institutional?: string
          color_primary?: string
          company_name?: string
          email?: string | null
          footer?: string | null
          id?: boolean
          logo_url?: string | null
          phone?: string | null
          site?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          active: boolean
          area_id: string | null
          benefits: Json
          billing: string
          code: string
          created_at: string
          default_price: number
          description: string
          features: Json
          gallery: Json
          highlight: string
          id: string
          kind: string
          main_image_url: string | null
          name: string
          sort_order: number
          subcategory_id: string | null
          tech_note: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          area_id?: string | null
          benefits?: Json
          billing?: string
          code: string
          created_at?: string
          default_price?: number
          description?: string
          features?: Json
          gallery?: Json
          highlight?: string
          id?: string
          kind?: string
          main_image_url?: string | null
          name: string
          sort_order?: number
          subcategory_id?: string | null
          tech_note?: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          area_id?: string | null
          benefits?: Json
          billing?: string
          code?: string
          created_at?: string
          default_price?: number
          description?: string
          features?: Json
          gallery?: Json
          highlight?: string
          id?: string
          kind?: string
          main_image_url?: string | null
          name?: string
          sort_order?: number
          subcategory_id?: string | null
          tech_note?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "solution_areas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "solution_subcategories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          phone: string | null
          photo_url: string | null
          role_title: string | null
          signature: string | null
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          created_at?: string
          email?: string
          id: string
          name?: string
          phone?: string | null
          photo_url?: string | null
          role_title?: string | null
          signature?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          phone?: string | null
          photo_url?: string | null
          role_title?: string | null
          signature?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      proposal_approvals: {
        Row: {
          approved_at: string
          email: string | null
          id: string
          name: string
          proposal_id: string
          role_title: string | null
        }
        Insert: {
          approved_at?: string
          email?: string | null
          id?: string
          name: string
          proposal_id: string
          role_title?: string | null
        }
        Update: {
          approved_at?: string
          email?: string | null
          id?: string
          name?: string
          proposal_id?: string
          role_title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "proposal_approvals_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      proposal_products: {
        Row: {
          area_code: string
          billing: string
          created_at: string
          id: string
          name: string
          product_id: string | null
          proposal_id: string
          quantity: number
          scenario: string
          sort_order: number
          unit_price: number
          updated_at: string
        }
        Insert: {
          area_code?: string
          billing?: string
          created_at?: string
          id?: string
          name?: string
          product_id?: string | null
          proposal_id: string
          quantity?: number
          scenario?: string
          sort_order?: number
          unit_price?: number
          updated_at?: string
        }
        Update: {
          area_code?: string
          billing?: string
          created_at?: string
          id?: string
          name?: string
          product_id?: string | null
          proposal_id?: string
          quantity?: number
          scenario?: string
          sort_order?: number
          unit_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "proposal_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposal_products_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      proposal_scenarios: {
        Row: {
          created_at: string
          description: string
          id: string
          key: string
          monthly_total: number
          proposal_id: string
          recommended: boolean
          sort_order: number
          title: string
          updated_at: string
          upfront_total: number
        }
        Insert: {
          created_at?: string
          description?: string
          id?: string
          key?: string
          monthly_total?: number
          proposal_id: string
          recommended?: boolean
          sort_order?: number
          title?: string
          updated_at?: string
          upfront_total?: number
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          key?: string
          monthly_total?: number
          proposal_id?: string
          recommended?: boolean
          sort_order?: number
          title?: string
          updated_at?: string
          upfront_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "proposal_scenarios_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      proposal_solutions: {
        Row: {
          area_code: string
          area_id: string | null
          created_at: string
          id: string
          proposal_id: string
          sort_order: number
          updated_at: string
          why_text: string
        }
        Insert: {
          area_code?: string
          area_id?: string | null
          created_at?: string
          id?: string
          proposal_id: string
          sort_order?: number
          updated_at?: string
          why_text?: string
        }
        Update: {
          area_code?: string
          area_id?: string | null
          created_at?: string
          id?: string
          proposal_id?: string
          sort_order?: number
          updated_at?: string
          why_text?: string
        }
        Relationships: [
          {
            foreignKeyName: "proposal_solutions_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "solution_areas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposal_solutions_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      proposal_views: {
        Row: {
          id: string
          proposal_id: string
          viewed_at: string
        }
        Insert: {
          id?: string
          proposal_id: string
          viewed_at?: string
        }
        Update: {
          id?: string
          proposal_id?: string
          viewed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "proposal_views_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      proposals: {
        Row: {
          approved_at: string | null
          calculator: Json
          city: string | null
          client_id: string | null
          cnpj: string | null
          company_name: string
          contact_name: string | null
          contact_role: string | null
          created_at: string
          device_qty: number
          discount_reason: string | null
          email: string | null
          employees: number | null
          first_viewed_at: string | null
          id: string
          last_viewed_at: string | null
          licenses: number
          modality: string
          monthly_total: number
          need_key: string | null
          notes: string | null
          number: number
          owner_id: string
          phone: string | null
          prices: Json
          problem_text: string | null
          public_token: string
          rejected_at: string | null
          rejection_note: string | null
          rejection_reason: string | null
          sections: Json
          seller_email: string | null
          seller_name: string | null
          seller_phone: string | null
          sent_at: string | null
          state: string | null
          status: string
          system_plan: string
          template: string
          texts: Json
          updated_at: string
          upfront_total: number
          valid_until: string | null
        }
        Insert: {
          approved_at?: string | null
          calculator?: Json
          city?: string | null
          client_id?: string | null
          cnpj?: string | null
          company_name?: string
          contact_name?: string | null
          contact_role?: string | null
          created_at?: string
          device_qty?: number
          discount_reason?: string | null
          email?: string | null
          employees?: number | null
          first_viewed_at?: string | null
          id?: string
          last_viewed_at?: string | null
          licenses?: number
          modality?: string
          monthly_total?: number
          need_key?: string | null
          notes?: string | null
          number?: number
          owner_id?: string
          phone?: string | null
          prices?: Json
          problem_text?: string | null
          public_token?: string
          rejected_at?: string | null
          rejection_note?: string | null
          rejection_reason?: string | null
          sections?: Json
          seller_email?: string | null
          seller_name?: string | null
          seller_phone?: string | null
          sent_at?: string | null
          state?: string | null
          status?: string
          system_plan?: string
          template?: string
          texts?: Json
          updated_at?: string
          upfront_total?: number
          valid_until?: string | null
        }
        Update: {
          approved_at?: string | null
          calculator?: Json
          city?: string | null
          client_id?: string | null
          cnpj?: string | null
          company_name?: string
          contact_name?: string | null
          contact_role?: string | null
          created_at?: string
          device_qty?: number
          discount_reason?: string | null
          email?: string | null
          employees?: number | null
          first_viewed_at?: string | null
          id?: string
          last_viewed_at?: string | null
          licenses?: number
          modality?: string
          monthly_total?: number
          need_key?: string | null
          notes?: string | null
          number?: number
          owner_id?: string
          phone?: string | null
          prices?: Json
          problem_text?: string | null
          public_token?: string
          rejected_at?: string | null
          rejection_note?: string | null
          rejection_reason?: string | null
          sections?: Json
          seller_email?: string | null
          seller_name?: string | null
          seller_phone?: string | null
          sent_at?: string | null
          state?: string | null
          status?: string
          system_plan?: string
          template?: string
          texts?: Json
          updated_at?: string
          upfront_total?: number
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "proposals_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      solution_areas: {
        Row: {
          active: boolean
          code: string
          created_at: string
          description: string
          icon: string
          id: string
          name: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          code: string
          created_at?: string
          description?: string
          icon?: string
          id?: string
          name: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          code?: string
          created_at?: string
          description?: string
          icon?: string
          id?: string
          name?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      solution_subcategories: {
        Row: {
          active: boolean
          area_id: string
          code: string
          created_at: string
          description: string
          id: string
          name: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          area_id: string
          code: string
          created_at?: string
          description?: string
          id?: string
          name: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          area_id?: string
          code?: string
          created_at?: string
          description?: string
          id?: string
          name?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "solution_subcategories_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "solution_areas"
            referencedColumns: ["id"]
          },
        ]
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      app_role: "admin" | "seller"
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
  public: {
    Enums: {
      app_role: ["admin", "seller"],
    },
  },
} as const
