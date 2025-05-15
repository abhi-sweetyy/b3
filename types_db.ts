export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          full_name: string | null;
          avatar_url: string | null;
        }
        Insert: {
          id: string;
          full_name?: string | null;
          avatar_url?: string | null;
        }
        Update: {
          id?: string;
          full_name?: string | null;
          avatar_url?: string | null;
        }
        Relationships: [
          {
            foreignKeyName: "users_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      documents: {
        Row: {
          id: string;
          user_id: string;
          filename: string;
          status: string;
          analysis_results: string | null;
          risk_level: string | null;
          model_used: string | null;
          created_at: string;
          score: number | null;
        }
        Insert: {
          id?: string;
          user_id: string;
          filename: string;
          status: string;
          analysis_results?: string | null;
          risk_level?: string | null;
          model_used?: string | null;
          created_at?: string;
          score?: number | null;
        }
        Update: {
          id?: string;
          user_id?: string;
          filename?: string;
          status?: string;
          analysis_results?: string | null;
          risk_level?: string | null;
          model_used?: string | null;
          created_at?: string;
          score?: number | null;
        }
        Relationships: [
          {
            foreignKeyName: "documents_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
