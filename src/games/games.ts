import CricketGameInput from '@/components/CricketGameInput.vue'
import KillerGameInput from '@/components/KillerGameInput.vue'
import NoOptionsInput from '@/components/NoOptionsInput.vue'
import RtcGameInput from '@/components/RtcGameInput.vue'
import RtcOptionsInput from '@/components/RtcOptionsInput.vue'
import X01GameInput from '@/components/X01GameInput.vue'
import X01OptionsInput from '@/components/X01OptionsInput.vue'
import {
  Game,
  GameController,
  GameExtended,
  GameState,
  Leg,
} from '@/types/game'
import {
  getTypeAttribute,
  getTypeAttributeOrDefault,
} from '@/types/typeAttributes'
import { getCricketController } from './cricket'
import { getKillerController } from './killer'
import { getRtcController } from './rtc'
import { getRtcRandomController } from './rtc-random'
import { getSkovhuggerController } from './skovhugger'
import { getX01Controller } from './x01'

export type GameType = 'x01' | 'rtc' | 'killer' | 'skovhugger' | 'cricket'

export const GameTypeNames = {
  x01: 'X01',
  rtc: 'Round the Clock',
  killer: 'Killer',
  skovhugger: 'Skovhugger',
  cricket: 'Cricket',
} as const satisfies Record<GameType, string>

export const getMinPlayerCount = (gameType: GameType): number => {
  switch (gameType) {
    case 'killer':
      return 2
    case 'rtc':
      return 1
    case 'x01':
      return 1
    case 'skovhugger':
      return 1
    case 'cricket':
      return 2
  }
}

export const getGameDisplayName = (game?: Game | Leg | null): string => {
  if (!game) return 'Empty Game'
  switch (game.type) {
    case 'rtc':
      const mode = ['', ' Double', ' Triple'][
        getTypeAttributeOrDefault(game, 'mode') - 1
      ]
      const random = ['', ' Random'][+getTypeAttributeOrDefault(game, 'random')]
      const fast = ['', ' Fast'][+getTypeAttributeOrDefault(game, 'fast')]
      return `Round the Clock${mode}${random}${fast}`

    case 'x01':
      const startScore = getTypeAttributeOrDefault(game, 'startScore')
      const finish = [' Single Finish', ' Double Finish', ' Triple Finish'][
        getTypeAttributeOrDefault(game, 'finish') - 1
      ]
      return `${startScore}${finish}`

    case 'killer':
      return 'Killer'

    case 'skovhugger':
      return 'Skovhugger'

    case 'cricket':
      return 'Cricket'
  }
}

export const getGamePoints = (game: {
  type: GameType
  typeAttributes: string[]
}): number => {
  switch (game.type) {
    case 'rtc':
      return 20

    case 'x01':
      return getTypeAttributeOrDefault(game, 'startScore')

    case 'killer':
      return 5

    case 'skovhugger':
      return 0

    case 'cricket':
      return 0
  }
}

export const getGameController = (
  game: GameExtended
): GameController<GameState> => {
  switch (game.type) {
    case 'x01':
      return getX01Controller(game)

    case 'rtc':
      if (getTypeAttribute(game, 'random')) {
        return getRtcRandomController(game)
      } else {
        return getRtcController(game)
      }

    case 'killer':
      return getKillerController(game)

    case 'skovhugger':
      return getSkovhuggerController(game)

    case 'cricket':
      return getCricketController(game)
  }
}

export const getOptionsComponent = (type: GameType) => {
  switch (type) {
    case 'x01':
      return X01OptionsInput
    case 'rtc':
      return RtcOptionsInput
    case 'cricket':
    case 'skovhugger':
    case 'killer':
      return NoOptionsInput
  }
}

export const getInputComponent = (gameType: GameType) => {
  switch (gameType) {
    case 'skovhugger':
    case 'x01':
      return X01GameInput
    case 'rtc':
      return RtcGameInput
    case 'killer':
      return KillerGameInput
    case 'cricket':
      return CricketGameInput
  }
}
