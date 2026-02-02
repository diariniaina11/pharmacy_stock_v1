// API Response types matching Laravel backend structure
export interface ApiCategory {
    id: number;
    nom: string;
}

export interface ApiFournisseur {
    id: number;
    nom: string;
    telephone: string | null;
    email: string | null;
}

export interface ApiUtilisateur {
    id: number;
    nom: string;
    email: string | null;
}

export interface ApiProduit {
    id: number;
    nom: string;
    categorie_id: number;
    fournisseur_id: number;
    numero_lot: string;
    date_peremption: string;
    quantite_boites: number;
    quantite_unites: number;
    prix: string;
    description: string | null;
    created_at?: string;
    updated_at?: string;
    category?: ApiCategory;
    fournisseur?: ApiFournisseur;
}

export interface ApiVente {
    id: number;
    produit_id: number;
    utilisateur_id: number;
    quantite_vendue: number;
    date_vente: string;
    produit?: ApiProduit;
    utilisateur?: ApiUtilisateur;
}

export interface ApiDemandeProduit {
    id: number;
    produit_id: number | null;
    utilisateur_id: number;
    quantite_demandee: number;
    commentaire: string | null;
    status: 'EN_ATTENTE' | 'VALIDE' | 'REFUSE';
    date_creation: string;
    produit?: ApiProduit;
    utilisateur?: ApiUtilisateur;
}
