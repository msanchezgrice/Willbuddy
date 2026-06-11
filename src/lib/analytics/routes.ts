const DYNAMIC_ROUTES: Array<[RegExp, string]> = [
  [/^\/session\/[^/]+$/, "/session/[id]"],
  [/^\/summary\/[^/]+$/, "/summary/[id]"],
  [/^\/share\/[^/]+$/, "/share/[token]"],
  [/^\/couple\/join\/[^/]+$/, "/couple/join/[token]"],
  [/^\/couple\/compare\/[^/]+$/, "/couple/compare/[id]"],
  [/^\/sign-in(?:\/.*)?$/, "/sign-in"],
  [/^\/sign-up(?:\/.*)?$/, "/sign-up"],
];

export function normalizeAnalyticsRoute(pathname: string): string {
  const path = pathname.split("?")[0]?.split("#")[0] || "/";

  for (const [pattern, replacement] of DYNAMIC_ROUTES) {
    if (pattern.test(path)) {
      return replacement;
    }
  }

  return path;
}
