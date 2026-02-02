import apiClient from './client';
import { Product, Sale, ProductRequest, User } from '@/types';
import {
    ApiCategory,
    ApiFournisseur,
    ApiProduit,
    ApiVente,
    ApiDemandeProduit,
    ApiUtilisateur,
} from './types';

// Helper: Transform API product to frontend Product
const transformProduct = (apiProduct: ApiProduit): Product => ({
    id: apiProduct.id.toString(),
    nom: apiProduct.nom,
    categorie: apiProduct.category?.nom || '',
    numeroLot: apiProduct.numero_lot,
    datePeremption: apiProduct.date_peremption.split('T')[0],
    quantiteBoites: apiProduct.quantite_boites,
    quantiteUnites: apiProduct.quantite_unites,
    prix: parseFloat(apiProduct.prix),
    fournisseur: apiProduct.fournisseur?.nom || '',
    description: apiProduct.description || '',
});

// Helper: Transform API vente to frontend Sale
const transformSale = (apiVente: ApiVente): Sale => ({
    id: apiVente.id.toString(),
    productId: apiVente.produit_id.toString(),
    productNom: apiVente.produit?.nom || '',
    quantiteVendue: apiVente.quantite_vendue,
    date: apiVente.date_vente.split('T')[0],
    userId: apiVente.utilisateur_id.toString(),
    userName: apiVente.utilisateur?.nom || '',
});

// Helper: Transform API demande to frontend Request
const transformRequest = (apiDemande: ApiDemandeProduit): ProductRequest => ({
    id: apiDemande.id.toString(),
    productId: apiDemande.produit_id?.toString(),
    productNom: apiDemande.produit?.nom || '',
    quantiteDemandee: apiDemande.quantite_demandee,
    commentaire: apiDemande.commentaire || '',
    status: apiDemande.status,
    userId: apiDemande.utilisateur_id.toString(),
    userName: apiDemande.utilisateur?.nom || '',
    dateCreation: apiDemande.date_creation.split('T')[0],
});

// Helper: Transform API user to frontend User
const transformUser = (apiUser: ApiUtilisateur & { role: 'ADMIN' | 'VENDEUR', badge_id: string, prenom: string }): User => ({
    id: apiUser.id.toString(),
    nom: apiUser.nom,
    prenom: apiUser.prenom,
    email: apiUser.email || '',
    password: '',
    role: apiUser.role,
    badgeId: apiUser.badge_id,
});

// Categories API
export const categoriesApi = {
    getAll: async (): Promise<ApiCategory[]> => {
        const { data } = await apiClient.get<ApiCategory[]>('/categories');
        return data;
    },
    create: async (nom: string): Promise<ApiCategory> => {
        const { data } = await apiClient.post<ApiCategory>('/categories', { nom });
        return data;
    },
};

// Fournisseurs API
export const fournisseursApi = {
    getAll: async (): Promise<ApiFournisseur[]> => {
        const { data } = await apiClient.get<ApiFournisseur[]>('/fournisseurs');
        return data;
    },
};

// Products API
export const productsApi = {
    getAll: async (): Promise<Product[]> => {
        const { data } = await apiClient.get<ApiProduit[]>('/produits');
        return data.map(transformProduct);
    },

    getById: async (id: string): Promise<Product> => {
        const { data } = await apiClient.get<ApiProduit>(`/produits/${id}`);
        return transformProduct(data);
    },

    create: async (product: Omit<Product, 'id'>, categorieId: number, fournisseurId: number): Promise<Product> => {
        const payload = {
            nom: product.nom,
            categorie_id: categorieId,
            fournisseur_id: fournisseurId,
            numero_lot: product.numeroLot,
            date_peremption: product.datePeremption,
            quantite_boites: product.quantiteBoites,
            quantite_unites: product.quantiteUnites,
            prix: product.prix,
            description: product.description,
        };
        const { data } = await apiClient.post<ApiProduit>('/produits', payload);
        return transformProduct(data);
    },

    update: async (id: string, updates: Partial<Product>, categorieId?: number, fournisseurId?: number): Promise<Product> => {
        const payload: any = {};
        if (updates.nom) payload.nom = updates.nom;
        if (categorieId) payload.categorie_id = categorieId;
        if (fournisseurId) payload.fournisseur_id = fournisseurId;
        if (updates.numeroLot) payload.numero_lot = updates.numeroLot;
        if (updates.datePeremption) payload.date_peremption = updates.datePeremption;
        if (updates.quantiteBoites !== undefined) payload.quantite_boites = updates.quantiteBoites;
        if (updates.quantiteUnites !== undefined) payload.quantite_unites = updates.quantiteUnites;
        if (updates.prix) payload.prix = updates.prix;
        if (updates.description !== undefined) payload.description = updates.description;

        const { data } = await apiClient.put<ApiProduit>(`/produits/${id}`, payload);
        return transformProduct(data);
    },

    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/produits/${id}`);
    },
};

// Sales API
export const salesApi = {
    getAll: async (): Promise<Sale[]> => {
        const { data } = await apiClient.get<ApiVente[]>('/ventes');
        return data.map(transformSale);
    },

    create: async (sale: Omit<Sale, 'id'>): Promise<Sale> => {
        const payload = {
            produit_id: parseInt(sale.productId),
            utilisateur_id: parseInt(sale.userId),
            quantite_vendue: sale.quantiteVendue,
            date_vente: sale.date || new Date().toISOString(),
        };
        const { data } = await apiClient.post<ApiVente>('/ventes', payload);
        return transformSale(data);
    },
};

// Requests API
export const requestsApi = {
    getAll: async (): Promise<ProductRequest[]> => {
        const { data } = await apiClient.get<ApiDemandeProduit[]>('/demandes-produits');
        return data.map(transformRequest);
    },

    create: async (request: Omit<ProductRequest, 'id' | 'status' | 'dateCreation'>): Promise<ProductRequest> => {
        const payload = {
            produit_id: request.productId ? parseInt(request.productId) : null,
            utilisateur_id: parseInt(request.userId),
            quantite_demandee: request.quantiteDemandee,
            commentaire: request.commentaire,
        };
        const { data } = await apiClient.post<ApiDemandeProduit>('/demandes-produits', payload);
        return transformRequest(data);
    },

    updateStatus: async (id: string, status: 'VALIDE' | 'REFUSE'): Promise<ProductRequest> => {
        const { data } = await apiClient.put<ApiDemandeProduit>(`/demandes-produits/${id}`, { status });
        return transformRequest(data);
    },
};

// Users API
export const usersApi = {
    getAll: async (): Promise<User[]> => {
        const { data } = await apiClient.get<any[]>('/users');
        return data.map(transformUser);
    },
};

// Auth API
export const authApi = {
    login: async (email: string, _password: string) => {
        const { data } = await apiClient.get<any[]>('/users');
        const user = data.find((u: any) => u.email === email);

        if (!user) {
            throw new Error('Identifiants incorrects');
        }

        return user;
    },
};
