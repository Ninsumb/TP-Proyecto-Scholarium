import apiClient from './apiClient';

export interface InterfaceService<T> {
  getAll(): Promise<T[]>;
  getById(id: number | string): Promise<T>;
  create(item: T): Promise<void>;
  update(item: T): Promise<void>;
  deleteItem(id: number | string): Promise<void>;
}

export abstract class CRUDService<T, F = undefined> implements InterfaceService<T> {
  protected path: string;

  constructor(path: string) {
    this.path = path;
  }

  async getAll(params?: F): Promise<T[]> {
    const response = await apiClient.get<T[]>(`/${this.path}`, { params });
    return response.data;
  }

  async getById(id: number | string): Promise<T> {
    const response = await apiClient.get<T>(`/${this.path}/${id}`);
    return response.data;
  }

  async create(item: T): Promise<void> {
    await apiClient.post(`/${this.path}`, item);
  }

  async update(item: T): Promise<void> {
    await apiClient.patch(`/${this.path}`, item);
  }

  async deleteItem(id: number | string): Promise<void> {
    await apiClient.delete(`/${this.path}/${id}`);
  }
}