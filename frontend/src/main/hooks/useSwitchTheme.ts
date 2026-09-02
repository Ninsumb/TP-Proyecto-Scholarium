import { useState } from "react"

export const useSwitchTheme = () => {
    const [darkTheme, setDarkTheme] = useState(false)

    const switchTheme = () => {
        setDarkTheme((prev) => {
            const next = !prev
            localStorage.setItem("darkTheme", String(next))
            return next
        })
    }

    return {
        darkTheme,
        setDarkTheme,
        switchTheme
    }
}