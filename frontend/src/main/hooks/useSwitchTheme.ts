import { useState } from "react"

// 

export const useSwitchTheme = () => {
    const [darkTheme, setDarkTheme] = useState(false)

    const switchTheme = () => {
        setDarkTheme(!darkTheme)
    }

    return {
        darkTheme,
        switchTheme
    }
}