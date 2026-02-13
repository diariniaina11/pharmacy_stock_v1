import React, { useState, useMemo } from 'react';
import { useData } from '@/contexts/DataContext';
import PageHeader from '@/components/shared/PageHeader';
import SearchInput from '@/components/shared/SearchInput';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

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
import { Plus, Edit, Trash2, Package } from 'lucide-react';
import { toast } from 'sonner';
import { Product } from '@/types';

const Products: React.FC = () => {
  const {
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
  } = useData();
  const isAdmin = true;

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nom: '',
    categorie_id: 0,
    fournisseur_id: 0,
    numero_lot: '',
    date_peremption: '',
    quantite_boites: 0,
    quantite_unites: 0,
    prix: 0,
    description: '',
    created_at: '',
    updated_at: ''
  });

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.nom.toLowerCase().includes(search.toLowerCase()) ||
        product.numeroLot.toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        categoryFilter === 'all' || product.categorie === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [products, search, categoryFilter]);

  const resetForm = () => {
    setFormData({
      nom: '',
      categorie_id: 0,
      fournisseur_id: 0,
      numero_lot: '',
      date_peremption: '',
      quantite_boites: 0,
      quantite_unites: 0,
      prix: 0,
      description: '',
      created_at: '',
      updated_at: ''
    });
    setEditingProduct(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validation de base côté client
    if (!formData.nom || !formData.categorie_id || !formData.numero_lot) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      // 2. Préparation des données pour l'API Laravel (Format Snake Case)
      // On ne garde que ce que le validateur du Controller Laravel attend
      const apiData = {
        nom: formData.nom,
        categorie_id: formData.categorie_id,
        fournisseur_id: formData.fournisseur_id,
        numero_lot: formData.numero_lot,
        date_peremption: formData.date_peremption,
        quantite_boites: formData.quantite_boites,
        quantite_unites: formData.quantite_unites,
        prix: formData.prix,
        description: formData.description,
      };

      // 3. Appel de la méthode appropriée via le DataContext
      if (editingProduct) {
        await updateProduct(editingProduct, apiData);
        toast.success('Produit mis à jour');
      } else {
        await addProduct(apiData);
        toast.success('Produit ajouté');
      }

      // 4. Fermeture et réinitialisation en cas de succès
      setIsDialogOpen(false);
      resetForm();

    } catch (err: any) {
      // 5. Gestion des erreurs (notamment la 422 de Laravel)
      console.error("Erreur lors de l'enregistrement:", err);
      if (err.response?.status === 422) {
        const messages = Object.values(err.response.data.errors).flat();
        toast.error(`Erreur de validation: ${messages[0]}`);
      } else {
        toast.error("Une erreur est survenue lors de l'enregistrement");
      }
    }
  };
  const handleEdit = (product: typeof products[0]) => {
    setFormData({
      nom: product.nom,
      categorie_id: product.categorie_id,
      fournisseur_id: product.fournisseur_id,
      numero_lot: product.numeroLot,
      date_peremption: product.datePeremption,
      quantite_boites: product.quantiteBoites,
      quantite_unites: product.quantiteUnites,
      prix: product.prix,
      description: product.description,
      created_at: product.createdAt || '',
      updated_at: product.updatedAt || ''
    });
    setEditingProduct(product.id);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      deleteProduct(id);
      toast.success('Produit supprimé');
    }
  };

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) return 'badge-expired';
    if (quantity < 10) return 'badge-warning';
    return 'badge-success';
  };

  return (
    <div>
      <PageHeader
        title="Gestion des Produits"
        description="Gérez votre catalogue de produits pharmaceutiques"
        action={
          isAdmin && (
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter un produit
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingProduct ? 'Modifier le produit' : 'Ajouter un produit'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nom">Nom du produit *</Label>
                      <Input
                        id="nom"
                        value={formData.nom}
                        onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                        placeholder="Ex: Doliprane 1000mg"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="categorie">Catégorie *</Label>
                      <Select
                        value={formData.categorie_id ? String(formData.categorie_id) : ""}
                        onValueChange={(value) => setFormData({ ...formData, categorie_id: parseInt(value) })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={String(cat.id)}>{cat.nom}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="numeroLot">Numéro de lot *</Label>
                      <Input
                        id="numeroLot"
                        value={formData.numero_lot}
                        onChange={(e) => setFormData({ ...formData, numero_lot: e.target.value })}
                        placeholder="Ex: LOT-2024-001"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="datePeremption">Date de péremption</Label>
                      <Input
                        id="datePeremption"
                        type="date"
                        value={formData.date_peremption}
                        onChange={(e) => setFormData({ ...formData, date_peremption: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="quantiteBoites">Quantité (boîtes)</Label>
                      <Input
                        id="quantiteBoites"
                        type="number"
                        min="0"
                        value={formData.quantite_boites}
                        onChange={(e) => setFormData({ ...formData, quantite_boites: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="quantiteUnites">Quantité (unités)</Label>
                      <Input
                        id="quantiteUnites"
                        type="number"
                        min="0"
                        value={formData.quantite_unites}
                        onChange={(e) => setFormData({ ...formData, quantite_unites: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="prix">Prix (€)</Label>
                      <Input
                        id="prix"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.prix}
                        onChange={(e) => setFormData({ ...formData, prix: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fournisseur">Fournisseur</Label>
                      <Select
                        value={formData.fournisseur_id ? String(formData.fournisseur_id) : ""}
                        onValueChange={(value) => setFormData({ ...formData, fournisseur_id: parseInt(value) })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                        <SelectContent>
                          {fournisseurs.map((f) => (
                            <SelectItem key={f.id} value={String(f.id)}>{f.nom}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Description du produit..."
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Annuler
                    </Button>
                    <Button type="submit">
                      {editingProduct ? 'Mettre à jour' : 'Ajouter'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 max-w-md">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Rechercher un produit..."
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Catégorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les catégories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.nom} value={cat.nom}>{cat.nom}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="table-container">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produit</TableHead>
              <TableHead>Catégorie</TableHead>
              <TableHead>N° Lot</TableHead>
              <TableHead>Péremption</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Prix</TableHead>
              {isAdmin && <TableHead className="w-[100px]">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isAdmin ? 7 : 6} className="text-center py-8">
                  <Package className="w-12 h-12 mx-auto mb-2 text-muted-foreground/50" />
                  <p className="text-muted-foreground">Aucun produit trouvé</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{product.nom}</p>
                      <p className="text-sm text-muted-foreground">{product.fournisseur}</p>
                    </div>
                  </TableCell>
                  <TableCell>{product.categorie}</TableCell>
                  <TableCell className="font-mono text-sm">{product.numeroLot}</TableCell>
                  <TableCell>{new Date(product.datePeremption).toLocaleDateString('fr-FR')}</TableCell>
                  <TableCell>
                    <span className={getStockStatus(product.quantiteBoites)}>
                      {product.quantiteBoites} boîtes
                    </span>
                  </TableCell>
                  <TableCell>{product.prix.toFixed(2)} €</TableCell>
                  {isAdmin && (
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(product)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(product.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Products;
