import { AgentWorkerProvider, WorkerCapability } from "./provider";

export class ProviderRegistry {
  private readonly providers = new Map<string, AgentWorkerProvider>();

  public register(provider: AgentWorkerProvider): void {
    this.providers.set(provider.providerId, provider);
  }

  public get(providerId: string): AgentWorkerProvider | undefined {
    return this.providers.get(providerId);
  }

  public async findWorker(roleSlug: string): Promise<{
    readonly provider: AgentWorkerProvider;
    readonly capability: WorkerCapability;
  } | null> {
    for (const provider of this.providers.values()) {
      const capabilities = await provider.discoverWorkers();
      const match = capabilities.find((c) => c.roleSlug === roleSlug);
      if (match) {
        return { provider, capability: match };
      }
    }
    return null;
  }
}
