import React from 'react';
import { Card, CardContent, Typography, Avatar, Chip, Button, Box } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

interface PendingCardProps {
  id: string | number;
  title: string;
  avatarContent?: React.ReactNode;
  status?: string;
  onApprove: (id: string | number) => void;
  onReject: (id: string | number) => void;
  isLoading?: boolean;
  children?: React.ReactNode;
}

export default function PendingCard(props: PendingCardProps) {
  const {
    id,
    title,
    avatarContent,
    status = 'Pending',
    onApprove,
    onReject,
    isLoading = false,
    children
  } = props;

  return (
    <Card sx={{ mb: 2, borderRadius: 2, boxShadow: 2 }}>
      <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
            {avatarContent}
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>
              {title}
            </Typography>
            {children}
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Chip
            label={status}
            color="warning"
            variant="outlined"
            sx={{ fontWeight: 'medium' }}
          />
          <Button
            variant="contained"
            color="success"
            startIcon={<CheckIcon />}
            onClick={() => onApprove(id)}
            disabled={isLoading}
            sx={{ minWidth: 100 }}
          >
            Approve
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<CloseIcon />}
            onClick={() => onReject(id)}
            disabled={isLoading}
            sx={{ minWidth: 100 }}
          >
            Reject
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};