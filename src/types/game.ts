import { Database } from './supabase'

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

export const GamePoints = {
  '301': 301,
  '501': 501,
  '701': 701,
  'Round the Clock': 20,
} as const

export type GameType = keyof typeof GamePoints

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

export interface GameController {
  getCurrentLegScore(): number
  getUserResultText(userId: string): string
  getUserDisplayText(userId: string): string
  getSegmentText(segment?: Segment | null): string
  recordHit(segment?: Segment): void
  recordMiss(): void
}

export const multiplierToString = (m?: Multiplier) => {
  return m ? 'I'.repeat(m) : '-'
}

export const getLegOfUser = (game: Game, userId: string) => {
  return game.legs.find((leg) => leg.userId == userId) ?? null
}

export const getVisitsOfUser = (game: Game, userId: string) => {
  return getLegOfUser(game, userId)?.visits ?? []
}
