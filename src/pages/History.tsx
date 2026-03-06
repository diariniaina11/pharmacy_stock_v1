import React, { useMemo, useState, MouseEventHandler } from 'react';
import { useData } from '@/contexts/AppServiceContext';
import { useAuth } from '@/hooks/useAuth';
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
import { History as HistoryIcon, ShoppingCart, Edit, Trash2, CheckCircle, XCircle, PlusCircle, MinusCircle, Package, Tag } from 'lucide-react';
import { HistoryItem } from '@/types';

const History: React.FC = () => {
  const { history } = useData();
  const { auth } = useAuth();
  const isAdmin = auth?.role === 'ADMIN';
  const user = auth;

  const ButtonTab: React.FC<{ active?: boolean; onClick?: MouseEventHandler; children: React.ReactNode }> = ({ active, onClick, children }) => (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded-md text-sm font-medium ${active ? 'bg-primary/10 ring-1 ring-primary/30' : 'bg-transparent hover:bg-muted/50'}`}
    >
      {children}
    </button>
  );

  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'sale' | 'product' | 'request' | 'category'>('all');

  const filteredHistory = useMemo(() => {
    let items = history;
    if (!isAdmin) {
      items = items.filter((h: any) => String(h.userId) === String(user?.id));
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
    return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [history, isAdmin, user, selectedType, search]);

  const getLogLabel = (item: HistoryItem) => {
    switch (item.action) {
      case 'produitPlus': return 'Augmentation stock';
      case 'produitMoins': return 'Diminution stock';
      case 'produitSupp': return 'Suppression produit';
      case 'produitNew': return 'Nouveau produit';
      case 'venteMoins': return 'Augmentation vente';
      case 'ventePlus': return 'Diminution vente';
      case 'venteSupp': return 'Suppression vente';
      case 'venteNew': return 'Nouvelle vente';
      case 'categNew': return 'Nouvelle catégorie';
      case 'categSupp': return 'Suppression catégorie';
      case 'create': return 'Création';
      case 'update': return 'Mise à jour';
      case 'delete': return 'Suppression';
      case 'validate': return 'Validation';
      case 'invalidate': return 'Refus';
      default: return item.action;
    }
  };

  const getLogIcon = (item: HistoryItem) => {
    if (item.action.includes('Plus') || item.action.includes('New') || item.action === 'create' || item.action === 'validate') {
      return <PlusCircle className="w-4 h-4 text-primary" />;
    }
    if (item.action.includes('Moins') || item.action.includes('Supp') || item.action === 'delete' || item.action === 'invalidate') {
      return <Trash2 className="w-4 h-4 text-destructive" />;
    }
    return <Edit className="w-4 h-4 text-amber-500" />;
  };

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

      <div className="mb-6 max-w-md">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder={isAdmin ? "Rechercher par produit ou vendeur..." : "Rechercher un produit..."}
        />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex gap-2">
          <ButtonTab active={selectedType === 'all'} onClick={() => setSelectedType('all')}>Tous</ButtonTab>
          <ButtonTab active={selectedType === 'sale'} onClick={() => setSelectedType('sale')}>Ventes</ButtonTab>
          <ButtonTab active={selectedType === 'product'} onClick={() => setSelectedType('product')}>Produits</ButtonTab>
          <ButtonTab active={selectedType === 'request'} onClick={() => setSelectedType('request')}>Demandes</ButtonTab>
          <ButtonTab active={selectedType === 'category'} onClick={() => setSelectedType('category')}>Catégories</ButtonTab>
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
                        {getLogIcon(h)}
                        <span className="font-medium">{h.type.toUpperCase()} — {getLogLabel(h)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {h.productNom && <div className="font-medium">{h.productNom}</div>}
                      {h.info && <div className="text-sm text-muted-foreground italic">{h.info}</div>}
                      {h.quantity !== undefined && <div>{h.quantity} boîtes</div>}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-xs font-medium text-primary">
                            {h.userName ? h.userName.split(' ').map((n: any) => n[0]).join('') : '??'}
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
