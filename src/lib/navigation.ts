interface SearchItem {
  category: string;
  age: string;
  type: string;
  gameData?: { ageGroups?: string[] };
}

/** Resolve the full learning context so a search result can render and continue. */
export function getSearchDestination(item: SearchItem) {
  const view = ['math', 'discovery'].includes(item.category) ? 'cognitive' : item.category;
  const age = item.gameData?.ageGroups?.[0] ?? (item.age.includes('Nhà trẻ') ? 'toddler' : item.age.replace(/\s/g, '').match(/[345]-[456]/)?.[0] ?? '3-4');
  return { view, age, section: item.type === 'game' ? 'games' : 'lessons' };
}
