import { useState } from "react";
import OfficerCard from "./OfficerCard";
import OfficerListItem from "./OfficerListItem";
import type { Officer } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";

interface OfficersPanelProps {
  availableOfficers: Officer[];
  corg: Officer | null;
  onDragStart: (officer: Officer) => void;
  onDragEnd: () => void;
  onDropCorg: () => void;
  onRemoveCorg: () => void;
  onDropRemove: () => void;
  draggedOfficer: Officer | null;
}

export default function OfficersPanel({
  availableOfficers,
  corg,
  onDragStart,
  onDragEnd,
  onDropCorg,
  onRemoveCorg,
  onDropRemove,
  draggedOfficer
}: OfficersPanelProps) {
  const [isDragOverCorg, setIsDragOverCorg] = useState(false);
  const [isDragOverRemove, setIsDragOverRemove] = useState(false);
  
  // Récupérer tous les gendarmes pour la gestion complète
  const { data: allOfficers = [] } = useQuery<Officer[]>({
    queryKey: ["/api/officers"],
  });

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverCorg(true);
  };

  const handleDragLeave = () => {
    setIsDragOverCorg(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverCorg(false);
    onDropCorg();
  };

  return (
    <div className="lg:col-span-1 h-fit">
      <div className="officers-panel rounded-2xl shadow-2xl p-6 bg-gradient-to-br from-white via-blue-50 to-blue-100 border border-blue-200 hover:border-blue-400 transition-all duration-300 h-full flex flex-col backdrop-blur-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center mr-3">
              <i className="fas fa-users text-white text-sm"></i>
            </div>
            Gestion du Personnel
          </h2>
          <div className="flex items-center space-x-2 bg-blue-100 px-3 py-1 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-medium text-blue-700">Temps réel</span>
          </div>
        </div>
        
        {/* Liste des gendarmes avec boutons DISPONIBLE/INDISPO */}
        <div className="mb-6 flex-1">
          <h3 className="text-md font-medium text-gray-700 mb-3 flex items-center">
            <i className="fas fa-users mr-2 text-blue-600"></i>
            Liste des Gendarmes
          </h3>
          <div className="space-y-2 h-full overflow-y-auto">
            {allOfficers.map((officer) => (
              <OfficerListItem
                key={officer.id}
                officer={officer}
              />
            ))}
          </div>
        </div>

        {/* Zone de glisser-déposer pour les gendarmes DISPONIBLES uniquement */}
        <div className="mb-6">
          <h3 className="text-md font-medium text-gray-700 mb-3 flex items-center">
            <i className="fas fa-hand-paper mr-2 text-green-600"></i>
            Gendarmes Disponibles
          </h3>
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-dashed border-blue-300 p-4 min-h-[200px] space-y-2 hover:border-blue-500 hover:bg-gradient-to-br hover:from-blue-100 hover:to-indigo-100 transition-all duration-200">
            <div className="text-center text-blue-600 text-sm font-medium mb-3">
              <i className="fas fa-car mr-2"></i>
              Glisser ici pour les patrouilles
            </div>
            {availableOfficers.length > 0 ? (
              <div className="space-y-3">
                {availableOfficers.map((officer) => (
                  <OfficerCard
                    key={officer.id}
                    officer={officer}
                    onDragStart={onDragStart}
                    onDragEnd={onDragEnd}
                    isDragging={draggedOfficer?.id === officer.id}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                <i className="fas fa-clock text-2xl mb-2 text-gray-400"></i>
                <p className="text-sm">Aucun gendarme disponible</p>
              </div>
            )}
          </div>
        </div>

        <div className="border-t pt-6">
          <h3 className="text-md font-semibold text-gray-800 mb-3 flex items-center">
            <i className="fas fa-star mr-2 text-[hsl(var(--gendarmerie-gold))]"></i>
            CORG (Coordinateur)
          </h3>
          <div 
            className={`min-h-20 border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
              isDragOverCorg 
                ? 'border-amber-400 bg-amber-100' 
                : 'border-amber-300 bg-amber-50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {corg ? (
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-[hsl(var(--gendarmerie-gold))] text-black rounded-full flex items-center justify-center text-sm font-medium">
                  <span>{corg.initials}</span>
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-800">{corg.name}</div>
                  <div className="text-sm text-gray-500">{corg.badge}</div>
                </div>
                <button 
                  onClick={onRemoveCorg}
                  className="text-red-500 hover:text-red-700"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            ) : (
              <div className="text-amber-600">
                <i className="fas fa-hand-point-up mb-2"></i>
                <p className="text-sm">Glissez un gendarme ici pour le désigner comme CORG</p>
              </div>
            )}
          </div>
        </div>

        <div className="border-t pt-6">
          <h3 className="text-md font-semibold text-gray-800 mb-3 flex items-center">
            <i className="fas fa-user-times mr-2 text-red-600"></i>
            Zone de Retrait
          </h3>
          <div 
            className={`remove-zone min-h-16 rounded-lg p-4 text-center transition-all ${
              isDragOverRemove ? 'drag-over' : ''
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOverRemove(true);
            }}
            onDragLeave={() => setIsDragOverRemove(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragOverRemove(false);
              onDropRemove();
            }}
          >
            <i className="fas fa-trash-alt text-2xl text-red-600 mb-2"></i>
            <p className="text-sm text-red-600 font-medium">Glissez un gendarme ici pour le retirer de sa mission</p>
          </div>
        </div>
      </div>
    </div>
  );
}
