export interface Report {
  id: number;
  reporterId: number;
  reporterUsername: string;
  reportedContentType: 'THREAD' | 'COMMENT';
  reportedContentId: number;
  reason: string;
  status: 'PENDING' | 'RESOLVED' | 'DISMISSED';
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: number;
  resolvedByUsername?: string;
  actionTaken?: string;
}

export interface CreateReportRequest {
  reportedContentType: 'THREAD' | 'COMMENT';
  reportedContentId: number;
  reason: string;
} 