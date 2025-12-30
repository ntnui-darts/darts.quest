import { Multiplier } from './game'

type TypeAttributeMap = {
  fast: boolean // rtc
  finish: 1 | 2 | 3 // x01
  forced: boolean // rtc
  maxVisits: number // x01 and rtc
  mode: Multiplier // rtc
  random: boolean // rtc
  startScore: number // x01
}
export type TypeAttribute = keyof TypeAttributeMap

export const TypeAttributeDefaults = {
  fast: false,
  finish: 2,
  forced: false,
  maxVisits: 20,
  mode: Multiplier.Single,
  random: false,
  startScore: 501,
} as const satisfies Readonly<TypeAttributeMap>

const parseBoolean = (value: string) =>
  value === 'true' || value === 'false' ? value === 'true' : undefined

const parseNumber = (value: string) =>
  isNaN(+value) ? undefined : parseFloat(value)

const parseFinish = (value: string) => {
  const n = parseNumber(value)
  if (n === 1 || n === 2 || n === 3) return n
  else return undefined
}

const handlers: {
  [K in TypeAttribute]: (value: string) => TypeAttributeMap[K] | undefined
} = {
  fast: parseBoolean,
  forced: parseBoolean,
  finish: parseFinish,
  maxVisits: parseNumber,
  mode: parseNumber,
  random: parseBoolean,
  startScore: parseNumber,
}

export function getTypeAttribute<T extends TypeAttribute>(
  data: { typeAttributes: string[] } | null,
  name: T
): TypeAttributeMap[T] | undefined {
  if (!data || !data.typeAttributes?.length) return undefined

  const attribute = data.typeAttributes
    .filter((t) => t.includes('='))
    .map((t) => {
      const i = t.indexOf('=')
      return { key: t.substring(0, i), value: t.substring(i + 1).trim() }
    })
    .filter(({ key, value }) => key == name && value.length > 0)
    .at(0)

  if (!attribute) return undefined
  return handlers[name](attribute.value)
}

export function getTypeAttributeOrDefault<T extends TypeAttribute>(
  data: { typeAttributes: string[] } | null,
  name: T
): TypeAttributeMap[T] {
  const _default = TypeAttributeDefaults[name]
  if (!data || !data.typeAttributes?.length) return _default
  return getTypeAttribute(data, name) ?? _default
}
