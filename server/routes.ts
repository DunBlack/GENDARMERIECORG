import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer } from "ws";
import { storage } from "./storage";
import { insertOfficerSchema, insertVehicleSchema } from "@shared/schema";

// WebSocket pour les mises à jour temps réel
let wss: WebSocketServer;

function broadcastUpdate(type: string, data: any) {
  if (wss) {
    const message = JSON.stringify({ type, data });
    wss.clients.forEach((client) => {
      if (client.readyState === 1) { // WebSocket.OPEN
        client.send(message);
      }
    });
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Configuration de session simple
  const sessions = new Map<string, { authenticated: boolean; timestamp: number }>();
  const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 heures
  const ADMIN_PASSWORD = "gendarmerie2025"; // Mot de passe unique

  // Middleware d'authentification
  const requireAuth = (req: any, res: any, next: any) => {
    const sessionId = req.headers['x-session-id'] || req.headers.cookie?.match(/sessionId=([^;]+)/)?.[1];
    const session = sessionId && typeof sessionId === 'string' ? sessions.get(sessionId) : null;
    
    if (!session || !session.authenticated || (Date.now() - session.timestamp > SESSION_TIMEOUT)) {
      return res.status(401).json({ authenticated: false });
    }
    
    // Renouveler la session
    session.timestamp = Date.now();
    next();
  };

  // Routes d'authentification
  app.post("/api/auth/login", (req, res) => {
    const { password } = req.body;
    
    if (password === ADMIN_PASSWORD) {
      const sessionId = Math.random().toString(36).substring(2) + Date.now().toString(36);
      sessions.set(sessionId, { authenticated: true, timestamp: Date.now() });
      
      res.cookie('sessionId', sessionId, { 
        httpOnly: true, 
        secure: false, 
        maxAge: SESSION_TIMEOUT 
      });
      
      res.json({ authenticated: true, sessionId });
    } else {
      res.status(401).json({ message: "Mot de passe incorrect" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    const sessionId = req.headers['x-session-id'] || req.headers.cookie?.match(/sessionId=([^;]+)/)?.[1];
    if (sessionId && typeof sessionId === 'string') {
      sessions.delete(sessionId);
    }
    res.clearCookie('sessionId');
    res.json({ authenticated: false });
  });

  app.get("/api/auth/check", (req, res) => {
    const sessionId = req.headers['x-session-id'] || req.headers.cookie?.match(/sessionId=([^;]+)/)?.[1];
    const session = sessionId && typeof sessionId === 'string' ? sessions.get(sessionId) : null;
    
    if (session && session.authenticated && (Date.now() - session.timestamp <= SESSION_TIMEOUT)) {
      session.timestamp = Date.now();
      res.json({ authenticated: true });
    } else {
      res.status(401).json({ authenticated: false });
    }
  });

  // Officer routes (protégées)
  app.get("/api/officers", requireAuth, async (req, res) => {
    try {
      const officers = await storage.getAllOfficers();
      res.json(officers);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to get officers" });
    }
  });

  app.post("/api/officers", requireAuth, async (req, res) => {
    try {
      const validatedData = insertOfficerSchema.parse(req.body);
      const officer = await storage.createOfficer(validatedData);
      res.json(officer);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Failed to create officer" });
    }
  });

  app.patch("/api/officers/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const officer = await storage.updateOfficer(id, req.body);
      res.json(officer);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Failed to update officer" });
    }
  });

  // Vehicle routes
  app.get("/api/vehicles", requireAuth, async (req, res) => {
    try {
      const vehicles = await storage.getAllVehicles();
      res.json(vehicles);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to get vehicles" });
    }
  });

  app.post("/api/vehicles", requireAuth, async (req, res) => {
    try {
      const validatedData = insertVehicleSchema.parse(req.body);
      const vehicle = await storage.createVehicle(validatedData);
      res.json(vehicle);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Failed to create vehicle" });
    }
  });

  app.patch("/api/vehicles/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const vehicle = await storage.updateVehicle(id, req.body);
      res.json(vehicle);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Failed to update vehicle" });
    }
  });

  // Assignment routes
  app.post("/api/assignments/vehicle", requireAuth, async (req, res) => {
    try {
      const { officerId, vehicleId, slotNumber } = req.body;
      const officer = await storage.assignOfficerToVehicle(
        parseInt(officerId), 
        parseInt(vehicleId), 
        parseInt(slotNumber)
      );
      
      // Diffuser la mise à jour en temps réel
      broadcastUpdate("officer_assigned", { officer, vehicleId, slotNumber });
      
      res.json(officer);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Failed to assign officer to vehicle" });
    }
  });

  app.delete("/api/assignments/vehicle/:officerId", requireAuth, async (req, res) => {
    try {
      const officerId = parseInt(req.params.officerId);
      const officer = await storage.removeOfficerFromVehicle(officerId);
      
      // Diffuser la mise à jour en temps réel
      broadcastUpdate("officer_removed", officer);
      
      res.json(officer);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Failed to remove officer from vehicle" });
    }
  });

  app.post("/api/assignments/corg", requireAuth, async (req, res) => {
    try {
      const { officerId } = req.body;
      const officer = await storage.assignCorg(parseInt(officerId));
      
      // Diffuser la mise à jour en temps réel
      broadcastUpdate("corg_assigned", officer);
      
      res.json(officer);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Failed to assign CORG" });
    }
  });

  app.delete("/api/assignments/corg", requireAuth, async (req, res) => {
    try {
      await storage.removeCorg();
      
      // Diffuser la mise à jour en temps réel
      broadcastUpdate("corg_removed", {});
      
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Failed to remove CORG" });
    }
  });

  app.get("/api/assignments/corg", requireAuth, async (req, res) => {
    try {
      const corg = await storage.getCorg();
      res.json(corg || null);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to get CORG" });
    }
  });

  // Toggle officer availability
  app.patch("/api/officers/:id/availability", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const officer = await storage.toggleOfficerAvailability(Number(id));
      
      // Diffuser la mise à jour en temps réel
      broadcastUpdate("officer_updated", officer);
      
      res.json(officer);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Set all officers availability
  app.patch("/api/officers/all/availability", requireAuth, async (req, res) => {
    try {
      const { available } = req.body;
      const officers = await storage.setAllOfficersAvailability(available);
      
      // Diffuser la mise à jour en temps réel
      broadcastUpdate("all_officers_updated", { officers, available });
      
      res.json(officers);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);
  
  // Configuration WebSocket pour les mises à jour temps réel
  wss = new WebSocketServer({ 
    server: httpServer,
    path: '/ws'
  });
  
  wss.on('connection', (ws) => {
    console.log('Nouvelle connexion WebSocket établie');
    
    ws.on('close', () => {
      console.log('Connexion WebSocket fermée');
    });
  });
  
  return httpServer;
}
