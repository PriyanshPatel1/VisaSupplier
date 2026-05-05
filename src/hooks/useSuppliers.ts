"use client";

import { useEffect, useState } from "react";
import type { Supplier } from "@/types";
import { suppliersApi } from "@/lib/api-client";

interface SuppliersState {
  suppliers: Supplier[];
  loading: boolean;
  error: string | null;
}

export function useSuppliers(): SuppliersState {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    suppliersApi
      .list()
      .then((data) => {
        if (cancelled) return;
        setSuppliers((data as Supplier[]) ?? []);
        setLoading(false);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Failed to load suppliers");
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { suppliers, loading, error };
}
