import { LibraryTable, LibrarySeat } from '../lib/types';

export const mockLibraryTables: LibraryTable[] = [
  // Main Library 2nd Floor
  ...Array.from({ length: 10 }, (_, i) => ({
    id: `table-lib201-${i + 1}`,
    room_id: 'room-1',
    table_number: i + 1,
    seat_count: 6,
  })),
  // Main Library 3rd Floor
  ...Array.from({ length: 8 }, (_, i) => ({
    id: `table-lib301-${i + 1}`,
    room_id: 'room-2', 
    table_number: i + 1,
    seat_count: 6,
  })),
];

export const mockLibrarySeats: LibrarySeat[] = [];

// Generate seats for each table
mockLibraryTables.forEach(table => {
  for (let i = 1; i <= table.seat_count; i++) {
    mockLibrarySeats.push({
      id: `seat-${table.id}-${i}`,
      table_id: table.id,
      seat_number: i,
      status: Math.random() > 0.7 ? 'occupied' : 'available', // 30% occupied
    });
  }
});