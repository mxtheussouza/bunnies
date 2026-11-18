import { ProfileFailure } from "../profiles/errors";
export class ConnectionActivity {
  private probes = new Set<number>();
  private session = false;
  probe(owner: number) {
    if (this.session || this.probes.has(owner))
      throw new ProfileFailure("UNAVAILABLE");
    this.probes.add(owner);
    return () => {
      this.probes.delete(owner);
    };
  }
  acquireSession() {
    if (this.session || this.probes.size)
      throw new ProfileFailure("UNAVAILABLE");
    this.session = true;
    return () => {
      this.session = false;
    };
  }
}
