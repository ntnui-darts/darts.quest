// Pure tournament logic. No Vue, Pinia or Supabase imports on purpose, so it
// can be unit tested without any app setup.

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

// What the creator picks in the UI.
export type TournamentFormat = 'elimination' | 'round-robin'
export type BracketOrder = 'random' | 'manual' | 'seeded'

// What is stored in the `type` column of the `tournaments` table.
//  - 'elimination':        players are paired top to bottom (1st vs 2nd, ...).
//                          If the count is not a power of two, the players at
//                          the bottom of the list get a bye in round 1.
//                          This is the layout every existing tournament uses.
//  - 'elimination-seeded': players are stored in seed order (best first) and
//                          the bracket is placed with standard seeding.
//  - 'round-robin':        everyone plays everyone once.
//  - 'round-robin:N':      N groups (N > 1). Everyone plays everyone in their
//                          own group. The stored player list is cut into N
//                          consecutive blocks, see `groupSizes`.
export type TournamentType =
  | 'elimination'
  | 'elimination-seeded'
  | 'round-robin'

// The kind of tournament, without any group suffix.
export const parseTournamentType = (
  type: string | null | undefined
): TournamentType => {
  if (type == 'elimination-seeded') return type
  if (type == 'round-robin' || type?.startsWith('round-robin:')) {
    return 'round-robin'
  }
  return 'elimination'
}

// Number of groups in a round robin tournament. Always at least 1.
export const parseGroupCount = (type: string | null | undefined): number => {
  const count = Number(type?.split(':')[1])
  return type?.startsWith('round-robin:') &&
    Number.isInteger(count) &&
    count > 1
    ? count
    : 1
}

export const tournamentTypeFor = (
  format: TournamentFormat,
  order: BracketOrder,
  groups = 1
): string => {
  if (format == 'round-robin') {
    return groups > 1 ? `round-robin:${groups}` : 'round-robin'
  }
  return order == 'seeded' ? 'elimination-seeded' : 'elimination'
}

// ---------------------------------------------------------------------------
// Groups
// ---------------------------------------------------------------------------

export const MIN_GROUP_SIZE = 3

// Most groups that still leave everyone with at least MIN_GROUP_SIZE players.
// 4 players -> 1, 6 -> 2, 8 -> 2, 9 -> 3, 12 -> 4.
export const maxGroupCount = (numberOfPlayers: number) =>
  Math.max(1, Math.floor(numberOfPlayers / MIN_GROUP_SIZE))

// Group sizes differ by at most one, bigger groups first: 9 in 2 -> [5, 4].
export const groupSizes = (numberOfPlayers: number, groups: number) => {
  const count = Math.max(1, Math.min(groups, numberOfPlayers))
  const base = Math.floor(numberOfPlayers / count)
  const extra = numberOfPlayers % count
  return Array.from({ length: count }, (_, i) => base + (i < extra ? 1 : 0))
}

// Cuts the list into consecutive blocks. This is how a stored tournament is
// turned into groups, and what the creator gets in manual mode.
export const splitIntoGroups = <T>(items: T[], groups: number): T[][] => {
  let start = 0
  return groupSizes(items.length, groups).map((size) => {
    const block = items.slice(start, start + size)
    start += size
    return block
  })
}

// Reorders a list that is ranked best first, so that splitIntoGroups gives
// groups that are dealt out snake style (1 2 3 3 2 1 ...). Every group gets
// one of the best players, one of the next best, and so on.
export const snakeOrder = <T>(ranked: T[], groups: number): T[] => {
  const sizes = groupSizes(ranked.length, groups)
  const dealt: T[][] = sizes.map(() => [])
  ranked.forEach((item, i) => {
    const row = Math.floor(i / sizes.length)
    const col = i % sizes.length
    const index = row % 2 == 0 ? col : sizes.length - 1 - col
    // The last row can be shorter than the others, then the groups at the
    // end are already full. Hand the player to the next group that has room.
    let target = index
    while (dealt[target].length >= sizes[target]) {
      target = (target + 1) % sizes.length
    }
    dealt[target].push(item)
  })
  return dealt.flat()
}

export const groupLabel = (index: number) =>
  `Group ${String.fromCharCode(65 + index)}`

// Minimal shape of a row from the `games` table. One game is one leg.
export type TournamentGame = {
  result: string[]
  createdAt: string
  players: string[]
}

// ---------------------------------------------------------------------------
// One match between two players
// ---------------------------------------------------------------------------

export type SideState = {
  legWins: number[] // legs won in each set, last entry is the current set
  setWins: number
}

export type MatchResult = {
  winnerId: string | undefined
  a: SideState
  b: SideState
}

