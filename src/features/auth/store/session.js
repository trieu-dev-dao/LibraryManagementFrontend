export const emptySession = {accessToken: null, user: null, isAuthenticated: false};

// Decoding expiry controls local UX only. The API verifies signatures and roles.
export function tokenExpiry(token) {
  try {
    const part = token.split('.')[1].replaceAll('-', '+').replaceAll('_', '/');
    const {exp} = JSON.parse(atob(part));
    return Number.isFinite(exp) && exp > 0 ? exp * 1000 : 0;
  } catch { return 0; }
}

export function mapAuth(data) {
  if (!data || typeof data.token !== 'string' || !data.token.trim()
    || !Number.isInteger(data.userId) || data.userId <= 0
    || (data.memberId != null && (!Number.isInteger(data.memberId) || data.memberId <= 0))
    || typeof data.username !== 'string' || !data.username.trim()
    || typeof data.role !== 'string' || !data.role.trim()) {
    throw new Error('Phản hồi đăng nhập không hợp lệ.');
  }
  return {
    accessToken: data.token,
    user: {userId: data.userId, memberId: data.memberId ?? null, username: data.username, role: data.role},
    isAuthenticated: true,
  };
}

export function restoreSession(storage) {
  try {
    const saved = JSON.parse(storage?.getItem('library-auth') || 'null')?.state;
    const restored = mapAuth({...saved?.user, token: saved?.accessToken});
    return tokenExpiry(restored.accessToken) > Date.now() ? restored : {...emptySession};
  } catch { return {...emptySession}; }
}
