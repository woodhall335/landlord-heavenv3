type AnyRecord = Record<string, unknown>;

function text(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function records(value: unknown): AnyRecord[] {
  return Array.isArray(value)
    ? value.filter(
        (item): item is AnyRecord => Boolean(item) && typeof item === 'object'
      )
    : [];
}

function inventoryRooms(facts: AnyRecord): AnyRecord[] {
  const inventory = facts.inventory;
  if (inventory && typeof inventory === 'object') {
    const rooms = records((inventory as AnyRecord).rooms);
    if (rooms.length) return rooms;
  }
  const directRooms = records(facts.inventory_rooms);
  if (directRooms.length) return directRooms;
  return records(facts.inspection_rooms);
}

export function normalizeInventoryRooms(facts: AnyRecord): AnyRecord[] {
  return inventoryRooms(facts).map((room) => {
    const items = records(room.items ?? room.item_rows);
    return {
      name: text(room.name ?? room.room_name),
      items: items.map((item) => ({
        name: text(item.name ?? item.item),
        condition: text(item.condition ?? item.condition_rating),
        cleanliness: text(item.cleanliness),
        notes: text(item.notes ?? item.description),
      })),
    };
  });
}

export function hasCompletedStructuredInventory(facts: AnyRecord): boolean {
  const rooms = normalizeInventoryRooms(facts);
  if (rooms.length === 0) return false;

  return rooms.every((room) => {
    const items = records(room.items);
    return (
      text(room.name).length > 0 &&
      items.length > 0 &&
      items.some(
        (item) =>
          text(item.name).length > 0 &&
          Boolean(
            text(item.condition) ||
              text(item.cleanliness) ||
              text(item.notes)
          )
      )
    );
  });
}
