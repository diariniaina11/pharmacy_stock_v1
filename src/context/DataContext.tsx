import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, Sale, ProductRequest } from '../types';
import { MOCK_PRODUCTS, MOCK_SALES, MOCK_REQUESTS } from '../data/mock';

interface DataContextType {
    products: Product[];
    sales: Sale[];
    requests: ProductRequest[];
    addProduct: (product: Product) => void;
    updateProduct: (product: Product) => void;
    deleteProduct: (productId: string) => void;
    addSale: (sale: Sale) => void;
    addRequest: (request: ProductRequest) => void;
    validateRequest: (request: ProductRequest) => void;
    rejectRequest: (requestId: string) => void;
    refreshData: () => void; // Reset to mock data if needed
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [sales, setSales] = useState<Sale[]>([]);
    const [requests, setRequests] = useState<ProductRequest[]>([]);

    // Initialize data from localStorage or Mock
    useEffect(() => {
        const storedProducts = localStorage.getItem('pharmacy_products');
        const storedSales = localStorage.getItem('pharmacy_sales');
        const storedRequests = localStorage.getItem('pharmacy_requests');

        if (storedProducts) setProducts(JSON.parse(storedProducts));
        else {
            setProducts(MOCK_PRODUCTS);
            localStorage.setItem('pharmacy_products', JSON.stringify(MOCK_PRODUCTS));
        }

        if (storedSales) setSales(JSON.parse(storedSales));
        else {
            setSales(MOCK_SALES);
            localStorage.setItem('pharmacy_sales', JSON.stringify(MOCK_SALES));
        }

        if (storedRequests) setRequests(JSON.parse(storedRequests));
        else {
            setRequests(MOCK_REQUESTS);
            localStorage.setItem('pharmacy_requests', JSON.stringify(MOCK_REQUESTS));
        }
    }, []);

    // Persistence helpers
    const saveProducts = (newProducts: Product[]) => {
        setProducts(newProducts);
        localStorage.setItem('pharmacy_products', JSON.stringify(newProducts));
    };

    const saveSales = (newSales: Sale[]) => {
        setSales(newSales);
        localStorage.setItem('pharmacy_sales', JSON.stringify(newSales));
    };

    const saveRequests = (newRequests: ProductRequest[]) => {
        setRequests(newRequests);
        localStorage.setItem('pharmacy_requests', JSON.stringify(newRequests));
    };

    // Actions
    const addProduct = (product: Product) => {
        const newProducts = [...products, product];
        saveProducts(newProducts);
    };

    const updateProduct = (updatedProduct: Product) => {
        const newProducts = products.map(p => p.id === updatedProduct.id ? updatedProduct : p);
        saveProducts(newProducts);
    };

    const deleteProduct = (productId: string) => {
        const newProducts = products.filter(p => p.id !== productId);
        saveProducts(newProducts);
    };

    const addSale = (sale: Sale) => {
        const newSales = [sale, ...sales];
        saveSales(newSales);

        // Update stock
        const product = products.find(p => p.id === sale.productId);
        if (product) {
            /* 
               Logic: Decrement boxes or units? 
               Simplification: We assume we sell by "unit" here for general sales, 
               or we handle boxes logic if we want. 
               Let's assume the sale quantity is in "units" (boites * units_per_boie + units_loose). 
               OR simpler: "QuantitySold" is usually boxes for wholesale or units for retail. 
               Let's assume "QuantitySold" subtracts from "Quantité (Boîtes)" for now as it's a pharmacy management, 
               often dealing with boxes. If units are sold, logic gets complex (decrement unit, if < 0 decrement box...).
               
               Let's stick to: we act on `quantiteBoite` as the primary stock indicator for simplicity unless `quantiteBoite` is 0.
               Realistically, let's just decrement `quantiteBoite` strictly for this MVP.
            */
            const updatedProduct = {
                ...product,
                quantiteBoite: Math.max(0, product.quantiteBoite - sale.quantitySold)
            };
            updateProduct(updatedProduct);
        }
    };

    const addRequest = (request: ProductRequest) => {
        const newRequests = [request, ...requests];
        saveRequests(newRequests);
    };

    const validateRequest = (request: ProductRequest) => {
        // 1. Update status
        const newRequests = requests.filter(r => r.id !== request.id); // Remove or keep as archived? Req says: list validated? Or history?
        // "Page pour les admins listant les demandes" -> "Boutons : Valider / Refuser" -> "Si validé → ajout automatique au stock"
        // Usually requests are removed from pending list. Let's remove from pending list.
        saveRequests(newRequests);

        // 2. Add to stock
        // Check if product exists (by name?) or create new. Mock data has IDs.
        // The request usually is for "adding products" -> "Produit, Quantité, ...". 
        // It might mean replenishing existing product OR new product.
        // Let's search by Name.
        const existingProduct = products.find(p => p.nom.toLowerCase() === request.productName.toLowerCase());
        if (existingProduct) {
            // Replenish
            updateProduct({
                ...existingProduct,
                quantiteBoite: existingProduct.quantiteBoite + request.quantity
            });
        } else {
            // Create new product stub (Admin would ideally fill details, but "auto add" implies defaults or it's just a stock req for existing)
            // If it's a new product request, we might need more fields. 
            // For this MVP, if product not found, we create a basic entry or asking admin to fill details?
            // Let's assume it works best for RE-STOCKING. For NEW products, Admin should use "Add Product" page.
            // But "Demandes d’Ajout de Produits (VENDEUR)" -> "Les vendeurs ne peuvent pas ajouter directement des produits".
            // Use Case: Seller sees a new drug "X" is needed. Requests "X". Admin validates -> Create "X"?
            // Detailed implementations usually redirect Admin to "Add Product Form" pre-filled.
            // Simpler for MVP: If not found, create a dummy product with 0 price/details that Admin edits later.
            addProduct({
                id: crypto.randomUUID(),
                nom: request.productName,
                categorie: 'Non classé',
                numLot: 'PENDING',
                datePeremption: '2099-12-31',
                quantiteBoite: request.quantity,
                quantiteUnite: 0,
                prix: 0,
                fournisseur: 'Inconnu',
                description: 'Généré depuis une demande validée'
            });
        }
    };

    const rejectRequest = (requestId: string) => {
        const newRequests = requests.filter(r => r.id !== requestId);
        saveRequests(newRequests);
    };

    const refreshData = () => {
        localStorage.removeItem('pharmacy_products');
        localStorage.removeItem('pharmacy_sales');
        localStorage.removeItem('pharmacy_requests');
        setProducts(MOCK_PRODUCTS);
        setSales(MOCK_SALES);
        setRequests(MOCK_REQUESTS);
        window.location.reload();
    };

    return (
        <DataContext.Provider value={{
            products, sales, requests,
            addProduct, updateProduct, deleteProduct,
            addSale, addRequest, validateRequest, rejectRequest,
            refreshData
        }}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = (): DataContextType => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};
