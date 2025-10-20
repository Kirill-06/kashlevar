import md5 from 'md5';
import CONFIG from "../../config";
import Store from "../store/Store";
import { TAnswer, TError, TMessagesResponse, TUser, UserInfo, UserProgress, UserVapes} from "./types";

const { CHAT_TIMESTAMP, HOST } = CONFIG;

class Server {
    HOST = HOST;
    store: Store;
    chatInterval: NodeJS.Timer | null = null;
    showErrorCb: (error: TError) => void = () => {};

    constructor(store: Store) {
        this.store = store;
    }

    // посылает запрос и обрабатывает ответ
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

    async puff(): Promise<UserProgress | null> {
        const token = this.store.getToken() ?? ""
        const result = await this.request<UserProgress>('puff', {token});
        if (result) {
            return result;
        }
        return null;
    }

    async getUserProgress(): Promise<UserProgress | null> {
        const token = this.store.getToken() ?? ""
        const result = await this.request<UserProgress>('getUserProgress', {token});
        if (result) {
            return result;
        }
        return null;
    }


    async getUserVapes(): Promise<UserVapes | null> {
        const token = this.store.getToken() ?? ""
        const result = await this.request<Array<UserVapes>>('getUserVapes', {token});
        if (result) {
            return result[0];
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



    stopChatMessages(): void {
        if (this.chatInterval) {
            clearInterval(this.chatInterval);
            this.chatInterval = null;
            this.store.clearMessages();
        }
    }
}

export default Server;