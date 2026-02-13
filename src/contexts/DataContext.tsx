import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, Sale, ProductRequest, User, ApiCategory, ApiFournisseur } from '@/types';
import api from '@/api/axios';

interface DataContextType {
  products: Product[];
  sales: Sale[];
  requests: ProductRequest[];
  categories: ApiCategory[];
  fournisseurs: ApiFournisseur[];
  users: User[];
  isLoading: boolean;
  error: string | null;
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addSale: (sale: Omit<Sale, 'id'>) => Promise<void>;
  addRequest: (request: Omit<ProductRequest, 'id' | 'status' | 'dateCreation'>) => Promise<void>;
  updateRequestStatus: (id: string, status: 'VALIDE' | 'REFUSE') => Promise<void>;
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [requests, setRequests] = useState<ProductRequest[]>([]);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [fournisseurs, setFournisseurs] = useState<ApiFournisseur[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch products from API
      const productsRes = await api.get('/products');
      const mappedProducts: Product[] = productsRes.data.map((p: any) => ({
        id: String(p.id),
        nom: p.nom,
        categorie: p.category?.nom || '',
        numeroLot: p.numero_lot,
        datePeremption: p.date_peremption,
        quantiteBoites: p.quantite_boites,
        quantiteUnites: p.quantite_unites,
        prix: parseFloat(p.prix),
        fournisseur: p.fournisseur?.nom || '',
        description: p.description || '',
      }));
      setProducts(mappedProducts);

      //Fetch categories from API
      const categoriesRes = await api.get('/categories');
      const mappedCategories: ApiCategory[] = categoriesRes.data.map((c: any) => ({
        id: c.id,
        nom: c.nom,
      }));
      setCategories(mappedCategories);

      //Fetch fournisseurs from API
      const fournisseursRes = await api.get('/fournisseurs');
      const mappedFournisseurs: ApiFournisseur[] = fournisseursRes.data.map((f: any) => ({
        id: f.id,
        nom: f.nom,
      }));
      setFournisseurs(mappedFournisseurs);

      //Fetch users from API
      const usersRes = await api.get('/users');
      const mappedUsers: User[] = usersRes.data.map((u: any) => ({
        id: String(u.id),
        nom: u.nom,
        prenom: u.prenom,
        email: u.email,
        role: u.role
      }));
      setUsers(mappedUsers);

      //Fetch sales from API
      const salesRes = await api.get('/sales');
      const mappedSales: Sale[] = salesRes.data.map((s: any) => ({
        id: String(s.id),
        productId: String(s.product_id),
        productNom: s.product?.nom || 'Produit inconnu',
        quantiteVendue: s.quantite_vendue,
        date: s.date_vente,
        userId: String(s.user_id),
        userName: s.user ? `${s.user.prenom} ${s.user.nom}` : 'Utilisateur inconnu',
      }));
      setSales(mappedSales);

      //Fetch product-requests
      const requestsRes = await api.get('/product-requests');
      const mappedRequests: ProductRequest[] = requestsRes.data.map((r: any) => ({
        id: String(r.id),
        productId: String(r.product_id),
        productNom: r.product?.nom || 'Produit inconnu',
        quantiteDemandee: r.quantite_demandee,
        commentaire: r.commentaire || '',
        status: r.status,
        dateCreation: r.date_creation,
        userId: String(r.user_id),
        userName: r.user ? `${r.user.prenom} ${r.user.nom}` : 'Utilisateur inconnu',
      }));
      setRequests(mappedRequests);

      // Categories and Fournisseurs are already fetched above
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Erreur lors du chargement des données du serveur');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const addProduct = async (product: Omit<Product, 'id'>) => {
    try {
      console.warn('API call stubbed: addProduct');
      // Find category and fournisseur IDs
      const category = categories.find(c => c.nom === product.categorie);
      const fournisseur = fournisseurs.find(f => f.nom === product.fournisseur);

      if (!category || !fournisseur) {
        throw new Error('Category or Fournisseur not found');
      }

      // const newProduct = await productsApi.create(product, category.id, fournisseur.id);
      // setProducts((prev) => [...prev, newProduct]);
    } catch (err) {
      console.error('Error adding product:', err);
      throw err;
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      console.warn('API call stubbed: updateProduct');
      // Find category and fournisseur IDs if they're being updated
      let categorieId: number | undefined;
      let fournisseurId: number | undefined;

      if (updates.categorie) {
        const category = categories.find(c => c.nom === updates.categorie);
        categorieId = category?.id;
      }

      if (updates.fournisseur) {
        const fournisseur = fournisseurs.find(f => f.nom === updates.fournisseur);
        fournisseurId = fournisseur?.id;
      }

      // Get the current product to merge updates properly
      const currentProduct = products.find(p => p.id === id);
      if (!currentProduct) {
        throw new Error('Product not found');
      }

      // If categorie or fournisseur not provided in updates, use existing values
      if (!categorieId && currentProduct.categorie) {
        const category = categories.find(c => c.nom === currentProduct.categorie);
        categorieId = category?.id;
      }

      if (!fournisseurId && currentProduct.fournisseur) {
        const fournisseur = fournisseurs.find(f => f.nom === currentProduct.fournisseur);
        fournisseurId = fournisseur?.id;
      }

      // const updatedProduct = await productsApi.update(id, updates, categorieId, fournisseurId);
      // setProducts((prev) => prev.map((p) => (p.id === id ? updatedProduct : p)));
    } catch (err) {
      console.error('Error updating product:', err);
      throw err;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      console.warn('API call stubbed: deleteProduct');
      // await productsApi.delete(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error('Error deleting product:', err);
      throw err;
    }
  };

