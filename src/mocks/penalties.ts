import { Penalty } from '../lib/types';

export const mockPenalties: Penalty[] = [
  {
    id: 'penalty-1',
    user_id: '1',
    booking_id: 'booking-4',
    amount: 200,
    reason: 'No-show for library seat booking (2 hours)',
    status: 'pending',
    created_at: '2025-01-15T15:30:00Z',
  },
  {
    id: 'penalty-2',
    user_id: '2',
    booking_id: 'booking-old-1',
    amount: 200,
    reason: 'No-show for equipment booking (1 hour)',
    status: 'paid',
    created_at: '2025-01-10T16:00:00Z',
  },
  {
    id: 'penalty-3',
    user_id: '1', 
    booking_id: 'booking-old-2',
    amount: 100,
    reason: 'No-show for library seat booking (1 hour)',
    status: 'waived',
    created_at: '2025-01-08T11:00:00Z',
  },
];

export let mockPenaltiesState = [...mockPenalties];

export const updatePenaltyStatus = (id: string, status: Penalty['status']) => {
  const index = mockPenaltiesState.findIndex(p => p.id === id);
  if (index !== -1) {
    mockPenaltiesState[index] = { ...mockPenaltiesState[index], status };
  }
};
