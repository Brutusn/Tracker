import {User} from "./user";

// In memory storage of users, don't save it to a database.
export class UserDatabase {
    private readonly userMap = new Map<string, User>();
    private readonly accessTokenMap = new Map<string, User>();

    login(name: string, code: string): User | null {
        const user = this.userMap.get(name);

        return user && user.pinCode === code ? user : null;
    }
    register(name: string, code: string): User | null {
        if (this.userMap.has(name)) return null;

        const user = new User(name, code);

        this.userMap.set(user.name, user);
        this.accessTokenMap.set(user.accessToken, user);

        return user;
    }

    loginOrRegister(name: string, code: string): User | null {
        if (this.userMap.has(name)) {
            return this.login(name, code);
        }

        return this.register(name, code);
    }

    find(userNameOrToken: string): User | null {
        return this.accessTokenMap.get(userNameOrToken) ?? this.userMap.get(userNameOrToken) ?? null;
    }
}