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
          createdAt: string
          id: string
          legs: string[]
          type: string
        }
        Insert: {
          createdAt?: string
          id?: string
          legs: string[]
          type: string
        }
        Update: {
          createdAt?: string
          id?: string
          legs?: string[]
          type?: string
        }
        Relationships: []
      }
      legs: {
        Row: {
          confirmed: boolean
          createdAt: string
          gameId: string
          id: string
          userId: string
          visits: Json
        }
        Insert: {
          confirmed?: boolean
          createdAt?: string
          gameId: string
          id?: string
          userId: string
          visits?: Json
        }
        Update: {
          confirmed?: boolean
          createdAt?: string
          gameId?: string
          id?: string
          userId?: string
          visits?: Json
        }
        Relationships: [
          {
            foreignKeyName: "legs_gameId_fkey"
            columns: ["gameId"]
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "legs_userId_fkey"
            columns: ["userId"]
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
