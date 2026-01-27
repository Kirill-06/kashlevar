import React, { useContext, useEffect, useState } from 'react';
import { ServerContext } from '../../App';
import { IBasePage, PAGES } from '../PageManager';
import { RatingResponse, RatingRow } from '../../services/server/types';
import './Rating.scss';

const formatDuration = (seconds: number): string => {
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);

    const parts: string[] = [];
    if (d > 0) parts.push(`${d} д`);
    if (h > 0) parts.push(`${h} ч`);
    if (m > 0 || parts.length === 0) parts.push(`${m} мин`);

    return parts.join(' ');
};

const Rating: React.FC<IBasePage> = ({ setPage }) => {
    const server = useContext(ServerContext);

    const [rows, setRows] = useState<RatingRow[]>([]);
    const [userRow, setUserRow] = useState<RatingResponse['user'] | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        let isMounted = true;

        const load = async () => {
            if (!server) return;
            setLoading(true);

            const res = await server.getRating();
            if (!isMounted) return;

            if (res) {
                setRows(res.rating || []);
                setUserRow(res.user || null);
                setError('');
            } else {
                setError('Не удалось загрузить рейтинг');
            }

            if (isMounted) setLoading(false);
        };

        void load();

        return () => {
            isMounted = false;
        };
    }, [server]);

    const goBack = () => setPage(PAGES.MAIN_SCREEN);

    return (
        <div className="rating">
            <div className="rating-inner">
                <div className="rating-header">
                    <button
                        className="rating-backBtn"
                        type="button"
                        onClick={goBack}
                    >
                        ← Назад
                    </button>
                    <h1 className="rating-title">Рейтинг выживших</h1>
                </div>

                {userRow && (
                    <div className="rating-userPanel">
                        <div className="rating-userPanel-title">Ваше место</div>
                        <div className="rating-userPanel-row">
                            <span className="rating-userPanel-pos">
                                #{userRow.position}
                            </span>
                            <span className="rating-userPanel-name">
                                {userRow.username}
                            </span>
                            <span className="rating-userPanel-status">
                                {userRow.status === 'alive' ? 'Жив' : 'Мёртв'}
                            </span>
                            <span className="rating-userPanel-time">
                                В игре: {formatDuration(userRow.alive_seconds)}
                            </span>
                        </div>
                    </div>
                )}

                {loading && <div className="rating-state">Загрузка...</div>}
                {error && !loading && (
                    <div className="rating-state rating-state_error">{error}</div>
                )}

                {!loading && !error && (
                    <div className="rating-tableWrap">
                        <table className="rating-table">
                            <thead>
                            <tr>
                                <th>#</th>
                                <th>Игрок</th>
                                <th>Статус</th>
                                <th>HP</th>
                                <th>Счастье</th>
                                <th>Время жизни</th>
                            </tr>
                            </thead>
                            <tbody>
                            {rows.map((row) => (
                                <tr
                                    key={row.person_id}
                                    className={
                                        userRow &&
                                        userRow.person_id === row.person_id
                                            ? 'rating-row rating-row_me'
                                            : 'rating-row'
                                    }
                                >
                                    <td>{row.position}</td>
                                    <td>{row.username}</td>
                                    <td>
                                        {row.status === 'alive'
                                            ? 'Жив'
                                            : 'Мёртв'}
                                    </td>
                                    <td>{row.hp}</td>
                                    <td>{row.happines}</td>
                                    <td>{formatDuration(row.alive_seconds)}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Rating;