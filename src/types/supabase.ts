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
          userId: string
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
            isOneToOne: false
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
            foreignKeyName: "legs_gameId_fkey"
            columns: ["gameId"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "legs_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      statistics_killer: {
        Row: {
          darts: number | null
          id: string
          winRate: number | null
        }
        Insert: {
          darts?: number | null
          id: string
          winRate?: number | null
        }
        Update: {
          darts?: number | null
          id?: string
          winRate?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "statistics_killer_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "legs"
            referencedColumns: ["id"]
          }
        ]
      }
      statistics_rtc: {
        Row: {
          darts: number | null
          hitRate: number | null
          id: string
          maxStreak: number | null
          winRate: number | null
        }
        Insert: {
          darts?: number | null
          hitRate?: number | null
          id: string
          maxStreak?: number | null
          winRate?: number | null
        }
        Update: {
          darts?: number | null
          hitRate?: number | null
          id?: string
          maxStreak?: number | null
          winRate?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "statistics_rtc_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "legs"
            referencedColumns: ["id"]
          }
        ]
      }
      statistics_skovhugger: {
        Row: {
          id: string
          score: number | null
          winRate: number | null
        }
        Insert: {
          id: string
          score?: number | null
          winRate?: number | null
        }
        Update: {
          id?: string
          score?: number | null
          winRate?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "statistics_skovhugger_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "legs"
            referencedColumns: ["id"]
          }
        ]
      }
      statistics_x01: {
        Row: {
          checkout: number | null
          darts: number | null
          first9Avg: number | null
          id: string
          maxVisitScore: number | null
          winRate: number | null
        }
        Insert: {
          checkout?: number | null
          darts?: number | null
          first9Avg?: number | null
          id: string
          maxVisitScore?: number | null
          winRate?: number | null
        }
        Update: {
          checkout?: number | null
          darts?: number | null
          first9Avg?: number | null
          id?: string
          maxVisitScore?: number | null
          winRate?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "statistics_x01_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "legs"
            referencedColumns: ["id"]
          }
        ]
      }
      users: {
        Row: {
          createdAt: string
          id: string
          name: string
          walkOn: string | null
          walkOnEndTime: number
          walkOnTime: number
        }
        Insert: {
          createdAt?: string
          id?: string
          name?: string
          walkOn?: string | null
          walkOnEndTime?: number
          walkOnTime?: number
        }
        Update: {
          createdAt?: string
          id?: string
          name?: string
          walkOn?: string | null
          walkOnEndTime?: number
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
