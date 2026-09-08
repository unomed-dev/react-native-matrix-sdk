import type { FunctionComponent } from "react";
import { Button, Text, View } from "react-native";

import { SyncServiceState } from "@unomed/react-native-matrix-sdk";
import { useMatrix } from "./use-matrix";

export const Footer: FunctionComponent = () => {
    const { synchronizeStatus, synchronize } = useMatrix();
    return <View>
        <SyncStatus synchronizeStatus={synchronizeStatus} />
        <Button title="sync" onPress={() => synchronize()}/>
    </View>
}

export const SyncStatus = ({ synchronizeStatus }: { synchronizeStatus: SyncServiceState | undefined }) => {
  if (!synchronizeStatus || synchronizeStatus === undefined) {
    return <Text>No sync status</Text>;
  }
  switch (synchronizeStatus) {
    // case SyncServiceState.Idle:
    //   return <Text>Sync is idle</Text>;
    case SyncServiceState.Offline:
      return <Text>Offline</Text>;
    case SyncServiceState.Error:
      return <Text>Sync error</Text>;
    case SyncServiceState.Running:
      return <Text>Syncing...</Text>;
    case SyncServiceState.Terminated:
      return <Text>Sync terminated</Text>;
    default:
      return <Text>Unknown sync status</Text>;
  }
}