export type InvitationStatus = 'pending' | 'accepted' | 'expired' | 'revoked';

export type Invitation = {
  id: string;
  organization_id: string;
  email: string;
  role_id: string | null;
  department_id: string | null;
  token: string;
  status: InvitationStatus;
  expires_at: string;
  accepted_at: string | null;
  invited_by: string | null;
  created_at: string;
  updated_at: string;
};

export type InvitationWithMeta = Invitation & {
  role?: { id: string; name: string } | null;
  department?: { id: string; name: string } | null;
  inviter?: { first_name: string | null; last_name: string | null; email: string } | null;
};

export type CreateInvitationInput = {
  email: string;
  role_id: string;
  department_id?: string;
};
