import type { ProfileErrorCode } from "../../shared/profiles";
export class ProfileFailure extends Error {
  constructor(readonly code: ProfileErrorCode) {
    super(code);
  }
}
