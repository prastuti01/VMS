export function hasRole(member, role) {
  return member.roles?.some((item) => item.toLowerCase() === role.toLowerCase())
}
