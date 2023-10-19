import { GameType } from '@/games/games'
import { Database } from './supabase'
import { Prettify } from './ts'

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

export type DbLeg = Database['public']['Tables']['legs']['Row']
export type Leg = Omit<
  DbLeg,
  'visits' | 'createdAt' | 'type' | 'finishType'
> & {
  visits: Visit[]
  createdAt: string
  type: GameType
}

export type DbGame = Database['public']['Tables']['games']['Row']
export type Game = Prettify<
  Omit<DbGame, 'createdAt' | 'legs' | 'type' | 'finishType'> & {
    createdAt?: string
    legs: Leg[]
    type: GameType
  }
>

export interface GameState {
  rank: string[]
  player: string | null
  prevPlayer: string | null
  playersLeft: string[]
  getUserResultText(userId: string): string
  getUserDisplayText(userId: string): string
}

export interface GameController {
  game: Game
  getGameState(): GameState
  recordHit(segment: Segment): void
  recordMiss(): void
  getSegmentText(segment?: Segment | null): string
}

export const multiplierToString = (m: Multiplier) => {
  return 'I'.repeat(m)
}

export const getLegOfUser = (game: Game, userId: string) => {
  return game.legs.find((leg) => leg.userId == userId)
}

export const getVisitsOfUser = (game: Game, userId?: string | null) => {
  if (!userId) return []
  const leg = getLegOfUser(game, userId)
  if (!leg) return []
  return leg.visits
}

export const getTypeAttribute = <T>(
  data: { typeAttributes: string[] },
  name: string,
  _default: T
) => {
  for (const attr of data.typeAttributes) {
    if (!attr.includes(':')) continue
    const [key, value] = attr.split(':')
    if (key == name) {
      if (typeof _default == 'number') {
        return parseFloat(value) as T
      }
      if (typeof _default == 'boolean') {
        return (value == 'true') as T
      }
      return value as T
    }
  }
  return _default as T
}
