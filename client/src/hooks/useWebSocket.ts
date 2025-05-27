import { useEffect, useRef } from 'react';
import { queryClient } from '@/lib/queryClient';

export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Établir la connexion WebSocket
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      console.log('Connexion WebSocket établie');
    };

    wsRef.current.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        
        // Invalider les caches appropriés selon le type de mise à jour
        switch (message.type) {
          case 'officer_updated':
          case 'officer_assigned':
          case 'officer_removed':
            // Invalider la liste des gendarmes
            queryClient.invalidateQueries({ queryKey: ['/api/officers'] });
            break;
            
          case 'corg_assigned':
          case 'corg_removed':
            // Invalider les données CORG
            queryClient.invalidateQueries({ queryKey: ['/api/assignments/corg'] });
            queryClient.invalidateQueries({ queryKey: ['/api/officers'] });
            break;
            
          default:
            console.log('Type de message WebSocket non reconnu:', message.type);
        }
      } catch (error) {
        console.error('Erreur lors du traitement du message WebSocket:', error);
      }
    };

    wsRef.current.onclose = () => {
      console.log('Connexion WebSocket fermée');
    };

    wsRef.current.onerror = (error) => {
      console.error('Erreur WebSocket:', error);
    };

    // Nettoyage lors du démontage du composant
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  return wsRef.current;
}