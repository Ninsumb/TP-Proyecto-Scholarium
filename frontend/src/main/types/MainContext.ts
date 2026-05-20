import { createContext } from 'react'
//import type { Usuario } from './Usuario'



export type MainContextType = {
    showToast: (message: string, severity: 'success' | 'error' | 'warning' | 'info') => void,
    switchTheme: () => void
}

export const MainContext = createContext<MainContextType>({
    showToast: () => {},
    switchTheme: () => {}
})