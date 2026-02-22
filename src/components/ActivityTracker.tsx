import { useAuth } from '@/hooks/useAuth';
import { useUserActivityTimer } from '@/hooks/useUserActivityTimer';

/**
 * Composant qui gère la mise à jour périodique de l'activité utilisateur
 * Doit être placé au niveau racine de l'app pour garantir le fonctionnement du timer
 */
export const ActivityTracker = () => {
  const { auth, isAuthenticated } = useAuth();
  
  // Le timer continue même si d'autres composants se démontent
  useUserActivityTimer(isAuthenticated ? auth?.id : null, 60000);

  // Ce composant n'affiche rien, il gère just le timer en arrière-plan
  return null;
};

export default ActivityTracker;
