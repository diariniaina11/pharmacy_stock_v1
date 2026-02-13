import React, { useState, useRef, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Pill, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import AuthContext from '@/context/AuthProvider';
import axios from '@/api/axios';
import md5 from 'md5';

const LOGIN_URL = '/users';


const Login: React.FC = () => {
  const { setAuth } = useContext(AuthContext);
  // ✅ CORRECTION 1: Typage correct des refs
  const userRef = useRef<HTMLInputElement>(null);
  const errRef = useRef<HTMLParagraphElement>(null);

  const [user, setUser] = useState('');
  const [pwd, setPwd] = useState('');
  const [errMsg, setErrMsg] = useState('');
  const [success, setSuccess] = useState(false);

  // ✅ CORRECTION 2: Vérification + ref utilisée
  useEffect(() => {
    if (userRef.current) {
      userRef.current.focus();
    }
  }, []);

  useEffect(() => {
    setErrMsg('');
  }, [user, pwd]);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrMsg('');

    if (!user || !pwd) {
      setErrMsg('Veuillez remplir tous les champs');
      if (userRef.current) {
        userRef.current.focus();
      }
      return;
    }
    try {
      const response = await axios.get(`${LOGIN_URL}/${encodeURI(user)}`);
      let hashedPwd = md5(pwd);
      if (response.data.password === hashedPwd) {
        toast.success('Connexion réussie');

        setAuth({ user, hashedPwd });
        navigate('/dashboard');
      } else {
        setErrMsg("Mot de passe incorrect");
        toast.error('Mot de passe incorrect');

      }
    } catch (err) {
      console.log(err);
      setErrMsg("Utilisateur n'existe pas");
      toast.error('Utilisateur n\'existe pas');

    }

    // TODO: Ajouter l'appel API réel ici
    //success ? navigate('/dashboard') : true;

  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        {/* Logo */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary mb-4">
            <Pill className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">PharmaSys</h1>
          <p className="text-muted-foreground mt-2">Système de gestion de pharmacie</p>
        </div>

        {/* Login Card */}
        <Card>
          <CardHeader>
            <CardTitle>Connexion</CardTitle>
            <CardDescription>
              Connectez-vous à votre compte pour accéder au système
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {errMsg && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {errMsg}
                </div>
              )}

              {/* ✅ CORRECTION 3: Ajout de la ref à l'input */}
              <div className="space-y-2">
                <Label htmlFor="email">Identifiant (Email ou Badge)</Label>
                <Input
                  ref={userRef}  // ← LIEN CRUCIAL manquant !
                  id="email"
                  type="text"
                  placeholder="votre email ou badge"
                  value={user}
                  onChange={(e) => setUser(e.target.value)}
                  autoComplete="username"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={pwd}
                  onChange={(e) => setPwd(e.target.value)}
                  autoComplete="current-password"
                  required
                />
              </div>

              <Button type="submit" className="w-full">
                Se connecter
              </Button>
            </form>
            <p className="text-center text-sm text-muted-foreground mt-[20px]">
              Pas de compte ?{' '}
              <Link to="/register" className="text-primary hover:underline ">
                S'inscrire
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
