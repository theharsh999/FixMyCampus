import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'fixmycampus_complaints';
const USER_KEY = 'fixmycampus_user';

function generateTicketId() {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `FMC-${num}`;
}

function autoPriority(category, title) {
  const urgent = ['shock', 'leakage', 'leak', 'fire', 'flood', 'danger', 'emergency', 'sparking'];
  const lower = title.toLowerCase();
  if (urgent.some(w => lower.includes(w))) return 'Urgent';
  if (category === 'Electrical') return 'Medium';
  if (category === 'Cleaning') return 'Low';
  return 'Medium';
}

export function getComplaints() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveComplaints(complaints) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(complaints));
}

export function addComplaint(data) {
  const complaints = getComplaints();
  const complaint = {
    id: uuidv4(),
    ticketId: generateTicketId(),
    ...data,
    status: 'Pending',
    priority: autoPriority(data.category, data.title),
    createdBy: getCurrentUser()?.name || 'Student',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  complaints.unshift(complaint);
  saveComplaints(complaints);
  return complaint;
}

export function updateComplaint(id, updates) {
  const complaints = getComplaints();
  const idx = complaints.findIndex(c => c.id === id);
  if (idx !== -1) {
    complaints[idx] = { ...complaints[idx], ...updates, updatedAt: new Date().toISOString() };
    saveComplaints(complaints);
  }
  return complaints[idx];
}

export function getCurrentUser() {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function loginUser(userData) {
  localStorage.setItem(USER_KEY, JSON.stringify(userData));
}

export function logoutUser() {
  localStorage.removeItem(USER_KEY);
}

// Seed demo data
export function seedDemoData() {
  if (getComplaints().length > 0) return;
  const demos = [
    { title: 'Fan not working in Room 204', category: 'Electrical', description: 'Ceiling fan has stopped working completely. Very hot in the room.', location: 'Room 204, Block A', status: 'Pending', priority: 'Medium', createdBy: 'Rahul' },
    { title: 'Washroom cleaning needed', category: 'Cleaning', description: 'Ground floor washroom near canteen is very dirty.', location: 'Ground Floor, Main Building', status: 'In Progress', priority: 'Low', createdBy: 'Priya', assignedTo: 'Ramesh' },
    { title: 'WiFi not working in Library', category: 'Network', description: 'WiFi has been down for 2 days in the library area.', location: 'Library, 2nd Floor', status: 'Pending', priority: 'Medium', createdBy: 'Amit' },
    { title: 'Water leakage in Lab', category: 'Plumbing', description: 'Water is leaking from the ceiling near the computers. Urgent!', location: 'Computer Lab 3, Block B', status: 'Pending', priority: 'Urgent', createdBy: 'Sneha' },
  ];
  const complaints = demos.map(d => ({
    ...d,
    id: uuidv4(),
    ticketId: generateTicketId(),
    createdAt: new Date(Date.now() - Math.random() * 86400000 * 5).toISOString(),
    updatedAt: new Date().toISOString(),
  }));
  saveComplaints(complaints);
}
