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
        categorie_id: p.categorie_id,
        numeroLot: p.numero_lot,
        datePeremption: p.date_peremption,
        quantiteBoites: p.quantite_boites,
        quantiteUnites: p.quantite_unites,
        prix: parseFloat(p.prix),
        fournisseur: p.fournisseur?.nom || '',
        fournisseur_id: p.fournisseur_id,
        description: p.description || '',
        createdAt: p.created_at,
        updatedAt: p.updated_at,
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

  const addProduct = async (product: any) => {
    try {
      // In the new structure, product already contains categorie_id and fournisseur_id
      const response = await api.post('/products', product);

      // After success, refresh data to get the new product with its generated ID and mapped fields
      await fetchData();
    } catch (err) {
      console.error('Error adding product:', err);
      throw err;
    }
  };

  const updateProduct = async (id: string, updates: any) => {
    try {
      await api.put(`/products/${id}`, updates);
      await fetchData();
    } catch (err) {
      console.error('Error updating product:', err);
      throw err;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await api.delete(`/products/${id}`);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error('Error deleting product:', err);
      throw err;
    }
  };

  const addSale = async (sale: Omit<Sale, 'id'>) => {

    try {
      const response = await api.post('/sales', sale);

      const created = response.data;

      const mappedSale: Sale = {
        id: String(created.id),
        productId: String(created.product_id),
        productNom: created.product?.nom || 'Produit inconnu',
        quantiteVendue: created.quantite_vendue,
        date: created.date_vente,
        userId: String(created.user_id),
        userName: created.user ? `${created.user.prenom} ${created.user.nom}` : 'Utilisateur inconnu',
      };

      // Prepend the new sale so it's visible immediately
      setSales((prev) => [mappedSale, ...prev]);

      // Update product stock locally
      const product = products.find((p) => p.id === String(created.product_id));
      if (product) {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === String(created.product_id)
              ? { ...p, quantiteBoites: Math.max(0, p.quantiteBoites - created.quantite_vendue) }
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
