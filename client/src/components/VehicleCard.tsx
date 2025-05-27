import { useState } from "react";
import type { Officer, Vehicle } from "@shared/schema";

interface VehicleCardProps {
  vehicle: Vehicle;
  officers: Officer[];
  onDrop: (vehicleId: number, slotNumber: number) => void;
  onRemoveOfficer: (officerId: number) => void;
  onAction: (vehicleId: number, action: string) => void;
  onDragStart: (officer: Officer) => void;
  onDragEnd: () => void;
  draggedOfficer: Officer | null;
  availableVehicles: Vehicle[];
  onVehicleChange: (newVehicleId: number, currentVehicleId: number) => void;
  cardIndex: number;
}

export default function VehicleCard({
  vehicle,
  officers,
  onDrop,
  onRemoveOfficer,
  onAction,
  onDragStart,
  onDragEnd,
  draggedOfficer,
  availableVehicles,
  onVehicleChange,
  cardIndex
}: VehicleCardProps) {
  const [dragOverSlot, setDragOverSlot] = useState<number | null>(null);

  const assignedOfficers = officers.filter(officer => officer.vehicleId === vehicle.id);
  const slot1Officer = assignedOfficers.find(officer => officer.slotNumber === 1);
  const slot2Officer = assignedOfficers.find(officer => officer.slotNumber === 2);
  const slot3Officer = assignedOfficers.find(officer => officer.slotNumber === 3);
  const slot4Officer = assignedOfficers.find(officer => officer.slotNumber === 4);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Disponible':
        return { indicator: 'bg-green-500', text: 'text-green-600' };
      case 'En Patrouille':
        return { indicator: 'bg-amber-500 status-indicator', text: 'text-amber-600' };
      case 'En Intervention':
        return { indicator: 'bg-red-500 status-indicator', text: 'text-red-600' };
      case 'ASL':
        return { indicator: 'bg-blue-500 status-indicator', text: 'text-blue-600' };
      case 'Hors Service':
        return { indicator: 'bg-gray-400', text: 'text-gray-600' };
      default:
        return { indicator: 'bg-gray-400', text: 'text-gray-600' };
    }
  };

  const statusColors = getStatusColor(vehicle.status);

  // Générer des modèles de véhicules spécifiques pour chaque carte
  const getVehicleModelsForCard = () => {
    const vehicleModels = [
      // Card 1
      ["Peugeot 508", "Renault Talisman", "Citroën C5 X", "BMW 320d", "Audi A4", "Mercedes C220"],
      // Card 2  
      ["Volkswagen Passat", "Ford Mondeo", "Opel Insignia", "Skoda Superb", "Toyota Camry", "Honda Accord"],
      // Card 3
      ["Peugeot 3008", "Renault Koleos", "Citroën C5 Aircross", "BMW X3", "Audi Q5", "Mercedes GLC"],
      // Card 4
      ["BMW 1250 RT", "Ford Kuga", "Opel Grandland", "Skoda Kodiaq", "Toyota RAV4", "Honda CR-V"],
      // Card 5
      ["Volkswagen Sharan", "Ford Kuga", "Opel Grandland", "Skoda Kodiaq", "Toyota RAV4", "Honda CR-V"]
    ];
    
    return vehicleModels[cardIndex % vehicleModels.length] || vehicleModels[0];
  };

  const vehicleModels = getVehicleModelsForCard();

  const handleDragOver = (e: React.DragEvent, slotNumber: number) => {
    e.preventDefault();
    setDragOverSlot(slotNumber);
  };

  const handleDragLeave = () => {
    setDragOverSlot(null);
  };

  const handleDrop = (e: React.DragEvent, slotNumber: number) => {
    e.preventDefault();
    setDragOverSlot(null);
    onDrop(vehicle.id, slotNumber);
  };

  const [selectedModel, setSelectedModel] = useState(vehicleModels[0] || "Peugeot 508");

  const handleModelSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedModel(e.target.value);
  };

  const renderOfficerSlot = (slotNumber: number, officer?: Officer) => {
    const isOccupied = !!officer;
    const isDragOver = dragOverSlot === slotNumber;

    const getSlotLabel = (slot: number) => {
      switch(slot) {
        case 1: return "Conducteur";
        case 2: return "Chef de patrouille";
        case 3: return "Équipier 1";
        case 4: return "Équipier 2";
        default: return `Poste ${slot}`;
      }
    };

    return (
      <div
        className={`officer-slot border-2 rounded-lg p-2 transition-colors min-h-[70px] ${
          isOccupied 
            ? 'border-green-300 bg-green-50' 
            : isDragOver
              ? 'border-blue-400 bg-blue-100'
              : 'border-dashed border-gray-300 bg-gray-50'
        } ${!isOccupied ? 'text-center' : ''}`}
        onDragOver={(e) => !isOccupied && handleDragOver(e, slotNumber)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => !isOccupied && handleDrop(e, slotNumber)}
      >
        <div className="text-xs text-gray-600 font-medium mb-1">{getSlotLabel(slotNumber)}</div>
        {officer ? (
          <div 
            className="flex items-center space-x-2 cursor-move officer-in-vehicle bg-white rounded-lg p-2 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200"
            draggable
            onDragStart={(e) => {
              onDragStart(officer);
            }}
            onDragEnd={onDragEnd}
          >
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-lg flex items-center justify-center text-xs font-bold">
              {officer.initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-800 text-sm truncate">{officer.name}</div>
              <div className="text-xs text-gray-500 truncate">{officer.badge}</div>
              <div className="text-xs text-blue-600 font-medium">{officer.rank}</div>
            </div>
            <div className="text-gray-400">
              <i className="fas fa-grip-dots-vertical text-xs"></i>
            </div>
          </div>
        ) : (
          <button
            onClick={() => onDrop(vehicle.id, slotNumber)}
            className="w-full h-full text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded border-2 border-dashed border-blue-300 hover:border-blue-500 transition-all duration-200 flex flex-col items-center justify-center"
          >
            <i className="fas fa-user-plus text-lg mb-1"></i>
            <p className="text-xs font-medium">Sélectionner</p>
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="vehicle-card bg-gradient-to-br from-white via-slate-50 to-blue-50 rounded-2xl shadow-xl border border-slate-200 p-6 hover:shadow-2xl hover:border-blue-400 transition-all duration-300 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-lg flex items-center justify-center shadow-lg border border-emerald-500">
            <i className="fas fa-car text-xl drop-shadow-sm"></i>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-800">{vehicle.callSign}</h3>
            <select
              value={selectedModel}
              onChange={handleModelSelection}
              className="text-sm text-gray-500 bg-transparent border-none outline-none cursor-pointer hover:text-blue-600 transition-colors duration-200 max-w-full"
            >
              {vehicleModels.map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${statusColors.indicator}`}></div>
          <span className={`text-sm font-medium ${statusColors.text}`}>{vehicle.status}</span>
        </div>
      </div>

      <div className="officer-slots mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Équipage (4 max)</h4>
        <div className="grid grid-cols-2 gap-2">
          {renderOfficerSlot(1, slot1Officer)}
          {renderOfficerSlot(2, slot2Officer)}
          {renderOfficerSlot(3, slot3Officer)}
          {renderOfficerSlot(4, slot4Officer)}
        </div>
      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={() => onAction(vehicle.id, 'startPatrol')}
            className="action-button btn-patrol px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center"
            disabled={assignedOfficers.length === 0}
          >
            <i className="fas fa-play mr-1"></i>
            Départ Patrouille
          </button>
          <button 
            onClick={() => onAction(vehicle.id, 'returnPatrol')}
            className="action-button btn-return px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center"
          >
            <i className="fas fa-home mr-1"></i>
            Retour Patrouille
          </button>
        </div>
        
        <div className="grid grid-cols-3 gap-2">
          <button 
            onClick={() => onAction(vehicle.id, 'aslMode')}
            className="action-button btn-asl px-2 py-2 rounded-lg text-xs font-medium flex items-center justify-center"
            disabled={assignedOfficers.length === 0}
          >
            <i className="fas fa-exclamation-triangle mr-1"></i>
            ASL
          </button>
          <button 
            onClick={() => onAction(vehicle.id, 'startIntervention')}
            className="action-button btn-intervention px-2 py-2 rounded-lg text-xs font-medium flex items-center justify-center"
            disabled={assignedOfficers.length === 0}
          >
            <i className="fas fa-siren mr-1"></i>
            Départ Intervention
          </button>
          <button 
            onClick={() => onAction(vehicle.id, 'returnIntervention')}
            className="action-button btn-return-intervention px-2 py-2 rounded-lg text-xs font-medium flex items-center justify-center"
            disabled={assignedOfficers.length === 0}
          >
            <i className="fas fa-check mr-1"></i>
            Retour Intervention
          </button>
        </div>

        {/* Zone de suppression par glisser-déposer */}
        <div 
          className={`border-t pt-3 transition-all duration-200 ${
            draggedOfficer 
              ? 'bg-red-50 border-red-200' 
              : 'border-gray-200'
          }`}
        >
          <div 
            className={`p-3 border-2 border-dashed rounded-lg transition-all duration-200 ${
              draggedOfficer 
                ? 'border-red-400 bg-red-100 text-red-600' 
                : 'border-gray-300 bg-gray-50 text-gray-500'
            }`}
            onDrop={(e) => {
              e.preventDefault();
              if (draggedOfficer) {
                onRemoveOfficer(draggedOfficer.id);
              }
            }}
            onDragOver={(e) => e.preventDefault()}
            onDragEnter={(e) => e.preventDefault()}
          >
            <div className="text-center">
              <i className={`fas fa-times-circle text-2xl mb-2 ${draggedOfficer ? 'text-red-500' : 'text-gray-400'}`}></i>
              <p className="text-sm font-medium">
                {draggedOfficer ? 'Relâcher pour retirer du véhicule' : 'Glisser un gendarme ici pour le retirer'}
              </p>
            </div>
          </div>
          
          <button 
            onClick={() => onAction(vehicle.id, 'clearAll')}
            className="action-button w-full mt-3 px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center bg-gray-500 hover:bg-gray-600 text-white transition-all duration-200"
            disabled={assignedOfficers.length === 0}
          >
            <i className="fas fa-user-times mr-2"></i>
            Retirer tout l'équipage
          </button>
        </div>
      </div>
    </div>
  );
}
