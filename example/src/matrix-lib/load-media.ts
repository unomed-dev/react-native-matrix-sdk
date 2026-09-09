import { MediaSource, type ClientLike } from "@unomed/react-native-matrix-sdk";

export interface Media { url: string };

const mediaCache = new Map<string, Promise<Media | undefined>>();

export async function loadMedia(client: ClientLike, url: string): Promise<Media | undefined> {
    const cached = mediaCache.get(url);
    if (cached) {
        return cached;
    }

    const loadPromise = loadMediaUncached(client, url).catch((error) => {
        mediaCache.delete(url);
        throw error;
    });

    mediaCache.set(url, loadPromise);
    return loadPromise;
}

async function loadMediaUncached(client: ClientLike, url: string): Promise<Media | undefined> {
    const mediaSource = MediaSource.fromUrl(url);
    const handle = await client.getMediaFile(mediaSource, undefined, 'image/jpeg', true, undefined);
    return { url: `file://${handle.path()}` };
}
