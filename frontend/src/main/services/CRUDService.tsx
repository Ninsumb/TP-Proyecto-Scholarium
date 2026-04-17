import axios from 'axios'
import type { AxiosInstance } from 'axios'

export interface InterfaceService<T> {
    getAll(): Promise<T[]>;
    getById(id: number | string): Promise<T>;
    create(item: T): Promise<void>;
    update(item: T): Promise<void>;
    deleteItem(id: number | string): Promise<void>;
}

export abstract class CRUDService<T, F = undefined> implements InterfaceService<T> {
    protected api: AxiosInstance
    protected apiRoot = import.meta.env.VITE_API_URL || 'http://localhost:9001/api'
    protected path: string

    constructor(path: string) {
        this.path = path
        this.api = axios.create({
        baseURL: this.apiRoot,
        headers: { 'Content-Type': 'application/json' },
        })
    }

    async getAll(params?: F): Promise<T[]> {
        const response = await this.api.get<T[]>(`/${this.path}`, { params })
        return response.data
    }

    async getById(id: number | string): Promise<T> {
        const response = await this.api.get<T>(`/${this.path}/${id}`)
        return response.data
    }

    async create(item: T): Promise<void> {
        await this.api.post(`/${this.path}`, item)
    }

    async update(item: T): Promise<void> {
        await this.api.patch(`/${this.path}`, item)
    }

    async deleteItem(id: number | string): Promise<void> {
        await this.api.delete(`/${this.path}/${id}`)
    }
}