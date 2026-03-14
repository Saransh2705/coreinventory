// Mock data for CoreInventory

export const kpiData = {
  totalProducts: 2847,
  lowStockItems: 24,
  outOfStockItems: 7,
  pendingReceipts: 14,
  pendingDeliveries: 9,
  scheduledTransfers: 5,
  totalWarehouses: 6,
  totalLocations: 148,
};

export type ReceiptStatus = "Draft" | "Waiting" | "Ready" | "Done" | "Cancelled";
export type DeliveryStatus = "Draft" | "Waiting" | "Ready" | "Done";
export type TransferStatus = "Scheduled" | "In Transit" | "Done";
export type ProductStatus = "In Stock" | "Low Stock" | "Out of Stock";

export interface Receipt {
  id: string;
  supplier: string;
  warehouse: string;
  items: number;
  status: ReceiptStatus;
  date: string;
}

export interface Delivery {
  id: string;
  customer: string;
  warehouse: string;
  items: number;
  status: DeliveryStatus;
  date: string;
}

export interface Transfer {
  id: string;
  fromLocation: string;
  toLocation: string;
  items: number;
  status: TransferStatus;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  unit: string;
  stockAvailable: number;
  reorderLevel: number;
  status: ProductStatus;
}

export interface Warehouse {
  id: string;
  name: string;
  shortCode: string;
  address: string;
  manager: string;
  locationsCount: number;
}

export interface Location {
  id: string;
  warehouse: string;
  shortCode: string;
  rack: string;
  shelf: string;
  stockItems: number;
}

export interface StockItem {
  product: string;
  sku: string;
  warehouse: string;
  location: string;
  available: number;
  reserved: number;
  free: number;
}

export interface MoveRecord {
  id: string;
  product: string;
  fromLocation: string;
  toLocation: string;
  quantity: number;
  date: string;
  status: string;
}

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: string;
  warehouse: string;
  status: string;
}

export const recentReceipts: Receipt[] = [
  { id: "REC-8829", supplier: "Apex Industrial", warehouse: "Warehouse A", items: 42, status: "Waiting", date: "2026-03-14" },
  { id: "REC-8828", supplier: "GlobalParts Co", warehouse: "Warehouse B", items: 18, status: "Ready", date: "2026-03-13" },
  { id: "REC-8827", supplier: "MetalWorks Ltd", warehouse: "Warehouse A", items: 65, status: "Done", date: "2026-03-12" },
  { id: "REC-8826", supplier: "TechSupply Inc", warehouse: "Warehouse C", items: 23, status: "Draft", date: "2026-03-12" },
  { id: "REC-8825", supplier: "Apex Industrial", warehouse: "Warehouse B", items: 31, status: "Done", date: "2026-03-11" },
];

export const recentDeliveries: Delivery[] = [
  { id: "DEL-4401", customer: "BuildRight Corp", warehouse: "Warehouse A", items: 15, status: "Ready", date: "2026-03-14" },
  { id: "DEL-4400", customer: "UrbanDev Ltd", warehouse: "Warehouse B", items: 8, status: "Waiting", date: "2026-03-13" },
  { id: "DEL-4399", customer: "SteelFrame Inc", warehouse: "Warehouse A", items: 34, status: "Done", date: "2026-03-12" },
  { id: "DEL-4398", customer: "Pacific Builders", warehouse: "Warehouse C", items: 12, status: "Draft", date: "2026-03-11" },
  { id: "DEL-4397", customer: "Metro Logistics", warehouse: "Warehouse A", items: 27, status: "Done", date: "2026-03-10" },
];

