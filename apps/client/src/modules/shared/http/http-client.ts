export class HttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly code?: string,
  ) {
    super(code ?? `Request failed with status ${status}`);
  }
}

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`/api${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...init?.headers,
      },
    });
  } catch {
    throw new HttpError(0, 'NETWORK_ERROR');
  }

  if (!response.ok) {
    let code: string | undefined;
    try {
      const body = await response.json() as { code?: string };
      code = body.code;
    } catch {
      code = undefined;
    }
    throw new HttpError(response.status, code);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
