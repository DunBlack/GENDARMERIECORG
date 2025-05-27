import { 
  officers, 
  vehicles, 
  users, 
  type Officer, 
  type Vehicle, 
  type User, 
  type InsertOfficer, 
  type InsertVehicle, 
  type InsertUser 
} from "@shared/schema";

export interface IStorage {
  // User methods (existing)
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Officer methods
  getAllOfficers(): Promise<Officer[]>;
  getOfficer(id: number): Promise<Officer | undefined>;
  createOfficer(officer: InsertOfficer): Promise<Officer>;
  updateOfficer(id: number, updates: Partial<Officer>): Promise<Officer>;
  deleteOfficer(id: number): Promise<void>;
  toggleOfficerAvailability(id: number): Promise<Officer>;
  setAllOfficersAvailability(available: boolean): Promise<Officer[]>;

  // Vehicle methods
  getAllVehicles(): Promise<Vehicle[]>;
  getVehicle(id: number): Promise<Vehicle | undefined>;
  createVehicle(vehicle: InsertVehicle): Promise<Vehicle>;
  updateVehicle(id: number, updates: Partial<Vehicle>): Promise<Vehicle>;
  deleteVehicle(id: number): Promise<void>;

  // Assignment methods
  assignOfficerToVehicle(officerId: number, vehicleId: number, slotNumber: number): Promise<Officer>;
  removeOfficerFromVehicle(officerId: number): Promise<Officer>;
  assignCorg(officerId: number): Promise<Officer>;
  removeCorg(): Promise<void>;
  getCorg(): Promise<Officer | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private officers: Map<number, Officer>;
  private vehicles: Map<number, Vehicle>;
  private currentUserId: number;
  private currentOfficerId: number;
  private currentVehicleId: number;

  constructor() {
    this.users = new Map();
    this.officers = new Map();
    this.vehicles = new Map();
    this.currentUserId = 1;
    this.currentOfficerId = 1;
    this.currentVehicleId = 1;

    // Initialize with sample data
    this.initializeData();
  }

