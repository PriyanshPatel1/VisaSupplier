import { z } from "zod";

export type ParsedInput<T> =
  | { success: true; data: T }
  | { success: false; error: string };

function formatPath(path: (string | number)[]) {
  return path.length > 0 ? path.join(".") : "body";
}

export function formatZodError(error: z.ZodError) {
  return error.issues
    .map((issue) => `${formatPath(issue.path)}: ${issue.message}`)
    .join(", ");
}

export function getZodFieldErrors(error: z.ZodError) {
  const fieldErrors: Record<string, string> = {};

  for (const issue of error.issues) {
    const path = formatPath(issue.path);
    if (!fieldErrors[path]) {
      fieldErrors[path] = issue.message;
    }
  }

  return fieldErrors;
}

export function parseBody<T extends z.ZodTypeAny>(
  schema: T,
  data: unknown,
): ParsedInput<z.infer<T>> {
  const result = schema.safeParse(data);

  if (!result.success) {
    return { success: false, error: formatZodError(result.error) };
  }

  return { success: true, data: result.data };
}

export async function parseRequestBody<T extends z.ZodTypeAny>(
  request: Request,
  schema: T,
): Promise<ParsedInput<z.infer<T>>> {
  try {
    const data = await request.json();
    return parseBody(schema, data);
  } catch {
    return { success: false, error: "Invalid JSON body" };
  }
}

function searchParamsToObject(searchParams: URLSearchParams) {
  const result: Record<string, string | string[]> = {};

  for (const [key, value] of searchParams.entries()) {
    const current = result[key];
    if (current === undefined) {
      result[key] = value;
      continue;
    }

    result[key] = Array.isArray(current) ? [...current, value] : [current, value];
  }

  return result;
}

export function parseSearchParams<T extends z.ZodTypeAny>(
  schema: T,
  searchParams: URLSearchParams,
): ParsedInput<z.infer<T>> {
  return parseBody(schema, searchParamsToObject(searchParams));
}
