export function matchesRoutePrefix(pathname: string, prefix: string) {
  const normalizedPrefix =
    prefix.length > 1 && prefix.endsWith("/") ? prefix.slice(0, -1) : prefix;

  return (
    pathname === normalizedPrefix ||
    pathname.startsWith(`${normalizedPrefix}/`)
  );
}

export function matchesAnyRoutePrefix(pathname: string, prefixes: string[]) {
  return prefixes.some((prefix) => matchesRoutePrefix(pathname, prefix));
}
