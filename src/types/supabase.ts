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
          finishType: number
          id: string
          legs: string[]
          players: string[]
          result: string[]
          type: string
          typeArray: string[]
          userId: string
        }
        Insert: {
          createdAt?: string
          finishType?: number
          id: string
          legs: string[]
          players?: string[]
          result: string[]
          type: string
          typeArray?: string[]
          userId?: string
        }
        Update: {
          createdAt?: string
          finishType?: number
          id?: string
          legs?: string[]
          players?: string[]
          result?: string[]
          type?: string
          typeArray?: string[]
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "games_userId_fkey"
            columns: ["userId"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      legs: {
        Row: {
          arrows: string | null
          beers: number | null
          confirmed: boolean
          createdAt: string
          finish: boolean
          finishType: number
          gameId: string
          id: string
          type: string
          typeArray: string[]
          userId: string
          visits: Json
        }
        Insert: {
          arrows?: string | null
          beers?: number | null
          confirmed?: boolean
          createdAt?: string
          finish?: boolean
          finishType?: number
          gameId: string
          id: string
          type: string
          typeArray?: string[]
          userId: string
          visits?: Json
        }
        Update: {
          arrows?: string | null
          beers?: number | null
          confirmed?: boolean
          createdAt?: string
          finish?: boolean
          finishType?: number
          gameId?: string
          id?: string
          type?: string
          typeArray?: string[]
          userId?: string
          visits?: Json
        }
        Relationships: [
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
