import md5 from 'md5';
import CONFIG from "../../config";
import Store from "../store/Store";
import { TAnswer, TError, TMessagesResponse, TUser, UserInfo, UserProgress, UserVapes, ShopItem, RefillResult, UpgradeResult, RatingResponse, THellTasksSet, THellSolvePayload, THellSolveResult, } from "./types";

const { CHAT_TIMESTAMP, HOST } = CONFIG;

class Server {
    HOST = HOST;
    store: Store;
    chatInterval: NodeJS.Timer | null = null;
    showErrorCb: (error: TError) => void = () => {};

    constructor(store: Store) {
        this.store = store;
    }

    private async request<T>(method: string, params: { [key: string]: string } = {}): Promise<T | null> {
        try {
            params.method = method;
            
            const token = this.store.getToken();
            if (token) {
                params.token = token;
            }
            const response = await fetch(`${this.HOST}/?${Object.keys(params).map(key => `${key}=${params[key]}`).join('&')}`);
            const answer: TAnswer<T> = await response.json();
            if (answer.result === 'ok' && answer.data) {
                return answer.data;
            }
            answer.error && this.setError(answer.error);
            return null;
        } catch (e) {
            console.log(e);
            this.setError({
                code: 9000,
                text: 'Unknown error',
            });
            return null;
        }
    }

    private setError(error: TError): void {
        this.showErrorCb(error);
    }

    showError(cb: (error: TError) => void) {
        this.showErrorCb = cb;
    }

    async login(username: string, password: string): Promise<boolean> {
        const rnd = Math.round(Math.random() * 100000);
        const hash = md5(`${md5(`${username}${password}`)}${rnd}`);
        const user = await this.request<TUser>('login', { username, hash, rnd: `${rnd}` });
        if (user) {
            this.store.setUser(user);
            return true;
        }
        return false;
    }

    async logout() {
        const result = await this.request<boolean>('logout');
        if (result) {
            this.store.clearUser();
        }
    }

    async registration(login: string, password: string): Promise<boolean> {
        const hash_password = md5(`${login}${password}`);
        const user = await this.request<TUser>('registration', { login, hash_password});
         if (user) {
            this.store.setUser(user);
            return true;
        }
        return false;
    }

    sendMessage(message: string): void {
        this.request<boolean>('sendMessage', { message });
    }

    async getMessages(): Promise<TMessagesResponse | null> {
        const hash = this.store.getChatHash();
        const result = await this.request<TMessagesResponse>('getMessages', { hash });
        if (result) {
            this.store.setChatHash(result.hash);
            return result;
        }
        return null;
    }

    // startChatMessages(cb: (hash: string) => void): void {
    //     this.chatInterval = setInterval(async () => {
    //         const result = await this.getMessages();
    //         if (result) {
    //             const { messages, hash } = result;
    //             this.store.addMessages(messages);
    //             cb(hash);
    //         }
    //     }, CHAT_TIMESTAMP);

    // }

    async puff(itemId?: number): Promise<UserProgress | null> {
        const params: Record<string, string> = {};

        if (typeof itemId === "number") {
            params.itemId = String(itemId);
        }

        const result = await this.request<UserProgress>("puff", params);
        return result ?? null;
    }

    async getUserProgress(): Promise<UserProgress | null> {
        const token = this.store.getToken() ?? "";
        const result = await this.request<UserProgress>('getPerson', { token });
        if (result) {
            return result;
        }
        return null;
    }

    async getUserInfo(): Promise<UserInfo | null> {
        const token = this.store.getToken() ?? ""
        const result = await this.request<UserInfo>('getUser', {token});
        if (result) {
            return result;
        }
        return null;
    }

    async updateHappinessAfterOfline(): Promise<UserProgress | null> {
        const token = this.store.getToken() ?? "";
        const result = await this.request<UserProgress>('update', { token });
        if (result) {
            return result;
        }
        return null;
    }

    async getCatalog(): Promise<ShopItem[]> {
        const result = await this.request<ShopItem[]>('getCatalog');
        return result ?? [];
    }

    async buy(itemId: number): Promise<boolean> {
        const result = await this.request<boolean>('buy', {
            itemId: String(itemId),
        });
        return !!result;
    }

    async refillItem(itemId: number): Promise<RefillResult | null> {
        const result = await this.request<RefillResult>('refillItem', {
            itemId: String(itemId),
        });
        return result ?? null;
    }


    async upgradeItem(itemId: number): Promise<UpgradeResult | null> {
        const result = await this.request<UpgradeResult>('upgradeItem', {
            itemId: String(itemId),
        });
        return result ?? null;
    }

    async getInventory(): Promise<UserVapes[]> {
        const token = this.store.getToken() ?? "";
        const result = await this.request<Array<UserVapes>>('getInventory', { token });
        return result ?? [];
    }

    async getRating(): Promise<RatingResponse | null> {
        const result = await this.request<RatingResponse>('getRating');
        return result ?? null;
    }

    public async getHellTasks(): Promise<THellTasksSet | null> {
        return this.request<THellTasksSet>('getHellTasks');
    }

    public async solveHellTasks(payload: THellSolvePayload): Promise<THellSolveResult | null> {
        const params: Record<string, string> = {
            q_a: String(payload.quadratic.a),
            q_b: String(payload.quadratic.b),
            q_c: String(payload.quadratic.c),
            q_ans: payload.quadratic.answers.join(','),

            c_a: String(payload.cubic.a),
            c_b: String(payload.cubic.b),
            c_c: String(payload.cubic.c),
            c_d: String(payload.cubic.d),
            c_ans: payload.cubic.answers.join(','),

            qt_a: String(payload.quartic.a),
            qt_b: String(payload.quartic.b),
            qt_c: String(payload.quartic.c),
            qt_d: String(payload.quartic.d),
            qt_e: String(payload.quartic.e),
            qt_ans: payload.quartic.answers.join(','),
        };

        const result = await this.request<THellSolveResult>('solveHellTasks', params);
        return result ?? null;
    }


    stopChatMessages(): void {
        if (this.chatInterval) {
            clearInterval(this.chatInterval);
            this.chatInterval = null;
            this.store.clearMessages();
        }
    }
}

export default Server;