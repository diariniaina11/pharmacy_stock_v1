import React from 'react';
import { Navigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import PageHeader from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CheckSquare, Check, X, FileText, Clock } from 'lucide-react';
import { toast } from 'sonner';

const Validation: React.FC = () => {
  const { requests, updateRequestStatus } = useData();
  const { isAdmin } = useAuth();

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  const pendingRequests = requests.filter((r) => r.status === 'EN_ATTENTE');

  const handleValidate = (id: string) => {
    updateRequestStatus(id, 'VALIDE');
    toast.success('Demande validée - Stock mis à jour');
  };

  const handleReject = (id: string) => {
    updateRequestStatus(id, 'REFUSE');
    toast.info('Demande refusée');
  };

  return (
    <div>
      <PageHeader
        title="Validation des Demandes"
        description="Validez ou refusez les demandes d'ajout de produits"
      />

      {/* Stats */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Demandes en attente</p>
              <p className="text-3xl font-bold">{pendingRequests.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pending Requests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-primary" />
            Demandes à traiter
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
                <TableHead>Demandeur</TableHead>
                <TableHead className="w-[150px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingRequests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <FileText className="w-12 h-12 mx-auto mb-2 text-muted-foreground/50" />
                    <p className="text-muted-foreground">Aucune demande en attente</p>
                  </TableCell>
                </TableRow>
              ) : (
                pendingRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{request.productNom}</p>
                        {request.productId && (
                          <p className="text-xs text-muted-foreground">Produit existant</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{request.quantiteDemandee} boîtes</TableCell>
                    <TableCell className="max-w-xs">
                      <p className="truncate">{request.commentaire}</p>
                    </TableCell>
                    <TableCell>
                      {new Date(request.dateCreation).toLocaleDateString('fr-FR')}
                    </TableCell>
                    <TableCell>{request.userName}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleValidate(request.id)}
                          className="bg-success hover:bg-success/90"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleReject(request.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
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

export default Validation;
