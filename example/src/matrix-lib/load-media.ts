import { MediaSource, type ClientLike } from "@unomed/react-native-matrix-sdk";

export interface Media { url: string };

export async function loadMedia(client: ClientLike, url: string): Promise<Media | undefined> {
    const mediaSource = MediaSource.fromUrl(url);
    const handle = await client.getMediaFile(mediaSource, undefined, 'image/jpeg', true, undefined);
    return { url: `file://${handle.path()}` };
}