  const addSale = async (sale: Omit<Sale, 'id'>) => {
    try {
      console.warn('API call stubbed: addSale');
      // const newSale = await salesApi.create(sale);
      // setSales((prev) => [...prev, newSale]);

      // Update product stock locally
      const product = products.find((p) => p.id === sale.productId);
      if (product) {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === sale.productId
              ? { ...p, quantiteBoites: Math.max(0, p.quantiteBoites - sale.quantiteVendue) }
              : p
          )
        );
      }
    } catch (err) {
      console.error('Error adding sale:', err);
      throw err;
    }
  };

  const addRequest = async (request: Omit<ProductRequest, 'id' | 'status' | 'dateCreation'>) => {
    try {
      console.warn('API call stubbed: addRequest');
      // const newRequest = await requestsApi.create(request);
      // setRequests((prev) => [...prev, newRequest]);
    } catch (err) {
      console.error('Error adding request:', err);
      throw err;
    }
  };

  const updateRequestStatus = async (id: string, status: 'VALIDE' | 'REFUSE') => {
    try {
      console.warn('API call stubbed: updateRequestStatus');
      // const updatedRequest = await requestsApi.updateStatus(id, status);
      // setRequests((prev) => prev.map((r) => (r.id === id ? updatedRequest : r)));

      if (status === 'VALIDE') {
        const request = requests.find((r) => r.id === id);
        if (request && request.productId) {
          const product = products.find((p) => p.id === request.productId);
          if (product) {
            setProducts((prev) =>
              prev.map((p) =>
                p.id === request.productId
                  ? { ...p, quantiteBoites: p.quantiteBoites + request.quantiteDemandee }
                  : p
              )
            );
          }
        }
      }
    } catch (err) {
      console.error('Error updating request status:', err);
      throw err;
    }
  };

  return (
    <DataContext.Provider
      value={{
        products,
        sales,
        requests,
        categories,
        fournisseurs,
        users,
        isLoading,
        error,
        addProduct,
        updateProduct,
        deleteProduct,
        addSale,
        addRequest,
        updateRequestStatus,
        refreshData: fetchData,
      }}
    >
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
