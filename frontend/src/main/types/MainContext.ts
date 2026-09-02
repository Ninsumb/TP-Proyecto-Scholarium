import { createContext } from 'react'


export type MainContextType = {
    showToast: (message: string, severity: 'success' | 'error' | 'warning' | 'info') => void,
    switchTheme: () => void
}

export const MainContext = createContext<MainContextType>({
    showToast: () => {},
    switchTheme: () => {}
})