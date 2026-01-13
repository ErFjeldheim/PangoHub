export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
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
      access_requests: {
        Row: {
          created_at: string
          decided_at: string | null
          decided_by: string | null
          email: string
          id: string
          message: string | null
          name: string | null
          status: string
        }
        Insert: {
          created_at?: string
          decided_at?: string | null
          decided_by?: string | null
          email: string
          id?: string
          message?: string | null
          name?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          decided_at?: string | null
          decided_by?: string | null
          email?: string
          id?: string
          message?: string | null
          name?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "access_requests_decided_by_fkey"
            columns: ["decided_by"]
            isOneToOne: false
            referencedRelation: "consultant_search"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "access_requests_decided_by_fkey"
            columns: ["decided_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "access_requests_decided_by_fkey"
            columns: ["decided_by"]
            isOneToOne: false
            referencedRelation: "v_consultant_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "access_requests_decided_by_fkey"
            columns: ["decided_by"]
            isOneToOne: false
            referencedRelation: "v_profile_completeness"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "access_requests_decided_by_fkey"
            columns: ["decided_by"]
            isOneToOne: false
            referencedRelation: "v_profiles_with_department"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "access_requests_decided_by_fkey"
            columns: ["decided_by"]
            isOneToOne: false
            referencedRelation: "v_profiles_with_email"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_members: {
        Row: {
          added_at: string
          user_id: string
        }
        Insert: {
          added_at?: string
          user_id: string
        }
        Update: {
          added_at?: string
          user_id?: string
        }
        Relationships: []
      }
      availability_months: {
        Row: {
          hours_available: number
          hours_committed: number
          month: string
          notes: string | null
          profile_id: string
          status: Database["public"]["Enums"]["availability_status"] | null
        }
        Insert: {
          hours_available: number
          hours_committed?: number
          month: string
          notes?: string | null
          profile_id: string
          status?: Database["public"]["Enums"]["availability_status"] | null
        }
        Update: {
          hours_available?: number
          hours_committed?: number
          month?: string
          notes?: string | null
          profile_id?: string
          status?: Database["public"]["Enums"]["availability_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "availability_months_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "consultant_search"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "availability_months_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "availability_months_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "v_consultant_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "availability_months_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "v_profile_completeness"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "availability_months_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "v_profiles_with_department"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "availability_months_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "v_profiles_with_email"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          id: string
          name: string
        }
        Insert: {
          id?: string
          name: string
        }
        Update: {
          id?: string
          name?: string
        }
        Relationships: []
      }
      companies: {
        Row: {
          id: string
          name: string
        }
        Insert: {
          id?: string
          name: string
        }
        Update: {
          id?: string
          name?: string
        }
        Relationships: []
      }
      compensation: {
        Row: {
          currency: string | null
          hourly_rate: number
          profile_id: string
          valid_from: string | null
        }
        Insert: {
          currency?: string | null
          hourly_rate: number
          profile_id: string
          valid_from?: string | null
        }
        Update: {
          currency?: string | null
          hourly_rate?: number
          profile_id?: string
          valid_from?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "compensation_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "consultant_search"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compensation_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compensation_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "v_consultant_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compensation_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "v_profile_completeness"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compensation_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "v_profiles_with_department"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compensation_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "v_profiles_with_email"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          created_at: string
          description: string | null
          id: string
          leader_profile_id: string | null
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          leader_profile_id?: string | null
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          leader_profile_id?: string | null
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "departments_leader_profile_id_fkey"
            columns: ["leader_profile_id"]
            isOneToOne: false
            referencedRelation: "consultant_search"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "departments_leader_profile_id_fkey"
            columns: ["leader_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "departments_leader_profile_id_fkey"
            columns: ["leader_profile_id"]
            isOneToOne: false
            referencedRelation: "v_consultant_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "departments_leader_profile_id_fkey"
            columns: ["leader_profile_id"]
            isOneToOne: false
            referencedRelation: "v_profile_completeness"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "departments_leader_profile_id_fkey"
            columns: ["leader_profile_id"]
            isOneToOne: false
            referencedRelation: "v_profiles_with_department"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "departments_leader_profile_id_fkey"
            columns: ["leader_profile_id"]
            isOneToOne: false
            referencedRelation: "v_profiles_with_email"
            referencedColumns: ["id"]
          },
        ]
      }
      educations: {
        Row: {
          created_at: string
          degree_level: string | null
          end_year: number | null
          id: string
          institution: string
          profile_id: string
          program: string | null
          start_year: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          degree_level?: string | null
          end_year?: number | null
          id?: string
          institution: string
          profile_id: string
          program?: string | null
          start_year?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          degree_level?: string | null
          end_year?: number | null
          id?: string
          institution?: string
          profile_id?: string
          program?: string | null
          start_year?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "educations_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "consultant_search"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "educations_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "educations_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "v_consultant_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "educations_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "v_profile_completeness"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "educations_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "v_profiles_with_department"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "educations_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "v_profiles_with_email"
            referencedColumns: ["id"]
          },
        ]
      }
      experiences: {
        Row: {
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          org: string
          profile_id: string
          role: string
          start_date: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          org: string
          profile_id: string
          role: string
          start_date: string
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          org?: string
          profile_id?: string
          role?: string
          start_date?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "experiences_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "consultant_search"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "experiences_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "experiences_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "v_consultant_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "experiences_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "v_profile_completeness"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "experiences_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "v_profiles_with_department"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "experiences_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "v_profiles_with_email"
            referencedColumns: ["id"]
          },
        ]
      }
      invitations: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string
          role: string
          token_hash: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          expires_at: string
          id?: string
          invited_by: string
          role?: string
          token_hash: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          role?: string
          token_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "invitations_invited_by_profiles_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "consultant_search"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invitations_invited_by_profiles_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invitations_invited_by_profiles_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "v_consultant_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invitations_invited_by_profiles_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "v_profile_completeness"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invitations_invited_by_profiles_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "v_profiles_with_department"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invitations_invited_by_profiles_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "v_profiles_with_email"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_company_interests: {
        Row: {
          company_id: string
          profile_id: string
        }
        Insert: {
          company_id: string
          profile_id: string
        }
        Update: {
          company_id?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_company_interests_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_company_interests_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "consultant_search"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_company_interests_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_company_interests_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "v_consultant_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_company_interests_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "v_profile_completeness"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_company_interests_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "v_profiles_with_department"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_company_interests_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "v_profiles_with_email"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_skill_interests: {
        Row: {
          priority: number | null
          profile_id: string
          skill_id: string
        }
        Insert: {
          priority?: number | null
          profile_id: string
          skill_id: string
        }
        Update: {
          priority?: number | null
          profile_id?: string
          skill_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_skill_interests_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "consultant_search"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_skill_interests_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_skill_interests_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "v_consultant_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_skill_interests_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "v_profile_completeness"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_skill_interests_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "v_profiles_with_department"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_skill_interests_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "v_profiles_with_email"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_skill_interests_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_skills: {
        Row: {
          proficiency: number | null
          profile_id: string
          skill_id: string
          years: number | null
        }
        Insert: {
          proficiency?: number | null
          profile_id: string
          skill_id: string
          years?: number | null
        }
        Update: {
          proficiency?: number | null
          profile_id?: string
          skill_id?: string
          years?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "profile_skills_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "consultant_search"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_skills_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_skills_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "v_consultant_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_skills_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "v_profile_completeness"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_skills_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "v_profiles_with_department"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_skills_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "v_profiles_with_email"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_skills_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          bio: string | null
          created_at: string
          display_name: string | null
          first_name: string
          github_url: string | null
          id: string
          last_name: string
          linkedin_url: string | null
          location: string | null
          phone: string | null
          portfolio_url: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          bio?: string | null
          created_at?: string
          display_name?: string | null
          first_name: string
          github_url?: string | null
          id: string
          last_name: string
          linkedin_url?: string | null
          location?: string | null
          phone?: string | null
          portfolio_url?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          bio?: string | null
          created_at?: string
          display_name?: string | null
          first_name?: string
          github_url?: string | null
          id?: string
          last_name?: string
          linkedin_url?: string | null
          location?: string | null
          phone?: string | null
          portfolio_url?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles_departments: {
        Row: {
          created_at: string
          department_id: string
          is_primary: boolean
          profile_id: string
          role: string | null
          since: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          department_id: string
          is_primary?: boolean
          profile_id: string
          role?: string | null
          since?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          department_id?: string
          is_primary?: boolean
          profile_id?: string
          role?: string | null
          since?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_departments_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_departments_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "consultant_search"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_departments_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_departments_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "v_consultant_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_departments_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "v_profile_completeness"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_departments_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "v_profiles_with_department"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_departments_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "v_profiles_with_email"
            referencedColumns: ["id"]
          },
        ]
      }
      project_department_hours: {
        Row: {
          department_id: string
          hours_required: number
          project_id: string
        }
        Insert: {
          department_id: string
          hours_required: number
          project_id: string
        }
        Update: {
          department_id?: string
          hours_required?: number
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_department_hours_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_department_hours_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_department_hours_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "v_project_overview"
            referencedColumns: ["id"]
          },
        ]
      }
      project_interest: {
        Row: {
          created_at: string
          message: string | null
          profile_id: string
          project_id: string
        }
        Insert: {
          created_at?: string
          message?: string | null
          profile_id: string
          project_id: string
        }
        Update: {
          created_at?: string
          message?: string | null
          profile_id?: string
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_interest_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "consultant_search"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_interest_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_interest_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "v_consultant_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_interest_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "v_profile_completeness"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_interest_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "v_profiles_with_department"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_interest_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "v_profiles_with_email"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_interest_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_interest_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "v_project_overview"
            referencedColumns: ["id"]
          },
        ]
      }
      project_members: {
        Row: {
          contribution: string | null
          end_date: string | null
          hours: number | null
          profile_id: string
          project_id: string
          role: string | null
          start_date: string | null
        }
        Insert: {
          contribution?: string | null
          end_date?: string | null
          hours?: number | null
          profile_id: string
          project_id: string
          role?: string | null
          start_date?: string | null
        }
        Update: {
          contribution?: string | null
          end_date?: string | null
          hours?: number | null
          profile_id?: string
          project_id?: string
          role?: string | null
          start_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_members_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "consultant_search"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_members_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_members_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "v_consultant_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_members_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "v_profile_completeness"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_members_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "v_profiles_with_department"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_members_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "v_profiles_with_email"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_members_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_members_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "v_project_overview"
            referencedColumns: ["id"]
          },
        ]
      }
      project_skills: {
        Row: {
          project_id: string
          skill_id: string
        }
        Insert: {
          project_id: string
          skill_id: string
        }
        Update: {
          project_id?: string
          skill_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_skills_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_skills_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "v_project_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_skills_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
        ]
      }
      project_updates: {
        Row: {
          author_id: string
          body: string | null
          created_at: string
          id: string
          project_id: string
          title: string | null
        }
        Insert: {
          author_id: string
          body?: string | null
          created_at?: string
          id?: string
          project_id: string
          title?: string | null
        }
        Update: {
          author_id?: string
          body?: string | null
          created_at?: string
          id?: string
          project_id?: string
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_updates_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "consultant_search"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_updates_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_updates_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "v_consultant_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_updates_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "v_profile_completeness"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_updates_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "v_profiles_with_department"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_updates_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "v_profiles_with_email"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_updates_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_updates_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "v_project_overview"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          client_id: string | null
          created_at: string | null
          description: string | null
          end_date: string | null
          hours_required: number | null
          id: string
          name: string
          owner_id: string | null
          start_date: string | null
          status: string | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          hours_required?: number | null
          id?: string
          name: string
          owner_id?: string | null
          start_date?: string | null
          status?: string | null
        }
        Update: {
          client_id?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          hours_required?: number | null
          id?: string
          name?: string
          owner_id?: string | null
          start_date?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "consultant_search"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "v_consultant_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "v_profile_completeness"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "v_profiles_with_department"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "v_profiles_with_email"
            referencedColumns: ["id"]
          },
        ]
      }
      skills: {
        Row: {
          aliases: string[] | null
          id: string
          name: string
        }
        Insert: {
          aliases?: string[] | null
          id?: string
          name: string
        }
        Update: {
          aliases?: string[] | null
          id?: string
          name?: string
        }
        Relationships: []
      }
    }
    Views: {
      consultant_search: {
        Row: {
          doc: unknown | null
          id: string | null
        }
        Relationships: []
      }
      v_availability_current: {
        Row: {
          hours_available: number | null
          hours_committed: number | null
          hours_free: number | null
          month: string | null
          profile_id: string | null
          status: Database["public"]["Enums"]["availability_status"] | null
        }
        Insert: {
          hours_available?: number | null
          hours_committed?: number | null
          hours_free?: never
          month?: string | null
          profile_id?: string | null
          status?: Database["public"]["Enums"]["availability_status"] | null
        }
        Update: {
          hours_available?: number | null
          hours_committed?: number | null
          hours_free?: never
          month?: string | null
          profile_id?: string | null
          status?: Database["public"]["Enums"]["availability_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "availability_months_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "consultant_search"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "availability_months_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "availability_months_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "v_consultant_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "availability_months_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "v_profile_completeness"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "availability_months_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "v_profiles_with_department"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "availability_months_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "v_profiles_with_email"
            referencedColumns: ["id"]
          },
        ]
      }
      v_consultant_overview: {
        Row: {
          availability_status:
            | Database["public"]["Enums"]["availability_status"]
            | null
          bio: string | null
          created_at: string | null
          display_name: string | null
          experience_years: number | null
          first_name: string | null
          github_url: string | null
          id: string | null
          last_name: string | null
          linkedin_url: string | null
          location: string | null
          phone: string | null
          portfolio_url: string | null
          title: string | null
          updated_at: string | null
        }
        Relationships: []
      }
      v_profile_completeness: {
        Row: {
          completeness_percentage: number | null
          id: string | null
        }
        Insert: {
          completeness_percentage?: never
          id?: string | null
        }
        Update: {
          completeness_percentage?: never
          id?: string | null
        }
        Relationships: []
      }
      v_profiles_with_department: {
        Row: {
          bio: string | null
          created_at: string | null
          display_name: string | null
          first_name: string | null
          github_url: string | null
          id: string | null
          last_name: string | null
          linkedin_url: string | null
          location: string | null
          phone: string | null
          portfolio_url: string | null
          primary_department: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          first_name?: string | null
          github_url?: string | null
          id?: string | null
          last_name?: string | null
          linkedin_url?: string | null
          location?: string | null
          phone?: string | null
          portfolio_url?: string | null
          primary_department?: never
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          first_name?: string | null
          github_url?: string | null
          id?: string | null
          last_name?: string | null
          linkedin_url?: string | null
          location?: string | null
          phone?: string | null
          portfolio_url?: string | null
          primary_department?: never
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      v_profiles_with_email: {
        Row: {
          bio: string | null
          created_at: string | null
          display_name: string | null
          email: string | null
          first_name: string | null
          github_url: string | null
          id: string | null
          last_name: string | null
          linkedin_url: string | null
          location: string | null
          phone: string | null
          portfolio_url: string | null
          title: string | null
          updated_at: string | null
        }
        Relationships: []
      }
      v_project_overview: {
        Row: {
          client_name: string | null
          consultant_count: number | null
          departments: string[] | null
          description: string | null
          duration_days: number | null
          end_date: string | null
          first_member_start: string | null
          id: string | null
          is_active: boolean | null
          last_member_end: string | null
          name: string | null
          start_date: string | null
          status: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      accept_invitation: {
        Args: { p_email: string; p_token: string; p_user_id: string }
        Returns: undefined
      }
      admin_profiles_with_email: {
        Args: Record<PropertyKey, never>
        Returns: {
          bio: string
          created_at: string
          department: string
          display_name: string
          email: string
          first_name: string
          github_url: string
          id: string
          last_name: string
          linkedin_url: string
          location: string
          phone: string
          portfolio_url: string
          title: string
          updated_at: string
        }[]
      }
      citext: {
        Args: { "": boolean } | { "": string } | { "": unknown }
        Returns: string
      }
      citext_hash: {
        Args: { "": string }
        Returns: number
      }
      citextin: {
        Args: { "": unknown }
        Returns: string
      }
      citextout: {
        Args: { "": string }
        Returns: unknown
      }
      citextrecv: {
        Args: { "": unknown }
        Returns: string
      }
      citextsend: {
        Args: { "": string }
        Returns: string
      }
      get_aggregated_availability_for_department: {
        Args: { p_department_id: string }
        Returns: {
          month: string
          total_hours_available: number
          total_hours_committed: number
          total_hours_free: number
        }[]
      }
      get_consultants_for_department: {
        Args: { p_department_id: string }
        Returns: {
          availability_status: string
          display_name: string
          email: string
          id: string
          title: string
        }[]
      }
      get_department_rollup: {
        Args: Record<PropertyKey, never>
        Returns: {
          available_consultants: number
          department_id: string
          department_name: string
          leader_name: string
          total_consultants: number
        }[]
      }
      get_departments_with_details: {
        Args: Record<PropertyKey, never>
        Returns: {
          consultant_count: number
          description: string
          id: string
          leader_name: string
          name: string
        }[]
      }
      get_projects_for_department: {
        Args: { p_department_id: string }
        Returns: {
          description: string
          end_date: string
          id: string
          name: string
          start_date: string
        }[]
      }
      gtrgm_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_options: {
        Args: { "": unknown }
        Returns: undefined
      }
      gtrgm_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      is_admin: {
        Args: { uid: string }
        Returns: boolean
      }
      sanitize_auth_user_tokens: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      search_consultants: {
        Args: { p_limit?: number; p_offset?: number; q: string }
        Returns: {
          availability_status: string
          display_name: string
          id: string
          rank: number
          title: string
        }[]
      }
      set_limit: {
        Args: { "": number }
        Returns: number
      }
      show_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_trgm: {
        Args: { "": string }
        Returns: string[]
      }
      unaccent: {
        Args: { "": string }
        Returns: string
      }
      unaccent_init: {
        Args: { "": unknown }
        Returns: unknown
      }
      verify_invitation: {
        Args: { p_email: string; p_token: string }
        Returns: {
          accepted_at: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string
          role: string
          token_hash: string
        }
      }
    }
    Enums: {
      availability_status: "available" | "partly" | "busy" | "unavailable"
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
      availability_status: ["available", "partly", "busy", "unavailable"],
    },
  },
} as const

