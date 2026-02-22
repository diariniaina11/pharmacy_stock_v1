import axios from './axios';

/**
 * Met à jour l'activité de l'utilisateur (updated_at)
 * @param userId - L'ID de l'utilisateur
 * @returns true si la mise à jour est réussie
 */
export const updateUserActivity = async (userId: string | number): Promise<boolean> => {
  try {
    if (!userId) {
      console.warn('Pas d\'ID utilisateur pour mettre à jour l\'activité');
      return false;
    }

    // Formater la date au format MySQL: "2026-02-03 11:38:07"
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    const formatted = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    
    const response = await axios.patch(`/users/${userId}`, {
      updated_at: formatted,
    });

    if (response.status === 200 || response.status === 204) {
      return true;
    }
    return false;
  } catch (error: any) {
    console.error('Erreur lors de la mise à jour de l\'activité utilisateur:', error);
    return false;
  }
};

/**
 * Vérifie l'authenticité d'un utilisateur auprès du serveur
 * @param user - Les données utilisateur du localStorage
 * @returns true si l'utilisateur est valide, false sinon
 */
export const verifyUserWithServer = async (user: any): Promise<boolean> => {
  try {
    // Si l'utilisateur n'a pas d'identifiant, on ne peut pas le vérifier
    if (!user || (!user.email && !user.id)) {
      return false;
    }

    // Essayer de vérifier l'utilisateur via une requête API
    // Utiliser l'email comme identifiant principal
    const identifier = user.email || user.id;
    const response = await axios.get(`/users/${encodeURI(identifier)}`);
    
    // Si la requête est successful, vérifier que les données correspondent
    if (response.data) {
      // Vérifier que les données clés correspondent
      const isValid = 
        response.data.email === user.email ||
        response.data.id === user.id ||
        (response.data.prenom === user.prenom && response.data.nom === user.nom);
      
      return isValid;
    }
    
    return false;
  } catch (error: any) {
    // Si la requête échoue (utilisateur non trouvé, serveur down, etc.)
    console.error('Erreur lors de la vérification de l\'utilisateur:', error);
    return false;
  }
};

/**
 * Valide les données essentielles de l'utilisateur
 * @param user - Les données utilisateur
 * @returns true si les données sont valides
 */
export const isUserDataValid = (user: any): boolean => {
  if (!user) return false;
  
  // Vérifier que les champs essentiels existent
  const hasEssentialFields = 
    (user.email || user.id) && // Au moins email ou id
    (user.prenom || user.nom); // Au moins prénom ou nom
  
  return hasEssentialFields;
};
