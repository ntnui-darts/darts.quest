export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      elo: {
        Row: {
          cricket: number | null
          id: string
          killer: number | null
          lastUpdate: string | null
          rtc: number | null
          skovhugger: number | null
          x01: number | null
        }
        Insert: {
          cricket?: number | null
          id: string
          killer?: number | null
          lastUpdate?: string | null
          rtc?: number | null
          skovhugger?: number | null
          x01?: number | null
        }
        Update: {
          cricket?: number | null
          id?: string
          killer?: number | null
          lastUpdate?: string | null
          rtc?: number | null
          skovhugger?: number | null
          x01?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "elo_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      games: {
        Row: {
          createdAt: string
          id: string
          legs: string[]
          players: string[]
          result: string[]
          tournamentId: string | null
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
          tournamentId?: string | null
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
          tournamentId?: string | null
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
          },
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
          },
        ]
      }
      statistics_cricket: {
        Row: {
          eloDelta: number | null
          id: string
          score: number | null
          winRate: number | null
        }
        Insert: {
          eloDelta?: number | null
          id: string
          score?: number | null
          winRate?: number | null
        }
        Update: {
          eloDelta?: number | null
          id?: string
          score?: number | null
          winRate?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "statistics_cricket_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "legs"
            referencedColumns: ["id"]
          },
        ]
      }
      statistics_killer: {
        Row: {
          darts: number | null
          eloDelta: number | null
          id: string
          winRate: number | null
        }
        Insert: {
          darts?: number | null
          eloDelta?: number | null
          id: string
          winRate?: number | null
        }
        Update: {
          darts?: number | null
          eloDelta?: number | null
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
          },
        ]
      }
      statistics_rtc: {
        Row: {
          darts: number | null
          eloDelta: number | null
          hitRate: number | null
          id: string
          maxStreak: number | null
          winRate: number | null
        }
        Insert: {
          darts?: number | null
          eloDelta?: number | null
          hitRate?: number | null
          id: string
          maxStreak?: number | null
          winRate?: number | null
        }
        Update: {
          darts?: number | null
          eloDelta?: number | null
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
          },
        ]
      }
      statistics_skovhugger: {
        Row: {
          eloDelta: number | null
          id: string
          score: number | null
          winRate: number | null
        }
        Insert: {
          eloDelta?: number | null
          id: string
          score?: number | null
          winRate?: number | null
        }
        Update: {
          eloDelta?: number | null
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
          },
        ]
      }
      statistics_x01: {
        Row: {
          checkout: number | null
          darts: number | null
          eloDelta: number | null
          first9Avg: number | null
          id: string
          maxVisitScore: number | null
          winRate: number | null
        }
        Insert: {
          checkout?: number | null
          darts?: number | null
          eloDelta?: number | null
          first9Avg?: number | null
          id: string
          maxVisitScore?: number | null
          winRate?: number | null
        }
        Update: {
          checkout?: number | null
          darts?: number | null
          eloDelta?: number | null
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
          },
        ]
      }
      tournaments: {
        Row: {
          createdAt: string
          gameType: string
          gameTypeAttributes: string[]
          id: string
          legsPerSet: number
          players: string[]
          setsPerMatch: number
          type: string
          userId: string
        }
        Insert: {
          createdAt?: string
          gameType: string
          gameTypeAttributes?: string[]
          id: string
          legsPerSet?: number
          players?: string[]
          setsPerMatch?: number
          type: string
          userId: string
        }
        Update: {
          createdAt?: string
          gameType?: string
          gameTypeAttributes?: string[]
          id?: string
          legsPerSet?: number
          players?: string[]
          setsPerMatch?: number
          type?: string
          userId?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          createdAt: string
          id: string
          lastActive: string | null
          name: string
          visible: boolean | null
          walkOn: string | null
          walkOnEndTime: number
          walkOnTime: number
        }
        Insert: {
          createdAt?: string
          id?: string
          lastActive?: string | null
          name?: string
          visible?: boolean | null
          walkOn?: string | null
          walkOnEndTime?: number
          walkOnTime?: number
        }
        Update: {
          createdAt?: string
          id?: string
          lastActive?: string | null
          name?: string
          visible?: boolean | null
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never
