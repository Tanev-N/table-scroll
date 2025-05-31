import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CommunityForm } from '../CommunityForm';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { api } from '../../api/client';
import type { Field } from '../../types';

jest.mock('../../api/client', () => ({
  api: {
    createCommunity: jest.fn(),
    updateCommunity: jest.fn()
  }
}));

const mockFields: Field[] = [
  { name: 'name', type: 'string', label: 'Название', required: true },
  { name: 'description', type: 'string', label: 'Описание' },
  { name: 'category', type: 'string', label: 'Категория', required: true },
  { name: 'subs', type: 'number', label: 'Количество подписчиков', required: true },
  { name: 'status', type: 'enum', label: 'Статус', enum: ['active', 'blocked', 'private'] }
];

describe('CommunityForm Component', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    (api.createCommunity as jest.Mock).mockResolvedValue({ id: 1 });
    (api.updateCommunity as jest.Mock).mockResolvedValue({ id: 1 });
  });

  it('renders form fields', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <CommunityForm fields={mockFields} onClose={() => {}} mode="create" />
      </QueryClientProvider>
    );

    expect(screen.getByRole('textbox', { name: /название/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /описание/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /категория/i })).toBeInTheDocument();
    expect(screen.getByRole('spinbutton', { name: /количество подписчиков/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /статус/i })).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <CommunityForm fields={mockFields} onClose={() => {}} mode="create" />
      </QueryClientProvider>
    );

    const submitButton = screen.getByRole('button', { name: /создать/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(api.createCommunity).not.toHaveBeenCalled();
    });

    const nameInput = screen.getByRole('textbox', { name: /название/i });
    const categoryInput = screen.getByRole('textbox', { name: /категория/i });
    const subsInput = screen.getByRole('spinbutton', { name: /количество подписчиков/i });

    expect(nameInput).toHaveAttribute('required');
    expect(categoryInput).toHaveAttribute('required');
    expect(subsInput).toHaveAttribute('required');
  });

  it('submits form with valid data in create mode', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <CommunityForm fields={mockFields} onClose={() => {}} mode="create" />
      </QueryClientProvider>
    );

    fireEvent.change(screen.getByRole('textbox', { name: /название/i }), {
      target: { value: 'Test Community' }
    });
    fireEvent.change(screen.getByRole('textbox', { name: /категория/i }), {
      target: { value: 'Test Category' }
    });
    fireEvent.change(screen.getByRole('spinbutton', { name: /количество подписчиков/i }), {
      target: { value: '100' }
    });

    const submitButton = screen.getByRole('button', { name: /создать/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(api.createCommunity).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Test Community',
        category: 'Test Category',
        subs: 100
      }));
    });
  });

  it('submits form with valid data in edit mode', async () => {
    const initialData = {
      id: 1,
      name: 'Test Community',
      category: 'Test Category',
      subs: 100
    };

    render(
      <QueryClientProvider client={queryClient}>
        <CommunityForm 
          fields={mockFields} 
          onClose={() => {}} 
          mode="edit"
          initialData={initialData}
        />
      </QueryClientProvider>
    );

    const submitButton = screen.getByRole('button', { name: /сохранить/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(api.updateCommunity).toHaveBeenCalledWith(expect.objectContaining({
        id: 1,
        name: 'Test Community',
        category: 'Test Category',
        subs: 100
      }));
    });
  });
}); 