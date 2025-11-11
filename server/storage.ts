import type { Example, InsertExample } from "../shared/schema.js";

export interface IStorage {
  getExamples(): Promise<Example[]>;
  createExample(data: InsertExample): Promise<Example>;
}

export class MemStorage implements IStorage {
  private examples: Example[] = [];
  private nextId = 1;

  async getExamples(): Promise<Example[]> {
    return this.examples;
  }

  async createExample(data: InsertExample): Promise<Example> {
    const example: Example = {
      id: this.nextId++,
      name: data.name,
      createdAt: new Date(),
    };
    this.examples.push(example);
    return example;
  }
}

export const storage = new MemStorage();