  private initializeData() {
    // Initialize vehicles
    const vehicleData = [
      { callSign: "PAM STRASBOURG", license: "VH-001-GP", status: "Hors Service" },
      { callSign: "BGE STRASBOURG", license: "VH-002-GP", status: "Hors Service" },
      { callSign: "CCB STRASBOURG", license: "VH-003-GP", status: "Hors Service" },
      { callSign: "BMO FERGERSHEIM", license: "VH-004-GP", status: "Hors Service" },
      { callSign: "PAM FERGERSHEIM", license: "VH-005-GP", status: "Hors Service" },
      { callSign: "PAM SAVERNE", license: "VH-006-GP", status: "Hors Service" },
      { callSign: "PSIG CYNO", license: "VH-007-GP", status: "Hors Service" },
      { callSign: "PSIG STRASBOURG", license: "VH-008-GP", status: "Hors Service" },
      { callSign: "PGM ST-BLAIS-LA-ROCHE", license: "VH-009-GP", status: "Hors Service" },
      { callSign: "PATROUILLE 1", license: "VH-010-GP", status: "Hors Service" },
      { callSign: "PATROUILLE 2", license: "VH-011-GP", status: "Hors Service" },
      { callSign: "SAG 67 - ALPHA 20", license: "VH-012-GP", status: "Hors Service" }
    ];

    vehicleData.forEach(async (vehicle) => {
      await this.createVehicle(vehicle);
    });



    // Create officers with Nigend IDs and correct field names
    const officersWithNigendIds = [
      // GENDARMES ADJOINTS VOLONTAIRES
      { id: 500200, name: "slowxix", badge: "Matricule: 1998501", initials: "EGAV", rank: "EGAV", available: true, isAssignedToCorg: false, vehicleId: null, slotNumber: null },
      { id: 500101, name: "neige_fardes", badge: "Matricule: 1943403", initials: "GA2", rank: "GAV", available: true, isAssignedToCorg: false, vehicleId: null, slotNumber: null },
      { id: 426031, name: "cr3v4rd25", badge: "Matricule: 1943119", initials: "GA2", rank: "GAV", available: true, isAssignedToCorg: false, vehicleId: null, slotNumber: null },
      { id: 495563, name: "lynxx54", badge: "Matricule: 1943136", initials: "GA2", rank: "GAV", available: true, isAssignedToCorg: false, vehicleId: null, slotNumber: null },
      { id: 500106, name: "diabolo.off", badge: "Matricule: 1965687", initials: "GA2", rank: "GAV", available: true, isAssignedToCorg: false, vehicleId: null, slotNumber: null },
      { id: 392001, name: "oscar_55", badge: "Matricule: 1943402", initials: "GA1", rank: "GA1", available: true, isAssignedToCorg: false, vehicleId: null, slotNumber: null },
      { id: 500102, name: "stellyxytb", badge: "Matricule: 1943404", initials: "GA1", rank: "GA1", available: true, isAssignedToCorg: false, vehicleId: null, slotNumber: null },
      { id: 500103, name: "killercrocs57", badge: "Matricule: 1943404", initials: "GA1", rank: "GA1", available: false, isAssignedToCorg: false, vehicleId: null, slotNumber: null },
      
      // BRIGADIERS
      { id: 495613, name: "lea_2012", badge: "Matricule: 1943303", initials: "BRI", rank: "Brigadier", available: true, isAssignedToCorg: false, vehicleId: null, slotNumber: null },
      { id: 474801, name: "martinezzz5700", badge: "Matricule: 1943113", initials: "BRI", rank: "Brigadier", available: true, isAssignedToCorg: false, vehicleId: null, slotNumber: null },
      { id: 487648, name: "kiwixx00", badge: "Matricule: 1943133", initials: "BRI", rank: "Brigadier", available: true, isAssignedToCorg: false, vehicleId: null, slotNumber: null },
      { id: 428433, name: "thegeekflood", badge: "Matricule: 1943134", initials: "BRI", rank: "Brigadier", available: false, isAssignedToCorg: false, vehicleId: null, slotNumber: null },
      
      // BRIGADIERS-CHEF
      { id: 458039, name: "mryestra", badge: "Matricule: 1943401", initials: "BRC", rank: "Brigadier-Chef", available: true, isAssignedToCorg: false, vehicleId: null, slotNumber: null },
      { id: 500104, name: "mikou63.", badge: "Matricule: 1943405", initials: "BRC", rank: "Brigadier-Chef", available: true, isAssignedToCorg: false, vehicleId: null, slotNumber: null },
      
      // MARÉCHAL DES LOGIS
      { id: 434782, name: "rouquin.37", badge: "Matricule: 1943501", initials: "GND", rank: "Maréchal des logis", available: true, isAssignedToCorg: false, vehicleId: null, slotNumber: null },
      
      // SOUS-OFFICIERS
      { id: 461087, name: "vicealmadopnj", badge: "Matricule: 1944302", initials: "ELG", rank: "Élève-Gendarme", available: true, isAssignedToCorg: false, vehicleId: null, slotNumber: null },
      { id: 478659, name: "anonyme8121", badge: "Matricule: 1944303", initials: "ELG", rank: "Élève-Gendarme", available: true, isAssignedToCorg: false, vehicleId: null, slotNumber: null },
      { id: 354190, name: "bouro78", badge: "Matricule: 1944309", initials: "ELG", rank: "Élève-Gendarme", available: false, isAssignedToCorg: false, vehicleId: null, slotNumber: null },
      { id: 417260, name: "anonymous9614", badge: "Matricule: 1944401", initials: "ELG", rank: "Élève-Gendarme", available: true, isAssignedToCorg: false, vehicleId: null, slotNumber: null },
      { id: 447092, name: "marcodublondsp", badge: "Matricule: 1944402", initials: "ELG", rank: "Élève-Gendarme", available: true, isAssignedToCorg: false, vehicleId: null, slotNumber: null },
      { id: 470912, name: "salvendk", badge: "Matricule: 1944702", initials: "ELG", rank: "Élève-Gendarme", available: true, isAssignedToCorg: false, vehicleId: null, slotNumber: null },
      
      // GENDARMES DE CARRIÈRE
      { id: 345870, name: "xertouille", badge: "Matricule: 1944313", initials: "GND2", rank: "Gendarme de Carrière", available: true, isAssignedToCorg: false, vehicleId: null, slotNumber: null },
      { id: 489302, name: "flowflexx", badge: "Matricule: 1944404", initials: "GND2", rank: "Gendarme de Carrière", available: true, isAssignedToCorg: false, vehicleId: null, slotNumber: null },
      { id: 472618, name: "lantillai", badge: "Matricule: 1944307", initials: "GND2", rank: "Gendarme de Carrière", available: false, isAssignedToCorg: false, vehicleId: null, slotNumber: null },
      { id: 381924, name: "thibaultcadro", badge: "Matricule: 1944501", initials: "GND2", rank: "Gendarme de Carrière", available: true, isAssignedToCorg: false, vehicleId: null, slotNumber: null },
      { id: 349758, name: "alphiyouriste", badge: "Matricule: 1944305", initials: "GND2", rank: "Gendarme de Carrière", available: true, isAssignedToCorg: false, vehicleId: null, slotNumber: null },
      
      // MARÉCHAL DES LOGIS-CHEF
      { id: 491270, name: "xxstarpoloxx", badge: "Matricule: 1944306", initials: "MDC", rank: "Maréchal des Logis-Chef", available: true, isAssignedToCorg: false, vehicleId: null, slotNumber: null },
      
      // ADJUDANT
      { id: 312087, name: "papo13", badge: "Matricule: 1944403", initials: "ADJ", rank: "Adjudant", available: true, isAssignedToCorg: false, vehicleId: null, slotNumber: null },
      
      // ADJUDANTS-CHEF
      { id: 395377, name: "rombibouch", badge: "Matricule: 1944502", initials: "ADC", rank: "Adjudant-Chef", available: true, isAssignedToCorg: false, vehicleId: null, slotNumber: null },
      { id: 352688, name: "tomi_2310", badge: "Matricule: 1944701", initials: "ADC", rank: "Adjudant-Chef", available: false, isAssignedToCorg: false, vehicleId: null, slotNumber: null },
      { id: 318540, name: "florentmasse", badge: "Matricule: 1946501", initials: "ADC", rank: "Adjudant-Chef", available: true, isAssignedToCorg: false, vehicleId: null, slotNumber: null },
      
      // MAJOR
      { id: 449217, name: "poupou158", badge: "Matricule: 1945402", initials: "MAJ", rank: "Major", available: true, isAssignedToCorg: false, vehicleId: null, slotNumber: null },
      
      // OFFICIERS
      { id: 400109, name: "dunblack", badge: "Matricule: 1947102", initials: "LTN", rank: "Lieutenant", available: true, isAssignedToCorg: false, vehicleId: null, slotNumber: null },
      { id: 426715, name: "ishifternicolas", badge: "Matricule: 1947101", initials: "CNE", rank: "Capitaine", available: true, isAssignedToCorg: false, vehicleId: null, slotNumber: null }
    ];

    officersWithNigendIds.forEach((officer) => {
      this.officers.set(officer.id, officer);
    });

    // Update currentOfficerId to start from the highest Nigend + 1
    this.currentOfficerId = 600000;
  }

