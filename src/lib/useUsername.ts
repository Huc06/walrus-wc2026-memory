import {useState} from 'react'

const KEY = 'wc2026_username'

export function useUsername() {
  const [name, setName] = useState(() => localStorage.getItem(KEY) || '')
  const save = (n: string) => { localStorage.setItem(KEY, n); setName(n) }
  return [name, save] as const
}
