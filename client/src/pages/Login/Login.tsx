import React, { useContext, useRef } from 'react';
import { ServerContext } from '../../App';
import Button from '../../components/Button/Button';
import { IBasePage, PAGES } from '../PageManager';

import './Login.scss';

const UserIcon = () => (
    <svg className="input-icon" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
        <path d="M4 20c0-4 4-6 8-6s8 2 8 6" stroke="currentColor" strokeWidth="2" />
    </svg>
);

const LockIcon = () => (
    <svg className="input-icon" viewBox="0 0 24 24" fill="none">
        <rect x="6" y="11" width="12" height="8" rx="2" stroke="currentColor" strokeWidth="2" />
        <path d="M12 15v2" stroke="currentColor" strokeWidth="2" />
        <path d="M8 11V8a4 4 0 1 1 8 0v3" stroke="currentColor" strokeWidth="2" />
    </svg>
);

const Login: React.FC<IBasePage> = (props: IBasePage) => {
    const { setPage } = props;
    const server = useContext(ServerContext);
    const loginRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);

    const [error, setError] = React.useState<string>("");

    const loginClickHandler = async () => {
        if (loginRef.current && passwordRef.current) {
            const login = loginRef.current.value;
            const password = passwordRef.current.value;
            if (!login || !password) {
                setError("Заполните все поля");
                return;
            }
try {
                const response = await server.login(login, password);


                setError("");
                setPage(PAGES.CHAT); 
            } catch (err) {
                console.error(err);
                setError("Ошибка соединения с сервером");
            }
        }
    }

    return (
        <div className='login'>
            <div className='login-left'>
                <div className='login-logo'>К.</div>
                <div className='login-title'>Вход</div>
                <div className='login-description'>
                    Добро пожаловать!<br />Введите свои данные для входа.
                </div>
                <div className='login-wrapper'>
                    <div className='login-inputs'>
                        <div className="input-icon-wrapper">
                            <input ref={loginRef} placeholder='Логин' />
                            <UserIcon />
                        </div>
                        <div className="input-icon-wrapper">
                            <input ref={passwordRef} placeholder='Пароль' type='password' />
                            <LockIcon />
                        </div>
                    </div>
                    {error && <div className="login-error">{error}</div>}
                    <div className='login-register'>
                        Нет аккаунта?
                        <a href="#" onClick={() => setPage(PAGES.REGISTER)}>Зарегистрироваться</a>
                    </div>
                    <div className='login-buttons'>
                        <Button onClick={loginClickHandler} text='Войти' />
                    </div>
                </div>
            </div>
            <div className='login-divider' />
            <div className='login-right'>
                <div className='login-right-text'>
                    Кашлевар
                </div>
            </div>
        </div>
    )
}

const Register: React.FC<IBasePage> = (props: IBasePage) => {
    const { setPage } = props;
    const server = useContext(ServerContext);
    const nameRef = useRef<HTMLInputElement>(null);
    const loginRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);

    const [error, setError] = React.useState<string>("");

    const registerClickHandler = async () => {
        console.log('hi')
        if (nameRef.current && passwordRef.current) {
            const name = nameRef.current.value.trim();
            const password = passwordRef.current.value.trim();

            if (!name || !password) {
                setError("Заполните все поля");
                return;
            }

            try {
                const response = await server.registration(name, password);
                setPage(PAGES.START); 
            } catch (err) {
                console.error(err);
                setError("Ошибка соединения с сервером");
            }
        }
    };


    return (
        <div className='login'>
            <div className='login-left'>
                <div className='login-logo'>К.</div>
                <div className='login-title'>Регистрация</div>
                <div className='login-description'>
                    Введите имя, логин и пароль для создания аккаунта.
                </div>
                <div className='login-wrapper'>
                    <div className='login-inputs'>
                        <div className="input-icon-wrapper">
                            <input ref={nameRef} placeholder='Имя' />
                            <UserIcon />
                        </div>
                        <div className="input-icon-wrapper">
                            <input ref={passwordRef} placeholder='Пароль' type='password' />
                            <LockIcon />
                        </div>
                    </div>
                    {error && <div className="login-error">{error}</div>}
                    <div className='login-register'>
                        Уже есть аккаунт?
                        <a href="#" onClick={() => setPage(PAGES.LOGIN)}>Войти</a>
                    </div>
                    <div className='login-buttons'>
                        <Button onClick={registerClickHandler} text='Начать' />
                    </div>
                </div>
            </div>
            <div className='login-divider' />
            <div className='login-right'>
                <div className='login-right-text'>
                    Кашлевар
                </div>
            </div>
        </div>
    )
}

export default Login;
export { Register };
