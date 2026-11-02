import { createContext, useContext } from 'react'

export const COMPARE_MAX = 3
export const COMPARE_STORAGE_KEY = 'autoev-compare'
export const CompareContext = createContext(null)

export const useCompare = () => useContext(CompareContext)
