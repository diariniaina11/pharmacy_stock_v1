export type UserRole = 'ADMIN' | 'VENDEUR';

export interface User {
  id?: string;
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
  categorie_id: number;
  numeroLot: string;
  datePeremption: string;
  quantiteBoites: number;
  quantiteUnites: number;
  prix: number;
  fournisseur: string;
  fournisseur_id: number;
  description: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Sale {
  id: string;
  product_id: string;
  product_nom: string;
  quantite_vendue: number;
  date_vente: string;
  user_id: string;
  userName: string;
  createdAt?: string;
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
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAdmin: boolean;
}

export interface ApiCategory {
  id: number;
  nom: string;
}

export interface ApiFournisseur {
  id: number;
  nom: string;
}

export interface SystemLog {
  id: number;
  date: string;
  action: string;
  info: string;
  user: string | number;
  created_at: string;
  updated_at: string;
}

export interface HistoryItem {
  id: string;
  type: 'sale' | 'product' | 'request' | 'category' | 'unknown';
  action: string;
  userId?: string;
  userName?: string;
  productId?: string;
  productNom?: string;
  quantity?: number;
  previousQuantity?: number;
  newQuantity?: number;
  date: string;
  info?: string;
}
