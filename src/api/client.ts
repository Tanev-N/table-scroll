import type { Community, ApiResponse, Schema } from '../types';

const API_URL = 'http://localhost:3000';

export const api = {
  async getCommunities(page: number = 1, limit: number = 10, search?: string): Promise<ApiResponse<Community>> {
    let url = `${API_URL}/communities?_page=${page}&_limit=${limit}`;
    
    if (search) {
      url += `&q=${encodeURIComponent(search)}`;
    }

    const response = await fetch(url);
    const totalCount = response.headers.get('X-Total-Count');
    const data = await response.json();
    
    const hasNextPage = totalCount ? (page * limit) < parseInt(totalCount) : data.length === limit;

    return {
      data,
      page,
      limit,
      nextPage: hasNextPage ? page + 1 : undefined
    } as ApiResponse<Community>;
  },

  async createCommunity(community: Omit<Community, 'id'>): Promise<Community> {
    const response = await fetch(`${API_URL}/communities`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(community),
    });
    
    return response.json();
  },

  async updateCommunity(community: Community): Promise<Community> {
    const response = await fetch(`${API_URL}/communities/${community.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(community),
    });
    
    return response.json();
  },

  async deleteCommunity(id: number): Promise<void> {
    await fetch(`${API_URL}/communities/${id}`, {
      method: 'DELETE',
    });
  },

  async getSchema(): Promise<Schema> {
    const response = await fetch(`${API_URL}/schema`);
    const data = await response.json();
    return data;
  }
}; 