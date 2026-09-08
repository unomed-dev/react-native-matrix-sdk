import type { MessageContent, Room } from "@unomed/react-native-matrix-sdk";

export function roomWithNewestMessageFirst(a: Room, b: Room): number {
    // FIXME
    return 0;
}

export function newestMessageLast(a: { timestamp: Date }, b: { timestamp: Date }): number {
    return a.timestamp.getTime() - b.timestamp.getTime();
}