import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Product, Sale, ProductRequest } from '@/types';
import { mockProducts, mockSales, mockRequests } from '@/data/mockData';

interface DataContextType {
  products: Product[];
  sales: Sale[];
  requests: ProductRequest[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addSale: (sale: Omit<Sale, 'id'>) => void;
  addRequest: (request: Omit<ProductRequest, 'id' | 'status' | 'dateCreation'>) => void;
  updateRequestStatus: (id: string, status: 'VALIDE' | 'REFUSE') => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [sales, setSales] = useState<Sale[]>(mockSales);
  const [requests, setRequests] = useState<ProductRequest[]>(mockRequests);

  const addProduct = (product: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...product,
      id: Date.now().toString(),
    };
    setProducts((prev) => [...prev, newProduct]);
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const addSale = (sale: Omit<Sale, 'id'>) => {
    const newSale: Sale = {
      ...sale,
      id: Date.now().toString(),
    };
    setSales((prev) => [...prev, newSale]);
    
    // Update product stock
    const product = products.find((p) => p.id === sale.productId);
    if (product) {
      updateProduct(sale.productId, {
        quantiteBoites: Math.max(0, product.quantiteBoites - sale.quantiteVendue),
      });
    }
  };

  const addRequest = (request: Omit<ProductRequest, 'id' | 'status' | 'dateCreation'>) => {
    const newRequest: ProductRequest = {
      ...request,
      id: Date.now().toString(),
      status: 'EN_ATTENTE',
      dateCreation: new Date().toISOString().split('T')[0],
    };
    setRequests((prev) => [...prev, newRequest]);
  };

  const updateRequestStatus = (id: string, status: 'VALIDE' | 'REFUSE') => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    );

    if (status === 'VALIDE') {
      const request = requests.find((r) => r.id === id);
      if (request && request.productId) {
        const product = products.find((p) => p.id === request.productId);
        if (product) {
          updateProduct(request.productId, {
            quantiteBoites: product.quantiteBoites + request.quantiteDemandee,
          });
        }
      }
    }
  };

  return (
    <DataContext.Provider
      value={{
        products,
        sales,
        requests,
        addProduct,
        updateProduct,
        deleteProduct,
        addSale,
        addRequest,
        updateRequestStatus,
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
