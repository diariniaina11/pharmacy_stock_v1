import React, { useMemo, useState } from 'react';
import { useData } from '@/contexts/DataContext';
import PageHeader from '@/components/shared/PageHeader';
import SearchInput from '@/components/shared/SearchInput';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { History as HistoryIcon, ShoppingCart } from 'lucide-react';

const History: React.FC = () => {
  const { sales } = useData();
  const isAdmin = true;
  const user = { id: 'admin' };

  const [search, setSearch] = useState('');

  const filteredSales = useMemo(() => {
    let filtered = isAdmin ? sales : sales.filter((s) => s.userId === user?.id);

    if (search) {
      filtered = filtered.filter(
        (sale) =>
          sale.productNom.toLowerCase().includes(search.toLowerCase()) ||
          sale.userName.toLowerCase().includes(search.toLowerCase())
      );
    }

    return filtered.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [sales, isAdmin, user, search]);

  return (
    <div>
      <PageHeader
        title="Historique"
        description={
          isAdmin
            ? 'Historique complet de toutes les ventes'
            : 'Historique de vos ventes personnelles'
        }
      />

      {/* Search */}
      <div className="mb-6 max-w-md">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Rechercher par produit ou vendeur..."
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total des ventes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{filteredSales.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Produits vendus
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {filteredSales.reduce((acc, s) => acc + s.quantiteVendue, 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* History Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HistoryIcon className="w-5 h-5 text-primary" />
            Historique des ventes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Produit</TableHead>
                <TableHead>Quantité</TableHead>
                <TableHead>Vendeur</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSales.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    <ShoppingCart className="w-12 h-12 mx-auto mb-2 text-muted-foreground/50" />
                    <p className="text-muted-foreground">Aucune vente enregistrée</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredSales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell>
                      {new Date(sale.date).toLocaleDateString('fr-FR', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </TableCell>
                    <TableCell className="font-medium">{sale.productNom}</TableCell>
                    <TableCell>
                      <span className="badge-success">{sale.quantiteVendue} boîtes</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-xs font-medium text-primary">
                            {sale.userName.split(' ').map((n) => n[0]).join('')}
                          </span>
                        </div>
                        {sale.userName}
                      </div>
                    </TableCell>
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

export default History;
