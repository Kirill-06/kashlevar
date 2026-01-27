import { useEffect, useState } from 'react';
import { PAGES } from '../../PageManager';
import { UserInfo, UserProgress, UserVapes } from '../../../services/server/types';

export type MainStats = {
  userProgress: UserProgress | null;
  userVapes: UserVapes[];
  userInfo: UserInfo | null;
};

export const normalizeVapes = (vapes: unknown): UserVapes[] => {
  if (Array.isArray(vapes)) return vapes as UserVapes[];
  if (vapes) return [vapes as UserVapes];
  return [];
};

const UPDATE_INTERVAL_MS = 5 * 1000;

export const useMainStats = (
  server: any,
  setPage: (p: any) => void,
  updateIntervalMs: number = UPDATE_INTERVAL_MS,
) => {
  const [stats, setStats] = useState<MainStats>({
    userProgress: null,
    userVapes: [],
    userInfo: null,
  });

  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;

    const fetchInitial = async () => {
      if (!server) return;

      const [progress, user, vapes] = await Promise.all([
        server.getUserProgress(),
        server.getUserInfo(),
        server.getInventory(),
      ]);

      if (!mounted) return;

      const vapesList = normalizeVapes(vapes);

      setStats({
        userProgress: progress ?? null,
        userInfo: user ?? null,
        userVapes: vapesList,
      });

      const hp = progress ? Number(progress.hp ?? 0) : 0;
      if (hp <= 0) {
        setPage(PAGES.HELL);
      }

      setError('');
      setLoading(false);
    };

    const updateUserProgress = async () => {
      if (!server) return;

      const progress = await server.updateHappinessAfterOfline();
      if (!progress) return;
      if (!mounted) return;

      setStats(prev => ({
        ...prev,
        userProgress: progress,
      }));

      const hp = Number(progress.hp ?? 0);
      if (hp <= 0) {
        setPage(PAGES.HELL);
      }
    };

    void fetchInitial();

    const id = window.setInterval(() => {
      void updateUserProgress();
    }, updateIntervalMs);

    return () => {
      mounted = false;
      window.clearInterval(id);
    };
  }, [server, setPage, updateIntervalMs]);

  return {
    stats,
    setStats,
    loading,
    error,
    setError,
  };
};
