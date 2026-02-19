import { useState, createContext, useEffect, ReactNode } from "react";
import { verifyUserWithServer, isUserDataValid } from "@/api/authService";

interface User {
  id?: string;
  prenom?: string;
  nom?: string;
  email?: string;
  role?: string;
  [key: string]: any;
}

interface AuthContextType {
  auth: User | null;
  setAuth: (auth: User | null) => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [auth, setAuth] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Vérifier l'authentification au chargement de l'application
  useEffect(() => {
    const initializeAuth = async () => {
      const storedUser = localStorage.getItem('user');
      
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          
          // Vérification 1: Les données sont-elles valides structurellement?
          if (!isUserDataValid(user)) {
            console.warn('Données utilisateur invalides ou incomplètes');
            localStorage.removeItem('user');
            setAuth(null);
            setIsAuthenticated(false);
            setIsLoading(false);
            return;
          }
          
          // Vérification 2: L'utilisateur existe-t-il auprès du serveur?
          const isValidOnServer = await verifyUserWithServer(user);
          
          if (!isValidOnServer) {
            console.warn('Utilisateur non validé par le serveur - suppression des données');
            localStorage.removeItem('user');
            setAuth(null);
            setIsAuthenticated(false);
            setIsLoading(false);
            return;
          }
          
          // Toutes les vérifications passées ✅
          setAuth(user);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Erreur lors du parsing/vérification de l\'utilisateur:', error);
          localStorage.removeItem('user');
          setAuth(null);
          setIsAuthenticated(false);
        }
      } else {
        setAuth(null);
        setIsAuthenticated(false);
      }
      
      setIsLoading(false);
    };
    
    initializeAuth();
  }, []);

  const handleSetAuth = (user: User | null) => {
    if (user) {
      // Vérifier que les données sont valides avant de les accepter
      if (!isUserDataValid(user)) {
        console.warn('Tentative de définir un utilisateur avec des données invalides');
        setAuth(null);
        setIsAuthenticated(false);
        localStorage.removeItem('user');
        return;
      }
      
      setAuth(user);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      setAuth(null);
      setIsAuthenticated(false);
      localStorage.removeItem('user');
    }
  };

  const logout = () => {
    // Nettoyer complètement le localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('pharmacy_products');
    localStorage.removeItem('pharmacy_sales');
    localStorage.removeItem('pharmacy_requests');
    
    setAuth(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        auth,
        setAuth: handleSetAuth,
        isAuthenticated,
        isLoading,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;