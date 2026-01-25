import React from 'react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { mockUsers } from '@/data/mockData';
import PageHeader from '@/components/shared/PageHeader';
import StatCard from '@/components/shared/StatCard';
import { Package, AlertTriangle, XCircle, Users, TrendingUp, ShoppingCart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Dashboard: React.FC = () => {
  const { products, sales } = useData();
  const { user } = useAuth();

  const today = new Date();
  
  const expiredProducts = products.filter(
    (p) => new Date(p.datePeremption) < today
  );
  
  const soonToExpire = products.filter((p) => {
    const expDate = new Date(p.datePeremption);
    const diffDays = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 30;
  });
  
  const outOfStock = products.filter(
    (p) => p.quantiteBoites === 0
  );

  // Chart data
  const categoryData = products.reduce((acc, product) => {
    const existing = acc.find((item) => item.name === product.categorie);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: product.categorie, value: 1 });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  const salesByDay = sales.reduce((acc, sale) => {
    const date = new Date(sale.date).toLocaleDateString('fr-FR', { weekday: 'short' });
    const existing = acc.find((item) => item.name === date);
    if (existing) {
      existing.ventes += sale.quantiteVendue;
    } else {
      acc.push({ name: date, ventes: sale.quantiteVendue });
    }
    return acc;
  }, [] as { name: string; ventes: number }[]);

  const COLORS = ['hsl(158, 64%, 40%)', 'hsl(142, 76%, 36%)', 'hsl(38, 92%, 50%)', 'hsl(200, 80%, 50%)', 'hsl(0, 84%, 60%)'];

  return (
    <div>
      <PageHeader
        title={`Bonjour, ${user?.prenom} !`}
        description="Voici un aperçu de votre pharmacie"
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Produits"
          value={products.length}
          icon={Package}
          variant="primary"
          subtitle="En catalogue"
        />
        <StatCard
          title="Péremption proche"
          value={soonToExpire.length}
          icon={AlertTriangle}
          variant="warning"
          subtitle="Dans les 30 jours"
        />
        <StatCard
          title="Rupture de stock"
          value={outOfStock.length}
          icon={XCircle}
          variant="destructive"
          subtitle="À réapprovisionner"
        />
        <StatCard
          title="Utilisateurs"
          value={mockUsers.length}
          icon={Users}
          variant="success"
          subtitle="Actifs"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-primary" />
              Ventes récentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="ventes" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Produits par catégorie
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {categoryData.slice(0, 5).map((item, index) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-sm text-muted-foreground">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {(expiredProducts.length > 0 || outOfStock.length > 0) && (
        <Card className="border-warning/50 bg-warning/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-warning">
              <AlertTriangle className="w-5 h-5" />
              Alertes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {expiredProducts.length > 0 && (
                <p className="text-sm">
                  <span className="badge-expired">{expiredProducts.length} produit(s) périmé(s)</span>
                  {' '}nécessitent une action immédiate
                </p>
              )}
              {outOfStock.length > 0 && (
                <p className="text-sm">
                  <span className="badge-warning">{outOfStock.length} produit(s) en rupture</span>
                  {' '}doivent être réapprovisionnés
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
