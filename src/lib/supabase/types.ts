/**
 * Supabase Database Types
 *
 * Generated from database schema
 * Provides type safety for all database operations
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          phone: string | null;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          hmo_pro_active: boolean;
          hmo_pro_tier: string | null;
          hmo_pro_trial_ends_at: string | null;
          hmo_pro_subscription_ends_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          phone?: string | null;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          hmo_pro_active?: boolean;
          hmo_pro_tier?: string | null;
          hmo_pro_trial_ends_at?: string | null;
          hmo_pro_subscription_ends_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          phone?: string | null;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          hmo_pro_active?: boolean;
          hmo_pro_tier?: string | null;
          hmo_pro_trial_ends_at?: string | null;
          hmo_pro_subscription_ends_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      cases: {
        Row: {
          id: string;
          user_id: string | null;
          case_type: string;
          jurisdiction: string;
          status: string;
          collected_facts: Json;
          wizard_progress: number;
          wizard_completed_at: string | null;
          recommended_route: string | null;
          recommended_grounds: string[] | null;
          success_probability: number | null;
          red_flags: Json;
          compliance_issues: Json;
          council_code: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          case_type: string;
          jurisdiction: string;
          status?: string;
          collected_facts?: Json;
          wizard_progress?: number;
          wizard_completed_at?: string | null;
          recommended_route?: string | null;
          recommended_grounds?: string[] | null;
          success_probability?: number | null;
          red_flags?: Json;
          compliance_issues?: Json;
          council_code?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          case_type?: string;
          jurisdiction?: string;
          status?: string;
          collected_facts?: Json;
          wizard_progress?: number;
          wizard_completed_at?: string | null;
          recommended_route?: string | null;
          recommended_grounds?: string[] | null;
          success_probability?: number | null;
          red_flags?: Json;
          compliance_issues?: Json;
          council_code?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      documents: {
        Row: {
          id: string;
          user_id: string | null;
          case_id: string | null;
          document_type: string;
          document_title: string;
          jurisdiction: string;
          generated_by_model: string | null;
          generation_tokens_used: number | null;
          generation_cost_usd: number | null;
          qa_score: number | null;
          qa_issues: Json;
          qa_passed: boolean;
          html_content: string | null;
          pdf_url: string | null;
          is_preview: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          case_id?: string | null;
          document_type: string;
          document_title: string;
          jurisdiction: string;
          generated_by_model?: string | null;
          generation_tokens_used?: number | null;
          generation_cost_usd?: number | null;
          qa_score?: number | null;
          qa_issues?: Json;
          qa_passed?: boolean;
          html_content?: string | null;
          pdf_url?: string | null;
          is_preview?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          case_id?: string | null;
          document_type?: string;
          document_title?: string;
          jurisdiction?: string;
          generated_by_model?: string | null;
          generation_tokens_used?: number | null;
          generation_cost_usd?: number | null;
          qa_score?: number | null;
          qa_issues?: Json;
          qa_passed?: boolean;
          html_content?: string | null;
          pdf_url?: string | null;
          is_preview?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      conversations: {
        Row: {
          id: string;
          case_id: string;
          role: string;
          content: string;
          question_id: string;
          input_type: string | null;
          model: string | null;
          user_input: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          case_id: string;
          role: string;
          content: string;
          question_id: string;
          input_type?: string | null;
          model?: string | null;
          user_input?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          case_id?: string;
          role?: string;
          content?: string;
          question_id?: string;
          input_type?: string | null;
          model?: string | null;
          user_input?: Json | null;
          created_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          user_id: string;
          case_id: string | null;
          order_type: string;
          product_name: string;
          amount: number;
          currency: string;
          status: string;
          stripe_payment_intent_id: string | null;
          stripe_session_id: string | null;
          payment_method: string | null;
          paid_at: string | null;
          delivered_at: string | null;
          refunded_at: string | null;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          case_id?: string | null;
          order_type: string;
          product_name: string;
          amount: number;
          currency?: string;
          status?: string;
          stripe_payment_intent_id?: string | null;
          stripe_session_id?: string | null;
          payment_method?: string | null;
          paid_at?: string | null;
          delivered_at?: string | null;
          refunded_at?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          case_id?: string | null;
          order_type?: string;
          product_name?: string;
          amount?: number;
          currency?: string;
          status?: string;
          stripe_payment_intent_id?: string | null;
          stripe_session_id?: string | null;
          payment_method?: string | null;
          paid_at?: string | null;
          delivered_at?: string | null;
          refunded_at?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      hmo_properties: {
        Row: {
          id: string;
          user_id: string;
          property_name: string;
          address_line1: string;
          address_line2: string | null;
          city: string;
          postcode: string;
          council_code: string;
          council_name: string | null;
          license_type: string | null;
          license_number: string | null;
          license_expiry_date: string | null;
          number_of_bedrooms: number | null;
          number_of_tenants: number | null;
          max_occupancy: number | null;
          number_of_bathrooms: number | null;
          number_of_kitchens: number | null;
          has_fire_alarm: boolean | null;
          has_co_alarm: boolean | null;
          has_emergency_lighting: boolean | null;
          has_fire_doors: boolean | null;
          has_fire_blanket: boolean | null;
          tenancy_status: string | null;
          monthly_rent: number | null;
          deposit_amount: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          property_name: string;
          address_line1: string;
          address_line2?: string | null;
          city: string;
          postcode: string;
          council_code: string;
          council_name?: string | null;
          license_type?: string | null;
          license_number?: string | null;
          license_expiry_date?: string | null;
          number_of_bedrooms?: number | null;
          number_of_tenants?: number | null;
          max_occupancy?: number | null;
          number_of_bathrooms?: number | null;
          number_of_kitchens?: number | null;
          has_fire_alarm?: boolean | null;
          has_co_alarm?: boolean | null;
          has_emergency_lighting?: boolean | null;
          has_fire_doors?: boolean | null;
          has_fire_blanket?: boolean | null;
          tenancy_status?: string | null;
          monthly_rent?: number | null;
          deposit_amount?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          property_name?: string;
          address_line1?: string;
          address_line2?: string | null;
          city?: string;
          postcode?: string;
          council_code?: string;
          council_name?: string | null;
          license_type?: string | null;
          license_number?: string | null;
          license_expiry_date?: string | null;
          number_of_bedrooms?: number | null;
          number_of_tenants?: number | null;
          max_occupancy?: number | null;
          number_of_bathrooms?: number | null;
          number_of_kitchens?: number | null;
          has_fire_alarm?: boolean | null;
          has_co_alarm?: boolean | null;
          has_emergency_lighting?: boolean | null;
          has_fire_doors?: boolean | null;
          has_fire_blanket?: boolean | null;
          tenancy_status?: string | null;
          monthly_rent?: number | null;
          deposit_amount?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      hmo_tenants: {
        Row: {
          id: string;
          property_id: string;
          user_id: string;
          full_name: string;
          email: string | null;
          phone: string | null;
          room_number: string | null;
          move_in_date: string;
          tenancy_end_date: string | null;
          move_out_date: string | null;
          monthly_rent: number;
          deposit_amount: number | null;
          deposit_protected: boolean | null;
          deposit_scheme: string | null;
          tenancy_status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          property_id: string;
          user_id: string;
          full_name: string;
          email?: string | null;
          phone?: string | null;
          room_number?: string | null;
          move_in_date: string;
          tenancy_end_date?: string | null;
          move_out_date?: string | null;
          monthly_rent: number;
          deposit_amount?: number | null;
          deposit_protected?: boolean | null;
          deposit_scheme?: string | null;
          tenancy_status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          property_id?: string;
          user_id?: string;
          full_name?: string;
          email?: string | null;
          phone?: string | null;
          room_number?: string | null;
          move_in_date?: string;
          tenancy_end_date?: string | null;
          move_out_date?: string | null;
          monthly_rent?: number;
          deposit_amount?: number | null;
          deposit_protected?: boolean | null;
          deposit_scheme?: string | null;
          tenancy_status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      councils: {
        Row: {
          code: string;
          name: string;
          region: string;
          country: string;
          hmo_mandatory: boolean;
          hmo_additional: boolean;
          hmo_selective: boolean;
          application_url: string | null;
          fees: Json | null;
          requirements: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          code: string;
          name: string;
          region: string;
          country: string;
          hmo_mandatory?: boolean;
          hmo_additional?: boolean;
          hmo_selective?: boolean;
          application_url?: string | null;
          fees?: Json | null;
          requirements?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          code?: string;
          name?: string;
          region?: string;
          country?: string;
          hmo_mandatory?: boolean;
          hmo_additional?: boolean;
          hmo_selective?: boolean;
          application_url?: string | null;
          fees?: Json | null;
          requirements?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      ai_usage: {
        Row: {
          id: string;
          user_id: string;
          model: string;
          operation: string;
          prompt_tokens: number;
          completion_tokens: number;
          total_tokens: number;
          cost_usd: number;
          case_id: string | null;
          document_id: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          model: string;
          operation: string;
          prompt_tokens: number;
          completion_tokens: number;
          total_tokens: number;
          cost_usd: number;
          case_id?: string | null;
          document_id?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          model?: string;
          operation?: string;
          prompt_tokens?: number;
          completion_tokens?: number;
          total_tokens?: number;
          cost_usd?: number;
          case_id?: string | null;
          document_id?: string | null;
          metadata?: Json;
          created_at?: string;
        };
      };
      seo_automation_log: {
        Row: {
          id: string;
          task_type: string;
          task_name: string;
          status: string;
          started_at: string;
          completed_at: string | null;
          items_processed: number;
          items_successful: number;
          summary: string | null;
          triggered_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          task_type: string;
          task_name: string;
          status: string;
          started_at: string;
          completed_at?: string | null;
          items_processed: number;
          items_successful: number;
          summary?: string | null;
          triggered_by: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          task_type?: string;
          task_name?: string;
          status?: string;
          started_at?: string;
          completed_at?: string | null;
          items_processed?: number;
          items_successful?: number;
          summary?: string | null;
          triggered_by?: string;
          created_at?: string;
        };
      };
      hmo_compliance_items: {
        Row: {
          id: string;
          property_id: string;
          user_id: string;
          item_type: string;
          item_name: string;
          status: string;
          expiry_date: string | null;
          reminder_sent_at: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          property_id: string;
          user_id: string;
          item_type: string;
          item_name: string;
          status?: string;
          expiry_date?: string | null;
          reminder_sent_at?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          property_id?: string;
          user_id?: string;
          item_type?: string;
          item_name?: string;
          status?: string;
          expiry_date?: string | null;
          reminder_sent_at?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
