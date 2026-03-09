import React, { useEffect, useState } from 'react';
import { useData } from '@/contexts/AppServiceContext';
import PageHeader from '@/components/shared/PageHeader';
import StatCard from '@/components/shared/StatCard';
import { Package, AlertTriangle, XCircle, Users, TrendingUp, ShoppingCart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import axios from '@/api/axios';
import { useAuth } from '@/hooks/useAuth';

const Dashboard: React.FC = () => {
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
  const { auth } = useAuth();

  const today = new Date();

  const expiredProducts = products.filter(
    (p) => new Date(p.datePeremption) < today
  );

  const soonToExpire = products.filter((p) => {
    const expDate = new Date(p.datePeremption);
    const diffDays = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 30;
  });

  const outOfStock = products.filter((p) => p.quantiteBoites === 0);

  const [activeUsersCount, setActiveUsersCount] = useState<number>(0);

  const parseTimestampToMillis = (tsValue: any): number | null => {
    if (!tsValue) return null;
    const s = String(tsValue).trim();
    // Try ISO-like: replace space with T and assume UTC
    const isoAttempt = s.replace(' ', 'T') + 'Z';
    let t = Date.parse(isoAttempt);
    if (!isNaN(t)) return t;
    // Try without Z (local)
    t = Date.parse(s.replace(' ', 'T'));
    if (!isNaN(t)) return t;
    // Try direct parse
    t = Date.parse(s);
    if (!isNaN(t)) return t;
    return null;
  };

  useEffect(() => {
    let mounted = true;

    const computeActiveUsers = (allUsers: any[]) => {
      const now = Date.now();
      const onlineUsers = allUsers.filter((u) => {
        const updatedAt = u?.updated_at || u?.updatedAt || u?.updatedAt;
        const ms = parseTimestampToMillis(updatedAt);
        if (!ms) return false;
        return (now - ms) <= 60000;
      });
      const active = onlineUsers.length;
      // Log online user IDs
      console.log('Utilisateurs en ligne:', onlineUsers.map(u => u.id || u.name || 'inconnu'));
      // Log time difference for each user
      allUsers.forEach((u) => {
        const updatedAt = u?.updated_at || u?.updatedAt || u?.updatedAt;
        const ms = parseTimestampToMillis(updatedAt);
        if (ms) {
          const diffSec = Math.floor((now - ms) / 1000);
          console.log(`Utilisateur ${u.id || u.name || 'inconnu'}: écart = ${diffSec} secondes`);
        } else {
          console.log(`Utilisateur ${u.id || u.name || 'inconnu'}: updated_at invalide`);
        }
      });
      if (mounted) setActiveUsersCount(active);
    };

    const fetchAndCompute = async () => {
      try {
        const res = await axios.get('/users');
        const allUsers = Array.isArray(res.data) ? res.data : res.data?.data || [];
        computeActiveUsers(allUsers as any[]);
      } catch (err) {
        console.error('Erreur récupération utilisateurs:', err);
      }
    };

    // initial fetch
    fetchAndCompute();
    // refresh every 30 seconds
    const id = setInterval(fetchAndCompute, 30000);

    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

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

  const filteredSales = auth?.role === 'ADMIN'
    ? sales
    : sales.filter(s => String(s.user_id) === String(auth?.id));

  const salesByDay = filteredSales.reduce((acc, sale) => {
    const saleDate = new Date(sale.date_vente);
    const name = saleDate.toLocaleDateString('fr-FR', { weekday: 'short' });
    const fullDate = saleDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
    const existing = acc.find((item) => item.name === name);
    if (existing) {
      existing.ventes += sale.quantite_vendue;
    } else {
      acc.push({ name, fullDate, ventes: sale.quantite_vendue });
    }
    return acc;
  }, [] as { name: string; fullDate: string; ventes: number }[]);

  const COLORS = ['hsl(158, 64%, 40%)', 'hsl(142, 76%, 36%)', 'hsl(38, 92%, 50%)', 'hsl(200, 80%, 50%)', 'hsl(0, 84%, 60%)'];

  return (
    <div>
      <PageHeader
        title={`Bonjour, ${auth?.prenom} !`}
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
          value={activeUsersCount}
          icon={Users}
          variant="success"
          subtitle="Actifs (1 min)"
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
                  formatter={(value: any) => [`${value} ventes`]}
                  labelFormatter={(_, payload) => {
                    if (payload && payload.length > 0) {
                      return payload[0].payload.fullDate;
                    }
                    return "";
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
