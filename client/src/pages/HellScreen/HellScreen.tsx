import React, { useContext, useEffect, useRef, useState } from 'react';
import { ServerContext, StoreContext } from '../../App';
import { IBasePage, PAGES } from '../PageManager';
import { TMessages, THellTasksSet, THellSolvePayload } from '../../services/server/types';
import Button from '../../components/Button/Button';

import './HellScreen.scss';

const CHAT_POLL_INTERVAL = 3000;

const HellScreen: React.FC<IBasePage> = ({ setPage }) => {
    const server = useContext(ServerContext);
    const store = useContext(StoreContext);
    const user = store.getUser();

    const [messages, setMessages] = useState<TMessages>([]);
    const [hellTasks, setHellTasks] = useState<THellTasksSet | null>(null);

    const [answers, setAnswers] = useState({
        quadratic: '',
        cubic: '',
        quartic: '',
    });

    const [submitStatus, setSubmitStatus] =
        useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [submitMessage, setSubmitMessage] = useState('');

    const messageRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!server) return;

        let isMounted = true;

        const loadMessages = async () => {
            if (!server) return;
            const res = await server.getMessages();
            if (!isMounted || !res) return;

            if (Array.isArray(res.messages)) {
                setMessages(res.messages);
            }
        };

        loadMessages();
        const id = window.setInterval(loadMessages, CHAT_POLL_INTERVAL);

        return () => {
            isMounted = false;
            window.clearInterval(id);
            server.stopChatMessages();
        };
    }, [server]);

    const sendChatMessage = () => {
        if (!server || !messageRef.current) return;
        const msg = messageRef.current.value.trim();
        if (!msg) return;
        server.sendMessage(msg);
        messageRef.current.value = '';
    };

    const loadHellTasks = async () => {
        if (!server) return;
        const data = await server.getHellTasks();
        if (!data) return;

        setHellTasks(data);
        setAnswers({
            quadratic: '',
            cubic: '',
            quartic: '',
        });
        setSubmitStatus('idle');
        setSubmitMessage('');
    };

    useEffect(() => {
        loadHellTasks();
    }, [server]);

    const parseRoots = (value: string): number[] => {
        return value
            .split(/[ ,;]+/)
            .map((v) => v.replace(',', '.'))
            .map((v) => Number(v))
            .filter((v) => !Number.isNaN(v));
    };

    const handleAnswerChange = (key: 'quadratic' | 'cubic' | 'quartic', value: string) => {
        setAnswers((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const handleTasksSubmit = async () => {
        if (!server || !hellTasks) return;

        const payload: THellSolvePayload = {
            quadratic: {
                a: hellTasks.quadratic.a,
                b: hellTasks.quadratic.b,
                c: hellTasks.quadratic.c!,
                answers: parseRoots(answers.quadratic),
            },
            cubic: {
                a: hellTasks.cubic.a,
                b: hellTasks.cubic.b,
                c: hellTasks.cubic.c!,
                d: hellTasks.cubic.d!,
                answers: parseRoots(answers.cubic),
            },
            quartic: {
                a: hellTasks.quartic.a,
                b: hellTasks.quartic.b,
                c: hellTasks.quartic.c!,
                d: hellTasks.quartic.d!,
                e: hellTasks.quartic.e!,
                answers: parseRoots(answers.quartic),
            },
        };

        setSubmitStatus('loading');
        setSubmitMessage('');

        const res = await server.solveHellTasks(payload);
        if (!res) {
            setSubmitStatus('error');
            setSubmitMessage('Адский сервер что-то пошёл по кругу. Попробуй ещё раз.');
            return;
        }

        if (res.resurrected) {
            setSubmitStatus('success');
            setSubmitMessage(
                `Ты решил правильно ${res.solved_count} из 3 заданий. Демоны отпустили тебя в мир живых! `
            );

            setTimeout(() => {
                setPage(PAGES.MAIN_SCREEN);
            }, 1500);
        } else {
            setSubmitStatus('error');
            setSubmitMessage(
                `Решено правильно: ${res.solved_count} из 3. Нужно минимум ${hellTasks.required_success}. Остаться ещё немного в Аду. `
            );
        }
    };
    const splitQuestion = (q: string) => {
        let title = q;
        let equation = '';
        let hint = '';

        const colonIndex = q.indexOf(':');
        if (colonIndex !== -1) {
            title = q.slice(0, colonIndex).trim();          
            const rest = q.slice(colonIndex + 1).trim();    

            const dotIndex = rest.indexOf('.');
            if (dotIndex !== -1) {
                equation = rest.slice(0, dotIndex).trim();  
                hint = rest.slice(dotIndex + 1).trim();     
            } else {
                equation = rest;
            }
        }

        return { title, equation, hint };
    };

    const toLogin = () => {
        store.clearUser();
        store.clearUserInfo();
        store.clearMessages();
        setPage(PAGES.LOGIN);
    };

    const quadraticParts = hellTasks ? splitQuestion(hellTasks.quadratic.question) : null;
    const cubicParts     = hellTasks ? splitQuestion(hellTasks.cubic.question) : null;
    const quarticParts   = hellTasks ? splitQuestion(hellTasks.quartic.question) : null;

    if (!user) {
        return (
            <div className="hell">
                <div className="hell-center">
                    <h1>Ад</h1>
                    <p>Не удалось получить данные пользователя.</p>
                    <Button text="На вход" onClick={toLogin} />
                </div>
            </div>
        );
    }

    return (
        <div className="hell">
            <div className="hell-left">
                <h1 className="hell-title">Ты умер</h1>
                <p className="hell-subtitle">
                    Добро пожаловать в Ад. Реши несколько уравнений, чтобы искупить свои грехи.
                </p>

                <div className="hell-task">
                    {!hellTasks && (
                        <div className="hell-task-loading">Демоны придумывают задания...</div>
                    )}

                    {hellTasks && quadraticParts && cubicParts && quarticParts && (
                        <>
                            <div className="hell-task-block">
                                <div className="hell-task-label">Задание 1 — квадратное</div>

                                <div className="hell-task-title">{quadraticParts.title}</div>

                                <div className="hell-task-equation">
                                    {quadraticParts.equation}
                                </div>

                                {quadraticParts.hint && (
                                    <div className="hell-task-hint">{quadraticParts.hint}</div>
                                )}

                                <input
                                    className="hell-task-input"
                                    type="text"
                                    value={answers.quadratic}
                                    onChange={(e) => handleAnswerChange('quadratic', e.target.value)}
                                    placeholder="Корни через пробел или запятую (например: 1 2)"
                                />
                            </div>

                            <div className="hell-task-block">
                                <div className="hell-task-label">Задание 2 — кубическое</div>

                                <div className="hell-task-title">{cubicParts.title}</div>

                                <div className="hell-task-equation">
                                    {cubicParts.equation}
                                </div>

                                {cubicParts.hint && (
                                    <div className="hell-task-hint">{cubicParts.hint}</div>
                                )}

                                <input
                                    className="hell-task-input"
                                    type="text"
                                    value={answers.cubic}
                                    onChange={(e) => handleAnswerChange('cubic', e.target.value)}
                                    placeholder="Корни через пробел или запятую"
                                />
                            </div>

                            <div className="hell-task-block">
                                <div className="hell-task-label">Задание 3 — четвёртой степени</div>

                                <div className="hell-task-title">{quarticParts.title}</div>

                                <div className="hell-task-equation">
                                    {quarticParts.equation}
                                </div>

                                {quarticParts.hint && (
                                    <div className="hell-task-hint">{quarticParts.hint}</div>
                                )}

                                <input
                                    className="hell-task-input"
                                    type="text"
                                    value={answers.quartic}
                                    onChange={(e) => handleAnswerChange('quartic', e.target.value)}
                                    placeholder="Корни через пробел или запятую"
                                />
                            </div>

                            <Button
                                text={
                                    submitStatus === 'loading'
                                        ? 'Считаем твои грехи...'
                                        : 'Отправить ответы'
                                }
                                onClick={handleTasksSubmit}
                            />
                        </>
                    )}

                    {submitStatus !== 'idle' && submitMessage && (
                        <div
                            className={
                                'hell-task-status ' +
                                (submitStatus === 'success'
                                    ? 'hell-task-status_success'
                                    : 'hell-task-status_error')
                            }
                        >
                            {submitMessage}
                        </div>
                    )}
                </div>

                <div className="hell-controls">
                  
                    <Button text="Выйти из игры" onClick={toLogin} />
                </div>
            </div>

            <div className="hell-right">
                <h2 className="hell-chatTitle">Чат грешников</h2>
                <div className="hell-chatUser">Ты в аду, {user.name}</div>

                <div className="hell-chatMessages">
                    {(messages ?? [])
                        .slice()
                        .reverse()
                        .map((m, idx) => (
                            <div key={idx} className="hell-chatMessage">
                                <span className="hell-chatAuthor">{m.author}</span>
                                <span className="hell-chatText">: {m.message}</span>
                            </div>
                        ))}
                </div>

                <div className="hell-chatInputRow">
                    <input
                        ref={messageRef}
                        className="hell-chatInput"
                        placeholder="сообщение в адском чате..."
                    />
                    <Button text="Отправить" onClick={sendChatMessage} />
                </div>
            </div>
        </div>
    );
};

export default HellScreen;