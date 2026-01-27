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
    messages?: TMessages;
    hash: string;
};

export type UserProgress = {
    hp: Number;
    happines: Number;
    status: Number;
}


export type UserVapes = {
    id: number;
    type: string;
    name: string;
    level: number;
    current_value: number;
};

export type UserInfo = {
    id: Number;
    username: string;
    money: Number;
}

export type ShopItem = {
    id: number;
    name: string;
    cost: number;
    type: string;
    value: number;
};

export type RefillResult = {
    itemId: number;
    current_value: number;
    money: number;
    refill_cost: number;
};

export type UpgradeResult = {
    itemId: number;
    level: number;
};

export type RatingRow = {
    user_id: number;
    username: string;
    person_id: number;
    status: string;
    hp: number;
    happines: number;
    alive_seconds: number;
    position: number;
};

export type RatingResponse = {
    rating: RatingRow[];
    user: {
        user_id: number;
        username: string;
        person_id: number;
        position: number;
        alive_seconds: number;
        status: string;
    } | null;
};

export type THellEquationTask = {
    degree: number;
    a: number;
    b: number;
    c?: number;
    d?: number;
    e?: number;
    question: string;
};

export type THellTasksSet = {
    quadratic: THellEquationTask;
    cubic: THellEquationTask;
    quartic: THellEquationTask;
    required_success: number;
};

export type THellSolvePayload = {
    quadratic: {
        a: number;
        b: number;
        c: number;
        answers: number[];
    };
    cubic: {
        a: number;
        b: number;
        c: number;
        d: number;
        answers: number[];
    };
    quartic: {
        a: number;
        b: number;
        c: number;
        d: number;
        e: number;
        answers: number[];
    };
};

export type THellSolveResult = {
    resurrected: boolean;
    solved_count: number;
};

export type TowerJoinResponse = {
  active: boolean;
  x: number;
  y: number;
};

export type TowerMoveResponse = {
  x: number;
  y: number;
  direction: string;   
  moveStatus: string;  
};

export type TowerScenePerson = {
  person_id: number;
  user_id: number;
  username: string;
  x: number;
  y: number;
  direction: string;
  movestatus: string;
  hp: number;
  happines: number;
  status: string;
};

export type TowerSceneItem = {
  id: number;
  kind: 'coin' | 'tablet';
  value: number;
  x: number;
  y: number;
};

export type TowerSceneUpdate = {
  personsHash: string;
  itemsHash: string;
  persons?: TowerScenePerson[];
  items?: TowerSceneItem[];
  picked?: any;
};