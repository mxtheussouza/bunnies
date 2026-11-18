export type TlsFixture = {
  directory: string;
  ca: string;
  cert: string;
  key: string;
  wrongCert: string;
  expiredCert: string;
  cleanup(): Promise<void>;
};
export function createTlsFixture(): Promise<TlsFixture>;
