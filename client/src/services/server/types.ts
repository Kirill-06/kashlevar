export type TError = {
    code: number;
    text: string;
}

export type TAnswer<T> = {
    result: 'ok' | 'error';
    data?: T;
    error?: TError;
}

export type TUser = {
    token: string;
    name: string;
}

export type TMessage = {
    message: string;
    author: string;
    created: string;
}

export type TMessages = TMessage[];
export type TMessagesResponse = {
    messages: TMessages;
    hash: string;
}

export type UserProgress = {
    user_id: Number;
    happines: Number;
    health: Number;
    coins: Number;
    last_played: string;

}


export type UserVapes = {
    
    id: Number;
    vape_id: Number;
    name: string;
    level: Number;
    health_change: Number;
    happiness_change: Number;
}




export type UserInfo = {
    
    id: Number;
    username: string;
}

export type updateHappines = {
    happiness: Number;
}
