import type { AmqpsConnection } from "../connections/amqpsConnection";

export class VhostSwitchGuard {
  private handshakeInProgress = false;
  private unconfirmed = false;

  get blocked() {
    return this.unconfirmed;
  }

  handshakeStarted() {
    this.handshakeInProgress = true;
  }

  disconnected(definitive = false) {
    if (!definitive && this.handshakeInProgress) this.unconfirmed = true;
    this.handshakeInProgress = false;
  }

  async retire(handle?: AmqpsConnection) {
    if (!handle) {
      this.disconnected();
      return !this.blocked;
    }
    let confirmed = false;
    try {
      confirmed = await handle.close();
    } finally {
      handle.destroy();
      if (!confirmed) this.unconfirmed = true;
      this.disconnected(confirmed);
    }
    return confirmed && !this.blocked;
  }
}
