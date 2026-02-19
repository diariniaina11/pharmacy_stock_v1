import axios from './axios';

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
