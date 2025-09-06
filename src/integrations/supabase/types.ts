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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      academic_programs: {
        Row: {
          created_at: string
          detailed_description: string
          display_order: number
          duration: string | null
          icon_image: string | null
          id: string
          is_active: boolean
          program_title: string
          short_description: string
          subjects: string[] | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          detailed_description: string
          display_order?: number
          duration?: string | null
          icon_image?: string | null
          id?: string
          is_active?: boolean
          program_title: string
          short_description: string
          subjects?: string[] | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          detailed_description?: string
          display_order?: number
          duration?: string | null
          icon_image?: string | null
          id?: string
          is_active?: boolean
          program_title?: string
          short_description?: string
          subjects?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      breaking_news: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          message: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          message: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          message?: string
          updated_at?: string
        }
        Relationships: []
      }
      contact_submissions: {
        Row: {
          created_at: string
          email: string
          id: string
          is_read: boolean
          message: string
          name: string
          phone: string | null
          subject: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_read?: boolean
          message: string
          name: string
          phone?: string | null
          subject: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_read?: boolean
          message?: string
          name?: string
          phone?: string | null
          subject?: string
          updated_at?: string
        }
        Relationships: []
      }
      hero_slides: {
        Row: {
          background_image: string | null
          button_link: string
          button_text: string
          created_at: string
          display_order: number
          id: string
          is_active: boolean
          slide_subtitle: string
          slide_title: string
          updated_at: string
        }
        Insert: {
          background_image?: string | null
          button_link: string
          button_text: string
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          slide_subtitle: string
          slide_title: string
          updated_at?: string
        }
        Update: {
          background_image?: string | null
          button_link?: string
          button_text?: string
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          slide_subtitle?: string
          slide_title?: string
          updated_at?: string
        }
        Relationships: []
      }
      leadership_messages: {
        Row: {
          created_at: string
          display_order: number
          id: string
          is_active: boolean
          message_content: string
          person_name: string
          person_title: string
          photo_url: string | null
          position: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          message_content: string
          person_name: string
          person_title: string
          photo_url?: string | null
          position: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          message_content?: string
          person_name?: string
          person_title?: string
          photo_url?: string | null
          position?: string
          updated_at?: string
        }
        Relationships: []
      }
      news_posts: {
        Row: {
          author: string
          content: string
          created_at: string
          excerpt: string
          featured_image: string | null
          id: string
          is_published: boolean
          publication_date: string
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          author: string
          content: string
          created_at?: string
          excerpt: string
          featured_image?: string | null
          id?: string
          is_published?: boolean
          publication_date?: string
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          author?: string
          content?: string
          created_at?: string
          excerpt?: string
          featured_image?: string | null
          id?: string
          is_published?: boolean
          publication_date?: string
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      page_content: {
        Row: {
          content: string
          created_at: string
          id: string
          meta_description: string | null
          page_key: string
          page_title: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          meta_description?: string | null
          page_key: string
          page_title: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          meta_description?: string | null
          page_key?: string
          page_title?: string
          updated_at?: string
        }
        Relationships: []
      }
      school_features: {
        Row: {
          created_at: string
          display_order: number
          feature_description: string
          feature_title: string
          icon_name: string
          id: string
          is_active: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          feature_description: string
          feature_title: string
          icon_name: string
          id?: string
          is_active?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number
          feature_description?: string
          feature_title?: string
          icon_name?: string
          id?: string
          is_active?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      staff_counts: {
        Row: {
          created_at: string
          guides_staff: number
          id: string
          professional_staff: number
          security_staff: number
          teaching_staff: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          guides_staff?: number
          id?: string
          professional_staff?: number
          security_staff?: number
          teaching_staff?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          guides_staff?: number
          id?: string
          professional_staff?: number
          security_staff?: number
          teaching_staff?: number
          updated_at?: string
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          created_at: string
          display_order: number
          id: string
          is_active: boolean
          person_name: string
          photo: string | null
          quote: string
          rating: number | null
          relation: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          person_name: string
          photo?: string | null
          quote: string
          rating?: number | null
          relation: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          person_name?: string
          photo?: string | null
          quote?: string
          rating?: number | null
          relation?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
