import React, { useMemo } from 'react';
import { useData } from '@/contexts/DataContext';
import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AlertTriangle, XCircle, Clock, Package } from 'lucide-react';

const Expirations: React.FC = () => {
  const { products } = useData();
  
  const today = new Date();

  const { expired, soonToExpire, safe } = useMemo(() => {
    const expired: typeof products = [];
    const soonToExpire: typeof products = [];
    const safe: typeof products = [];

    products.forEach((product) => {
      const expDate = new Date(product.datePeremption);
      const diffDays = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays < 0) {
        expired.push(product);
      } else if (diffDays <= 30) {
        soonToExpire.push(product);
      } else {
        safe.push(product);
      }
    });

    return { expired, soonToExpire, safe };
  }, [products]);

  const getDaysUntilExpiration = (dateStr: string) => {
    const expDate = new Date(dateStr);
    return Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  const ProductTable: React.FC<{
    items: typeof products;
    variant: 'expired' | 'warning' | 'safe';
  }> = ({ items, variant }) => {
    if (items.length === 0) {
      return (
        <div className="text-center py-8">
          <Package className="w-12 h-12 mx-auto mb-2 text-muted-foreground/50" />
          <p className="text-muted-foreground">Aucun produit dans cette catégorie</p>
        </div>
      );
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Produit</TableHead>
            <TableHead>N° Lot</TableHead>
            <TableHead>Date péremption</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Stock</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((product) => {
            const days = getDaysUntilExpiration(product.datePeremption);
            return (
              <TableRow key={product.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{product.nom}</p>
                    <p className="text-sm text-muted-foreground">{product.fournisseur}</p>
                  </div>
                </TableCell>
                <TableCell className="font-mono text-sm">{product.numeroLot}</TableCell>
                <TableCell>
                  {new Date(product.datePeremption).toLocaleDateString('fr-FR')}
                </TableCell>
                <TableCell>
                  {variant === 'expired' && (
                    <span className="badge-expired">
                      Périmé depuis {Math.abs(days)} jours
                    </span>
                  )}
                  {variant === 'warning' && (
                    <span className="badge-warning">
                      Expire dans {days} jours
                    </span>
                  )}
                  {variant === 'safe' && (
                    <span className="badge-success">
                      {days} jours restants
                    </span>
                  )}
                </TableCell>
                <TableCell>{product.quantiteBoites} boîtes</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    );
  };

  return (
    <div>
      <PageHeader
        title="Gestion des Péremptions"
        description="Suivez les dates de péremption de vos produits"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <XCircle className="w-4 h-4 text-destructive" />
              Produits périmés
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-destructive">{expired.length}</p>
          </CardContent>
        </Card>
        <Card className="border-warning/50 bg-warning/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-warning" />
              Péremption proche
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-warning">{soonToExpire.length}</p>
            <p className="text-sm text-muted-foreground">Dans les 30 prochains jours</p>
          </CardContent>
        </Card>
        <Card className="border-success/50 bg-success/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="w-4 h-4 text-success" />
              Produits valides
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-success">{safe.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Expired Products */}
      {expired.length > 0 && (
        <Card className="mb-6 border-destructive/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <XCircle className="w-5 h-5" />
              Produits périmés
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ProductTable items={expired} variant="expired" />
          </CardContent>
        </Card>
      )}

      {/* Soon to Expire */}
      <Card className="mb-6 border-warning/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-warning">
            <AlertTriangle className="w-5 h-5" />
            Péremption proche (30 jours)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ProductTable items={soonToExpire} variant="warning" />
        </CardContent>
      </Card>

      {/* Safe Products */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-success">
            <Clock className="w-5 h-5" />
            Produits valides
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ProductTable items={safe} variant="safe" />
        </CardContent>
      </Card>
    </div>
  );
};

export default Expirations;
