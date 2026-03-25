import { create } from "zustand";
import type {
  PublishJob,
  SocialAccount,
  PublishConfig,
  PlatformType,
  PublishStatus,
} from "@/lib/types";

interface PublishState {
  publishJobs: PublishJob[];
  connectedAccounts: SocialAccount[];
  publishConfig: PublishConfig;
}

interface PublishActions {
  setPublishConfig: (config: Partial<PublishConfig>) => void;
  connectAccount: (account: SocialAccount) => void;
  disconnectAccount: (accountId: string) => void;
  publishToSelected: (
    projectId: string,
    mediaIds: string[],
    platforms: PlatformType[]
  ) => Promise<void>;
  publishToAll: (projectId: string, mediaIds: string[]) => Promise<void>;
  schedulePublish: (
    projectId: string,
    mediaIds: string[],
    scheduledAt: Date
  ) => Promise<void>;
}

const defaultPublishConfig: PublishConfig = {
  platforms: [],
  caption: "",
  hashtags: [],
};

function makePublishJob(
  projectId: string,
  mediaId: string,
  platform: PlatformType,
  status: PublishStatus,
  scheduledAt: Date | null = null
): PublishJob {
  return {
    id: crypto.randomUUID(),
    projectId,
    mediaId,
    platform,
    status,
    scheduledAt,
    publishedAt: null,
    publishedUrl: "",
    platformPostId: "",
    caption: "",
    hashtags: [],
    metadata: {},
    createdAt: new Date(),
  };
}

export const usePublishStore = create<PublishState & PublishActions>()(
  (set, get) => ({
    publishJobs: [],
    connectedAccounts: [],
    publishConfig: { ...defaultPublishConfig },

    setPublishConfig: (config) =>
      set((state) => ({
        publishConfig: { ...state.publishConfig, ...config },
      })),

    connectAccount: (account) =>
      set((state) => ({
        connectedAccounts: [...state.connectedAccounts, account],
      })),

    disconnectAccount: (accountId) =>
      set((state) => ({
        connectedAccounts: state.connectedAccounts.filter(
          (a) => a.id !== accountId
        ),
      })),

    publishToSelected: async (projectId, mediaIds, platforms) => {
      const { publishConfig } = get();
      const jobs: PublishJob[] = platforms.flatMap((platform) =>
        mediaIds.map((mediaId) =>
          makePublishJob(projectId, mediaId, platform, "publishing")
        )
      );

      set((state) => ({
        publishJobs: [...state.publishJobs, ...jobs],
      }));

      for (const job of jobs) {
        try {
          const res = await fetch("/api/publish", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              jobId: job.id,
              projectId,
              mediaId: job.mediaId,
              platform: job.platform,
              caption: publishConfig.caption,
              hashtags: publishConfig.hashtags,
            }),
          });
          if (!res.ok) throw new Error(`Publish failed: ${res.statusText}`);
          set((state) => ({
            publishJobs: state.publishJobs.map((j) =>
              j.id === job.id
                ? {
                    ...j,
                    status: "published" as const,
                    publishedAt: new Date(),
                  }
                : j
            ),
          }));
        } catch (err) {
          const message =
            err instanceof Error ? err.message : "Publish failed";
          set((state) => ({
            publishJobs: state.publishJobs.map((j) =>
              j.id === job.id
                ? {
                    ...j,
                    status: "failed" as const,
                    metadata: { ...j.metadata, error: message },
                  }
                : j
            ),
          }));
        }
      }
    },

    publishToAll: async (projectId, mediaIds) => {
      const { connectedAccounts, publishToSelected } = get();
      const platforms = connectedAccounts.map((a) => a.platform);
      await publishToSelected(projectId, mediaIds, platforms);
    },

    schedulePublish: async (projectId, mediaIds, scheduledAt) => {
      const { publishConfig, connectedAccounts } = get();
      const platforms: PlatformType[] =
        publishConfig.platforms.length > 0
          ? publishConfig.platforms
          : connectedAccounts.map((a) => a.platform);

      const jobs: PublishJob[] = platforms.flatMap((platform) =>
        mediaIds.map((mediaId) =>
          makePublishJob(projectId, mediaId, platform, "scheduled", scheduledAt)
        )
      );

      set((state) => ({
        publishJobs: [...state.publishJobs, ...jobs],
      }));

      try {
        await fetch("/api/publish/schedule", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectId,
            mediaIds,
            platforms,
            caption: publishConfig.caption,
            hashtags: publishConfig.hashtags,
            scheduledAt: scheduledAt.toISOString(),
          }),
        });
      } catch {
        set((state) => ({
          publishJobs: state.publishJobs.map((j) =>
            jobs.some((sj) => sj.id === j.id)
              ? {
                  ...j,
                  status: "failed" as const,
                  metadata: { ...j.metadata, error: "Failed to schedule" },
                }
              : j
          ),
        }));
      }
    },
  })
);
