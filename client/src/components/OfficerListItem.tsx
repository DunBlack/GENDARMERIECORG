import { Officer } from "@shared/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface OfficerListItemProps {
  officer: Officer;
}

export default function OfficerListItem({ officer }: OfficerListItemProps) {
  const queryClient = useQueryClient();

  const toggleAvailabilityMutation = useMutation({
    mutationFn: () => apiRequest("PATCH", `/api/officers/${officer.id}/availability`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/officers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/assignments/corg"] });
    }
  });

  const handleToggleAvailability = () => {
    toggleAvailabilityMutation.mutate();
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 flex items-center justify-between hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-lg flex items-center justify-center text-xs font-bold">
          {officer.initials}
        </div>
        <div className="flex-1">
          <div className="font-medium text-gray-800">{officer.name}</div>
          <div className="text-xs text-gray-500">{officer.badge}</div>
          <div className="text-xs font-medium text-blue-600">{officer.rank}</div>
        </div>
      </div>
      
      <div className="flex items-center">
        {/* Switch de disponibilité uniquement */}
        <button
          onClick={handleToggleAvailability}
          disabled={toggleAvailabilityMutation.isPending}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            officer.available 
              ? 'bg-green-500 focus:ring-green-500' 
              : 'bg-red-500 focus:ring-red-500'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
              officer.available ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
          {toggleAvailabilityMutation.isPending && (
            <div className="absolute inset-0 flex items-center justify-center">
              <i className="fas fa-spinner animate-spin text-white text-xs"></i>
            </div>
          )}
        </button>
      </div>
    </div>
  );
}