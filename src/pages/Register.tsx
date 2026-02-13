import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Pill, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import axios from '@/api/axios';

const REGISTER_URL = '/users';

const Register: React.FC = () => {
    const nomRef = useRef<HTMLInputElement>(null);

    const [nom, setNom] = useState('');
    const [prenom, setPrenom] = useState('');
    const [email, setEmail] = useState('');
    const [pwd, setPwd] = useState('');
    const [confirmPwd, setConfirmPwd] = useState('');
    const [role, setRole] = useState('VENDEUR');
    const [badgeId, setBadgeId] = useState('');
    const [errMsg, setErrMsg] = useState('');

    useEffect(() => {
        if (nomRef.current) {
            nomRef.current.focus();
        }
    }, []);

    useEffect(() => {
        setErrMsg('');
    }, [nom, prenom, email, pwd, confirmPwd, badgeId]);

    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrMsg('');

        if (!nom || !prenom || !email || !pwd || !badgeId) {
            setErrMsg('Veuillez remplir tous les champs obligatoires');
            return;
        }

        if (pwd !== confirmPwd) {
            setErrMsg('Les mots de passe ne correspondent pas');
            return;
        }

        try {
            await axios.post(REGISTER_URL, {
                nom,
                prenom,
                email,
                password: pwd,
                role,
                badge_id: badgeId,
            });

            toast.success('Inscription réussie ! Vous pouvez maintenant vous connecter.');
            setNom('');
            setPrenom('');
            setEmail('');
            setPwd('');
            setConfirmPwd('');
            setBadgeId('');
            setRole('VENDEUR');
            navigate('/login');
        } catch (err: any) {
            if (err?.response?.status === 422) {
                setErrMsg('Email ou Badge déjà utilisé');
            } else {
                setErrMsg("Erreur lors de l'inscription");
            }
            console.error(err);
        }
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
                    <p className="text-muted-foreground mt-2">Créer un nouveau compte</p>
                </div>

                {/* Register Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Inscription</CardTitle>
                        <CardDescription>
                            Remplissez le formulaire pour créer votre compte
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {errMsg && (
                                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                    {errMsg}
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="nom">Nom</Label>
                                    <Input
                                        ref={nomRef}
                                        id="nom"
                                        type="text"
                                        placeholder="Dupont"
                                        value={nom}
                                        onChange={(e) => setNom(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="prenom">Prénom</Label>
                                    <Input
                                        id="prenom"
                                        type="text"
                                        placeholder="Jean"
                                        value={prenom}
                                        onChange={(e) => setPrenom(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="exemple@pharmacie.fr"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    autoComplete="email"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="badgeId">Badge ID</Label>
                                <Input
                                    id="badgeId"
                                    type="text"
                                    placeholder="Votre identifiant badge"
                                    value={badgeId}
                                    onChange={(e) => setBadgeId(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="role">Rôle</Label>
                                <select
                                    id="role"
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                >
                                    <option value="VENDEUR">Vendeur</option>
                                    <option value="ADMIN">Administrateur</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Mot de passe</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={pwd}
                                    onChange={(e) => setPwd(e.target.value)}
                                    autoComplete="new-password"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="••••••••"
                                    value={confirmPwd}
                                    onChange={(e) => setConfirmPwd(e.target.value)}
                                    autoComplete="new-password"
                                    required
                                />
                            </div>

                            <Button type="submit" className="w-full">
                                S'inscrire
                            </Button>
                        </form>
                        <p className="text-center text-sm text-muted-foreground mt-[20px]">
                            Déjà un compte ?{' '}
                            <Link to="/login" className="text-primary hover:underline">
                                Se connecter
                            </Link>
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Register;
