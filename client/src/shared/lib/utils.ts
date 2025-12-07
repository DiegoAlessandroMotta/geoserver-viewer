import clsx, { type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function generateSHA1HexHash(input: string) {
  const textEncoder = new TextEncoder()
  const data = textEncoder.encode(input)
  const hashBuffer = await crypto.subtle.digest('SHA-1', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hexHash = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')

  return hexHash
}

export function randomColorFromString(input: string) {
  const MAX_EFFECTIVE_HASH_LENGTH = 16
  let effectiveInput = input

  if (input.length > MAX_EFFECTIVE_HASH_LENGTH) {
    effectiveInput = input.substring(0, MAX_EFFECTIVE_HASH_LENGTH)
  }

  let hash = 0
  for (let i = 0; i < effectiveInput.length; i++) {
    hash = effectiveInput.charCodeAt(i) + ((hash << 5) - hash)
  }

  const hue = ((hash % 360) + 360) % 360
  const saturation = 70
  const lightness = 50
  return hslToHex(hue, saturation, lightness)
}

export function hslToHex(h: number, s: number, l: number) {
  l /= 100

  const a = (s * Math.min(l, 1 - l)) / 100

  const f = (n: number) => {
    const k = (n + h / 30) % 12
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0')
  }

  return `#${f(0)}${f(8)}${f(4)}`
}
