import { Modal, Box, Typography } from '@mui/material';
import { CommunityForm } from './CommunityForm';
import type { Community, Field } from '../types';

interface CommunityModalProps {
  open: boolean;
  onClose: () => void;
  fields: Field[];
  initialData?: Partial<Community>;
  mode: 'create' | 'edit';
}

const style = {
  position: 'absolute' as const,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

export const CommunityModal = ({ open, onClose, fields, initialData, mode }: CommunityModalProps) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="community-modal-title"
    >
      <Box sx={style}>
        <Typography id="community-modal-title" variant="h6" component="h2" gutterBottom>
          {mode === 'create' ? 'Создание сообщества' : 'Редактирование сообщества'}
        </Typography>
        <CommunityForm 
          fields={fields} 
          onClose={onClose}
          initialData={initialData}
          mode={mode}
        />
      </Box>
    </Modal>
  );
}; 