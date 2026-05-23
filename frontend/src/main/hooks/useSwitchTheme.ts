import { useState } from "react"

// 

export const useSwitchTheme = () => {
    const [darkTheme, setDarkTheme] = useState(false)

    const switchTheme = () => {
        setDarkTheme(!darkTheme)
        localStorage.setItem("darkTheme", String(darkTheme ? "true" : "")) //amo los tipos de javascript
    }

    return {
        darkTheme,
        setDarkTheme,
        switchTheme
    }
}