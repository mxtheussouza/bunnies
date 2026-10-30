import type { Socket } from "node:net";
import type { TlsFixture } from "./tls-fixture.cjs";
export type AmqpPeer = {
  mode: string;
  records: Array<{
    methods: string[];
    channels: number[];
    vhost: string | null;
    credentials: { mechanism: string; response: string } | null;
    tune: { channelMax: number; frameMax: number; heartbeat: number } | null;
    closeConfirmed: boolean;
  }>;
  sockets: Set<Socket>;
  readonly attempts: number;
  url: string;
  port: number;
  close(): Promise<void>;
};
export function createAmqpPeer(
  fixture: TlsFixture,
  options?: { mode?: string; cert?: string },
): Promise<AmqpPeer>;