export const computeMatch = (
  aId: string,
  bId: string,
  games: TournamentGame[],
  legsToWinSet: number,
  setsToWinMatch: number
): MatchResult => {
  const a: SideState = { legWins: [0], setWins: 0 }
  const b: SideState = { legWins: [0], setWins: 0 }
  if (aId == bId) return { winnerId: undefined, a, b }

  const relevant = games
    .filter((g) => g.players.includes(aId) && g.players.includes(bId))
    .toSorted(
      (x, y) =>
        new Date(x.createdAt).getTime() - new Date(y.createdAt).getTime()
    )

  for (const game of relevant) {
    const winnerId: string | undefined = game.result[0]
    const [winner, loser] =
      winnerId == aId
        ? [a, b]
        : winnerId == bId
          ? [b, a]
          : [undefined, undefined]
    if (!winner || !loser) continue

    winner.legWins[winner.legWins.length - 1] += 1
    if (winner.legWins[winner.legWins.length - 1] >= legsToWinSet) {
      winner.setWins += 1
      if (winner.setWins >= setsToWinMatch) {
        return { winnerId, a, b }
      }
      winner.legWins.push(0)
      loser.legWins.push(0)
    }
  }
  return { winnerId: undefined, a, b }
}

// ---------------------------------------------------------------------------
// Elimination bracket
// ---------------------------------------------------------------------------

export const eliminationRounds = (numberOfPlayers: number) =>
  Math.ceil(Math.log2(Math.max(2, numberOfPlayers)))

export const bracketSize = (numberOfPlayers: number) =>
  2 ** eliminationRounds(numberOfPlayers)

// Standard seeding positions for a bracket of `size` (a power of two).
// size 8 -> [1, 8, 4, 5, 2, 7, 3, 6]: adjacent entries meet in round 1, and
// seeds 1 and 2 can only meet in the final.
export const standardSeedOrder = (size: number): number[] => {
  let seeds = [1]
  while (seeds.length < size) {
    const total = seeds.length * 2 + 1
    seeds = seeds.flatMap((seed) => [seed, total - seed])
  }
  return seeds
}

// Round 1 line-up for 'elimination'. Adjacent entries meet, `undefined` is an
// empty slot, so a player next to it has a bye.
export const legacySlots = (ids: string[]): (string | undefined)[] => {
  const size = bracketSize(ids.length)
  const playing = Math.max(0, 2 * ids.length - size)
  const slots: (string | undefined)[] = ids.slice(0, playing)
  for (const id of ids.slice(playing)) {
    slots.push(id, undefined)
  }
  return slots
}

// Round 1 line-up for 'elimination-seeded'. `ids` must be in seed order.
// Seeds that do not exist become empty slots, so the top seeds get the byes.
export const seededSlots = (ids: string[]): (string | undefined)[] =>
  standardSeedOrder(bracketSize(ids.length)).map((seed) => ids[seed - 1])

export const eliminationSlots = (
  ids: string[],
  type: string
): (string | undefined)[] =>
  type == 'elimination-seeded' ? seededSlots(ids) : legacySlots(ids)

export const firstRoundPairings = (
  ids: string[],
  type: string
): [string | undefined, string | undefined][] => {
  const slots = eliminationSlots(ids, type)
  const pairs: [string | undefined, string | undefined][] = []
  for (let i = 0; i < slots.length; i += 2) {
    pairs.push([slots[i], slots[i + 1]])
  }
  return pairs
}

export type BracketPlayer = {
  id: string
  legWins: number[]
  setWins: number
  wonMatch: boolean | undefined
}

export type EliminationState = {
  // One column per round, plus a last column holding the champion. Adjacent
  // entries (0 and 1, 2 and 3, ...) feed one entry in the next column.
  grid: (BracketPlayer | undefined)[][]
  // Matches where both players are known but no winner has been decided yet.
  matches: [BracketPlayer, BracketPlayer][]
}

const freshPlayer = (id: string): BracketPlayer => ({
  id,
  legWins: [0],
  setWins: 0,
  wonMatch: undefined,
})

export const getEliminationState = (
  ids: string[],
  type: TournamentType,
  games: TournamentGame[],
  legsPerSetArray: number[] | null | undefined,
  setsPerMatchArray: number[] | null | undefined
): EliminationState => {
  const rounds = eliminationRounds(ids.length)
  let column = eliminationSlots(ids, type).map((id) =>
    id === undefined ? undefined : freshPlayer(id)
  )
  const grid: EliminationState['grid'] = []
  const matches: EliminationState['matches'] = []

  for (let round = 0; round < rounds; round++) {
    grid.push(column)
    const next: (BracketPlayer | undefined)[] = []

    for (let i = 0; i < column.length; i += 2) {
      const a = column[i]
      const b = column[i + 1]

      if (a && b) {
        const result = computeMatch(
          a.id,
          b.id,
          games,
          legsPerSetArray?.at(round) ?? 1,
          setsPerMatchArray?.at(round) ?? 1
        )
        a.legWins = result.a.legWins
        a.setWins = result.a.setWins
        b.legWins = result.b.legWins
        b.setWins = result.b.setWins
        a.wonMatch =
          result.winnerId === undefined ? undefined : result.winnerId == a.id
        b.wonMatch =
          result.winnerId === undefined ? undefined : result.winnerId == b.id

        if (result.winnerId) {
          next.push(freshPlayer(result.winnerId))
        } else {
          next.push(undefined)
          matches.push([a, b])
        }
      } else if (round == 0 && (a || b)) {
        // Bye: only empty slots in round 1 mean a free pass. Later on an
        // empty entry just means that the other match is not decided yet.
        next.push(freshPlayer((a ?? b)!.id))
      } else {
        next.push(undefined)
      }
    }
    column = next
  }
  grid.push(column)

  return { grid, matches }
}

