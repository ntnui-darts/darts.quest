import {
  computeMatch,
  getEliminationState,
  getGroupedRoundRobinState,
  getRoundRobinState,
  groupSizes,
  maxGroupCount,
  parseGroupCount,
  snakeOrder,
  splitIntoGroups,
  legacySlots,
  parseTournamentType,
  roundRobinRounds,
  seededSlots,
  standardSeedOrder,
  tournamentTypeFor,
  TournamentGame,
} from '@/functions/tournament'
import { expect, test } from 'vitest'

let clock = 0
// One game is one leg. Games get increasing timestamps.
const leg = (winner: string, loser: string): TournamentGame => ({
  result: [winner, loser],
  players: [winner, loser],
  createdAt: new Date(Date.UTC(2026, 0, 1, 12, clock++)).toISOString(),
})

test('tournament type parsing and mapping', () => {
  expect(parseTournamentType('elimination')).toBe('elimination')
  expect(parseTournamentType('elimination-seeded')).toBe('elimination-seeded')
  expect(parseTournamentType('round-robin')).toBe('round-robin')
  expect(parseTournamentType('something else')).toBe('elimination')
  expect(parseTournamentType(undefined)).toBe('elimination')

  expect(tournamentTypeFor('elimination', 'random')).toBe('elimination')
  expect(tournamentTypeFor('elimination', 'manual')).toBe('elimination')
  expect(tournamentTypeFor('elimination', 'seeded')).toBe('elimination-seeded')
  expect(tournamentTypeFor('round-robin', 'seeded')).toBe('round-robin')
})

test('standard seed order', () => {
  expect(standardSeedOrder(1)).toEqual([1])
  expect(standardSeedOrder(2)).toEqual([1, 2])
  expect(standardSeedOrder(4)).toEqual([1, 4, 2, 3])
  expect(standardSeedOrder(8)).toEqual([1, 8, 4, 5, 2, 7, 3, 6])
  expect(standardSeedOrder(16).slice(0, 4)).toEqual([1, 16, 8, 9])
})

test('seeded slots give byes to the top seeds', () => {
  expect(seededSlots(['a', 'b', 'c', 'd'])).toEqual(['a', 'd', 'b', 'c'])
  expect(seededSlots(['a', 'b', 'c'])).toEqual(['a', undefined, 'b', 'c'])
  expect(seededSlots(['a', 'b', 'c', 'd', 'e'])).toEqual([
    'a',
    undefined,
    'd',
    'e',
    'b',
    undefined,
    'c',
    undefined,
  ])
})

test('legacy slots give byes to the bottom of the list', () => {
  expect(legacySlots(['a', 'b'])).toEqual(['a', 'b'])
  expect(legacySlots(['a', 'b', 'c', 'd'])).toEqual(['a', 'b', 'c', 'd'])
  expect(legacySlots(['a', 'b', 'c'])).toEqual(['a', 'b', 'c', undefined])
  expect(legacySlots(['a', 'b', 'c', 'd', 'e'])).toEqual([
    'a',
    'b',
    'c',
    undefined,
    'd',
    undefined,
    'e',
    undefined,
  ])
  expect(legacySlots(['a', 'b', 'c', 'd', 'e', 'f'])).toEqual([
    'a',
    'b',
    'c',
    'd',
    'e',
    undefined,
    'f',
    undefined,
  ])
})

test('compute match: first to 2 legs, one set', () => {
  const games = [leg('a', 'b'), leg('b', 'a'), leg('a', 'b')]
  const result = computeMatch('a', 'b', games, 2, 1)
  expect(result.winnerId).toBe('a')
  expect(result.a.legWins).toEqual([2])
  expect(result.b.legWins).toEqual([1])
  expect(result.a.setWins).toBe(1)
})

test('compute match: still open, other games ignored', () => {
  const games = [leg('a', 'b'), leg('a', 'c'), leg('c', 'b')]
  const result = computeMatch('a', 'b', games, 2, 1)
  expect(result.winnerId).toBeUndefined()
  expect(result.a.legWins).toEqual([1])
  expect(result.b.legWins).toEqual([0])
})

