import './App.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Container, Typography, Box, Button } from '@mui/material'
import { Table } from '@/components/Table'
import { CommunityModal } from './components/CommunityModal'
import { useEffect, useState } from 'react'
import { api } from './api/client'
import type { Field, Community } from './types'

const queryClient = new QueryClient()

function App() {
  const [fields, setFields] = useState<Field[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null)

  useEffect(() => {
    const loadSchema = async () => {
      try {
        setIsLoading(true)
        const data = await api.getSchema()
        setFields(data.communities)
        setError(null)
      } catch (err) {
        setError('Ошибка при загрузке схемы')
        console.error('Error loading schema:', err)
      } finally {
        setIsLoading(false)
      }
    }
    loadSchema()
  }, [])

  const handleOpenModal = (community?: Community) => {
    setSelectedCommunity(community || null)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedCommunity(null)
  }

  if (isLoading) {
    return <div>Загрузка схемы...</div>
  }

  if (error) {
    return <div>{error}</div>
  }

  if (fields.length === 0) {
    return <div>Нет доступных полей</div>
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h4" component="h1">
              Управление сообществами
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleOpenModal()}
            >
              Создать сообщество
            </Button>
          </Box>
          <Table 
            fields={fields} 
            onEdit={handleOpenModal}
          />
          <CommunityModal
            open={isModalOpen}
            onClose={handleCloseModal}
            fields={fields}
            initialData={selectedCommunity || undefined}
            mode={selectedCommunity ? 'edit' : 'create'}
          />
        </Box>
      </Container>
    </QueryClientProvider>
  )
}

export default App
