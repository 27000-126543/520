import { store } from '../data/store';
import type { WeeklyReport, RankingEntry, RankingType, Announcement } from '../../shared/types';

export class ReportService {
  getWeeklyReport(): WeeklyReport {
    return store.getWeeklyReport();
  }

  getRankings(type: RankingType): RankingEntry[] {
    return store.getRankings(type);
  }

  getAnnouncements(): Announcement[] {
    return store.getAnnouncements();
  }

  generatePDFReport(): string {
    const report = store.getWeeklyReport();
    return JSON.stringify({
      title: '情报产业周报',
      generatedAt: new Date().toISOString(),
      report
    }, null, 2);
  }
}

export const reportService = new ReportService();
