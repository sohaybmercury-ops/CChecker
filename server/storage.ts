import { type User, type InsertUser, type CalculatorHistory, type InsertCalculatorHistory } from "@shared/schema";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Calculator History methods
  getCalculatorHistory(): Promise<CalculatorHistory[]>;
  addCalculatorHistory(history: InsertCalculatorHistory): Promise<CalculatorHistory>;
  clearCalculatorHistory(): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private calculatorHistory: Map<string, CalculatorHistory>;

  constructor() {
    this.users = new Map();
    this.calculatorHistory = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getCalculatorHistory(): Promise<CalculatorHistory[]> {
    return Array.from(this.calculatorHistory.values()).sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  async addCalculatorHistory(insertHistory: InsertCalculatorHistory): Promise<CalculatorHistory> {
    const id = randomUUID();
    const history: CalculatorHistory = { 
      ...insertHistory, 
      id, 
      timestamp: new Date() 
    };
    this.calculatorHistory.set(id, history);
    return history;
  }

  async clearCalculatorHistory(): Promise<void> {
    this.calculatorHistory.clear();
  }
}

export const storage = new MemStorage();
