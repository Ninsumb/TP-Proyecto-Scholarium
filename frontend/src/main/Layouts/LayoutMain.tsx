import { Outlet } from "react-router-dom";
import { useMemo } from "react";
import { useToast } from "../Hooks/useToast";
import { Toast } from "../Components/common/Toast";
import { MainContext } from "../types/MainContext";
import type { MainContextType } from "../types/MainContext";
import { Header } from "../Components/Header/Header";
import { Footer } from "../Components/Footer/Footer";
import { useSwitchTheme } from "../Hooks/useSwitchTheme";
import { useOnInit } from "../Hooks/useOnInit";

export const LayoutMain = () => {
    const { toast, showToast } = useToast();
    const { darkTheme, setDarkTheme, switchTheme } = useSwitchTheme();
    
    const contextValue: MainContextType = useMemo(
        () => ({ showToast, switchTheme }),
        [showToast, switchTheme]
    );

    useOnInit(() => {
        var storedTheme = Boolean(localStorage.getItem("darkTheme"))
        setDarkTheme(!storedTheme)
    })

    return (
        <MainContext.Provider value={contextValue}>
            <div className={`min-h-screen flex flex-col bg-background ${darkTheme ? 'dark' : ''}`}>
                
                <Header darkTheme={darkTheme} switchTheme={switchTheme} />

                {/* Contenido de las páginas */}
                <main className="flex-1">
                    <Outlet context={{}} />
                </main>

                <div id="toast-container">
                    <Toast toast={toast} />
                </div>

                <Footer />
            </div>
        </MainContext.Provider>
    );
};