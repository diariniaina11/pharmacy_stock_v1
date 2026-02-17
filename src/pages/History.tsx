import React, { useMemo, useState, MouseEventHandler } from 'react';
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
import { History as HistoryIcon, ShoppingCart, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';

const History: React.FC = () => {
  const { sales, history } = useData();
  const isAdmin = true;
  const user = { id: 'admin' };

  const ButtonTab: React.FC<{ active?: boolean; onClick?: MouseEventHandler; children: React.ReactNode }> = ({ active, onClick, children }) => (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded-md text-sm font-medium ${active ? 'bg-primary/10 ring-1 ring-primary/30' : 'bg-transparent hover:bg-muted/50'}`}
    >
      {children}
    </button>
  );

  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'sale' | 'product' | 'request'>('all');

  const filteredHistory = useMemo(() => {
    let items = history;
    if (!isAdmin) {
      items = items.filter((h: any) => h.userId === user?.id);
    }
    if (selectedType !== 'all') {
      items = items.filter((h: any) => h.type === selectedType);
    }
    if (search) {
      const q = search.toLowerCase();
      items = items.filter((h: any) => {
        return (
          (h.productNom && h.productNom.toLowerCase().includes(q)) ||
          (h.userName && h.userName.toLowerCase().includes(q)) ||
          (h.action && h.action.toLowerCase().includes(q))
        );
      });
    }
    return items.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [history, isAdmin, user, selectedType, search]);

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

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex gap-2">
          <ButtonTab active={selectedType === 'all'} onClick={() => setSelectedType('all')}>Tous</ButtonTab>
          <ButtonTab active={selectedType === 'sale'} onClick={() => setSelectedType('sale')}>Ventes</ButtonTab>
          <ButtonTab active={selectedType === 'product'} onClick={() => setSelectedType('product')}>Produits</ButtonTab>
          <ButtonTab active={selectedType === 'request'} onClick={() => setSelectedType('request')}>Demandes</ButtonTab>
        </div>
        <div className="ml-auto max-w-md">
          <SearchInput value={search} onChange={setSearch} placeholder="Rechercher..." />
        </div>
      </div>

      {/* History Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HistoryIcon className="w-5 h-5 text-primary" />
            Journal d'activité
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Détails</TableHead>
                <TableHead>Utilisateur</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredHistory.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    <ShoppingCart className="w-12 h-12 mx-auto mb-2 text-muted-foreground/50" />
                    <p className="text-muted-foreground">Aucun historique</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredHistory.map((h: any) => (
                  <TableRow key={h.id}>
                    <TableCell>
                      {new Date(h.date).toLocaleDateString('fr-FR', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {h.type === 'sale' && h.action === 'create' && <ShoppingCart className="w-4 h-4 text-primary" />}
                        {h.type === 'sale' && h.action === 'update' && <Edit className="w-4 h-4 text-amber-500" />}
                        {h.type === 'sale' && h.action === 'delete' && <Trash2 className="w-4 h-4 text-destructive" />}
                        {h.type === 'request' && h.action === 'validate' && <CheckCircle className="w-4 h-4 text-success" />}
                        {h.type === 'request' && h.action === 'invalidate' && <XCircle className="w-4 h-4 text-warning" />}
                        {h.type === 'product' && h.action === 'create' && <ShoppingCart className="w-4 h-4" />}
                        <span className="font-medium">{h.type.toUpperCase()} — {h.action}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {h.productNom && <div className="font-medium">{h.productNom}</div>}
                      {h.quantity !== undefined && <div>{h.quantity} boîtes</div>}
                      {h.previousQuantity !== undefined && (
                        <div className="text-sm text-muted-foreground">Avant: {h.previousQuantity}</div>
                      )}
                      {h.newQuantity !== undefined && (
                        <div className="text-sm text-muted-foreground">Après: {h.newQuantity}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-xs font-medium text-primary">
                            {h.userName ? h.userName.split(' ').map((n:any) => n[0]).join('') : '??'}
                          </span>
                        </div>
                        {h.userName}
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
