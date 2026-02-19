# Système d'Authentification et de Protection des Routes

## Vue d'ensemble

Le système d'authentification a été entièrement refactorisé pour protéger toutes les routes de l'application. Seules les pages de `login` et `register` sont accessibles sans authentification.

## Architecture

### 1. **AuthProvider** (`src/context/AuthProvider.tsx`)
Context React qui gère l'état d'authentification global.

**Fonctionnalités:**
- Vérifie l'authentification au chargement de l'application
- Gère l'état utilisateur (`auth`)
- Fournit la méthode `setAuth()` pour mettre à jour l'utilisateur
- Fournit la méthode `logout()` qui nettoie complètement le localStorage
- Persiste automatiquement l'utilisateur dans le localStorage

**État fourni:**
```typescript
{
  auth: User | null,          // Données utilisateur
  setAuth: (user) => void,    // Mise à jour utilisateur
  isAuthenticated: boolean,   // État d'authentification
  logout: () => void,         // Déconnexion
}
```

### 2. **Hook useAuth** (`src/hooks/useAuth.ts`)
Hook personnalisé pour accéder facilement au contexte d'authentification.

**Utilisation:**
```typescript
const { auth, setAuth, isAuthenticated, logout } = useAuth();
```

### 3. **ProtectedRoute** (`src/authguard/ProtectedRoute.tsx`)
Composant wrapper pour protéger les routes. Redirige vers `/login` si l'utilisateur n'est pas authentifié.

**Utilisation:**
```tsx
<Route
  element={
    <ProtectedRoute>
      <MainLayout />
    </ProtectedRoute>
  }
>
  <Route path="/dashboard" element={<Dashboard />} />
  {/* autres routes protégées */}
</Route>
```

## Flow d'Authentification

### 1. Connexion (Login)
```
1. Utilisateur remplit le formulaire
2. handleSubmit() appelle l'API
3. Si succès: setAuth() sauvegarde l'utilisateur
4. Redirection vers /dashboard
5. Le localStorage est mis à jour automatiquement
```

### 2. Accès aux routes protégées
```
1. Utilisateur essaie d'accéder à /dashboard
2. ProtectedRoute vérifie isAuthenticated
3. Si FALSE: Redirection vers /login
4. Si TRUE: Affichage du composant
```

### 3. Déconnexion (Logout)
```
1. Utilisateur clique sur le bouton Déconnexion
2. logout() est appelé
3. Nettoyage complet du localStorage:
   - user
   - pharmacy_products
   - pharmacy_sales
   - pharmacy_requests
4. auth et isAuthenticated sont réinitialisés
5. Redirection vers /login
```

## Routes Publiques vs Protégées

### Publiques (accessibles sans authentification)
- `/login` - Page de connexion
- `/register` - Page d'inscription
- `*` - Page 404 (Not Found)

### Protégées (nécessitent une authentification)
- `/` - Redirection vers /dashboard
- `/dashboard` - Tableau de bord
- `/produits` - Gestion des produits
- `/ventes` - Gestion des ventes
- `/peremptions` - Gestion des péremptions
- `/demandes` - Gestion des demandes
- `/validation` - Validation des demandes
- `/historique` - Historique des opérations

## Données dans localStorage

### User (`user`)
```json
{
  "id": "...",
  "prenom": "...",
  "nom": "...",
  "email": "...",
  "role": "ADMIN" | "VENDEUR",
  "badge_id": "..."
}
```

### Données métier (nettoyées à la déconnexion)
- `pharmacy_products` - Liste des produits
- `pharmacy_sales` - Historique des ventes
- `pharmacy_requests` - Demandes de produits

## Utilisation dans les composants

### Dans une page
```typescript
import { useAuth } from '@/hooks/useAuth';

export default function MyPage() {
  const { auth, logout } = useAuth();
  
  console.log(auth.prenom); // Données utilisateur
  console.log(auth.role);   // "ADMIN" ou "VENDEUR"
}
```

### Dans un composant
```typescript
import { useAuth } from '@/hooks/useAuth';

export default function UserProfile() {
  const { auth, logout } = useAuth();
  
  return (
    <div>
      <p>{auth?.prenom} {auth?.nom}</p>
      <button onClick={logout}>Déconnexion</button>
    </div>
  );
}
```

## Sécurité

✅ **Points de sécurité implémentés:**
1. Vérification d'authentification avant chaque route protégée
2. Nettoyage complet du localStorage à la déconnexion
3. Persistance de l'authentification au rechargement de page
4. Pas d'accès direct aux routes protégées sans authentification
5. Typage TypeScript complet

⚠️ **À améliorer:**
1. Implémenter un JWT ou token d'authentification
2. Ajouter une expiration de session
3. Valider le token côté serveur à chaque requête
4. Implémenter un refresh token
5. Ajouter une 2FA (Two-Factor Authentication)

## Dépannage

**Problème:** Redirection infinie vers /login
- **Cause:** `isAuthenticated` reste `false`
- **Solution:** Vérifier que `localStorage` contient `user`

**Problème:** Utilisateur reste connecté après fermeture du navigateur
- **Cause:** Données stockées dans localStorage
- **Solution:** Utiliser sessionStorage ou supprimer les données à la fermeture

**Problème:** useAuth() lance une erreur
- **Cause:** Hook utilisé en dehors d'un AuthProvider
- **Solution:** S'assurer que le composant est enfant d'AuthProvider dans App.tsx