  // User methods (existing)
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Officer methods
  async getAllOfficers(): Promise<Officer[]> {
    return Array.from(this.officers.values());
  }

  async getOfficer(id: number): Promise<Officer | undefined> {
    return this.officers.get(id);
  }

  async createOfficer(insertOfficer: InsertOfficer): Promise<Officer> {
    const id = this.currentOfficerId++;
    const officer: Officer = { 
      ...insertOfficer, 
      id,
      available: insertOfficer.available ?? true,
      vehicleId: insertOfficer.vehicleId ?? null,
      slotNumber: insertOfficer.slotNumber ?? null,
      isAssignedToCorg: insertOfficer.isAssignedToCorg ?? false
    };
    this.officers.set(id, officer);
    return officer;
  }

  async updateOfficer(id: number, updates: Partial<Officer>): Promise<Officer> {
    const officer = this.officers.get(id);
    if (!officer) {
      throw new Error(`Officer with id ${id} not found`);
    }
    const updatedOfficer: Officer = { 
      ...officer, 
      ...updates,
      available: updates.available ?? officer.available,
      vehicleId: updates.vehicleId ?? officer.vehicleId,
      slotNumber: updates.slotNumber ?? officer.slotNumber,
      isAssignedToCorg: updates.isAssignedToCorg ?? officer.isAssignedToCorg
    };
    this.officers.set(id, updatedOfficer);
    return updatedOfficer;
  }

  async deleteOfficer(id: number): Promise<void> {
    this.officers.delete(id);
  }

  // Vehicle methods
  async getAllVehicles(): Promise<Vehicle[]> {
    return Array.from(this.vehicles.values());
  }

  async getVehicle(id: number): Promise<Vehicle | undefined> {
    return this.vehicles.get(id);
  }

  async createVehicle(insertVehicle: InsertVehicle): Promise<Vehicle> {
    const id = this.currentVehicleId++;
    const vehicle: Vehicle = { 
      ...insertVehicle, 
      id,
      status: insertVehicle.status ?? "Disponible"
    };
    this.vehicles.set(id, vehicle);
    return vehicle;
  }

