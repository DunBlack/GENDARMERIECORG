import { useState, useEffect } from "react";
import DispatchHeader from "@/components/DispatchHeader";
import OfficersPanel from "@/components/OfficersPanel";
import VehicleCard from "@/components/VehicleCard";
import PersonnelManagement from "@/components/PersonnelManagement";
import { LoadingScreen } from "@/components/ui/loading-spinner";
import { useDispatchData } from "@/hooks/useDispatchData";
import { useWebSocket } from "@/hooks/useWebSocket";
import type { Officer, Vehicle } from "@shared/schema";

export default function DispatchPage() {
  const { officers, vehicles, corg, isLoading, updateVehicleStatus, assignOfficerToVehicle, removeOfficerFromVehicle, assignCorg, removeCorg } = useDispatchData();
  const finalCorg = corg ?? null;
  
  // Établir la connexion WebSocket pour les mises à jour temps réel
  useWebSocket();
  const [draggedOfficer, setDraggedOfficer] = useState<Officer | null>(null);
  const [showOfficerSelection, setShowOfficerSelection] = useState<{vehicleId: number, slotNumber: number} | null>(null);
  const [showCorgSelection, setShowCorgSelection] = useState(false);
  const [showPersonnelManagement, setShowPersonnelManagement] = useState(false);

  const availableOfficers = officers?.filter(officer => officer.available && !officer.isAssignedToCorg && !officer.vehicleId) || [];

  const handleDragStart = (officer: Officer) => {
    setDraggedOfficer(officer);
  };

  const handleDragEnd = () => {
    setDraggedOfficer(null);
  };

  const handleDropOnVehicle = async (vehicleId: number, slotNumber: number) => {
    // Nouveau système de sélection par clic
    setShowOfficerSelection({ vehicleId, slotNumber });
  };

  const handleOfficerSelect = async (officerId: number) => {
    if (!showOfficerSelection) return;

    try {
      await assignOfficerToVehicle.mutateAsync({
        officerId,
        vehicleId: showOfficerSelection.vehicleId,
        slotNumber: showOfficerSelection.slotNumber
      });
      setShowOfficerSelection(null);
    } catch (error) {
      console.error("Failed to assign officer:", error);
    }
  };

  const handleDropOnCorg = async () => {
    setShowCorgSelection(true);
  };

  const handleCorgSelect = async (officerId: number) => {
    try {
      await assignCorg.mutateAsync(officerId);
      setShowCorgSelection(false);
    } catch (error) {
      console.error("Failed to assign CORG:", error);
    }
  };

  const handleRemoveOfficer = async (officerId: number) => {
    try {
      await removeOfficerFromVehicle.mutateAsync(officerId);
    } catch (error) {
      console.error("Failed to remove officer:", error);
    }
  };

  const handleRemoveCorg = async () => {
    try {
      await removeCorg.mutateAsync();
    } catch (error) {
      console.error("Failed to remove CORG:", error);
    }
  };

  const handleRemoveAllCorgOfficers = async () => {
    try {
      // Retirer le CORG s'il y en a un
      if (finalCorg) {
        await removeCorg.mutateAsync();
      }
      
      // Retirer tous les gendarmes assignés au CORG (s'il y en a)
      const corgOfficers = officers?.filter(officer => officer.isAssignedToCorg) || [];
      for (const officer of corgOfficers) {
        await removeOfficerFromVehicle.mutateAsync(officer.id);
      }
    } catch (error) {
      console.error("Failed to remove all CORG officers:", error);
    }
  };

  const handleDropRemove = async () => {
    if (!draggedOfficer) return;

    try {
      if (draggedOfficer.isAssignedToCorg) {
        await removeCorg.mutateAsync();
      } else {
        await removeOfficerFromVehicle.mutateAsync(draggedOfficer.id);
      }
    } catch (error) {
      console.error("Failed to remove officer:", error);
    }
  };

  const handleVehicleChange = async (newVehicleId: number, currentVehicleId: number) => {
    // Cette fonction gérera le changement de véhicule
    // Pour l'instant, on peut simplement recharger les données
    console.log(`Changing vehicle from ${currentVehicleId} to ${newVehicleId}`);
  };

  const handleVehicleAction = async (vehicleId: number, action: string) => {
    if (action === 'clearAll') {
      // Remove all officers from this vehicle
      const vehicleOfficers = officers?.filter(officer => officer.vehicleId === vehicleId) || [];
      try {
        for (const officer of vehicleOfficers) {
          await removeOfficerFromVehicle.mutateAsync(officer.id);
        }
      } catch (error) {
        console.error("Failed to clear vehicle crew:", error);
      }
      return;
    }

    let newStatus: string;
    
    switch(action) {
      case 'startPatrol':
        newStatus = 'Départ Patrouille';
        break;
      case 'returnPatrol':
        newStatus = 'Fin de Patrouille';
        break;
      case 'aslMode':
        newStatus = 'ASL';
        break;
      case 'startIntervention':
        newStatus = 'Départ Intervention';
        break;
      case 'returnIntervention':
        newStatus = 'Retour Intervention';
        break;
      default:
        return;
    }

    try {
      await updateVehicleStatus.mutateAsync({ vehicleId, status: newStatus });
    } catch (error) {
      console.error("Failed to update vehicle status:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[hsl(var(--background))] flex items-center justify-center">
        <div className="text-lg">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 font-sans">
      <DispatchHeader onShowPersonnelManagement={() => setShowPersonnelManagement(true)} />
      
      <div className="max-w-7xl mx-auto p-6">
        {/* Section CORG en haut */}
        <div className="mb-6">
          <div className="bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 rounded-2xl shadow-xl border border-amber-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 text-white rounded-xl flex items-center justify-center shadow-lg">
                  <i className="fas fa-star text-2xl"></i>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">CORG (Coordinateur)</h2>
                  <p className="text-sm text-gray-600">Centre d'opérations et de renseignement de la gendarmerie</p>
                </div>
              </div>
              
              <div className="flex-1 max-w-md mx-8">
                {finalCorg ? (
                  <div className="bg-white rounded-lg p-4 shadow-md border border-amber-200">
                    <div className="flex items-center justify-between">
                      <div 
                        className="flex items-center space-x-3 flex-1 cursor-pointer hover:bg-amber-50 rounded p-2 transition-colors duration-200"
                        onClick={() => setShowCorgSelection(true)}
                        title="Cliquer pour changer le CORG"
                      >
                        <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 text-white rounded-lg flex items-center justify-center text-sm font-bold">
                          {finalCorg.initials}
                        </div>
                        <div>
                          <div className="font-medium text-gray-800">{finalCorg.name}</div>
                          <div className="text-sm text-gray-500">{finalCorg.badge}</div>
                          <div className="text-sm text-amber-600 font-medium">{finalCorg.rank}</div>
                        </div>
                      </div>
                      
                      {/* Boutons d'action */}
                      <div className="flex items-center space-x-1 ml-2">
                        <button 
                          onClick={handleDropOnCorg}
                          className="p-2 text-amber-500 hover:text-amber-700 hover:bg-amber-50 rounded-full transition-all duration-200"
                          title="Changer le CORG"
                        >
                          <i className="fas fa-exchange-alt text-sm"></i>
                        </button>
                        <button 
                          onClick={handleRemoveCorg}
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-all duration-200"
                          title="Retirer du poste CORG"
                        >
                          <i className="fas fa-trash-alt text-sm"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={handleDropOnCorg}
                    className="w-full p-4 border-2 border-dashed border-amber-300 rounded-lg text-amber-600 hover:text-amber-800 hover:bg-amber-100 hover:border-amber-500 transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    <i className="fas fa-user-plus text-xl"></i>
                    <span className="font-medium">Sélectionner un CORG</span>
                  </button>
                )}
              </div>

              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 bg-amber-100 px-4 py-2 rounded-full">
                  <div className="w-3 h-3 bg-amber-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-amber-700">Opérateur CORG</span>
                </div>
                
                {/* Bouton pour retirer tous les gendarmes du CORG */}
                <button
                  onClick={handleRemoveAllCorgOfficers}
                  className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 hover:text-red-800 rounded-lg transition-all duration-200 flex items-center space-x-2 text-sm font-medium"
                  title="Retirer tous les gendarmes du CORG"
                >
                  <i className="fas fa-user-times text-sm"></i>
                  <span>Vider le CORG</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center">
            <i className="fas fa-car mr-2 text-[hsl(var(--police-blue))]"></i>
            Unités de Patrouille
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles?.map((vehicle, index) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              officers={officers || []}
              onDrop={handleDropOnVehicle}
              onRemoveOfficer={handleRemoveOfficer}
              onAction={handleVehicleAction}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              draggedOfficer={draggedOfficer}
              availableVehicles={vehicles || []}
              onVehicleChange={handleVehicleChange}
              cardIndex={index}
            />
          ))}
        </div>
      </div>

      {/* Modal de sélection des gendarmes */}
      {showOfficerSelection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Sélectionner un Gendarme
              </h3>
              <button
                onClick={() => setShowOfficerSelection(null)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-all duration-200"
                title="Fermer"
              >
                <i className="fas fa-times text-lg"></i>
              </button>
            </div>
            
            <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800 font-medium">
                <i className="fas fa-car mr-2"></i>
                Poste: <span className="font-bold">
                  {showOfficerSelection.slotNumber === 1 ? "Conducteur" : 
                   showOfficerSelection.slotNumber === 2 ? "Passager" :
                   showOfficerSelection.slotNumber === 3 ? "Équipier 1" : "Équipier 2"}
                </span>
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Seuls les gendarmes libres et disponibles sont affichés
              </p>
            </div>

            <div className="space-y-3">
              {availableOfficers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <i className="fas fa-users text-3xl mb-2"></i>
                  <p className="font-medium">Aucun gendarme disponible</p>
                  <p className="text-xs mt-2">Tous les gendarmes sont soit indisponibles, soit déjà assignés</p>
                </div>
              ) : (
                availableOfficers.map((officer) => (
                  <button
                    key={officer.id}
                    onClick={() => handleOfficerSelect(officer.id)}
                    className="w-full p-4 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-lg transition-all duration-200 flex items-center space-x-3 text-left hover:shadow-md"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-lg flex items-center justify-center text-sm font-bold shadow-md">
                      {officer.initials}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-800 text-sm">{officer.name}</div>
                      <div className="text-xs text-gray-500">{officer.badge}</div>
                      <div className="text-xs text-blue-600 font-medium">{officer.rank}</div>
                    </div>
                    <div className="flex items-center bg-green-100 px-2 py-1 rounded-full">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      <span className="ml-1 text-xs text-green-700 font-medium">LIBRE</span>
                    </div>
                  </button>
                ))
              )}
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={() => setShowOfficerSelection(null)}
                className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all duration-200 font-medium"
              >
                <i className="fas fa-times mr-2"></i>
                Annuler la sélection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de sélection CORG */}
      {showCorgSelection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Sélectionner un CORG
              </h3>
              <button
                onClick={() => setShowCorgSelection(false)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-all duration-200"
                title="Fermer"
              >
                <i className="fas fa-times text-lg"></i>
              </button>
            </div>
            
            <div className="mb-4 bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-sm text-amber-800 font-medium">
                <i className="fas fa-star mr-2"></i>
                Poste: <span className="font-bold">Coordinateur Opérationnel</span>
              </p>
              <p className="text-xs text-amber-600 mt-1">
                Seuls les gendarmes libres et disponibles sont affichés
              </p>
            </div>

            <div className="space-y-3">
              {availableOfficers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <i className="fas fa-users text-3xl mb-2"></i>
                  <p className="font-medium">Aucun gendarme disponible</p>
                  <p className="text-xs mt-2">Tous les gendarmes sont soit indisponibles, soit déjà assignés</p>
                </div>
              ) : (
                availableOfficers.map((officer) => (
                  <button
                    key={officer.id}
                    onClick={() => handleCorgSelect(officer.id)}
                    className="w-full p-4 bg-gray-50 hover:bg-amber-50 border border-gray-200 hover:border-amber-300 rounded-lg transition-all duration-200 flex items-center space-x-3 text-left hover:shadow-md"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 text-white rounded-lg flex items-center justify-center text-sm font-bold shadow-md">
                      {officer.initials}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-800 text-sm">{officer.name}</div>
                      <div className="text-xs text-gray-500">{officer.badge}</div>
                      <div className="text-xs text-amber-600 font-medium">{officer.rank}</div>
                    </div>
                    <div className="flex items-center bg-green-100 px-2 py-1 rounded-full">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      <span className="ml-1 text-xs text-green-700 font-medium">LIBRE</span>
                    </div>
                  </button>
                ))
              )}
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={() => setShowCorgSelection(false)}
                className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all duration-200 font-medium"
              >
                <i className="fas fa-times mr-2"></i>
                Annuler la sélection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de gestion du personnel */}
      <PersonnelManagement 
        isOpen={showPersonnelManagement}
        onClose={() => setShowPersonnelManagement(false)}
      />
    </div>
  );
}
