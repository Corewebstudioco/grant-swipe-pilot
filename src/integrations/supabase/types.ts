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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      activities: {
        Row: {
          action_type: string
          created_at: string
          id: string
          message: string
          metadata: Json | null
          user_id: string
        }
        Insert: {
          action_type: string
          created_at?: string
          id?: string
          message: string
          metadata?: Json | null
          user_id: string
        }
        Update: {
          action_type?: string
          created_at?: string
          id?: string
          message?: string
          metadata?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      ai_experiments: {
        Row: {
          created_at: string | null
          end_date: string | null
          experiment_name: string
          hypothesis: string | null
          id: string
          model_a_version: string
          model_b_version: string
          results: Json | null
          start_date: string | null
          status: string | null
          success_metrics: Json | null
          traffic_split: number | null
        }
        Insert: {
          created_at?: string | null
          end_date?: string | null
          experiment_name: string
          hypothesis?: string | null
          id?: string
          model_a_version: string
          model_b_version: string
          results?: Json | null
          start_date?: string | null
          status?: string | null
          success_metrics?: Json | null
          traffic_split?: number | null
        }
        Update: {
          created_at?: string | null
          end_date?: string | null
          experiment_name?: string
          hypothesis?: string | null
          id?: string
          model_a_version?: string
          model_b_version?: string
          results?: Json | null
          start_date?: string | null
          status?: string | null
          success_metrics?: Json | null
          traffic_split?: number | null
        }
        Relationships: []
      }
      ai_recommendation_feedback: {
        Row: {
          ai_score: number
          created_at: string | null
          feedback_text: string | null
          feedback_type: string
          grant_id: string | null
          id: string
          model_version: string | null
          outcome_data: Json | null
          recommendation_id: string | null
          user_id: string
          user_rating: number | null
        }
        Insert: {
          ai_score: number
          created_at?: string | null
          feedback_text?: string | null
          feedback_type: string
          grant_id?: string | null
          id?: string
          model_version?: string | null
          outcome_data?: Json | null
          recommendation_id?: string | null
          user_id: string
          user_rating?: number | null
        }
        Update: {
          ai_score?: number
          created_at?: string | null
          feedback_text?: string | null
          feedback_type?: string
          grant_id?: string | null
          id?: string
          model_version?: string | null
          outcome_data?: Json | null
          recommendation_id?: string | null
          user_id?: string
          user_rating?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_recommendation_feedback_grant_id_fkey"
            columns: ["grant_id"]
            isOneToOne: false
            referencedRelation: "grant_opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      applications: {
        Row: {
          ai_assistance_used: boolean | null
          application_data: Json | null
          created_at: string | null
          funding_amount: number | null
          grant_id: string | null
          id: string
          match_id: string | null
          notes: string | null
          status: string | null
          submitted_at: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          ai_assistance_used?: boolean | null
          application_data?: Json | null
          created_at?: string | null
          funding_amount?: number | null
          grant_id?: string | null
          id?: string
          match_id?: string | null
          notes?: string | null
          status?: string | null
          submitted_at?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          ai_assistance_used?: boolean | null
          application_data?: Json | null
          created_at?: string | null
          funding_amount?: number | null
          grant_id?: string | null
          id?: string
          match_id?: string | null
          notes?: string | null
          status?: string | null
          submitted_at?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "applications_grant_id_fkey"
            columns: ["grant_id"]
            isOneToOne: false
            referencedRelation: "grants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      business_profiles_enhanced: {
        Row: {
          ai_profile_score: number | null
          annual_revenue: number | null
          business_stage: string | null
          certifications: string[] | null
          competitive_advantages: string[] | null
          created_at: string | null
          employee_count: number | null
          focus_areas: string[] | null
          id: string
          last_ai_analysis: string | null
          naics_codes: string[] | null
          past_funding_history: Json | null
          target_markets: string[] | null
          technology_stack: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ai_profile_score?: number | null
          annual_revenue?: number | null
          business_stage?: string | null
          certifications?: string[] | null
          competitive_advantages?: string[] | null
          created_at?: string | null
          employee_count?: number | null
          focus_areas?: string[] | null
          id?: string
          last_ai_analysis?: string | null
          naics_codes?: string[] | null
          past_funding_history?: Json | null
          target_markets?: string[] | null
          technology_stack?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ai_profile_score?: number | null
          annual_revenue?: number | null
          business_stage?: string | null
          certifications?: string[] | null
          competitive_advantages?: string[] | null
          created_at?: string | null
          employee_count?: number | null
          focus_areas?: string[] | null
          id?: string
          last_ai_analysis?: string | null
          naics_codes?: string[] | null
          past_funding_history?: Json | null
          target_markets?: string[] | null
          technology_stack?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      compliance_requirements: {
        Row: {
          confidence_score: number | null
          created_at: string | null
          description: string
          documentation_needed: string[] | null
          extracted_by_ai: boolean | null
          grant_id: string | null
          id: string
          is_mandatory: boolean | null
          requirement_type: string
          validation_criteria: Json | null
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string | null
          description: string
          documentation_needed?: string[] | null
          extracted_by_ai?: boolean | null
          grant_id?: string | null
          id?: string
          is_mandatory?: boolean | null
          requirement_type: string
          validation_criteria?: Json | null
        }
        Update: {
          confidence_score?: number | null
          created_at?: string | null
          description?: string
          documentation_needed?: string[] | null
          extracted_by_ai?: boolean | null
          grant_id?: string | null
          id?: string
          is_mandatory?: boolean | null
          requirement_type?: string
          validation_criteria?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "compliance_requirements_grant_id_fkey"
            columns: ["grant_id"]
            isOneToOne: false
            referencedRelation: "grant_opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      data_sources: {
        Row: {
          api_key_required: boolean | null
          api_url: string | null
          configuration: Json | null
          created_at: string | null
          id: string
          is_active: boolean | null
          last_sync: string | null
          name: string
          rate_limit_per_hour: number | null
          update_frequency: number | null
        }
        Insert: {
          api_key_required?: boolean | null
          api_url?: string | null
          configuration?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_sync?: string | null
          name: string
          rate_limit_per_hour?: number | null
          update_frequency?: number | null
        }
        Update: {
          api_key_required?: boolean | null
          api_url?: string | null
          configuration?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_sync?: string | null
          name?: string
          rate_limit_per_hour?: number | null
          update_frequency?: number | null
        }
        Relationships: []
      }
      documents: {
        Row: {
          created_at: string
          file_name: string
          file_size: number
          file_type: string
          id: string
          original_name: string
          storage_path: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          file_name: string
          file_size: number
          file_type: string
          id?: string
          original_name: string
          storage_path: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          file_name?: string
          file_size?: number
          file_type?: string
          id?: string
          original_name?: string
          storage_path?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      experiment_user_assignments: {
        Row: {
          assigned_variant: string
          assignment_date: string | null
          experiment_id: string | null
          id: string
          user_id: string
        }
        Insert: {
          assigned_variant: string
          assignment_date?: string | null
          experiment_id?: string | null
          id?: string
          user_id: string
        }
        Update: {
          assigned_variant?: string
          assignment_date?: string | null
          experiment_id?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "experiment_user_assignments_experiment_id_fkey"
            columns: ["experiment_id"]
            isOneToOne: false
            referencedRelation: "ai_experiments"
            referencedColumns: ["id"]
          },
        ]
      }
      grant_application_outcomes: {
        Row: {
          actual_outcome: boolean | null
          application_score: number | null
          application_status: string
          created_at: string | null
          decision_date: string | null
          failure_reasons: Json | null
          feedback_notes: string | null
          funding_amount: number | null
          grant_id: string | null
          id: string
          submitted_date: string | null
          success_factors: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          actual_outcome?: boolean | null
          application_score?: number | null
          application_status: string
          created_at?: string | null
          decision_date?: string | null
          failure_reasons?: Json | null
          feedback_notes?: string | null
          funding_amount?: number | null
          grant_id?: string | null
          id?: string
          submitted_date?: string | null
          success_factors?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          actual_outcome?: boolean | null
          application_score?: number | null
          application_status?: string
          created_at?: string | null
          decision_date?: string | null
          failure_reasons?: Json | null
          feedback_notes?: string | null
          funding_amount?: number | null
          grant_id?: string | null
          id?: string
          submitted_date?: string | null
          success_factors?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "grant_application_outcomes_grant_id_fkey"
            columns: ["grant_id"]
            isOneToOne: false
            referencedRelation: "grant_opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      grant_categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          keywords: string[] | null
          level: number | null
          name: string
          parent_category_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          keywords?: string[] | null
          level?: number | null
          name: string
          parent_category_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          keywords?: string[] | null
          level?: number | null
          name?: string
          parent_category_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "grant_categories_parent_category_id_fkey"
            columns: ["parent_category_id"]
            isOneToOne: false
            referencedRelation: "grant_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      grant_opportunities: {
        Row: {
          agency: string | null
          applicant_types: string[] | null
          application_due_date: string | null
          application_requirements: string | null
          application_url: string | null
          archive_date: string | null
          award_ceiling: number | null
          award_floor: number | null
          categories: string[] | null
          cfda_number: string | null
          created_at: string | null
          data_quality_score: number | null
          description: string | null
          eligibility_requirements: string | null
          estimated_funding: number | null
          external_id: string
          full_announcement_url: string | null
          geographic_scope: string[] | null
          id: string
          industries: string[] | null
          is_active: boolean | null
          keywords: string[] | null
          last_updated: string | null
          number_of_awards: number | null
          opportunity_number: string | null
          posted_date: string | null
          processing_status: string | null
          program_name: string | null
          related_documents: Json | null
          source: string
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          agency?: string | null
          applicant_types?: string[] | null
          application_due_date?: string | null
          application_requirements?: string | null
          application_url?: string | null
          archive_date?: string | null
          award_ceiling?: number | null
          award_floor?: number | null
          categories?: string[] | null
          cfda_number?: string | null
          created_at?: string | null
          data_quality_score?: number | null
          description?: string | null
          eligibility_requirements?: string | null
          estimated_funding?: number | null
          external_id: string
          full_announcement_url?: string | null
          geographic_scope?: string[] | null
          id?: string
          industries?: string[] | null
          is_active?: boolean | null
          keywords?: string[] | null
          last_updated?: string | null
          number_of_awards?: number | null
          opportunity_number?: string | null
          posted_date?: string | null
          processing_status?: string | null
          program_name?: string | null
          related_documents?: Json | null
          source: string
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          agency?: string | null
          applicant_types?: string[] | null
          application_due_date?: string | null
          application_requirements?: string | null
          application_url?: string | null
          archive_date?: string | null
          award_ceiling?: number | null
          award_floor?: number | null
          categories?: string[] | null
          cfda_number?: string | null
          created_at?: string | null
          data_quality_score?: number | null
          description?: string | null
          eligibility_requirements?: string | null
          estimated_funding?: number | null
          external_id?: string
          full_announcement_url?: string | null
          geographic_scope?: string[] | null
          id?: string
          industries?: string[] | null
          is_active?: boolean | null
          keywords?: string[] | null
          last_updated?: string | null
          number_of_awards?: number | null
          opportunity_number?: string | null
          posted_date?: string | null
          processing_status?: string | null
          program_name?: string | null
          related_documents?: Json | null
          source?: string
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      grant_training_corpus: {
        Row: {
          annotations: Json | null
          content_type: string
          created_at: string | null
          grant_id: string | null
          id: string
          quality_score: number | null
          text_content: string
          updated_at: string | null
        }
        Insert: {
          annotations?: Json | null
          content_type: string
          created_at?: string | null
          grant_id?: string | null
          id?: string
          quality_score?: number | null
          text_content: string
          updated_at?: string | null
        }
        Update: {
          annotations?: Json | null
          content_type?: string
          created_at?: string | null
          grant_id?: string | null
          id?: string
          quality_score?: number | null
          text_content?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "grant_training_corpus_grant_id_fkey"
            columns: ["grant_id"]
            isOneToOne: false
            referencedRelation: "grant_opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      grants: {
        Row: {
          agency: string | null
          amount: string | null
          application_url: string | null
          business_size_requirements: string[] | null
          category: string | null
          created_at: string | null
          deadline: string | null
          description: string | null
          eligibility: string | null
          funding_type: string | null
          id: string
          industry_tags: string[] | null
          location_restrictions: string[] | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          agency?: string | null
          amount?: string | null
          application_url?: string | null
          business_size_requirements?: string[] | null
          category?: string | null
          created_at?: string | null
          deadline?: string | null
          description?: string | null
          eligibility?: string | null
          funding_type?: string | null
          id?: string
          industry_tags?: string[] | null
          location_restrictions?: string[] | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          agency?: string | null
          amount?: string | null
          application_url?: string | null
          business_size_requirements?: string[] | null
          category?: string | null
          created_at?: string | null
          deadline?: string | null
          description?: string | null
          eligibility?: string | null
          funding_type?: string | null
          id?: string
          industry_tags?: string[] | null
          location_restrictions?: string[] | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      industries: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          keywords: string[] | null
          naics_code: string | null
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          keywords?: string[] | null
          naics_code?: string | null
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          keywords?: string[] | null
          naics_code?: string | null
          name?: string
        }
        Relationships: []
      }
      matches: {
        Row: {
          ai_reasons: string[] | null
          application_tips: string[] | null
          bookmarked: boolean | null
          compatibility_score: number | null
          created_at: string | null
          eligibility_status: string | null
          grant_id: string | null
          id: string
          missing_requirements: string[] | null
          user_id: string | null
          viewed: boolean | null
        }
        Insert: {
          ai_reasons?: string[] | null
          application_tips?: string[] | null
          bookmarked?: boolean | null
          compatibility_score?: number | null
          created_at?: string | null
          eligibility_status?: string | null
          grant_id?: string | null
          id?: string
          missing_requirements?: string[] | null
          user_id?: string | null
          viewed?: boolean | null
        }
        Update: {
          ai_reasons?: string[] | null
          application_tips?: string[] | null
          bookmarked?: boolean | null
          compatibility_score?: number | null
          created_at?: string | null
          eligibility_status?: string | null
          grant_id?: string | null
          id?: string
          missing_requirements?: string[] | null
          user_id?: string | null
          viewed?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "matches_grant_id_fkey"
            columns: ["grant_id"]
            isOneToOne: false
            referencedRelation: "grants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      model_performance_metrics: {
        Row: {
          created_at: string | null
          dataset_size: number | null
          evaluation_context: Json | null
          evaluation_date: string | null
          id: string
          metric_name: string
          metric_value: number
          model_name: string
          model_version: string
        }
        Insert: {
          created_at?: string | null
          dataset_size?: number | null
          evaluation_context?: Json | null
          evaluation_date?: string | null
          id?: string
          metric_name: string
          metric_value: number
          model_name: string
          model_version: string
        }
        Update: {
          created_at?: string | null
          dataset_size?: number | null
          evaluation_context?: Json | null
          evaluation_date?: string | null
          id?: string
          metric_name?: string
          metric_value?: number
          model_name?: string
          model_version?: string
        }
        Relationships: []
      }
      pipeline_logs: {
        Row: {
          created_at: string | null
          error_details: Json | null
          errors_count: number | null
          execution_time_ms: number | null
          id: string
          operation: string
          records_processed: number | null
          source: string
          status: string
        }
        Insert: {
          created_at?: string | null
          error_details?: Json | null
          errors_count?: number | null
          execution_time_ms?: number | null
          id?: string
          operation: string
          records_processed?: number | null
          source: string
          status: string
        }
        Update: {
          created_at?: string | null
          error_details?: Json | null
          errors_count?: number | null
          execution_time_ms?: number | null
          id?: string
          operation?: string
          records_processed?: number | null
          source?: string
          status?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          business_size: string | null
          company_name: string | null
          created_at: string | null
          description: string | null
          email: string | null
          funding_needs: string | null
          id: string
          industry: string | null
          interests: string[] | null
          location: string | null
          previous_grants: string[] | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          business_size?: string | null
          company_name?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          funding_needs?: string | null
          id: string
          industry?: string | null
          interests?: string[] | null
          location?: string | null
          previous_grants?: string[] | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          business_size?: string | null
          company_name?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          funding_needs?: string | null
          id?: string
          industry?: string | null
          interests?: string[] | null
          location?: string | null
          previous_grants?: string[] | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      team_members: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invite_token: string | null
          invited_at: string
          inviter_id: string
          name: string
          role: string
          status: string
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invite_token?: string | null
          invited_at?: string
          inviter_id: string
          name: string
          role: string
          status?: string
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invite_token?: string | null
          invited_at?: string
          inviter_id?: string
          name?: string
          role?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_activity: {
        Row: {
          activity_type: string | null
          created_at: string | null
          grant_id: string | null
          id: string
          metadata: Json | null
          user_id: string | null
        }
        Insert: {
          activity_type?: string | null
          created_at?: string | null
          grant_id?: string | null
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Update: {
          activity_type?: string | null
          created_at?: string | null
          grant_id?: string | null
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_activity_grant_id_fkey"
            columns: ["grant_id"]
            isOneToOne: false
            referencedRelation: "grants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_activity_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_grant_interactions: {
        Row: {
          ai_recommendation_score: number | null
          created_at: string | null
          grant_id: string | null
          id: string
          interaction_context: Json | null
          interaction_type: string
          session_id: string | null
          user_id: string
          user_rating: number | null
        }
        Insert: {
          ai_recommendation_score?: number | null
          created_at?: string | null
          grant_id?: string | null
          id?: string
          interaction_context?: Json | null
          interaction_type: string
          session_id?: string | null
          user_id: string
          user_rating?: number | null
        }
        Update: {
          ai_recommendation_score?: number | null
          created_at?: string | null
          grant_id?: string | null
          id?: string
          interaction_context?: Json | null
          interaction_type?: string
          session_id?: string | null
          user_id?: string
          user_rating?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_grant_interactions_grant_id_fkey"
            columns: ["grant_id"]
            isOneToOne: false
            referencedRelation: "grant_opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_dashboard_metrics: {
        Args: { user_id: string }
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
