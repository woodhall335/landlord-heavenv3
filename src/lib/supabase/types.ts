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
          user_id: string;
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
          user_id: string;
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
          user_id?: string;
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
          user_id: string;
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
          user_id: string;
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
          user_id?: string;
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
          address: string;
          postcode: string;
          council_code: string | null;
          license_type: string | null;
          license_number: string | null;
          license_expires_at: string | null;
          max_occupants: number | null;
          current_occupants: number;
          compliance_status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          property_name: string;
          address: string;
          postcode: string;
          council_code?: string | null;
          license_type?: string | null;
          license_number?: string | null;
          license_expires_at?: string | null;
          max_occupants?: number | null;
          current_occupants?: number;
          compliance_status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          property_name?: string;
          address?: string;
          postcode?: string;
          council_code?: string | null;
          license_type?: string | null;
          license_number?: string | null;
          license_expires_at?: string | null;
          max_occupants?: number | null;
          current_occupants?: number;
          compliance_status?: string;
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
          rent_amount: number;
          rent_period: string;
          tenancy_start_date: string;
          tenancy_end_date: string | null;
          status: string;
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
          rent_amount: number;
          rent_period?: string;
          tenancy_start_date: string;
          tenancy_end_date?: string | null;
          status?: string;
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
          rent_amount?: number;
          rent_period?: string;
          tenancy_start_date?: string;
          tenancy_end_date?: string | null;
          status?: string;
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
