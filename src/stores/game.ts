import { Database } from '@/types/supabase'

export enum Multiplier {
  None,
  Single,
  Double,
  Triple,
}

export type Segment = {
  multiplier: Multiplier
  sector: number
}

export type Visit = [Segment | null, Segment | null, Segment | null]

export const GameTypes = {
  '301': 301,
  '501': 501,
  '701': 701,
  'Round the Clock': 20,
} as const

export type GameType = keyof typeof GameTypes

export type DbLeg = Database['public']['Tables']['legs']['Row']
export type Leg = Omit<
  DbLeg,
  'visits' | 'createdAt' | 'type' | 'finishType'
> & {
  visits: Visit[]
  createdAt: string
  type: GameType
  finishType: 1 | 2 | 3
}

export type DbGame = Database['public']['Tables']['games']['Row']
export type Game = Omit<
  DbGame,
  'createdAt' | 'legs' | 'type' | 'finishType'
> & {
  createdAt?: string
  legs: Leg[]
  type: GameType
  finishType: 1 | 2 | 3
}
