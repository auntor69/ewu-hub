import { UserProfile } from '../lib/types';

export const mockUsers: UserProfile[] = [
  {
    id: '1',
    name: 'Ahmed Rahman',
    email: 'ahmed.rahman@student.ewu.edu',
    role: 'student',
    studentId: '2021-1-60-001',
    created_at: '2023-09-01T00:00:00Z',
  },
  {
    id: '2', 
    name: 'Fatima Khan',
    email: 'fatima.khan@student.ewu.edu',
    role: 'student',
    studentId: '2021-1-60-002',
    created_at: '2023-09-01T00:00:00Z',
  },
  {
    id: '3',
    name: 'Dr. Mohammad Ali',
    email: 'mohammad.ali@ewu.edu',
    role: 'faculty',
    facultyId: 'F-2020-001',
    created_at: '2020-08-01T00:00:00Z',
  },
  {
    id: '4',
    name: 'Sarah Ahmed',
    email: 'sarah.ahmed@ewu.edu',
    role: 'staff',
    created_at: '2022-01-15T00:00:00Z',
  },
  {
    id: '5',
    name: 'Admin User',
    email: 'admin@ewu.edu', 
    role: 'admin',
    created_at: '2020-01-01T00:00:00Z',
  }
];

export const getCurrentUser = (): UserProfile | null => {
  const stored = localStorage.getItem('currentUser');
  return stored ? JSON.parse(stored) : null;
};

export const setCurrentUser = (user: UserProfile | null) => {
  if (user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
  } else {
    localStorage.removeItem('currentUser');
  }
};