export const recentTransfers: Transfer[] = [
  { id: "TRF-0091", fromLocation: "WH-A / R3-S2", toLocation: "WH-B / R1-S4", items: 120, status: "In Transit" },
  { id: "TRF-0090", fromLocation: "WH-B / R2-S1", toLocation: "WH-C / R5-S3", items: 45, status: "Scheduled" },
  { id: "TRF-0089", fromLocation: "WH-A / R1-S1", toLocation: "WH-A / R4-S2", items: 80, status: "Done" },
  { id: "TRF-0088", fromLocation: "WH-C / R2-S4", toLocation: "WH-A / R3-S1", items: 200, status: "Done" },
];

export const products: Product[] = [
  { id: "PRD-001", name: "Industrial Compressor V2", sku: "SKU-9920", category: "Machinery", unit: "pcs", stockAvailable: 1240, reorderLevel: 200, status: "In Stock" },
  { id: "PRD-002", name: "Hydraulic Pump HP-400", sku: "SKU-9921", category: "Machinery", unit: "pcs", stockAvailable: 85, reorderLevel: 100, status: "Low Stock" },
  { id: "PRD-003", name: "Steel Beam 6m Q235", sku: "SKU-9922", category: "Raw Materials", unit: "units", stockAvailable: 3200, reorderLevel: 500, status: "In Stock" },
  { id: "PRD-004", name: "Copper Wire 2.5mm", sku: "SKU-9923", category: "Electrical", unit: "m", stockAvailable: 0, reorderLevel: 1000, status: "Out of Stock" },
  { id: "PRD-005", name: "Safety Helmet Class A", sku: "SKU-9924", category: "PPE", unit: "pcs", stockAvailable: 450, reorderLevel: 100, status: "In Stock" },
  { id: "PRD-006", name: "Welding Rod E7018", sku: "SKU-9925", category: "Consumables", unit: "kg", stockAvailable: 62, reorderLevel: 80, status: "Low Stock" },
  { id: "PRD-007", name: "Concrete Mixer CM-200", sku: "SKU-9926", category: "Machinery", unit: "pcs", stockAvailable: 18, reorderLevel: 5, status: "In Stock" },
  { id: "PRD-008", name: "PVC Pipe 110mm", sku: "SKU-9927", category: "Plumbing", unit: "m", stockAvailable: 5600, reorderLevel: 1000, status: "In Stock" },
];

export const warehouses: Warehouse[] = [
  { id: "WH-001", name: "Central Distribution Hub", shortCode: "WH-A", address: "123 Industrial Ave, Chicago", manager: "Sarah Chen", locationsCount: 42 },
  { id: "WH-002", name: "East Coast Warehouse", shortCode: "WH-B", address: "456 Harbor Rd, New York", manager: "Michael Torres", locationsCount: 38 },
  { id: "WH-003", name: "Pacific Storage Center", shortCode: "WH-C", address: "789 Dock St, Los Angeles", manager: "David Kim", locationsCount: 28 },
  { id: "WH-004", name: "Midwest Depot", shortCode: "WH-D", address: "321 Plains Blvd, Dallas", manager: "Lisa Johnson", locationsCount: 22 },
  { id: "WH-005", name: "Northern Facility", shortCode: "WH-E", address: "654 Pine St, Seattle", manager: "James Wright", locationsCount: 12 },
  { id: "WH-006", name: "Southern Hub", shortCode: "WH-F", address: "987 Oak Dr, Miami", manager: "Ana Rodriguez", locationsCount: 6 },
];

export const locations: Location[] = [
  { id: "LOC-001", warehouse: "WH-A", shortCode: "A-R1-S1", rack: "R1", shelf: "S1", stockItems: 24 },
  { id: "LOC-002", warehouse: "WH-A", shortCode: "A-R1-S2", rack: "R1", shelf: "S2", stockItems: 18 },
  { id: "LOC-003", warehouse: "WH-A", shortCode: "A-R2-S1", rack: "R2", shelf: "S1", stockItems: 31 },
  { id: "LOC-004", warehouse: "WH-B", shortCode: "B-R1-S1", rack: "R1", shelf: "S1", stockItems: 12 },
  { id: "LOC-005", warehouse: "WH-B", shortCode: "B-R1-S2", rack: "R1", shelf: "S2", stockItems: 45 },
  { id: "LOC-006", warehouse: "WH-C", shortCode: "C-R1-S1", rack: "R1", shelf: "S1", stockItems: 8 },
];

