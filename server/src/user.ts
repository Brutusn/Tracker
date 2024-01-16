import { createHash } from "crypto";

export class User {
  private _accessToken = "";
  private _isAdmin = false;

  get accessToken(): string {
    if (!this._accessToken) this.generateAccessToken();

    return this._accessToken;
  }
  get isAdmin(): boolean {
    return this._isAdmin;
  }

  constructor(
    readonly name: string,
    readonly pinCode: string,
  ) {}

  setAdmin(isAdmin: boolean): void {
    this._isAdmin = isAdmin;
  }

  private generateAccessToken(): void {
    const hash = createHash("sha256");
    this._accessToken = hash
      .update("Make a token: " + new Date() + this.name + this.pinCode)
      .digest("hex");
  }
}
