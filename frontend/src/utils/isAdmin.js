/**
 * Must match backend requireAdmin (JWT payload role).
 * Username "admin" alone is not enough — DB role must be "admin".
 */
export function isAdminUser(user) {
  return user?.role === "admin";
}
