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
  updateSale: (id: string, updates: any) => Promise<void>;
  addSale: (sale: Omit<Sale, 'id'>) => Promise<void>;
  deleteSale: (id: string) => Promise<void>;
  addRequest: (request: Omit<ProductRequest, 'id' | 'status' | 'dateCreation'>) => Promise<void>;
  updateRequestStatus: (id: string, status: 'VALIDE' | 'REFUSE') => Promise<void>;
  refreshData: () => Promise<void>;
  history: any[];
}


const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [requests, setRequests] = useState<ProductRequest[]>([]);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [fournisseurs, setFournisseurs] = useState<ApiFournisseur[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [history, setHistory] = useState<any[]>([]);
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
        createdAt: s.created_at,
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
      const created = response.data;
      await fetchData();

      // add history entry
      setHistory((prev) => [
        {
          id: `product-create-${created.id}`,
          type: 'product',
          action: 'create',
          userId: product.user_id || null,
          userName: product.userName || 'Utilisateur inconnu',
          productId: String(created.id),
          productNom: created.nom,
          date: created.created_at || new Date().toISOString().split('T')[0],
        },
        ...prev,
      ]);
    } catch (err) {
      console.error('Error adding product:', err);
      throw err;
    }
  };

  const updateProduct = async (id: string, updates: any) => {
    try {
      await api.put(`/products/${id}`, updates);
      await fetchData();

      setHistory((prev) => [
        {
          id: `product-update-${id}`,
          type: 'product',
          action: 'update',
          userId: updates.user_id || null,
          userName: updates.userName || 'Utilisateur inconnu',
          productId: id,
          productNom: updates.nom || null,
          date: new Date().toISOString().split('T')[0],
        },
        ...prev,
      ]);
    } catch (err) {
      console.error('Error updating product:', err);
      throw err;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await api.delete(`/products/${id}`);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setHistory((prev) => [
        {
          id: `product-delete-${id}`,
          type: 'product',
          action: 'delete',
          userId: null,
          userName: 'Utilisateur inconnu',
          productId: id,
          productNom: null,
          date: new Date().toISOString().split('T')[0],
        },
        ...prev,
      ]);
    } catch (err) {
      console.error('Error deleting product:', err);
      throw err;
    }
  };

  const addSale = async (sale: Omit<Sale, 'id'>) => {

    try {
      // Ensure product exists locally and has enough stock before calling API
      const productLocal = products.find((p) => p.id === String(sale.product_id));
      if (!productLocal) {
        throw new Error('Produit non trouvé');
      }
      if (productLocal.quantiteBoites < (sale as any).quantite_vendue) {
        throw new Error('Stock insuffisant');
      }

      const response = await api.post('/sales', sale);

      const created = response.data;

      const mappedSale: Sale = {
        id: String(created.id),
        productId: String(created.product_id),
        productNom: created.product?.nom || 'Produit inconnu',
        quantiteVendue: created.quantite_vendue,
        date: created.date_vente,
        createdAt: created.created_at,
        userId: String(created.user_id),
        userName: created.user ? `${created.user.prenom} ${created.user.nom}` : 'Utilisateur inconnu',
      };

      // Prepend the new sale so it's visible immediately
      setSales((prev) => [mappedSale, ...prev]);

      // add history entry
      setHistory((prev) => [
        {
          id: `sale-create-${created.id}`,
          type: 'sale',
          action: 'create',
          userId: String(created.user_id),
          userName: created.user ? `${created.user.prenom} ${created.user.nom}` : 'Utilisateur inconnu',
          productId: String(created.product_id),
          productNom: created.product?.nom || 'Produit inconnu',
          quantity: created.quantite_vendue,
          date: created.date_vente,
        },
        ...prev,
      ]);

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

  const deleteSale = async (id: string) => {
    try {
      // find the sale locally to adjust product stock immediately
      const existingSale = sales.find((s) => s.id === id);

      await api.delete(`/sales/${id}`);

      // remove sale from local state
      setSales((prev) => prev.filter((s) => s.id !== id));

      // if we had the sale, restore the product quantity locally
      if (existingSale) {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === existingSale.productId
              ? { ...p, quantiteBoites: p.quantiteBoites + existingSale.quantiteVendue }
              : p
          )
        );

        // add history entry for deletion
        setHistory((prev) => [
          {
            id: `sale-delete-${id}`,
            type: 'sale',
            action: 'delete',
            userId: existingSale.userId,
            userName: existingSale.userName,
            productId: existingSale.productId,
            productNom: existingSale.productNom,
            quantity: existingSale.quantiteVendue,
            date: new Date().toISOString().split('T')[0],
          },
          ...prev,
        ]);
      }

      // refresh from server to ensure consistency
      await fetchData();
    } catch (err) {
      console.error('Error deleting sale:', err);
      throw err;
    }
  };

  const updateSale = async (id: string, updates: any) => {
    try {
      // find previous sale to compute stock delta and validate
      const prev = sales.find((s) => s.id === id);
      if (!prev) throw new Error('Vente introuvable');

      const requestedNewQty = updates.quantite_vendue !== undefined ? Number(updates.quantite_vendue) : prev.quantiteVendue;

      // find related product locally
      const productLocal = products.find((p) => p.id === String(prev.productId));
      if (!productLocal) throw new Error('Produit introuvable');

      // if increasing sold quantity, ensure enough stock
      const increase = requestedNewQty - prev.quantiteVendue;
      if (increase > 0 && productLocal.quantiteBoites < increase) {
        throw new Error('Stock insuffisant pour cette modification');
      }

      const response = await api.put(`/sales/${id}`, updates);
      const updated = response.data;

      // map updated sale to frontend shape
      const mappedSale: Sale = {
        id: String(updated.id),
        productId: String(updated.product_id),
        productNom: updated.product?.nom || 'Produit inconnu',
        quantiteVendue: updated.quantite_vendue,
        date: updated.date_vente,
        createdAt: updated.created_at,
        userId: String(updated.user_id),
        userName: updated.user ? `${updated.user.prenom} ${updated.user.nom}` : 'Utilisateur inconnu',
      };

      // update sales list locally
      setSales((prevList) => prevList.map((s) => (s.id === id ? mappedSale : s)));

      // add history entry for update
      setHistory((prev) => [
        {
          id: `sale-update-${id}`,
          type: 'sale',
          action: 'update',
          userId: mappedSale.userId,
          userName: mappedSale.userName,
          productId: mappedSale.productId,
          productNom: mappedSale.productNom,
          previousQuantity: prev.find((h) => h.type === 'sale' && h.action === 'create' && h.productId === mappedSale.productId)?.quantity ?? null,
          newQuantity: mappedSale.quantiteVendue,
          date: mappedSale.date,
        },
        ...prev,
      ]);

      // adjust product stock locally based on difference between previous and updated quantities
      const productId = String(updated.product_id);
      const delta = prev.quantiteVendue - mappedSale.quantiteVendue; // positive => increase stock, negative => decrease
      setProducts((prevProducts) =>
        prevProducts.map((p) =>
          p.id === productId ? { ...p, quantiteBoites: Math.max(0, p.quantiteBoites + delta) } : p
        )
      );

      // refresh from server to ensure full consistency
      await fetchData();
    } catch (err) {
      console.error('Error updating sale:', err);
      throw err;
    }
  };

  const addRequest = async (request: Omit<ProductRequest, 'id' | 'status' | 'dateCreation'>) => {
    try {
      // Frontend-local creation of a request when backend API is not yet implemented.
      const id = `req-${Date.now()}`;
      const dateCreation = new Date().toISOString();
      const newReq: ProductRequest = {
        id: id,
        productId: request.productId ? String(request.productId) : undefined,
        productNom: request.productNom || 'Produit inconnu',
        quantiteDemandee: request.quantiteDemandee || 1,
        commentaire: request.commentaire || '',
        status: 'EN_ATTENTE',
        dateCreation: dateCreation,
        userId: request.userId ? String(request.userId) : null,
        userName: request.userName || 'Utilisateur inconnu',
      } as any;

      setRequests((prev) => [newReq, ...prev]);

      // add history entry
      setHistory((prev) => [
        {
          id: `request-create-${id}`,
          type: 'request',
          action: 'create',
          userId: newReq.userId || null,
          userName: newReq.userName || 'Utilisateur inconnu',
          productId: newReq.productId || null,
          productNom: newReq.productNom || null,
          quantity: newReq.quantiteDemandee,
          date: dateCreation.split('T')[0],
        },
        ...prev,
      ]);
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
        // add history entry for validation
        const req = requests.find((r) => r.id === id);
        setHistory((prev) => [
          {
            id: `request-validate-${id}`,
            type: 'request',
            action: 'validate',
            userId: req?.userId || null,
            userName: req?.userName || 'Utilisateur inconnu',
            productId: req?.productId || null,
            productNom: req?.productNom || null,
            quantity: req?.quantiteDemandee || null,
            date: new Date().toISOString().split('T')[0],
          },
          ...prev,
        ]);
      }
      if (status === 'REFUSE') {
        const req = requests.find((r) => r.id === id);
        setHistory((prev) => [
          {
            id: `request-refuse-${id}`,
            type: 'request',
            action: 'invalidate',
            userId: req?.userId || null,
            userName: req?.userName || 'Utilisateur inconnu',
            productId: req?.productId || null,
            productNom: req?.productNom || null,
            quantity: req?.quantiteDemandee || null,
            date: new Date().toISOString().split('T')[0],
          },
          ...prev,
        ]);
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
        updateSale,
        addSale,
        deleteSale,
        addRequest,
        updateRequestStatus,
        refreshData: fetchData,
        history,
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
