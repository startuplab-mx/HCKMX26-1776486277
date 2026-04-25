function sleep(ms: number) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, ms));
}

export async function mockAddManualAlert(_formData: {
  description: string;
  app: string;
  level: number;
}): Promise<{ ok: true }> {
  await sleep(500);
  return { ok: true };
}

export async function mockUpdateAgreement(_config: Record<string, boolean>): Promise<{ ok: true }> {
  await sleep(350);
  return { ok: true };
}

