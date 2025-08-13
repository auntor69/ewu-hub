import { EquipmentType, EquipmentUnit } from '../lib/types';

export const mockEquipmentTypes: EquipmentType[] = [
  {
    id: 'eq-type-1',
    name: 'Digital Oscilloscope',
    category: 'Measurement',
    description: 'High-precision digital oscilloscope for circuit analysis',
  },
  {
    id: 'eq-type-2',
    name: 'Function Generator',
    category: 'Signal Generation',
    description: 'Multi-waveform function generator',
  },
  {
    id: 'eq-type-3',
    name: 'Power Supply',
    category: 'Power',
    description: 'Variable DC power supply unit',
  },
  {
    id: 'eq-type-4',
    name: 'Multimeter',
    category: 'Measurement',
    description: 'Digital multimeter for electrical measurements',
  },
  {
    id: 'eq-type-5',
    name: 'Spectrum Analyzer',
    category: 'Analysis',
    description: 'RF spectrum analyzer for frequency domain analysis',
  },
];

export const mockEquipmentUnits: EquipmentUnit[] = [
  // Oscilloscopes
  { id: 'unit-1', equipment_type_id: 'eq-type-1', asset_tag: 'OSC-001', room_id: 'room-3', status: 'available' },
  { id: 'unit-2', equipment_type_id: 'eq-type-1', asset_tag: 'OSC-002', room_id: 'room-3', status: 'available' },
  { id: 'unit-3', equipment_type_id: 'eq-type-1', asset_tag: 'OSC-003', room_id: 'room-3', status: 'in_use' },
  
  // Function Generators
  { id: 'unit-4', equipment_type_id: 'eq-type-2', asset_tag: 'FG-001', room_id: 'room-3', status: 'available' },
  { id: 'unit-5', equipment_type_id: 'eq-type-2', asset_tag: 'FG-002', room_id: 'room-3', status: 'available' },
  
  // Power Supplies
  { id: 'unit-6', equipment_type_id: 'eq-type-3', asset_tag: 'PS-001', room_id: 'room-3', status: 'available' },
  { id: 'unit-7', equipment_type_id: 'eq-type-3', asset_tag: 'PS-002', room_id: 'room-3', status: 'maintenance' },
  
  // Multimeters
  { id: 'unit-8', equipment_type_id: 'eq-type-4', asset_tag: 'MM-001', room_id: 'room-4', status: 'available' },
  { id: 'unit-9', equipment_type_id: 'eq-type-4', asset_tag: 'MM-002', room_id: 'room-4', status: 'available' },
  
  // Spectrum Analyzers
  { id: 'unit-10', equipment_type_id: 'eq-type-5', asset_tag: 'SA-001', room_id: 'room-3', status: 'available' },
];