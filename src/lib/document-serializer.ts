type SerializableDocument = {
  sizeBytes?: number | null;
  createdAt?: Date | string | null;
  [key: string]: unknown;
};

export function serializeDocument<T extends SerializableDocument>(document: T) {
  return {
    ...document,
    size: document.sizeBytes ?? 0,
    uploadDate:
      document.createdAt instanceof Date
        ? document.createdAt.toISOString()
        : document.createdAt ?? null,
  };
}
