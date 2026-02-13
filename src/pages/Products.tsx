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

const Products: React.FC = () => {
  const { products, categories, fournisseurs, addProduct, updateProduct, deleteProduct } = useData();
  const isAdmin = true;

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nom: '',
    categorie: '',
    numeroLot: '',
    datePeremption: '',
    quantiteBoites: 0,
    quantiteUnites: 0,
    prix: 0,
    fournisseur: '',
    description: '',
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
      categorie: '',
      numeroLot: '',
      datePeremption: '',
      quantiteBoites: 0,
      quantiteUnites: 0,
      prix: 0,
      fournisseur: '',
      description: '',
    });
    setEditingProduct(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nom || !formData.categorie || !formData.numeroLot) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (editingProduct) {
      updateProduct(editingProduct, formData);
      toast.success('Produit mis à jour');
    } else {
      addProduct(formData);
      toast.success('Produit ajouté');
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleEdit = (product: typeof products[0]) => {
    setFormData({
      nom: product.nom,
      categorie: product.categorie,
      numeroLot: product.numeroLot,
      datePeremption: product.datePeremption,
      quantiteBoites: product.quantiteBoites,
      quantiteUnites: product.quantiteUnites,
      prix: product.prix,
      fournisseur: product.fournisseur,
      description: product.description,
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
                        value={formData.categorie}
                        onValueChange={(value) => setFormData({ ...formData, categorie: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.nom} value={cat.nom}>{cat.nom}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="numeroLot">Numéro de lot *</Label>
                      <Input
                        id="numeroLot"
                        value={formData.numeroLot}
                        onChange={(e) => setFormData({ ...formData, numeroLot: e.target.value })}
                        placeholder="Ex: LOT-2024-001"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="datePeremption">Date de péremption</Label>
                      <Input
                        id="datePeremption"
                        type="date"
                        value={formData.datePeremption}
                        onChange={(e) => setFormData({ ...formData, datePeremption: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="quantiteBoites">Quantité (boîtes)</Label>
                      <Input
                        id="quantiteBoites"
                        type="number"
                        min="0"
                        value={formData.quantiteBoites}
                        onChange={(e) => setFormData({ ...formData, quantiteBoites: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="quantiteUnites">Quantité (unités)</Label>
                      <Input
                        id="quantiteUnites"
                        type="number"
                        min="0"
                        value={formData.quantiteUnites}
                        onChange={(e) => setFormData({ ...formData, quantiteUnites: parseInt(e.target.value) || 0 })}
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
                        value={formData.fournisseur}
                        onValueChange={(value) => setFormData({ ...formData, fournisseur: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                        <SelectContent>
                          {fournisseurs.map((f) => (
                            <SelectItem key={f.nom} value={f.nom}>{f.nom}</SelectItem>
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
