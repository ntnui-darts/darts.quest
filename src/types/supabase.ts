export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      games: {
        Row: {
          created_at: string
          id: string
          legs: string[]
          type: string
        }
        Insert: {
          created_at?: string
          id?: string
          legs: string[]
          type: string
        }
        Update: {
          created_at?: string
          id?: string
          legs?: string[]
          type?: string
        }
        Relationships: []
      }
      legs: {
        Row: {
          created_at: string
          game_id: string
          id: string
          user_id: string
          visits: Json
        }
        Insert: {
          created_at?: string
          game_id: string
          id?: string
          user_id: string
          visits?: Json
        }
        Update: {
          created_at?: string
          game_id?: string
          id?: string
          user_id?: string
          visits?: Json
        }
        Relationships: [
          {
            foreignKeyName: "legs_game_id_fkey"
            columns: ["game_id"]
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "legs_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      users: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
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
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
