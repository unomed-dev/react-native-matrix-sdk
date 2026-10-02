import { ClientBuilder, Session, SlidingSyncVersionBuilder, type ClientLike } from "@unomed/react-native-matrix-sdk";

export interface Credentials {
    url: string;
    username: string;
    password: string;
};
export interface Device {
    id: string;
    name: string;
}

export async function login(credentials: Credentials, device: Device): Promise<{ 
    client: ClientLike;
    session: Session;
}> {
    const { url, username, password } = credentials;

    const client = await new ClientBuilder()
        .homeserverUrl(url)
        .slidingSyncVersionBuilder(SlidingSyncVersionBuilder.DiscoverNative)
        .build();
    await client.login(
        username,
        password,
        device.name,
        device.id,
    );
    const session = await client.session();
    return {
        client,
        session,
    }
}