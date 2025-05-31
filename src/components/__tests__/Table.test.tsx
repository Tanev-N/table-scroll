import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { Table } from '../Table';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { api } from '../../api/client';
import type { Field } from '../../types';

// Мокаем API клиент
jest.mock('../../api/client', () => ({
  api: {
    getCommunities: jest.fn(),
    deleteCommunity: jest.fn()
  }
}));

const mockFields: Field[] = [
  { name: 'name', type: 'string', label: 'Название', required: true },
  { name: 'description', type: 'string', label: 'Описание' },
  { name: 'subs', type: 'number', label: 'Подписчики' },
  { name: 'category', type: 'string', label: 'Категория' },
  { name: 'status', type: 'enum', label: 'Статус', enum: ['active', 'blocked', 'private'] }
];

const mockCommunities = [
  { id: 1, name: 'Test Community', description: 'Test Description', subs: 100, category: 'Test Category' }
];

describe('Table Component', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    (api.getCommunities as jest.Mock).mockResolvedValue({
      data: mockCommunities,
      total: 1,
      nextPage: undefined
    });
    (api.deleteCommunity as jest.Mock).mockResolvedValue({});
  });

  it('renders table with data', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Table fields={mockFields} onEdit={() => {}} />
      </QueryClientProvider>
    );

    // Ждем загрузки данных
    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    expect(screen.getByRole('columnheader', { name: /название/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /описание/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /подписчики/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /категория/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /действия/i })).toBeInTheDocument();
  });

  it('shows loading state', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Table fields={mockFields} onEdit={() => {}} />
      </QueryClientProvider>
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('handles delete functionality', async () => {
    window.confirm = jest.fn(() => true);

    render(
      <QueryClientProvider client={queryClient}>
        <Table fields={mockFields} onEdit={() => {}} />
      </QueryClientProvider>
    );

    // Ждем загрузки данных
    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    const deleteButton = screen.getByTestId('DeleteIcon').closest('button');
    fireEvent.click(deleteButton!);

    await waitFor(() => {
      expect(api.deleteCommunity).toHaveBeenCalledWith(1);
    });
  });
}); 