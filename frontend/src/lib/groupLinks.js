export function groupLinksByCategory(links, categories = []) {
  const grouped = new Map();
  const uncategorized = { iconLinks: [], cardLinks: [] };

  for (const link of links) {
    const target = link.categoryId == null
      ? uncategorized
      : (() => {
          if (!grouped.has(link.categoryId)) {
            grouped.set(link.categoryId, { iconLinks: [], cardLinks: [] });
          }
          return grouped.get(link.categoryId);
        })();
    (link.displayStyle === 'icon' ? target.iconLinks : target.cardLinks).push(link);
  }

  const sections = [];
  if (uncategorized.iconLinks.length > 0 || uncategorized.cardLinks.length > 0) {
    sections.push({ id: null, name: null, ...uncategorized });
  }

  for (const category of [...categories].sort((a, b) => a.position - b.position)) {
    const group = grouped.get(category.id);
    if (group && (group.iconLinks.length > 0 || group.cardLinks.length > 0)) {
      sections.push({ id: category.id, name: category.name, ...group });
    }
  }

  return sections;
}
