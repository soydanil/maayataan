export type ContributionStatus = 'pending' | 'approved' | 'rejected';

export type Dialect =
  | 'oriente'
  | 'noroccidente'
  | 'centro'
  | 'sur'
  | 'costa'
  | 'otro';

export type Source =
  | 'hablante_nativo'
  | 'estudiante'
  | 'academico'
  | 'evento'
  | 'otro';

export interface Contribution {
  id: string;
  maya_text: string;
  spanish_translation: string;
  audio_url: string | null;
  contributor_name: string;
  consent_given: boolean;
  dialect: Dialect;
  source: Source;
  status: ContributionStatus;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      contributions: {
        Row: Contribution;
        Insert: Omit<Contribution, 'id' | 'created_at' | 'status'>;
        Update: Partial<Contribution>;
      };
    };
  };
}
