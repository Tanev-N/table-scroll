export type FieldType = 'string' | 'number' | 'enum' | 'date';

export interface Field {
  name: string;
  type: FieldType;
  label: string;
  required?: boolean;
  enum?: string[];
}

export interface Community {
  id?: number;
  name: string;
  description?: string;
  category: string;
  subs: number;
  status?: 'active' | 'blocked' | 'private';
  type?: 'group' | 'public' | 'event';
  createdAt?: string;
  updatedAt?: string;
}

export interface Schema {
  communities: Field[];
}

export interface ApiResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  nextPage?: number;
} 