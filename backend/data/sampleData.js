const { v4: uuidv4 } = require('uuid');

const sampleAssets = [
  {
    id: uuidv4(),
    assetTag: 'HW-001',
    name: 'Dell Latitude 5520',
    type: 'Laptop',
    owner: 'Alice Johnson',
    application: 'Engineering',
    status: 'Active',
    purchaseDate: '2023-03-15',
    warrantyExpiry: '2026-03-15',
    location: 'Building A, Floor 2',
    notes: 'Assigned for software development'
  },
  {
    id: uuidv4(),
    assetTag: 'HW-002',
    name: 'HP EliteDesk 800 G6',
    type: 'Desktop',
    owner: 'Bob Martinez',
    application: 'Finance',
    status: 'Active',
    purchaseDate: '2022-11-01',
    warrantyExpiry: '2025-11-01',
    location: 'Building B, Floor 1',
    notes: 'Used for financial reporting'
  },
  {
    id: uuidv4(),
    assetTag: 'HW-003',
    name: 'Dell UltraSharp U2722D',
    type: 'Monitor',
    owner: 'Alice Johnson',
    application: 'Engineering',
    status: 'Active',
    purchaseDate: '2023-03-15',
    warrantyExpiry: '2026-03-15',
    location: 'Building A, Floor 2',
    notes: '27-inch 4K monitor'
  },
  {
    id: uuidv4(),
    assetTag: 'HW-004',
    name: 'Dell PowerEdge R740',
    type: 'Server',
    owner: 'Carlos Rivera',
    application: 'IT Operations',
    status: 'Active',
    purchaseDate: '2021-06-20',
    warrantyExpiry: '2026-06-20',
    location: 'Data Center, Rack 12',
    notes: 'Production application server'
  },
  {
    id: uuidv4(),
    assetTag: 'HW-005',
    name: 'Cisco Catalyst 9300',
    type: 'Network Equipment',
    owner: 'Carlos Rivera',
    application: 'IT Operations',
    status: 'Under Repair',
    purchaseDate: '2020-09-10',
    warrantyExpiry: '2025-09-10',
    location: 'Data Center, Rack 3',
    notes: 'Core switch — firmware issue being resolved'
  },
  {
    id: uuidv4(),
    assetTag: 'HW-006',
    name: 'HP LaserJet Pro M404dn',
    type: 'Printer',
    owner: 'Diana Patel',
    application: 'Human Resources',
    status: 'In Storage',
    purchaseDate: '2021-01-05',
    warrantyExpiry: '2024-01-05',
    location: 'Warehouse B, Shelf 4',
    notes: 'Replaced by newer model; kept as backup'
  },
  {
    id: uuidv4(),
    assetTag: 'HW-007',
    name: 'Lenovo ThinkPad X1 Carbon Gen 9',
    type: 'Laptop',
    owner: 'Eve Chang',
    application: 'Marketing',
    status: 'Retired',
    purchaseDate: '2019-07-22',
    warrantyExpiry: '2022-07-22',
    location: 'IT Storage Room',
    notes: 'End of life — data wiped'
  },
  {
    id: uuidv4(),
    assetTag: 'HW-008',
    name: 'APC Smart-UPS 3000VA',
    type: 'Other',
    owner: 'Carlos Rivera',
    application: 'IT Operations',
    status: 'Active',
    purchaseDate: '2022-04-18',
    warrantyExpiry: '2027-04-18',
    location: 'Data Center, Rack 1',
    notes: 'UPS for critical server rack'
  }
];

module.exports = sampleAssets;
