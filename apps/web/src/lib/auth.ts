export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch {
    return true;
  }
};

export const PERMISSIONS = {
  PATIENT_LIST: "patient:list",
  PATIENT_VIEW: "patient:view",
  PATIENT_CREATE: "patient:create",
  PATIENT_UPDATE: "patient:update",
  PATIENT_DELETE: "patient:delete",
};

export enum Role {
  ADMIN = "ADMIN",
  USER = "USER",
}

const ROLE_PERMISSIONS: Record<Role, string[]> = {
  [Role.ADMIN]: [
    PERMISSIONS.PATIENT_LIST,
    PERMISSIONS.PATIENT_VIEW,
    PERMISSIONS.PATIENT_CREATE,
    PERMISSIONS.PATIENT_UPDATE,
    PERMISSIONS.PATIENT_DELETE,
  ],
  [Role.USER]: [PERMISSIONS.PATIENT_LIST, PERMISSIONS.PATIENT_VIEW],
};

// Helper function to get permissions for a given role
export const getPermissionsForRole = (role: Role): Set<string> => {
  return new Set(ROLE_PERMISSIONS[role] || []);
};
