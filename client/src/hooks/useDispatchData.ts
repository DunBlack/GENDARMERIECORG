import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Officer, Vehicle } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useDispatchData() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: officers, isLoading: officersLoading } = useQuery<Officer[]>({
    queryKey: ["/api/officers"],
  });

  const { data: vehicles, isLoading: vehiclesLoading } = useQuery<Vehicle[]>({
    queryKey: ["/api/vehicles"],
  });

  const { data: corg } = useQuery<Officer | null>({
    queryKey: ["/api/assignments/corg"],
  });

  const updateVehicleStatus = useMutation({
    mutationFn: async ({ vehicleId, status }: { vehicleId: number; status: string }) => {
      const response = await apiRequest("PATCH", `/api/vehicles/${vehicleId}`, { status });
      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles"] });
      
      const statusMessages: Record<string, string> = {
        'En Patrouille': 'Patrouille démarrée',
        'Disponible': 'Retour à la base',
        'ASL': 'Mode ASL activé',
        'En Intervention': 'Intervention démarrée'
      };
      
      toast({
        title: "Statut mis à jour",
        description: statusMessages[variables.status] || "Statut du véhicule modifié",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut du véhicule",
        variant: "destructive",
      });
    },
  });

  const assignOfficerToVehicle = useMutation({
    mutationFn: async ({ officerId, vehicleId, slotNumber }: { officerId: number; vehicleId: number; slotNumber: number }) => {
      const response = await apiRequest("POST", "/api/assignments/vehicle", { 
        officerId, 
        vehicleId, 
        slotNumber 
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/officers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles"] });
      toast({
        title: "Assignation réussie",
        description: "Gendarme assigné au véhicule",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur d'assignation",
        description: error instanceof Error ? error.message : "Impossible d'assigner le gendarme",
        variant: "destructive",
      });
    },
  });

  const removeOfficerFromVehicle = useMutation({
    mutationFn: async (officerId: number) => {
      const response = await apiRequest("DELETE", `/api/assignments/vehicle/${officerId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/officers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles"] });
      toast({
        title: "Retrait effectué",
        description: "Gendarme retiré de l'assignation",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de retirer le gendarme",
        variant: "destructive",
      });
    },
  });

  const assignCorg = useMutation({
    mutationFn: async (officerId: number) => {
      const response = await apiRequest("POST", "/api/assignments/corg", { officerId });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/officers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/assignments/corg"] });
      toast({
        title: "CORG assigné",
        description: "Coordinateur désigné avec succès",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible d'assigner le CORG",
        variant: "destructive",
      });
    },
  });

  const removeCorg = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", "/api/assignments/corg");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/officers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/assignments/corg"] });
      toast({
        title: "CORG retiré",
        description: "Coordinateur retiré de l'assignation",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de retirer le CORG",
        variant: "destructive",
      });
    },
  });

  return {
    officers,
    vehicles,
    corg,
    isLoading: officersLoading || vehiclesLoading,
    updateVehicleStatus,
    assignOfficerToVehicle,
    removeOfficerFromVehicle,
    assignCorg,
    removeCorg,
  };
}
