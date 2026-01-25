export type UserRole = 'ADMIN' | 'VENDEUR';

export interface User {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  password: string;
  role: UserRole;
  badgeId: string;
}

export interface Product {
  id: string;
  nom: string;
  categorie: string;
  numeroLot: string;
  datePeremption: string;
  quantiteBoites: number;
  quantiteUnites: number;
  prix: number;
  fournisseur: string;
  description: string;
}

export interface Sale {
  id: string;
  productId: string;
  productNom: string;
  quantiteVendue: number;
  date: string;
  userId: string;
  userName: string;
}

export interface ProductRequest {
  id: string;
  productId?: string;
  productNom: string;
  quantiteDemandee: number;
  commentaire: string;
  status: 'EN_ATTENTE' | 'VALIDE' | 'REFUSE';
  userId: string;
  userName: string;
  dateCreation: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  isAdmin: boolean;
}
