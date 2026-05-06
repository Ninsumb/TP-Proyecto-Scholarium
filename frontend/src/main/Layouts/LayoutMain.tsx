import { Outlet } from "react-router-dom";
import { useMemo } from "react";
import { useToast } from "../hooks/useToast";
import { Toast } from "../Components/common/Toast";
import { MainContext } from "../types/MainContext";
import type { MainContextType } from "../types/MainContext";
import { Header } from "../Components/Header/Header";

export const LayoutMain = () => {
    const { toast, showToast } = useToast();
    
    const contextValue: MainContextType = useMemo(() => ({showToast}), [showToast]);

    return (
        <MainContext.Provider value={contextValue}>
            <div className="min-h-screen bg-background">
                <Header />
                
                {/* Contenido de las páginas */}
                <Outlet context={{}} />
                
                <div id="toast-container">
                    <Toast toast={toast} />
                </div>
            </div>
        </MainContext.Provider>
    );
};