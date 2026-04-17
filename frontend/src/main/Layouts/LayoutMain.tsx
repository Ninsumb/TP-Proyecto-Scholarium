import { Outlet, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import { useToast } from "../hooks/useToast";
import { Toast } from "../Components/common/Toast";
//import { Header } from "../components/Header/Header";
import { MainContext } from "../types/MainContext";
import type { MainContextType } from "../types/MainContext";
//import { loginService } from "../services/AuthService";
//import type { Usuario } from "../../types/Usuario";
//import { routeConfig } from "../config/routeConfig";
import { useCallback } from "react";
import { Header } from "../Components/Header";

export const LayoutMain = () => {
    const { toast, showToast } = useToast()
    //const  [ usuario, setUsuario ] = useState<Usuario | null>(null)
    
    const contextValue: MainContextType = useMemo(() => ({showToast}), [showToast]);

    return (
        <MainContext.Provider value={contextValue}>
           { <Header />}
            <main className="main-content">
                <Outlet context={{}} />
            </main>
            <div id="toast-container">
                <Toast toast={toast} />
            </div>
        </MainContext.Provider>
    )
}