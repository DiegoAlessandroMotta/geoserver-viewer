import { v4 as uuidv4 } from 'uuid'

export const generateUuid = (): string => {
  try {
    if (typeof globalThis?.crypto?.randomUUID === 'function') {
      return globalThis.crypto.randomUUID()
    }
  } catch {
    // ignore and fallback to uuid
  }

  return uuidv4()
}
