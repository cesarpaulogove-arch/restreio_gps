export interface ObjetoRastreado {
  id: string;
  nome: string;

  latitude: number;
  longitude: number;

  velocidade: number;
  direcao: number;

  bateria: number;
  precisao: number;

  online: boolean;

  ultimaAtualizacao: string;

  timestamp: number;
}


export interface EventLog {
  id: string;

  time: string;

  type:
    | 'info'
    | 'success'
    | 'warning'
    | 'critical';

  message: string;
}