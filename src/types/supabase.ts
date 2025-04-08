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
      achievement: {
        Row: {
          createdAt: string
          description: string
          id: string
          includedGameTypes: string[]
          name: string
        }
        Insert: {
          createdAt?: string
          description: string
          id: string
          includedGameTypes?: string[]
          name: string
        }
        Update: {
          createdAt?: string
          description?: string
          id?: string
          includedGameTypes?: string[]
          name?: string
        }
        Relationships: []
      }
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
          legsPerSetArray: number[] | null
          name: string | null
          players: string[]
          setsPerMatchArray: number[] | null
          type: string
          userId: string
        }
        Insert: {
          createdAt?: string
          gameType: string
          gameTypeAttributes?: string[]
          id: string
          legsPerSetArray?: number[] | null
          name?: string | null
          players?: string[]
          setsPerMatchArray?: number[] | null
          type: string
          userId: string
        }
        Update: {
          createdAt?: string
          gameType?: string
          gameTypeAttributes?: string[]
          id?: string
          legsPerSetArray?: number[] | null
          name?: string | null
          players?: string[]
          setsPerMatchArray?: number[] | null
          type?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "tournaments_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_achievement: {
        Row: {
          achievement: string
          createdAt: string
          leg: string | null
          unlocked: boolean
          unlockedTime: string | null
          user: string
        }
        Insert: {
          achievement: string
          createdAt?: string
          leg?: string | null
          unlocked?: boolean
          unlockedTime?: string | null
          user: string
        }
        Update: {
          achievement?: string
          createdAt?: string
          leg?: string | null
          unlocked?: boolean
          unlockedTime?: string | null
          user?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievement_achievement_fkey"
            columns: ["achievement"]
            isOneToOne: false
            referencedRelation: "achievement"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_achievement_leg_fkey"
            columns: ["leg"]
            isOneToOne: false
            referencedRelation: "legs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_achievement_user_fkey"
            columns: ["user"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
