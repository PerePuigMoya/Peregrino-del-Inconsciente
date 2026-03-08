
export enum Screen {
  Home = 'Home',
  Oraculo = 'Oraculo',
  Arquetipo = 'Arquetipo',
  Suenos = 'Suenos',
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

export const ARQUETIPOS = [
  "El Inocente", 
  "El Huérfano", 
  "El Buscador-Rebelde", 
  "El Amante", 
  "El Guerrero", 
  "La Bienhechora", 
  "El Creador", 
  "El Destructor", 
  "El Mago", 
  "El Gobernante", 
  "El Sabio", 
  "El Bufón-Trickster"
] as const;

export type ArquetipoName = typeof ARQUETIPOS[number];
