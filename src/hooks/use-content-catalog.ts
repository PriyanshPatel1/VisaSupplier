"use client";

import { useEffect, useState } from "react";
import type { Country, VisaType } from "@/types";

type CatalogResponse = {
  countries: Country[];
  visas: VisaType[];
  categories?: string[];
  continents?: string[];
};

type CatalogState = {
  countries: Country[];
  visas: VisaType[];
  categories: string[];
  continents: string[];
  loading: boolean;
  error: string | null;
};

const FALLBACK_STATE: CatalogState = {
  countries: [],
  visas: [],
  categories: [],
  continents: [],
  loading: true,
  error: null,
};

export function useContentCatalog(): CatalogState {
  const [state, setState] = useState<CatalogState>(FALLBACK_STATE);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const response = await fetch("/api/content/catalog", {
          credentials: "include",
          cache: "no-store",
        });
        const json = (await response.json()) as { ok?: boolean; data?: CatalogResponse; error?: string };
        if (!response.ok || !json.ok || !json.data) {
          throw new Error(json.error ?? "Failed to fetch catalog");
        }
        if (cancelled) return;

        const countries = Array.isArray(json.data.countries) ? json.data.countries : [];
        const visas = Array.isArray(json.data.visas) ? json.data.visas : [];
        const categories =
          Array.isArray(json.data.categories) && json.data.categories.length > 0
            ? json.data.categories
            : Array.from(new Set(visas.map((visa) => visa.category)));
        const continents =
          Array.isArray(json.data.continents) && json.data.continents.length > 0
            ? json.data.continents
            : Array.from(new Set(countries.map((country) => country.continent).filter(Boolean) as string[]));

        setState({
          countries,
          visas,
          categories,
          continents,
          loading: false,
          error: null,
        });
      } catch (error) {
        if (cancelled) return;
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : "Failed to load catalog",
        }));
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
