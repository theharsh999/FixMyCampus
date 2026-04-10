const USER_KEY = 'fixmycampus_user';

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
