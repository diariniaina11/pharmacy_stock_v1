import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import PageHeader from '@/components/shared/PageHeader';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, FileText, Clock, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

const Requests: React.FC = () => {
  const { products, requests, addRequest } = useData();
  const isAdmin = true;
  const user = { id: 'admin', prenom: 'Admin', nom: 'System' };

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    productId: '',
    productNom: '',
    quantiteDemandee: 1,
    commentaire: '',
  });

  // For vendeurs, show only their requests
  const filteredRequests = isAdmin
    ? requests
    : requests.filter((r) => r.userId === user?.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const productName = formData.productId
      ? products.find((p) => p.id === formData.productId)?.nom || formData.productNom
      : formData.productNom;

    if (!productName || formData.quantiteDemandee <= 0) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    addRequest({
      productId: formData.productId || undefined,
      productNom: productName,
      quantiteDemandee: formData.quantiteDemandee,
      commentaire: formData.commentaire,
      userId: user!.id,
      userName: `${user!.prenom} ${user!.nom}`,
    });

    toast.success('Demande créée');
    setIsDialogOpen(false);
    setFormData({
      productId: '',
      productNom: '',
      quantiteDemandee: 1,
      commentaire: '',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'EN_ATTENTE':
        return (
          <span className="inline-flex items-center gap-1 badge-warning">
            <Clock className="w-3 h-3" />
            En attente
          </span>
        );
      case 'VALIDE':
        return (
          <span className="inline-flex items-center gap-1 badge-success">
            <CheckCircle className="w-3 h-3" />
            Validée
          </span>
        );
      case 'REFUSE':
        return (
          <span className="inline-flex items-center gap-1 badge-expired">
            <XCircle className="w-3 h-3" />
            Refusée
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <PageHeader
        title="Demandes de Produits"
        description={isAdmin ? "Toutes les demandes d'ajout de produits" : "Créez des demandes pour ajouter des produits au stock"}
        action={
          !isAdmin && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Nouvelle demande
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Créer une demande</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="product">Produit existant (optionnel)</Label>
                    <Select
                      value={formData.productId}
                      onValueChange={(value) =>
                        setFormData({ ...formData, productId: value, productNom: '' })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un produit existant" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.nom}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="text-center text-muted-foreground text-sm">ou</div>

                  <div className="space-y-2">
                    <Label htmlFor="productNom">Nouveau produit</Label>
                    <Input
                      id="productNom"
                      value={formData.productNom}
                      onChange={(e) =>
                        setFormData({ ...formData, productNom: e.target.value, productId: '' })
                      }
                      placeholder="Nom du nouveau produit"
                      disabled={!!formData.productId}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quantite">Quantité demandée</Label>
                    <Input
                      id="quantite"
                      type="number"
                      min="1"
                      value={formData.quantiteDemandee}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          quantiteDemandee: parseInt(e.target.value) || 1,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="commentaire">Commentaire</Label>
                    <Textarea
                      id="commentaire"
                      value={formData.commentaire}
                      onChange={(e) =>
                        setFormData({ ...formData, commentaire: e.target.value })
                      }
                      placeholder="Raison de la demande..."
                      rows={3}
                    />
                  </div>

                  <div className="flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Annuler
                    </Button>
                    <Button type="submit">Créer la demande</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="w-4 h-4 text-warning" />
              En attente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {filteredRequests.filter((r) => r.status === 'EN_ATTENTE').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-success" />
              Validées
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {filteredRequests.filter((r) => r.status === 'VALIDE').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <XCircle className="w-4 h-4 text-destructive" />
              Refusées
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {filteredRequests.filter((r) => r.status === 'REFUSE').length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            {isAdmin ? 'Toutes les demandes' : 'Mes demandes'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produit</TableHead>
                <TableHead>Quantité</TableHead>
                <TableHead>Commentaire</TableHead>
                <TableHead>Date</TableHead>
                {isAdmin && <TableHead>Demandeur</TableHead>}
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 6 : 5} className="text-center py-8">
                    <FileText className="w-12 h-12 mx-auto mb-2 text-muted-foreground/50" />
                    <p className="text-muted-foreground">Aucune demande</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">{request.productNom}</TableCell>
                    <TableCell>{request.quantiteDemandee} boîtes</TableCell>
                    <TableCell className="max-w-xs truncate">{request.commentaire}</TableCell>
                    <TableCell>
                      {new Date(request.dateCreation).toLocaleDateString('fr-FR')}
                    </TableCell>
                    {isAdmin && <TableCell>{request.userName}</TableCell>}
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Requests;
