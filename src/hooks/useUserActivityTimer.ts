import { useEffect, useRef } from 'react';
import { updateUserActivity } from '@/api/authService';

/**
 * Hook personnalisé pour gérer la mise à jour périodique de l'activité utilisateur
 * Place le timer à un niveau plus haut pour éviter les réinitialisations
 * @param userId - L'ID de l'utilisateur connecté
 * @param interval - Intervalle en millisecondes (par défaut 60000 = 1 minute)
 */
export const useUserActivityTimer = (userId: string | number | null, interval: number = 60000) => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Utiliser useRef pour éviter les réinitialisations
    if (!userId) {
      // Nettoyer l'intervalle si pas d'utilisateur
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Mise à jour immédiate au démarrage
    updateUserActivity(userId);

    // Créer l'intervalle une seule fois
    if (!intervalRef.current) {
      intervalRef.current = setInterval(() => {
        if (userId) {
          updateUserActivity(userId);
        }
      }, interval);
    }

    // Cleanup uniquement si on se déconnecte
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [userId, interval]);
};
