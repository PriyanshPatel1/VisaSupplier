"use client";

import { useEffect, useState } from "react";
import type { SiteContent } from "@/lib/site-content";
import { DEFAULT_SITE_CONTENT } from "@/lib/site-content-defaults";

type SiteContentState = {
  content: SiteContent | null;
  loading: boolean;
  error: string | null;
};

let cachedContent: SiteContent | null = null;
let cachedPromise: Promise<SiteContent | null> | null = null;

async function loadSiteContent(): Promise<SiteContent | null> {
  if (cachedContent) return cachedContent;
  if (!cachedPromise) {
    cachedPromise = fetch("/api/content/site", {
      credentials: "include",
      cache: "no-store",
    })
      .then(async (response) => {
        const json = (await response.json()) as {
          ok?: boolean;
          data?: { content?: SiteContent | null };
          error?: string;
        };

        if (!response.ok || !json.ok) {
          throw new Error(json.error ?? "Failed to load site content");
        }

        cachedContent = json.data?.content ?? null;
        return cachedContent;
      })
      .finally(() => {
        cachedPromise = null;
      });
  }

  return cachedPromise;
}

export function useSiteContent(): SiteContentState {
  const [state, setState] = useState<SiteContentState>({
    content: cachedContent ?? DEFAULT_SITE_CONTENT,
    loading: !cachedContent,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    loadSiteContent()
      .then((content) => {
        if (cancelled) return;
        setState({ content: content ?? DEFAULT_SITE_CONTENT, loading: false, error: null });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setState((prev) => ({
          content: prev.content ?? DEFAULT_SITE_CONTENT,
          loading: false,
          error: error instanceof Error ? error.message : "Failed to load site content",
        }));
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
