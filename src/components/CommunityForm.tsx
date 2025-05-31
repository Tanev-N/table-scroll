import { useForm, Controller } from 'react-hook-form';
import { TextField, Button, Box, MenuItem, CircularProgress, Typography } from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import type { Community, Field } from '../types';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

interface CommunityFormProps {
  fields: Field[];
  onClose: () => void;
  initialData?: Partial<Community>;
  mode: 'create' | 'edit';
}

type FormData = {
  [key: string]: string | number;
};

export const CommunityForm = ({ fields, onClose, initialData, mode }: CommunityFormProps) => {
  const queryClient = useQueryClient();

  const schema = z.object(
    fields.reduce((acc, field) => {
      let fieldSchema: z.ZodType<any>;
      
      switch (field.type) {
        case 'string':
          fieldSchema = z.string();
          break;
        case 'number':
          fieldSchema = z.string().transform((val) => {
            const num = Number(val);
            if (isNaN(num)) {
              throw new Error('Должно быть числом');
            }
            return num;
          });
          break;
        case 'enum':
          fieldSchema = z.enum(field.enum as [string, ...string[]]);
          break;
        case 'date':
          fieldSchema = z.string();
          break;
        default:
          fieldSchema = z.string();
      }

      if (field.required) {
        fieldSchema = fieldSchema.refine((val) => val !== undefined && val !== '', {
          message: 'Это поле обязательно'
        });
      } else {
        fieldSchema = fieldSchema.optional();
      }

      return { ...acc, [field.name]: fieldSchema };
    }, {} as Record<string, z.ZodType<any>>)
  );

  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: initialData ? Object.entries(initialData).reduce((acc, [key, value]) => {
      const field = fields.find(f => f.name === key);
      if (field?.type === 'number') {
        acc[key] = String(value);
      } else {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, any>) : undefined
  });

  const createMutation = useMutation({
    mutationFn: (data: Omit<Community, 'id'>) => api.createCommunity(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communities'] });
      reset();
      onClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: Community) => api.updateCommunity(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communities'] });
      reset();
      onClose();
    },
  });

  const formatDate = (date: Date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${day}.${month}.${year} ${hours}:${minutes}`;
  };

  const onSubmit = (data: FormData) => {
    const now = new Date();
    const processedData = Object.entries(data).reduce((acc, [key, value]) => {
      const field = fields.find(f => f.name === key);
      if (field?.type === 'number') {
        acc[key] = Number(value);
      } else {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, any>);

    if (mode === 'create') {
      createMutation.mutate({
        ...processedData,
        createdAt: formatDate(now),
        updatedAt: formatDate(now)
      } as Omit<Community, 'id'>);
    } else {
      updateMutation.mutate({
        ...processedData,
        id: initialData?.id,
        updatedAt: formatDate(now)
      } as Community);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 2 }}>
      {fields
        .filter(field => field.name !== 'createdAt' && field.name !== 'updatedAt')
        .map((field) => (
          <Controller
            key={field.name}
            name={field.name}
            control={control}
            render={({ field: { onChange, value } }) => (
              <TextField
                fullWidth
                margin="normal"
                label={field.label}
                value={value || ''}
                onChange={onChange}
                error={!!errors[field.name]}
                helperText={errors[field.name]?.message as string}
                select={field.type === 'enum'}
                type={field.type === 'number' ? 'number' : 'text'}
                required={field.required}
              >
                {field.type === 'enum' && field.enum?.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
        ))}
      <Box sx={{ mt: 2, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button
          variant="outlined"
          onClick={onClose}
          disabled={isSubmitting || createMutation.isPending || updateMutation.isPending}
          sx={{ minWidth: 100 }}
        >
          Отмена
        </Button>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={isSubmitting || createMutation.isPending || updateMutation.isPending}
          sx={{ minWidth: 120 }}
        >
          {isSubmitting || createMutation.isPending || updateMutation.isPending ? (
            'Отправка...'
          ) : (
            mode === 'create' ? 'Создать' : 'Сохранить'
          )}
        </Button>
      </Box>
    </Box>
  );
}; 