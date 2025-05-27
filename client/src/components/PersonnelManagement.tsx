import { useState } from "react";
import { useDispatchData } from "@/hooks/useDispatchData";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Officer } from "@shared/schema";

interface PersonnelManagementProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PersonnelManagement({ isOpen, onClose }: PersonnelManagementProps) {
  const { officers } = useDispatchData();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("");
  const queryClient = useQueryClient();

  const toggleAvailabilityMutation = useMutation({
    mutationFn: (officerId: number) => apiRequest("PATCH", `/api/officers/${officerId}/availability`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/officers"] });
    },
  });



  if (!isOpen) return null;

  // Obtenir tous les grades disponibles
  const availableGrades = Array.from(new Set(officers?.map(officer => officer.rank) || [])).sort();

  // Filtrer les gendarmes selon la recherche et le grade
  const filteredOfficers = officers?.filter(officer => {
    const matchesSearch = officer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         officer.badge.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGrade = selectedGrade === "" || officer.rank === selectedGrade;
    return matchesSearch && matchesGrade;
  }) || [];

  const handleToggleAvailability = (officerId: number) => {
    toggleAvailabilityMutation.mutate(officerId);
  };



  const getStatusBadge = (officer: Officer) => {
    if (!officer.available) {
      return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">NON DISPONIBLE</span>;
    } else if (officer.isAssignedToCorg) {
      return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">CORG</span>;
    } else if (officer.vehicleId) {
      return <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">EN MISSION</span>;
    } else {
      return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">DISPONIBLE</span>;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
        {/* En-tête */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <i className="fas fa-users text-2xl"></i>
              <div>
                <h2 className="text-xl font-bold">Gestion du Personnel</h2>
                <p className="text-blue-100 text-sm">Gérer la disponibilité des gendarmes</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors duration-200"
            >
              <i className="fas fa-times text-xl"></i>
            </button>
          </div>
        </div>

        {/* Filtres et recherche */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rechercher un gendarme
              </label>
              <div className="relative">
                <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Nom, matricule..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="md:w-64">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filtrer par grade
              </label>
              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Tous les grades</option>
                {availableGrades.map(grade => (
                  <option key={grade} value={grade}>{grade}</option>
                ))}
              </select>
            </div>
          </div>

        </div>

        {/* Liste des gendarmes */}
        <div className="p-6 overflow-y-auto max-h-96">
          <div className="grid gap-3">
            {filteredOfficers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <i className="fas fa-search text-3xl mb-2"></i>
                <p className="font-medium">Aucun gendarme trouvé</p>
                <p className="text-sm">Essayez de modifier vos critères de recherche</p>
              </div>
            ) : (
              filteredOfficers.map((officer) => (
                <div key={officer.id} className="bg-gray-50 rounded-lg p-4 flex items-center justify-between hover:bg-gray-100 transition-colors duration-200">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-lg flex items-center justify-center text-sm font-bold">
                      {officer.initials}
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">{officer.name}</div>
                      <div className="text-sm text-gray-500">{officer.badge}</div>
                      <div className="text-sm text-blue-600 font-medium">{officer.rank}</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    {getStatusBadge(officer)}
                    <button
                      onClick={() => handleToggleAvailability(officer.id)}
                      disabled={toggleAvailabilityMutation.isPending}
                      className={`px-4 py-2 text-sm font-bold rounded-lg transition-all duration-200 ${
                        officer.available
                          ? 'bg-red-500 hover:bg-red-600 text-white'
                          : 'bg-green-500 hover:bg-green-600 text-white'
                      } disabled:opacity-50`}
                    >
                      {toggleAvailabilityMutation.isPending ? (
                        <i className="fas fa-spinner animate-spin"></i>
                      ) : officer.available ? (
                        <>
                          <i className="fas fa-times mr-1"></i>
                          Indisponible
                        </>
                      ) : (
                        <>
                          <i className="fas fa-check mr-1"></i>
                          Disponible
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Statistiques et bouton de fermeture */}
        <div className="bg-gray-50 p-4 border-t border-gray-200">
          <div className="grid grid-cols-4 gap-4 text-center mb-4">
            <div>
              <div className="text-lg font-bold text-green-600">
                {officers?.filter(o => o.available && !o.vehicleId && !o.isAssignedToCorg).length || 0}
              </div>
              <div className="text-xs text-gray-600">Disponibles</div>
            </div>
            <div>
              <div className="text-lg font-bold text-blue-600">
                {officers?.filter(o => o.vehicleId).length || 0}
              </div>
              <div className="text-xs text-gray-600">En mission</div>
            </div>
            <div>
              <div className="text-lg font-bold text-yellow-600">
                {officers?.filter(o => o.isAssignedToCorg).length || 0}
              </div>
              <div className="text-xs text-gray-600">CORG</div>
            </div>
            <div>
              <div className="text-lg font-bold text-red-600">
                {officers?.filter(o => !o.available).length || 0}
              </div>
              <div className="text-xs text-gray-600">Non dispo</div>
            </div>
          </div>
          
          {/* Bouton de fermeture en bas */}
          <div className="flex justify-center">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200 font-medium flex items-center space-x-2"
            >
              <i className="fas fa-times"></i>
              <span>Fermer</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}