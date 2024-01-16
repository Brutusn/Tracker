import { User } from "./user";

// In memory storage of users, don't save it to a database.
export class UserDatabase {
  private readonly userNameMap = new Map<string, User>();
  private readonly userIdMap = new Map<string, User>();
  private readonly accessTokenMap = new Map<string, User>();

  login(name: string, code: string): User | null {
    const user = this.userNameMap.get(name);

    return user && user.pinCode === code ? user : null;
  }
  register(name: string, code: string): User | null {
    if (this.userNameMap.has(name)) return null;

    const user = new User(name, code);

    this.userNameMap.set(user.name, user);
    this.userIdMap.set(user.id, user);
    this.accessTokenMap.set(user.accessToken, user);

    return user;
  }

  loginOrRegister(name: string, code: string): User | null {
    if (this.userNameMap.has(name)) {
      return this.login(name, code);
    }

    return this.register(name, code);
  }

  find(idOrToken: string): User | null {
    return (
      this.userIdMap.get(idOrToken) ??
      this.accessTokenMap.get(idOrToken) ??
      null
    );
  }
}
