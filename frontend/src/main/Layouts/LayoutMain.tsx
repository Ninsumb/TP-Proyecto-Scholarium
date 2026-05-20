import { Outlet } from "react-router-dom";
import { useMemo } from "react";
import { useToast } from "../hooks/useToast";
import { Toast } from "../Components/common/Toast";
import { MainContext } from "../types/MainContext";
import type { MainContextType } from "../types/MainContext";
import { Header } from "../Components/Header/Header";
import { Footer } from "../Components/Footer/Footer";
import { useSwitchTheme } from "../hooks/useSwitchTheme";

export const LayoutMain = () => {
    const { toast, showToast } = useToast();
    const { darkTheme, switchTheme} = useSwitchTheme();
    
    const contextValue: MainContextType = useMemo(() => ({showToast, switchTheme}), [showToast, switchTheme]);

    return (
        <MainContext.Provider value={contextValue}>
            <div className={`min-h-screen bg-background ${darkTheme ? 'dark' : ''}`}>
                <Header darkTheme={darkTheme} switchTheme={switchTheme}/>
                
                {/* Contenido de las páginas */}
                <Outlet context={{}} />
                
                <div id="toast-container">
                    <Toast toast={toast} />
                </div>
                
                <Footer />
            </div>
        </MainContext.Provider>
    );
};