// ---------------------------------------------------------------------------
// Round robin
// ---------------------------------------------------------------------------

export const POINTS_PER_WIN = 2

// Circle method. Returns one list of fixtures per round. With an odd number of
// players one player sits out each round.
export const roundRobinRounds = (ids: string[]): [string, string][][] => {
  const list: (string | null)[] = [...ids]
  if (list.length % 2 == 1) list.push(null)
  const n = list.length
  const rounds: [string, string][][] = []

  for (let r = 0; r < n - 1; r++) {
    const fixtures: [string, string][] = []
    for (let i = 0; i < n / 2; i++) {
      const a = list[i]
      const b = list[n - 1 - i]
      if (a !== null && b !== null) fixtures.push([a, b])
    }
    rounds.push(fixtures)
    // Keep the first player fixed and rotate the others one step.
    list.splice(1, 0, list.pop() as string | null)
  }
  return rounds
}

export type Fixture = {
  round: number
  aId: string
  bId: string
  result: MatchResult
}

export type StandingRow = {
  id: string
  played: number
  won: number
  lost: number
  legsFor: number
  legsAgainst: number
  points: number
}

export type RoundRobinState = {
  rounds: Fixture[][]
  standings: StandingRow[]
  finished: boolean
}

const sum = (values: number[]) => values.reduce((total, v) => total + v, 0)

// Standings are sorted by points, then leg difference, then legs won, then
// head to head.
export const getRoundRobinState = (
  ids: string[],
  games: TournamentGame[],
  legsPerSetArray: number[] | null | undefined,
  setsPerMatchArray: number[] | null | undefined
): RoundRobinState => {
  const legsToWinSet = legsPerSetArray?.at(0) ?? 1
  const setsToWinMatch = setsPerMatchArray?.at(0) ?? 1

  const rows = new Map<string, StandingRow>(
    ids.map((id) => [
      id,
      { id, played: 0, won: 0, lost: 0, legsFor: 0, legsAgainst: 0, points: 0 },
    ])
  )
  const beat = new Map<string, Set<string>>()

  const rounds: Fixture[][] = roundRobinRounds(ids).map((pairs, round) =>
    pairs.map(([aId, bId]) => {
      const result = computeMatch(aId, bId, games, legsToWinSet, setsToWinMatch)
      const rowA = rows.get(aId)
      const rowB = rows.get(bId)

      // Only finished matches count towards the standings.
      if (rowA && rowB && result.winnerId) {
        const legsA = sum(result.a.legWins)
        const legsB = sum(result.b.legWins)
        rowA.played += 1
        rowB.played += 1
        rowA.legsFor += legsA
        rowA.legsAgainst += legsB
        rowB.legsFor += legsB
        rowB.legsAgainst += legsA

        const [winnerRow, loserRow] =
          result.winnerId == aId ? [rowA, rowB] : [rowB, rowA]
        winnerRow.won += 1
        winnerRow.points += POINTS_PER_WIN
        loserRow.lost += 1
        beat.set(
          winnerRow.id,
          (beat.get(winnerRow.id) ?? new Set()).add(loserRow.id)
        )
      }
      return { round, aId, bId, result }
    })
  )

  const standings = [...rows.values()].sort(
    (x, y) =>
      y.points - x.points ||
      y.legsFor - y.legsAgainst - (x.legsFor - x.legsAgainst) ||
      y.legsFor - x.legsFor ||
      (beat.get(x.id)?.has(y.id) ? -1 : beat.get(y.id)?.has(x.id) ? 1 : 0)
  )

  const finished = rounds.every((fixtures) =>
    fixtures.every((fixture) => fixture.result.winnerId !== undefined)
  )

  return { rounds, standings, finished }
}

export type GroupedRoundRobinState = {
  groups: RoundRobinState[]
  // True when every match in every group has been decided.
  finished: boolean
}

// `ids` is the stored player list. It is cut into consecutive blocks, one per
// group, and each block is played as its own round robin.
export const getGroupedRoundRobinState = (
  ids: string[],
  groupCount: number,
  games: TournamentGame[],
  legsPerSetArray: number[] | null | undefined,
  setsPerMatchArray: number[] | null | undefined
): GroupedRoundRobinState => {
  const groups = splitIntoGroups(ids, groupCount).map((members) =>
    getRoundRobinState(members, games, legsPerSetArray, setsPerMatchArray)
  )
  return { groups, finished: groups.every((group) => group.finished) }
}
