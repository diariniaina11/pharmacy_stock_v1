import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import PageHeader from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, ShoppingCart, Package, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { User } from '@/types';
import axios from '@/api/axios';

const Sales: React.FC = () => {
  const { products, sales, addSale, deleteSale } = useData();
  
  const user:User = JSON.parse(localStorage.getItem('user') || '{}');
  

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);
  

  const availableProducts = products.filter((p) => p.quantiteBoites > 0);
  const selectedProductData = products.find((p) => p.id === selectedProduct);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProduct || quantity <= 0) {
      toast.error('Veuillez sélectionner un produit et une quantité valide');
      return;
    }

    if (!selectedProductData) {
      toast.error('Produit non trouvé');
      return;
    }

    if (quantity > selectedProductData.quantiteBoites) {
      toast.error('Stock insuffisant');
      return;
    }

    if (!user || !user.id) {
      toast.error('Utilisateur non connecté');
      return;
    }

    const numericUserId = Number(user.id);
    if (isNaN(numericUserId) || numericUserId <= 0) {
      toast.error('ID utilisateur invalide');
      return;
    }

    /*
    forme de l'objet a envoyer   
    export interface Sale {
      productId: string;
      productNom: string;
      quantiteVendue: number;
      date: string;
      userId: string;
      userName: string;
    }
    */
    
    try {
      const response = await axios.get(`/products/${selectedProduct}`);
      const sale = {
        product_id: selectedProduct,
        product_nom: selectedProductData.nom,
        quantite_vendue: quantity,
        date_vente: new Date().toISOString().split('T')[0],
        user_id: numericUserId,
        user: user,
        product: response.data,
      };

      await addSale(sale);

      toast.success('Vente enregistrée');
      setIsDialogOpen(false);
      setSelectedProduct('');
      setQuantity(1);
    } catch (err: any) {
      console.error('Erreur enregistr. vente:', err);
      const message = err?.response?.data?.message || err?.message || 'Erreur lors de la création de la vente';
      toast.error(message);
    }
  };

  const recentSales = [...sales]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  

  return (
    <div>
      <PageHeader
        title="Gestion des Ventes"
        description="Enregistrez et suivez les ventes de produits"
        action={
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nouvelle vente
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Enregistrer une vente</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="product">Produit</Label>
                  <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un produit" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableProducts.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.nom} ({product.quantiteBoites} en stock)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedProductData && (
                  <Card className="bg-muted/50">
                    <CardContent className="pt-4">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-muted-foreground">Stock actuel</p>
                          <p className="font-medium">{selectedProductData.quantiteBoites} boîtes</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Prix unitaire</p>
                          <p className="font-medium">{selectedProductData.prix.toFixed(2)} €</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantité</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    max={selectedProductData?.quantiteBoites || 1}
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  />
                </div>

                {selectedProductData && (
                  <div className="p-4 rounded-lg bg-primary/10">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Total</span>
                      <span className="text-xl font-bold text-primary">
                        {(selectedProductData.prix * quantity).toFixed(2)} €
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Stock restant : {selectedProductData.quantiteBoites - quantity} boîtes
                    </p>
                  </div>
                )}

                <div className="flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button type="submit">
                    Enregistrer la vente
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ventes aujourd'hui
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {sales.filter((s) => s.date === new Date().toISOString().split('T')[0]).length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total ventes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{sales.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Produits vendus
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {sales.reduce((acc, s) => acc + s.quantiteVendue, 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Sales */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-primary" />
            Ventes récentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produit</TableHead>
                <TableHead>Quantité</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Vendeur</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentSales.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    <Package className="w-12 h-12 mx-auto mb-2 text-muted-foreground/50" />
                    <p className="text-muted-foreground">Aucune vente enregistrée</p>
                  </TableCell>
                </TableRow>
              ) : (
                recentSales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell className="font-medium">{sale.productNom}</TableCell>
                    <TableCell>{sale.quantiteVendue} boîtes</TableCell>
                    <TableCell>{new Date(sale.date).toLocaleDateString('fr-FR')}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div>{sale.userName}</div>
                        {sale.createdAt && (Date.now() - new Date(sale.createdAt).getTime()) <= 10 * 60 * 1000 && (
                          <Button size="sm" variant="ghost" onClick={async () => {
                            try {
                              await deleteSale(sale.id);
                              toast.success('Vente annulée');
                            } catch (err: any) {
                              console.error(err);
                              toast.error(err?.message || 'Erreur lors de l\'annulation');
                            }
                          }}>
                            Annuler
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {availableProducts.length === 0 && (
        <Card className="mt-6 border-warning/50 bg-warning/5">
          <CardContent className="flex items-center gap-4 pt-6">
            <AlertCircle className="w-8 h-8 text-warning" />
            <div>
              <p className="font-medium">Aucun produit disponible</p>
              <p className="text-sm text-muted-foreground">
                Tous les produits sont en rupture de stock
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Sales;