test('compute match: first to 2 sets of 1 leg', () => {
  const games = [leg('a', 'b'), leg('b', 'a'), leg('a', 'b')]
  const result = computeMatch('a', 'b', games, 1, 2)
  expect(result.winnerId).toBe('a')
  expect(result.a.setWins).toBe(2)
  expect(result.b.setWins).toBe(1)
  expect(result.a.legWins).toEqual([1, 0, 1])
  expect(result.b.legWins).toEqual([0, 1, 0])
})

test('compute match: games are applied in the order they were created', () => {
  const first = leg('a', 'b')
  const second = leg('b', 'a')
  const third = leg('b', 'a')
  // Passed in the wrong order on purpose.
  const result = computeMatch('a', 'b', [third, first, second], 2, 1)
  expect(result.winnerId).toBe('b')
  expect(result.a.legWins).toEqual([1])
  expect(result.b.legWins).toEqual([2])
})

test('round robin rounds: every pair plays exactly once', () => {
  for (const n of [2, 3, 4, 5, 6, 7, 8]) {
    const ids = Array.from({ length: n }, (_, i) => `p${i}`)
    const rounds = roundRobinRounds(ids)
    expect(rounds).toHaveLength(n % 2 == 0 ? n - 1 : n)

    const seen = new Set<string>()
    for (const fixtures of rounds) {
      const busy = new Set<string>()
      for (const [a, b] of fixtures) {
        expect(a == b).toBe(false)
        // Nobody plays twice in the same round.
        expect(busy.has(a) || busy.has(b)).toBe(false)
        busy.add(a)
        busy.add(b)
        seen.add([a, b].toSorted().join('-'))
      }
    }
    expect(seen.size).toBe((n * (n - 1)) / 2)
  }
})

test('elimination: four players', () => {
  const ids = ['a', 'b', 'c', 'd']
  const state = getEliminationState(ids, 'elimination', [], [1, 1], [1, 1])
  expect(state.grid.map((c) => c.length)).toEqual([4, 2, 1])
  expect(state.matches.map((m) => m.map((p) => p.id))).toEqual([
    ['a', 'b'],
    ['c', 'd'],
  ])

  const after = getEliminationState(
    ids,
    'elimination',
    [leg('a', 'b')],
    [1, 1],
    [1, 1]
  )
  expect(after.grid[0][0]?.wonMatch).toBe(true)
  expect(after.grid[0][1]?.wonMatch).toBe(false)
  expect(after.grid[1][0]?.id).toBe('a')
  expect(after.grid[1][1]).toBeUndefined()
  expect(after.matches.map((m) => m.map((p) => p.id))).toEqual([['c', 'd']])
})

test('elimination: champion ends up in the last column', () => {
  const state = getEliminationState(
    ['a', 'b'],
    'elimination',
    [leg('a', 'b')],
    [1],
    [1]
  )
  expect(state.grid.map((c) => c.length)).toEqual([2, 1])
  expect(state.grid.at(-1)?.at(0)?.id).toBe('a')
  expect(state.matches).toEqual([])
})

test('elimination: bye at the bottom of the list', () => {
  const ids = ['a', 'b', 'c']
  const state = getEliminationState(ids, 'elimination', [], [1, 1], [1, 1])
  expect(state.grid.map((c) => c.length)).toEqual([4, 2, 1])
  expect(state.matches.map((m) => m.map((p) => p.id))).toEqual([['a', 'b']])

  const after = getEliminationState(
    ids,
    'elimination',
    [leg('b', 'a')],
    [1, 1],
    [1, 1]
  )
  expect(after.grid[1].map((p) => p?.id)).toEqual(['b', 'c'])
  expect(after.matches.map((m) => m.map((p) => p.id))).toEqual([['b', 'c']])
})

