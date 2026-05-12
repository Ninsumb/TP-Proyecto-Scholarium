/* import { api } from "./api"
import { saveToken } from "./authStorage"


//TODO: VER QUE VAMOS A HACER CON ESTOS ARCHIVOS


type LoginRequest = {
    email: string,
    password: string
}

type LoginResponse = {
    token: string,
    email: string,
    nombre: string
}

type RegisterRequest = {
    nombre: string,
    email: string,
    password: string
}

type RegisterResponse = {
    id: number,
    email: string,
    nombre: string
}

export const login = async (payload:LoginRequest):Promise<LoginResponse> =>{
    const response = await api.post<LoginResponse>("/api/auth/login",payload)

    saveToken(response.data.token)
    
    return response.data
}

export const register = async (payload:RegisterRequest):Promise<RegisterResponse>=>{
    const response = await api.post<RegisterResponse>("/api/auth/register",payload)
    return response.data
} */