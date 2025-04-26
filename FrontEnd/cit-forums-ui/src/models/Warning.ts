export interface Warning {
  id: number;
  memberId: number;
  memberUsername: string;
  warnedById: number;
  warnedByUsername: string;
  reason: string;
  message: string;
  createdAt: string;
}

export interface CreateWarningRequest {
  memberId: number;
  reason: string;
  message: string;
}
