import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, Sale, ProductRequest, User, ApiCategory, ApiFournisseur, SystemLog, HistoryItem } from '@/types';
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
  addCategory: (nom: string) => Promise<ApiCategory>;
  refreshData: () => Promise<void>;
  history: HistoryItem[];
}


const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [requests, setRequests] = useState<ProductRequest[]>([]);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [fournisseurs, setFournisseurs] = useState<ApiFournisseur[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
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
        product_id: String(s.product_id),
        product_nom: s.product?.nom || 'Produit inconnu',
        quantite_vendue: s.quantite_vendue,
        date_vente: s.date_vente,
        createdAt: s.created_at,
        user_id: String(s.user_id),
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

      // Fetch logs from API
      const logsRes = await api.get('/logs');
      const mappedHistory: HistoryItem[] = logsRes.data.map((l: SystemLog) => {
        const userObj = mappedUsers.find(u => String(u.id) === String(l.user));

        let type: HistoryItem['type'] = 'unknown';
        if (l.action.startsWith('produit')) type = 'product';
        else if (l.action.startsWith('vente')) type = 'sale';
        else if (l.action.startsWith('categ')) type = 'category';

        return {
          id: String(l.id),
          type,
          action: l.action,
          userId: String(l.user),
          userName: userObj ? `${userObj.prenom} ${userObj.nom}` : `Utilisateur ${l.user}`,
          info: l.info,
          date: l.date,
        };
      });
      setHistory(mappedHistory);

    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Erreur lors du chargement des données du serveur');
    } finally {
      setIsLoading(false);
    }
  };

  const createLog = async (action: string, info: string) => {
    try {
      const storedUser = localStorage.getItem('user');
      const currentUser = storedUser ? JSON.parse(storedUser) : null;
      const userId = currentUser ? currentUser.id : 1;

      await api.post('/logs', {
        action,
        info,
        user: userId,
        date: new Date().toLocaleString('sv-SE'), // Format: YYYY-MM-DD HH:MM:SS
      });
    } catch (err) {
      console.error('Error creating log:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const addProduct = async (product: any) => {
    try {
      const response = await api.post('/products', product);
      const created = response.data;
      await fetchData();

      // Log action
      await createLog('produitNew', `Ajout du nouveau produit: ${created.nom}`);
    } catch (err) {
      console.error('Error adding product:', err);
      throw err;
    }
  };

  const updateProduct = async (id: string, updates: any) => {
    try {
      const oldProduct = products.find(p => p.id === id);
      await api.put(`/products/${id}`, updates);
      await fetchData();

      if (oldProduct) {
        if (updates.quantite_boites !== undefined) {
          const diff = Number(updates.quantite_boites) - oldProduct.quantiteBoites;
          if (diff > 0) {
            await createLog('produitPlus', `Augmentation du stock pour ${oldProduct.nom} (+${diff})`);
          } else if (diff < 0) {
            await createLog('produitMoins', `Diminution du stock pour ${oldProduct.nom} (${diff})`);
          } else {
            await createLog('produitPlus', `Mise à jour du produit: ${oldProduct.nom}`);
          }
        } else {
          await createLog('produitPlus', `Mise à jour du produit: ${oldProduct.nom}`);
        }
      }
    } catch (err) {
      console.error('Error updating product:', err);
      throw err;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const productToDelete = products.find(p => p.id === id);
      await api.delete(`/products/${id}`);
      await fetchData();

      if (productToDelete) {
        await createLog('produitSupp', `Suppression du produit: ${productToDelete.nom}`);
      }
    } catch (err) {
      console.error('Error deleting product:', err);
      throw err;
    }
  };

  const addSale = async (sale: any) => {
    try {
      const productLocal = products.find((p) => p.id === String(sale.product_id));
      if (!productLocal) throw new Error('Produit non trouvé');
      if (productLocal.quantiteBoites < sale.quantite_vendue) throw new Error('Stock insuffisant');

      const response = await api.post('/sales', sale);
      const created = response.data;
      await fetchData();

      // Log action
      await createLog('venteNew', `Nouvelle vente: ${created.product?.nom || 'Produit'} (${created.quantite_vendue} boîtes)`);
    } catch (err) {
      console.error('Error adding sale:', err);
      throw err;
    }
  };

  const deleteSale = async (id: string) => {
    try {
      const existingSale = sales.find((s) => s.id === id);
      await api.delete(`/sales/${id}`);
      await fetchData();

      if (existingSale) {
        // Log action
        await createLog('venteSupp', `Suppression de la vente: ${existingSale.product_nom}`);
      }
    } catch (err) {
      console.error('Error deleting sale:', err);
      throw err;
    }
  };

  const updateSale = async (id: string, updates: any) => {
    try {
      const prev = sales.find((s) => s.id === id);
      if (!prev) throw new Error('Vente introuvable');

      const requestedNewQty = updates.quantite_vendue !== undefined ? Number(updates.quantite_vendue) : prev.quantite_vendue;
      const productLocal = products.find((p) => p.id === String(prev.product_id));
      if (!productLocal) throw new Error('Produit introuvable');

      const increase = requestedNewQty - prev.quantite_vendue;
      if (increase > 0 && productLocal.quantiteBoites < increase) {
        throw new Error('Stock insuffisant pour cette modification');
      }

      await api.put(`/sales/${id}`, updates);
      await fetchData();

      // Find updated sale to get fresh product info
      const refreshedSales = (await api.get('/sales')).data;
      const updated = refreshedSales.find((s: any) => String(s.id) === String(id));

      if (prev && updated) {
        const diff = updated.quantite_vendue - prev.quantite_vendue;
        if (diff > 0) {
          // user requested: venteMoins (augmenter le nombre de vente)
          await createLog('venteMoins', `Augmentation de la vente pour ${updated.product?.nom || 'Produit'} (+${diff})`);
        } else if (diff < 0) {
          // user requested: ventePlus (diminuer le nombre de vente)
          await createLog('ventePlus', `Diminution de la vente pour ${updated.product?.nom || 'Produit'} (${diff})`);
        }
      }
    } catch (err) {
      console.error('Error updating sale:', err);
      throw err;
    }
  };

  const addRequest = async (request: Omit<ProductRequest, 'id' | 'status' | 'dateCreation'>) => {
    try {
      const payload: any = {
        product_id: request.productId || null,
        quantite_demandee: request.quantiteDemandee,
        commentaire: request.commentaire || '',
        user_id: request.userId || null,
      };

      await api.post('/product-requests', payload);
      await fetchData();
    } catch (err) {
      console.error('Error adding request:', err);
      throw err;
    }
  };

  const updateRequestStatus = async (id: string, status: 'VALIDE' | 'REFUSE') => {
    try {
      await api.put(`/product-requests/${id}`, { status });
      await fetchData();
    } catch (err) {
      console.error('Error updating request status:', err);
      throw err;
    }
  };

  const addCategory = async (nom: string): Promise<ApiCategory> => {
    try {
      const response = await api.post('/categories', { nom });
      const newCategory: ApiCategory = {
        id: response.data.id,
        nom: response.data.nom,
      };
      setCategories((prev) => [...prev, newCategory]);

      // Log action
      await createLog('categNew', `Nouvelle catégorie: ${newCategory.nom}`);

      return newCategory;
    } catch (err) {
      console.error('Error adding category:', err);
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
        addCategory,
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
