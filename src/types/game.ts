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
export type Resigned = 'resigned'

export type Visit = [
  Segment | null | Resigned,
  Segment | null | Resigned,
  Segment | null | Resigned
]

export type DbLeg = Database['public']['Tables']['legs']['Row']
export type Leg = Omit<DbLeg, 'visits' | 'createdAt' | 'type'> & {
  visits: Visit[]
  createdAt: string
  type: GameType
}

export type DbGame = Database['public']['Tables']['games']['Row']
export type Game = Prettify<
  Omit<DbGame, 'createdAt' | 'legs' | 'type' | 'tournamentId'> & {
    createdAt?: string
    tournamentId?: string
    legs: Leg[]
    type: GameType
  }
>

export interface GameState {
  result: string[]
  resignees: string[]
  player: string | null
  prevPlayer: string | null
  playersLeft: string[]
  getUserResultText(userId: string): string
  getUserDisplayText(userId: string): string
  getTopRightText(): string
}

export interface GameController<T extends GameState> {
  game: Game
  getGameState(): T
  recordHit(segment: Segment): void
  recordMiss(): void
  recordResign(): void
  getSegmentText(segment?: Segment | null | Resigned): string
  speakVisit(visit: Visit, leg: Leg): void
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
  data: { typeAttributes: string[] } | null,
  name: string,
  _default: T
) => {
  if (!data) return _default

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
