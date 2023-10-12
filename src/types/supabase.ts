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
          players: string[]
          result: string[]
          type: string
          typeAttributes: string[]
          userId: string
        }
        Insert: {
          createdAt?: string
          id: string
          legs: string[]
          players?: string[]
          result: string[]
          type: string
          typeAttributes?: string[]
          userId?: string
        }
        Update: {
          createdAt?: string
          id?: string
          legs?: string[]
          players?: string[]
          result?: string[]
          type?: string
          typeAttributes?: string[]
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
          gameId: string
          id: string
          type: string
          typeAttributes: string[]
          userId: string
          visits: Json
        }
        Insert: {
          arrows?: string | null
          beers?: number | null
          confirmed?: boolean
          createdAt?: string
          finish?: boolean
          gameId: string
          id: string
          type: string
          typeAttributes?: string[]
          userId: string
          visits?: Json
        }
        Update: {
          arrows?: string | null
          beers?: number | null
          confirmed?: boolean
          createdAt?: string
          finish?: boolean
          gameId?: string
          id?: string
          type?: string
          typeAttributes?: string[]
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
      statistics: {
        Row: {
          maxRtcStreak: number
          maxX01VisitScore: number
          min301DoubleVisits: number | null
          minRtcVisits: number | null
          userId: string
        }
        Insert: {
          maxRtcStreak?: number
          maxX01VisitScore?: number
          min301DoubleVisits?: number | null
          minRtcVisits?: number | null
          userId: string
        }
        Update: {
          maxRtcStreak?: number
          maxX01VisitScore?: number
          min301DoubleVisits?: number | null
          minRtcVisits?: number | null
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "statistics_userId_fkey"
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
          walkOn: string | null
          walkOnTime: number
        }
        Insert: {
          created_at?: string
          id?: string
          name?: string
          walkOn?: string | null
          walkOnTime?: number
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          walkOn?: string | null
          walkOnTime?: number
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
