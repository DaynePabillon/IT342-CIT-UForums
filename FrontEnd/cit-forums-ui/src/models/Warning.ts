export interface Warning {
  id: number;
  memberId: number;
  memberUsername: string;
  adminId: number;
  adminUsername: string;
  reason: string;
  contentType?: string;
  contentId?: number;
  createdAt: string;
  acknowledged: boolean;
  acknowledgedAt?: string;
}

export interface IssueWarningRequest {
  memberId: number;
  reason: string;
  contentType?: string;
  contentId?: number;
}
