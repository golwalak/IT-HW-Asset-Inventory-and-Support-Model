// In-memory asset store (loaded from uploaded CSV or seeded with mock data)
const Asset = require('../models/Asset');

// --- Mock / seed data (5 representative rows) ---
const MOCK_ASSETS = [
  new Asset({
    'Asset Name': 'ALHA-SRV-001', 'Asset Number': 'AST-1001', 'Serial Number': 'SN001',
    'Tag': 'TAG001', 'Material Name': 'Server', 'Type': 'Server', 'Manufacturer': 'Cisco',
    'Model': 'UCS C240 M5', 'Material Subtype Name': 'Rack Server',
    'Material Category Name': 'Compute', 'ETS Std HW Category': 'Server',
    'Record Status': 'Active', 'Location': 'Alhambra', 'Operational Date': '2019-06-01',
    'Warranty End Date': '2024-06-01', 'Support Group Name': 'ETS-Compute',
    'age (mo)': '60', 'application (mock)': 'ERP', 'Owner (mock)': 'Finance',
    'status (prod or nonprod) (mock)': 'prod',
    '7x24 OEM $ / 365 days (mock)': '12000',
    '7x24 Tier1 (yes/no?)': 'yes', 'cost avoidance ($) if not Tier 1': '0',
  }),
  new Asset({
    'Asset Name': 'ALHA-SW-002', 'Asset Number': 'AST-1002', 'Serial Number': 'SN002',
    'Tag': 'TAG002', 'Material Name': 'Switch', 'Type': 'Network', 'Manufacturer': 'Cisco',
    'Model': 'Nexus 9300', 'Material Subtype Name': 'Core Switch',
    'Material Category Name': 'Network', 'ETS Std HW Category': 'Switch',
    'Record Status': 'Active', 'Location': 'Alhambra', 'Operational Date': '2020-03-15',
    'Warranty End Date': '2025-03-15', 'Support Group Name': 'ETS-Network',
    'age (mo)': '48', 'application (mock)': 'Network Infrastructure', 'Owner (mock)': 'IT Ops',
    'status (prod or nonprod) (mock)': 'prod',
    '7x24 OEM $ / 365 days (mock)': '8500',
    'NBD Tier 2, 7% save (yes / no)': 'yes', 'cost avoidance ($) if not Tier 1': '595',
  }),
  new Asset({
    'Asset Name': 'IRV-STG-003', 'Asset Number': 'AST-1003', 'Serial Number': 'SN003',
    'Tag': 'TAG003', 'Material Name': 'Storage Array', 'Type': 'Storage',
    'Manufacturer': 'Nutanix', 'Model': 'NX-3155G-G8', 'Material Subtype Name': 'HCI',
    'Material Category Name': 'Storage', 'ETS Std HW Category': 'Storage',
    'Record Status': 'Active', 'Location': 'Irvine', 'Operational Date': '2018-09-01',
    'Warranty End Date': '2023-09-01', 'Support Group Name': 'ETS-Storage',
    'age (mo)': '78', 'application (mock)': 'Virtual Infrastructure', 'Owner (mock)': 'IT Ops',
    'status (prod or nonprod) (mock)': 'prod',
    '7x24 OEM $ / 365 days (mock)': '22000',
    'None Tier 3, 100% save (yes/on)': 'yes', 'cost avoidance ($) if not Tier 1': '22000',
  }),
  new Asset({
    'Asset Name': 'ALHA-FW-004', 'Asset Number': 'AST-1004', 'Serial Number': 'SN004',
    'Tag': 'TAG004', 'Material Name': 'Firewall', 'Type': 'Security', 'Manufacturer': 'Palo Alto',
    'Model': 'PA-5250', 'Material Subtype Name': 'NGFW',
    'Material Category Name': 'Security', 'ETS Std HW Category': 'Firewall',
    'Record Status': 'Active', 'Location': 'Alhambra', 'Operational Date': '2021-01-10',
    'Warranty End Date': '2026-01-10', 'Support Group Name': 'ETS-Security',
    'age (mo)': '38', 'application (mock)': 'Security', 'Owner (mock)': 'Security Team',
    'status (prod or nonprod) (mock)': 'prod',
    '7x24 OEM $ / 365 days (mock)': '15000',
    '7x24 3rd Party Tier 4, 80% save (yes/no)': 'yes',
    'cost avoidance ($) if not Tier 1': '12000',
  }),
  new Asset({
    'Asset Name': 'IRV-SRV-005', 'Asset Number': 'AST-1005', 'Serial Number': 'SN005',
    'Tag': 'TAG005', 'Material Name': 'Server', 'Type': 'Server', 'Manufacturer': 'IBM',
    'Model': 'Power9', 'Material Subtype Name': 'Rack Server',
    'Material Category Name': 'Compute', 'ETS Std HW Category': 'Server',
    'Record Status': 'Active', 'Location': 'Irvine', 'Operational Date': '2017-11-20',
    'Warranty End Date': '2022-11-20', 'Support Group Name': 'ETS-Compute',
    'age (mo)': '88', 'application (mock)': 'ERP', 'Owner (mock)': 'Finance',
    'status (prod or nonprod) (mock)': 'nonprod',
    '7x24 OEM $ / 365 days (mock)': '18000',
    'NBD Tier 2, 7% save (yes / no)': 'yes', 'cost avoidance ($) if not Tier 1': '1260',
  }),
];

// In-memory store — replaced when a CSV is uploaded
let assetStore = [...MOCK_ASSETS];

/**
 * Return all assets, with optional filtering.
 * @param {{owner?:string, application?:string, status?:string}} filters
 * @returns {Asset[]}
 */
function getAll(filters = {}) {
  let results = assetStore;
  if (filters.owner) {
    results = results.filter(
      (a) => a.owner.toLowerCase() === filters.owner.toLowerCase()
    );
  }
  if (filters.application) {
    results = results.filter(
      (a) => a.application.toLowerCase() === filters.application.toLowerCase()
    );
  }
  if (filters.status) {
    results = results.filter(
      (a) => a.status.toLowerCase() === filters.status.toLowerCase()
    );
  }
  return results;
}

/**
 * Return a single asset by assetNumber.
 * @param {string} id
 * @returns {Asset|undefined}
 */
function getById(id) {
  return assetStore.find((a) => a.assetNumber === id);
}

/**
 * Replace the in-memory store with a new list of assets.
 * @param {Asset[]} assets
 */
function replaceAll(assets) {
  assetStore = assets;
}

module.exports = { getAll, getById, replaceAll };
