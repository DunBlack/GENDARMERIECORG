import { useState } from "react";
import { useLocation } from "wouter";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
  const { login } = useAuth();
  const [, setLocation] = useLocation();
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: any) => {
    e.preventDefault();
    console.log("Tentative de connexion avec mot de passe:", password);
    setIsLoading(true);
    setError("");

    try {
      const success = await login(password);
      console.log("Résultat de la connexion:", success);
      if (success) {
        console.log("Connexion réussie, actualisation de la page");
        // Actualiser la page après connexion réussie
        window.location.reload();
      } else {
        console.log("Connexion échouée");
        setError("Mot de passe incorrect");
      }
    } catch (error) {
      console.error("Erreur lors de la connexion:", error);
      setError("Erreur de connexion. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl border border-blue-200 shadow-2xl">
          <div className="text-center space-y-4 p-8">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
              <i className="fas fa-shield-alt text-white text-3xl"></i>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Gendarmerie Nationale
              </h1>
              <p className="text-gray-600 mt-2">
                Système de Dispatch Opérationnel
              </p>
            </div>
          </div>
          
          <div className="p-8 pt-0 space-y-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Mot de passe d'accès
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Entrez le mot de passe"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isLoading}
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              <button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-2 px-4 rounded-md transition-all duration-200 disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Connexion en cours...
                  </>
                ) : (
                  <>
                    <i className="fas fa-sign-in-alt mr-2"></i>
                    Se connecter
                  </>
                )}
              </button>
            </form>

            <div className="text-center">
              <div className="text-xs text-gray-500 border-t pt-4">
                <p className="font-medium">Système sécurisé</p>
                <p>Accès réservé au personnel autorisé</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}