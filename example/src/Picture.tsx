import { useEffect, useState, type FunctionComponent } from "react";
import { Image, View, type ViewProps } from "react-native";

import { useMatrix } from "./use-matrix";

export const Picture: FunctionComponent<{ url: string | undefined } & ViewProps> = ({ style, url }) => {
    const [loadedImageData, setLoadedImageData] = useState<string>();
    const { loadMedia } = useMatrix();

    useEffect(() => {
        (async () => {
            const media = await loadMedia(url);
            if (media?.url) {
                setLoadedImageData(media.url);
            }
        })()
    }, []);

    if (loadedImageData) {
        return <View style={[style, { backgroundColor: 'transparent' }]}><Image source={{ uri: loadedImageData }} style={{ flex: 1, resizeMode: 'contain' }} /></View>;
    }
    return <View style={[style]} />
}