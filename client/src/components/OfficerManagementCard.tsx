import { Officer } from "@shared/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface OfficerManagementCardProps {
  officer: Officer;
  onDragStart: (officer: Officer) => void;
  onDragEnd: () => void;
  isDragging?: boolean;
}

export default function OfficerManagementCard({ 
  officer, 
  onDragStart, 
  onDragEnd, 
  isDragging 
}: OfficerManagementCardProps) {
  const queryClient = useQueryClient();

  const toggleAvailabilityMutation = useMutation({
    mutationFn: () => apiRequest("PATCH", `/api/officers/${officer.id}/availability`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/officers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/assignments/corg"] });
    }
  });

  const handleDragStart = () => {
    onDragStart(officer);
  };

  const handleToggleAvailability = () => {
    toggleAvailabilityMutation.mutate();
  };

  return (
    <div className="bg-gradient-to-r from-slate-50 to-blue-50 border-2 border-slate-200 rounded-xl p-4 mb-3 hover:shadow-lg transition-all duration-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[hsl(var(--gendarmerie-blue))] to-[hsl(var(--gendarmerie-blue-dark))] text-white rounded-lg flex items-center justify-center text-sm font-bold shadow-lg">
            {officer.initials}
          </div>
          <div>
            <div className="font-semibold text-gray-800">{officer.name}</div>
            <div className="text-sm text-gray-500">{officer.badge}</div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Bouton de statut */}
          <button
            onClick={handleToggleAvailability}
            disabled={toggleAvailabilityMutation.isPending}
            className={`px-4 py-2 text-sm font-bold rounded-lg transition-all duration-200 transform hover:scale-105 ${
              officer.available
                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-lg border border-green-400'
                : 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-lg border border-red-400'
            }`}
          >
            {toggleAvailabilityMutation.isPending 
              ? <i className="fas fa-spinner animate-spin"></i>
              : officer.available ? "DISPONIBLE" : "NON DISPO"
            }
          </button>
          
          {/* Indicateur d'assignation */}
          {officer.vehicleId && (
            <div className="px-2 py-1 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 text-xs rounded-full border border-blue-200">
              Assigné
            </div>
          )}
          
          {officer.isAssignedToCorg && (
            <div className="px-2 py-1 bg-gradient-to-r from-[hsl(var(--gendarmerie-gold))] to-yellow-500 text-white text-xs rounded-full font-bold shadow-lg">
              CORG
            </div>
          )}
        </div>
      </div>
      
      {/* Zone draggable uniquement si disponible */}
      {officer.available && !officer.vehicleId && !officer.isAssignedToCorg && (
        <div
          className={`mt-3 p-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-dashed border-blue-300 rounded-lg cursor-move hover:bg-gradient-to-r hover:from-blue-100 hover:to-indigo-100 hover:border-[hsl(var(--gendarmerie-blue))] transition-all duration-200 ${
            isDragging ? 'dragging opacity-50' : ''
          }`}
          draggable
          onDragStart={handleDragStart}
          onDragEnd={onDragEnd}
        >
          <div className="flex items-center justify-center text-sm text-gray-600">
            <i className="fas fa-grip-dots-vertical mr-2"></i>
            Glisser pour assigner
          </div>
        </div>
      )}
    </div>
  );
}