  async updateVehicle(id: number, updates: Partial<Vehicle>): Promise<Vehicle> {
    const vehicle = this.vehicles.get(id);
    if (!vehicle) {
      throw new Error(`Vehicle with id ${id} not found`);
    }
    const updatedVehicle: Vehicle = { 
      ...vehicle, 
      ...updates,
      status: updates.status ?? vehicle.status
    };
    this.vehicles.set(id, updatedVehicle);
    return updatedVehicle;
  }

  async deleteVehicle(id: number): Promise<void> {
    this.vehicles.delete(id);
  }

  // Assignment methods
  async assignOfficerToVehicle(officerId: number, vehicleId: number, slotNumber: number): Promise<Officer> {
    const officer = this.officers.get(officerId);
    if (!officer) {
      throw new Error(`Officer with id ${officerId} not found`);
    }

    const vehicle = this.vehicles.get(vehicleId);
    if (!vehicle) {
      throw new Error(`Vehicle with id ${vehicleId} not found`);
    }

    // Check if slot is already occupied
    const existingOfficer = Array.from(this.officers.values()).find(
      o => o.vehicleId === vehicleId && o.slotNumber === slotNumber
    );
    if (existingOfficer) {
      throw new Error(`Le poste ${slotNumber} du véhicule est déjà occupé`);
    }

    const updatedOfficer = { 
      ...officer, 
      // NE PAS changer isAvailable - contrôlé uniquement par les boutons
      vehicleId, 
      slotNumber,
      isCorg: false 
    };
    this.officers.set(officerId, updatedOfficer);
    return updatedOfficer;
  }

  async removeOfficerFromVehicle(officerId: number): Promise<Officer> {
    const officer = this.officers.get(officerId);
    if (!officer) {
      throw new Error(`Officer with id ${officerId} not found`);
    }

    const updatedOfficer = { 
      ...officer, 
      // NE PAS changer available - contrôlé uniquement par les boutons
      vehicleId: null, 
      slotNumber: null,
      isAssignedToCorg: false 
    };
    this.officers.set(officerId, updatedOfficer);
    return updatedOfficer;
  }

  async assignCorg(officerId: number): Promise<Officer> {
    // Remove current CORG if exists
    await this.removeCorg();

    const officer = this.officers.get(officerId);
    if (!officer) {
      throw new Error(`Officer with id ${officerId} not found`);
    }

    const updatedOfficer = { 
      ...officer, 
      // NE PAS changer available - contrôlé uniquement par les boutons
      isAssignedToCorg: true,
      vehicleId: null,
      slotNumber: null
    };
    this.officers.set(officerId, updatedOfficer);
    return updatedOfficer;
  }

  async removeCorg(): Promise<void> {
    const currentCorg = Array.from(this.officers.values()).find(o => o.isAssignedToCorg);
    if (currentCorg) {
      const updatedOfficer = { 
        ...currentCorg, 
        // NE PAS changer available - contrôlé uniquement par les boutons
        isAssignedToCorg: false 
      };
      this.officers.set(currentCorg.id, updatedOfficer);
    }
  }

  async getCorg(): Promise<Officer | undefined> {
    return Array.from(this.officers.values()).find(o => o.isAssignedToCorg);
  }

  async toggleOfficerAvailability(id: number): Promise<Officer> {
    const officer = this.officers.get(id);
    if (!officer) {
      throw new Error(`Officer with id ${id} not found`);
    }

    const updatedOfficer: Officer = { 
      ...officer, 
      available: !officer.available,
      // Si le gendarme devient NON DISPO (available passe de true à false), le retirer de toute assignation
      ...(officer.available === true ? {
        vehicleId: null,
        slotNumber: null,
        isAssignedToCorg: false
      } : {})
    };
    
    this.officers.set(id, updatedOfficer);
    return updatedOfficer;
  }

  async setAllOfficersAvailability(available: boolean): Promise<Officer[]> {
    const updatedOfficers: Officer[] = [];
    
    for (const officer of Array.from(this.officers.values())) {
      const updatedOfficer: Officer = {
        ...officer,
        available,
        // Si on désactive tous les gendarmes, les retirer de toute assignation
        ...(!available ? {
          vehicleId: null,
          slotNumber: null,
          isAssignedToCorg: false
        } : {})
      };
      
      this.officers.set(officer.id, updatedOfficer);
      updatedOfficers.push(updatedOfficer);
    }
    
    return updatedOfficers;
  }
}

export const storage = new MemStorage();
