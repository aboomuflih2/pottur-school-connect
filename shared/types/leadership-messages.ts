export interface LeadershipMessage {
  id: string;
  person_name: string;
  person_title: string;
  position: string;
  message_content: string;
  photo_url?: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface CreateLeadershipMessageRequest {
  person_name: string;
  person_title: string;
  position: string;
  message_content: string;
  photo_url?: string;
  is_active?: boolean;
  display_order?: number;
}

export interface UpdateLeadershipMessageRequest {
  person_name?: string;
  person_title?: string;
  position?: string;
  message_content?: string;
  photo_url?: string;
  is_active?: boolean;
  display_order?: number;
}

export type LeadershipPosition = 'chairman' | 'principal' | 'vice_principal' | 'manager';

export const LEADERSHIP_POSITIONS: Record<LeadershipPosition, string> = {
  chairman: 'Chairman',
  principal: 'Principal',
  vice_principal: 'Vice Principal',
  manager: 'Manager'
};