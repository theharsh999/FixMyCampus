// ─── API Helper for FixMyCampus ─────────────────────────
// Replaces localStorage (store.js) with real backend API calls

const API_BASE = "http://localhost:5001/api";

// ─── 1. Create a new problem ────────────────────────────
// Used by: SubmitComplaint.jsx
export async function createProblem(data) {
  const res = await fetch(`${API_BASE}/problems`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.message || "Failed to create problem");
  }

  return json.data;
}

// ─── 2. Get all problems (with optional filters) ────────
// Used by: StudentDashboard.jsx, AdminDashboard.jsx
export async function getProblems(filters = {}) {
  // Build query string from filters
  const params = new URLSearchParams();
  if (filters.createdBy) params.set("createdBy", filters.createdBy);
  if (filters.department) params.set("department", filters.department);

  const query = params.toString();
  const url = query ? `${API_BASE}/problems?${query}` : `${API_BASE}/problems`;

  const res = await fetch(url);
  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.message || "Failed to fetch problems");
  }

  return json.data;
}

// ─── 3. Update a problem (status / assignedTo) ──────────
// Used by: AdminDashboard.jsx
export async function updateProblem(id, updates) {
  const res = await fetch(`${API_BASE}/problems/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.message || "Failed to update problem");
  }

  return json.data;
}