test('elimination: seeded, top seed gets the bye', () => {
  const ids = ['a', 'b', 'c']
  const state = getEliminationState(
    ids,
    'elimination-seeded',
    [],
    [1, 1],
    [1, 1]
  )
  expect(state.matches.map((m) => m.map((p) => p.id))).toEqual([['b', 'c']])
  expect(state.grid[1].map((p) => p?.id)).toEqual(['a', undefined])

  const after = getEliminationState(
    ids,
    'elimination-seeded',
    [leg('c', 'b')],
    [1, 1],
    [1, 1]
  )
  expect(after.grid[1].map((p) => p?.id)).toEqual(['a', 'c'])
  expect(after.matches.map((m) => m.map((p) => p.id))).toEqual([['a', 'c']])
})

test('elimination: seeds 1 and 2 only meet in the final', () => {
  const ids = ['s1', 's2', 's3', 's4', 's5', 's6', 's7', 's8']
  const state = getEliminationState(ids, 'elimination-seeded', [], [1], [1])
  expect(state.matches.map((m) => m.map((p) => p.id))).toEqual([
    ['s1', 's8'],
    ['s4', 's5'],
    ['s2', 's7'],
    ['s3', 's6'],
  ])
})

test('round robin: standings and winner', () => {
  const ids = ['a', 'b', 'c']
  const open = getRoundRobinState(ids, [leg('a', 'b')], [1], [1])
  expect(open.finished).toBe(false)
  expect(open.rounds.flat()).toHaveLength(3)
  expect(open.standings[0].id).toBe('a')
  expect(open.standings[0].played).toBe(1)
  expect(open.standings[0].points).toBe(2)

  const done = getRoundRobinState(
    ids,
    [leg('a', 'b'), leg('a', 'c'), leg('b', 'c')],
    [1],
    [1]
  )
  expect(done.finished).toBe(true)
  expect(done.standings.map((r) => r.id)).toEqual(['a', 'b', 'c'])
  expect(done.standings.map((r) => r.won)).toEqual([2, 1, 0])
  expect(done.standings.map((r) => r.lost)).toEqual([0, 1, 2])
  expect(done.standings.map((r) => r.points)).toEqual([4, 2, 0])
})

test('round robin: leg difference breaks ties in points', () => {
  // First to 2 legs. a beats b 2-0, b beats c 2-1, c beats a 2-1, so everyone
  // has one win and the leg difference has to decide.
  const games = [
    leg('a', 'b'),
    leg('a', 'b'),
    leg('b', 'c'),
    leg('c', 'b'),
    leg('b', 'c'),
    leg('c', 'a'),
    leg('a', 'c'),
    leg('c', 'a'),
  ]
  const state = getRoundRobinState(['a', 'b', 'c'], games, [2], [1])
  expect(state.finished).toBe(true)
  // a: legs 2+1 for, 0+2 against = +1. b: 0+2 for, 2+1 against = -1.
  // c: 1+2 for, 2+1 against = 0.
  expect(state.standings.map((r) => r.id)).toEqual(['a', 'c', 'b'])
})

test('parse group count from the stored type', () => {
  expect(parseGroupCount('round-robin')).toBe(1)
  expect(parseGroupCount('round-robin:2')).toBe(2)
  expect(parseGroupCount('round-robin:4')).toBe(4)
  expect(parseGroupCount('round-robin:1')).toBe(1)
  expect(parseGroupCount('round-robin:x')).toBe(1)
  expect(parseGroupCount('elimination')).toBe(1)
  expect(parseGroupCount('elimination:3')).toBe(1)
  expect(parseGroupCount(undefined)).toBe(1)

  expect(parseTournamentType('round-robin:2')).toBe('round-robin')
  expect(tournamentTypeFor('round-robin', 'random', 1)).toBe('round-robin')
  expect(tournamentTypeFor('round-robin', 'random', 3)).toBe('round-robin:3')
  // Groups are ignored for elimination.
  expect(tournamentTypeFor('elimination', 'seeded', 3)).toBe(
    'elimination-seeded'
  )
})

test('how many groups are allowed', () => {
  expect(maxGroupCount(2)).toBe(1)
  expect(maxGroupCount(4)).toBe(1)
  expect(maxGroupCount(5)).toBe(1)
  expect(maxGroupCount(6)).toBe(2)
  expect(maxGroupCount(8)).toBe(2)
  expect(maxGroupCount(9)).toBe(3)
  expect(maxGroupCount(12)).toBe(4)
})