export const stockItems: StockItem[] = [
  { product: "Industrial Compressor V2", sku: "SKU-9920", warehouse: "WH-A", location: "A-R1-S1", available: 640, reserved: 40, free: 600 },
  { product: "Industrial Compressor V2", sku: "SKU-9920", warehouse: "WH-B", location: "B-R1-S1", available: 600, reserved: 0, free: 600 },
  { product: "Hydraulic Pump HP-400", sku: "SKU-9921", warehouse: "WH-A", location: "A-R2-S1", available: 85, reserved: 15, free: 70 },
  { product: "Steel Beam 6m Q235", sku: "SKU-9922", warehouse: "WH-C", location: "C-R1-S1", available: 3200, reserved: 200, free: 3000 },
  { product: "Safety Helmet Class A", sku: "SKU-9924", warehouse: "WH-A", location: "A-R1-S2", available: 250, reserved: 0, free: 250 },
  { product: "Safety Helmet Class A", sku: "SKU-9924", warehouse: "WH-B", location: "B-R1-S2", available: 200, reserved: 50, free: 150 },
];

export const moveHistory: MoveRecord[] = [
  { id: "MOV-1201", product: "Industrial Compressor V2", fromLocation: "WH-A / R1-S1", toLocation: "WH-B / R1-S1", quantity: 120, date: "2026-03-14", status: "Done" },
  { id: "MOV-1200", product: "Hydraulic Pump HP-400", fromLocation: "Supplier", toLocation: "WH-A / R2-S1", quantity: 50, date: "2026-03-13", status: "Done" },
  { id: "MOV-1199", product: "Steel Beam 6m Q235", fromLocation: "WH-C / R1-S1", toLocation: "Customer", quantity: 400, date: "2026-03-12", status: "Done" },
  { id: "MOV-1198", product: "Safety Helmet Class A", fromLocation: "Supplier", toLocation: "WH-A / R1-S2", quantity: 200, date: "2026-03-11", status: "Done" },
  { id: "MOV-1197", product: "Welding Rod E7018", fromLocation: "WH-B / R2-S1", toLocation: "WH-A / R3-S2", quantity: 30, date: "2026-03-10", status: "In Transit" },
];

export const users: UserRecord[] = [
  { id: "USR-001", name: "Sarah Chen", email: "s.chen@coreinv.com", role: "Warehouse Manager", warehouse: "WH-A", status: "Active" },
  { id: "USR-002", name: "Michael Torres", email: "m.torres@coreinv.com", role: "Warehouse Manager", warehouse: "WH-B", status: "Active" },
  { id: "USR-003", name: "David Kim", email: "d.kim@coreinv.com", role: "Warehouse Manager", warehouse: "WH-C", status: "Active" },
  { id: "USR-004", name: "John Operator", email: "j.operator@coreinv.com", role: "Warehouse Staff", warehouse: "WH-A", status: "Active" },
  { id: "USR-005", name: "Emily Davis", email: "e.davis@coreinv.com", role: "Viewer", warehouse: "—", status: "Active" },
  { id: "USR-006", name: "Admin User", email: "admin@coreinv.com", role: "System Admin", warehouse: "All", status: "Active" },
  { id: "USR-007", name: "Tom Baker", email: "t.baker@coreinv.com", role: "Warehouse Staff", warehouse: "WH-B", status: "Disabled" },
];

export const categories = ["All", "Machinery", "Raw Materials", "Electrical", "PPE", "Consumables", "Plumbing"];
export const stockStatuses = ["All", "In Stock", "Low Stock", "Out of Stock"];
