const STORAGE_KEY = 'workshop-badges';
export type BadgeId = 'code-archaeologist' | 'stargazer' | 'tinkerer' | 'alchemist';
export interface Badge {
  id: BadgeId;
  name: string;
  description: string;
}
export const BADGES: Record<BadgeId, Badge> = {
  'code-archaeologist': { id: 'code-archaeologist', name: 'Code Archaeologist', description: 'Read 3 blog posts' },
  'stargazer': { id: 'stargazer', name: 'Stargazer', description: 'Spend 2+ minutes on the home page' },
  'tinkerer': { id: 'tinkerer', name: 'Master Tinkerer', description: 'Visit all main pages' },
  'alchemist': { id: 'alchemist', name: 'Data Alchemist', description: 'Read a post, view a project, and view resume' },
};
export function getBadges(): BadgeId[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
}
export function hasBadge(id: BadgeId): boolean { return getBadges().includes(id); }
export function awardBadge(id: BadgeId): boolean {
  if (hasBadge(id)) return false;
  const badges = getBadges(); badges.push(id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(badges));
  return true;
}
export function getProgress(): { level: number; xp: number; nextLevelXp: number } {
  const badges = getBadges(); const xp = badges.length * 100;
  const level = Math.floor(xp / 100) + 1;
  return { level, xp, nextLevelXp: level * 100 };
}
