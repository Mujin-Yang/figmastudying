"use client";

import { ReactNode } from "react";
import {
  LiveblocksProvider, RoomProvider,
  ClientSideSuspense,
} from "@liveblocks/react/suspense";
import {LiveMap} from "@liveblocks/core";
import Loader from "@/components/Loader";

export function Room({ children }: { children: ReactNode }) {
  return (
    <LiveblocksProvider publicApiKey={"pk_prod_FV637MU5PO1mFX4yS5bKTmG6Qhy2_9Tlx5MbK3tdbxW7u165cBPIZEGhTN21GXyF"}>
      <RoomProvider
          id="my-room"
          initialStorage={{canvasObjects: new LiveMap(),}}
          initialPresence={{
          cursor:null, cursorColor:null, editingText:null
      }}>
        <ClientSideSuspense fallback={<Loader/>}>
          {children}
        </ClientSideSuspense>
      </RoomProvider>
    </LiveblocksProvider>
  );
}