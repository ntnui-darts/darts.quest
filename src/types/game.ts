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

export const getGamePoints = (game: Game | Leg) => {
  switch (game.type) {
    case 'rtc':
      return 20
    case 'x01':
      return getTypeAttribute<number>(game, 'startScore', NaN)
    case 'killer':
      return 5
  }
}

export const GameTypeNames = {
  x01: 'X01',
  rtc: 'Round the Clock',
  killer: 'Killer',
} as const satisfies Record<GameType, string>

export const getGameDisplayName = (game: Game) => {
  switch (game.type) {
    case 'rtc':
      return 'Round the Clock'
    case 'x01':
      return getTypeAttribute<number>(game, 'startScore', NaN).toString()
  }
}

export type GameType = 'x01' | 'rtc' | 'killer'

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
  results: string[]
  userId: string | null
  prevUserId: string | null
  playersLeft: string[]
  getUserResultText(userId: string): string
  getUserDisplayText(userId: string): string
  getSegmentText(segment?: Segment | null): string
}

export interface GameController {
  game: Game
  getGameState(): GameState
  recordHit(segment: Segment): void
  recordMiss(): void
}

export const getMinPlayerCount = (gameType: GameType) => {
  switch (gameType) {
    case 'killer':
      return 2
    case 'rtc':
      return 1
    case 'x01':
      return 1
  }
}

export const multiplierToString = (m: Multiplier) => {
  return 'I'.repeat(m)
}

export const getLegOfUser = (game: Game, userId: string) => {
  const leg = game.legs.find((leg) => leg.userId == userId)
  if (!leg) throw Error()
  if (leg.visits.length == 0 || leg.visits.at(-1)?.[2] != null) {
    leg.visits.push([null, null, null])
  }
  return leg
}

export const getVisitsOfUser = (
  game: Game,
  userId?: string | null,
  includeEmpty = true
) => {
  if (!userId) return []
  const leg = getLegOfUser(game, userId)
  if (!leg) return []
  if (!includeEmpty) return leg.visits.filter((v) => !v.every((s) => s == null))
  return leg.visits
}

export const getTypeAttribute = <T>(
  data: Game | Leg,
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
