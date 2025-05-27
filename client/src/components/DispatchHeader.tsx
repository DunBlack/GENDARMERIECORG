import { useState, useEffect } from "react";
import { useDispatchData } from "@/hooks/useDispatchData";
import { useAuth } from "@/hooks/useAuth";

interface DispatchHeaderProps {
  onShowPersonnelManagement?: () => void;
}

export default function DispatchHeader({ onShowPersonnelManagement }: DispatchHeaderProps) {
  const [lastUpdate, setLastUpdate] = useState<string>("");
  const { officers, vehicles } = useDispatchData();
  const { logout } = useAuth();

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setLastUpdate(now.toLocaleTimeString('fr-FR'));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  const availableOfficers = officers?.filter(officer => officer.available && !officer.isAssignedToCorg && !officer.vehicleId) || [];
  const assignedOfficers = officers?.filter(officer => officer.vehicleId !== null) || [];
  const unavailableOfficers = officers?.filter(officer => !officer.available) || [];
  const corgOfficer = officers?.find(officer => officer.isAssignedToCorg);
  
  const activeVehicles = vehicles?.filter(vehicle => 
    vehicle.status !== 'Disponible' && vehicle.status !== 'Hors Service'
  ) || [];

  return (
    <header className="bg-gradient-to-r from-blue-800 via-blue-700 to-blue-600 text-white py-6 px-6 shadow-2xl border-b-4 border-emerald-500">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <i className="fas fa-shield-alt text-2xl"></i>
            <div>
              <h1 className="text-2xl font-bold">GENDARMERIE NATIONALE</h1>
              <p className="text-sm opacity-90">Système de Dispatch - Centre Opérationnel Départemental</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm">
              <span className="opacity-80">Dernière mise à jour:</span>
              <span className="font-medium ml-1">{lastUpdate}</span>
            </div>
            <div className="w-3 h-3 bg-green-400 rounded-full status-indicator"></div>
            <button
              onClick={onShowPersonnelManagement}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded-md text-sm font-medium transition-colors duration-200 flex items-center space-x-1 mr-2"
              title="Gestion du Personnel"
            >
              <i className="fas fa-users text-sm"></i>
              <span>Personnel</span>
            </button>
            <button
              onClick={logout}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded-md text-sm font-medium transition-colors duration-200 flex items-center space-x-1"
              title="Se déconnecter"
            >
              <i className="fas fa-sign-out-alt text-sm"></i>
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
        
        {/* Tableau de bord des statistiques */}
        <div className="grid grid-cols-4 gap-4 mt-4">
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-4 text-center shadow-lg">
            <div className="text-2xl font-bold text-white">{availableOfficers.length}</div>
            <div className="text-sm text-green-100 uppercase tracking-wide">Disponibles</div>
            <i className="fas fa-user-check text-green-200 mt-1"></i>
          </div>
          
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-4 text-center shadow-lg">
            <div className="text-2xl font-bold text-white">{assignedOfficers.length}</div>
            <div className="text-sm text-blue-100 uppercase tracking-wide">En Mission</div>
            <i className="fas fa-car text-blue-200 mt-1"></i>
          </div>
          
          <div className="bg-gradient-to-br from-red-500 to-pink-600 rounded-xl p-4 text-center shadow-lg">
            <div className="text-2xl font-bold text-white">{unavailableOfficers.length}</div>
            <div className="text-sm text-red-100 uppercase tracking-wide">Non Dispo</div>
            <i className="fas fa-user-times text-red-200 mt-1"></i>
          </div>
          
          <div className="bg-gradient-to-br from-yellow-500 to-amber-600 rounded-xl p-4 text-center shadow-lg">
            <div className="text-2xl font-bold text-white">{corgOfficer ? 1 : 0}</div>
            <div className="text-sm text-yellow-100 uppercase tracking-wide">CORG Actif</div>
            <i className="fas fa-star text-yellow-200 mt-1"></i>
          </div>
        </div>
        
        {/* Informations CORG et véhicules */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-blue-500 border-opacity-30">
          <div className="flex items-center space-x-6">
            {corgOfficer && (
              <div className="flex items-center space-x-2 bg-yellow-500 bg-opacity-20 rounded-lg px-3 py-1">
                <i className="fas fa-star text-yellow-300"></i>
                <span className="text-yellow-100">CORG: <strong>{corgOfficer.name}</strong> ({corgOfficer.rank})</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2 text-sm">
            <i className="fas fa-car text-emerald-400"></i>
            <span className="text-blue-200">Véhicules actifs: <strong className="text-white">{activeVehicles.length}/{vehicles?.length || 0}</strong></span>
          </div>
        </div>
      </div>
    </header>
  );
}
