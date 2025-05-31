import { useEffect, useRef, useCallback } from 'react';
import { Table as MuiTable, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Box, CircularProgress, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import type { Community, Field, ApiResponse } from '../types';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';

interface TableProps {
  fields: Field[];
  onEdit: (community: Community) => void;
}

export const Table = ({ fields, onEdit }: TableProps) => {
  const queryClient = useQueryClient();
  const observer = useRef<IntersectionObserver | null>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery<ApiResponse<Community>>({
    queryKey: ['communities'],
    queryFn: ({ pageParam = 1 }) => api.getCommunities(pageParam as number),
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 1,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.deleteCommunity(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communities'] });
    },
  });

  const handleDelete = (id: number) => {
    if (window.confirm('Вы уверены, что хотите удалить эту запись?')) {
      deleteMutation.mutate(id);
    }
  };

  const lastElementRef = useCallback(
    (node: HTMLTableRowElement | null) => {
      if (isFetchingNextPage) return;
      
      if (observer.current) {
        observer.current.disconnect();
      }
      
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage();
        }
      }, {
        root: null,
        rootMargin: '100px',
        threshold: 0.1
      });
    
      if (node) {
        observer.current.observe(node);
      }
    },
    [hasNextPage, fetchNextPage, isFetchingNextPage]
  );

  useEffect(() => {
    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, []);

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '';
    
    if (dateString.match(/^\d{2}\.\d{2}\.\d{4} \d{2}:\d{2}$/)) {
      return dateString;
    }
    
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (status === 'pending') {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (status === 'error') {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4, color: 'error.main' }}>
        Ошибка при загрузке данных
      </Box>
    );
  }

  const allCommunities = data?.pages.flatMap(page => page.data) || [];

  return (
    <TableContainer component={Paper} sx={{ maxHeight: 'calc(100vh - 200px)', overflow: 'auto' }}>
      <MuiTable stickyHeader>
        <TableHead>
          <TableRow>
            {fields.map((field) => (
              <TableCell key={field.name}>{field.label}</TableCell>
            ))}
            <TableCell>Действия</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {allCommunities.map((community: Community, index: number) => {
            const isLastElement = index === allCommunities.length - 1;
            return (
              <TableRow 
                key={community.id}
                ref={isLastElement ? lastElementRef : null}
                sx={{ height: '50px' }}
              >
                {fields.map((field) => (
                  <TableCell key={field.name}>
                    {field.type === 'date' 
                      ? formatDate(community[field.name as keyof Community] as string)
                      : community[field.name as keyof Community]}
                  </TableCell>
                ))}
                <TableCell>
                  <IconButton 
                    onClick={() => onEdit(community)} 
                    size="small"
                    disabled={deleteMutation.isPending}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton 
                    onClick={() => handleDelete(community.id!)} 
                    size="small"
                    disabled={deleteMutation.isPending}
                  >
                    {deleteMutation.isPending && deleteMutation.variables === community.id ? (
                      <CircularProgress size={20} />
                    ) : (
                      <DeleteIcon data-testid="DeleteIcon" />
                    )}
                  </IconButton>
                </TableCell>
              </TableRow>
            );
          })}
          {isFetchingNextPage && (
            <TableRow>
              <TableCell colSpan={fields.length + 1} align="center" sx={{ py: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                  <CircularProgress size={24} />
                  <Typography variant="body2" color="text.secondary">
                    Загрузка данных...
                  </Typography>
                </Box>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </MuiTable>
    </TableContainer>
  );
}; 