test('group sizes differ by at most one', () => {
  expect(groupSizes(8, 1)).toEqual([8])
  expect(groupSizes(8, 2)).toEqual([4, 4])
  expect(groupSizes(9, 2)).toEqual([5, 4])
  expect(groupSizes(10, 3)).toEqual([4, 3, 3])
  expect(groupSizes(12, 4)).toEqual([3, 3, 3, 3])
})

test('split into groups keeps the order', () => {
  expect(splitIntoGroups(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'], 2)).toEqual([
    ['a', 'b', 'c', 'd'],
    ['e', 'f', 'g', 'h'],
  ])
  expect(splitIntoGroups([1, 2, 3, 4, 5, 6, 7], 2)).toEqual([
    [1, 2, 3, 4],
    [5, 6, 7],
  ])
  expect(splitIntoGroups([1, 2, 3], 1)).toEqual([[1, 2, 3]])
})

test('snake order deals the best players to different groups', () => {
  const ranked = [1, 2, 3, 4, 5, 6, 7, 8]
  expect(splitIntoGroups(snakeOrder(ranked, 2), 2)).toEqual([
    [1, 4, 5, 8],
    [2, 3, 6, 7],
  ])
  expect(
    splitIntoGroups(snakeOrder([1, 2, 3, 4, 5, 6, 7, 8, 9], 3), 3)
  ).toEqual([
    [1, 6, 7],
    [2, 5, 8],
    [3, 4, 9],
  ])
})

test('snake order keeps every player exactly once and the right sizes', () => {
  for (let n = 3; n <= 30; n++) {
    for (let g = 1; g <= maxGroupCount(n); g++) {
      const ranked = Array.from({ length: n }, (_, i) => i + 1)
      const order = snakeOrder(ranked, g)
      expect(order.toSorted((x, y) => x - y)).toEqual(ranked)
      expect(splitIntoGroups(order, g).map((group) => group.length)).toEqual(
        groupSizes(n, g)
      )
    }
  }
})

test('grouped round robin: groups are independent', () => {
  const ids = ['a', 'b', 'c', 'd', 'e', 'f']
  const open = getGroupedRoundRobinState(ids, 2, [], [1], [1])
  expect(open.groups).toHaveLength(2)
  expect(open.finished).toBe(false)
  expect(open.groups[0].rounds.flat()).toHaveLength(3)
  expect(open.groups[1].rounds.flat()).toHaveLength(3)
  // Nobody from group 1 meets anybody from group 2.
  const meets = open.groups[0].rounds
    .flat()
    .flatMap((fixture) => [fixture.aId, fixture.bId])
  expect(meets.toSorted()).toEqual(['a', 'a', 'b', 'b', 'c', 'c'])

  const games = [
    leg('a', 'b'),
    leg('a', 'c'),
    leg('b', 'c'),
    leg('f', 'd'),
    leg('e', 'd'),
  ]
  const part = getGroupedRoundRobinState(ids, 2, games, [1], [1])
  expect(part.groups[0].finished).toBe(true)
  expect(part.groups[0].standings.map((row) => row.id)).toEqual(['a', 'b', 'c'])
  expect(part.groups[1].finished).toBe(false)
  expect(part.finished).toBe(false)

  const done = getGroupedRoundRobinState(
    ids,
    2,
    [...games, leg('e', 'f')],
    [1],
    [1]
  )
  expect(done.finished).toBe(true)
  expect(done.groups[1].standings.map((row) => row.id)).toEqual(['e', 'f', 'd'])
})

test('grouped round robin with one group matches the plain version', () => {
  const ids = ['a', 'b', 'c', 'd']
  const games = [leg('a', 'b'), leg('c', 'd'), leg('a', 'c'), leg('b', 'd')]
  const grouped = getGroupedRoundRobinState(ids, 1, games, [1], [1])
  const plain = getRoundRobinState(ids, games, [1], [1])
  expect(grouped.groups).toEqual([plain])
})
