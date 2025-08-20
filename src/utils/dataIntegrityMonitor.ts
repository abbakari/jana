// Data Integrity Monitor - Ensures no data disappears from tables during updates
// Specifically designed to prevent BUD 2026 data loss issues

export interface DataSnapshot {
  timestamp: string;
  itemCount: number;
  budgetItemsCount: number;
  totalBudgetValue: number;
  checksum: string;
  userActivity: string;
}

export class DataIntegrityMonitor {
  private static readonly STORAGE_KEY = 'data_integrity_snapshots';
  private static readonly MAX_SNAPSHOTS = 50;

  // Create a snapshot of current table data
  static createSnapshot(data: any[], user: any, activity: string): DataSnapshot {
    const budgetItems = data.filter(item => item.budget2026 > 0 || item.budgetValue2026 > 0);
    const totalBudgetValue = data.reduce((sum, item) => sum + (item.budgetValue2026 || 0), 0);
    
    // Create a simple checksum based on data structure
    const checksum = this.calculateChecksum(data);
    
    const snapshot: DataSnapshot = {
      timestamp: new Date().toISOString(),
      itemCount: data.length,
      budgetItemsCount: budgetItems.length,
      totalBudgetValue,
      checksum,
      userActivity: `${user?.name || 'Unknown'}: ${activity}`
    };

    this.saveSnapshot(snapshot);
    return snapshot;
  }

  // Save snapshot to localStorage
  private static saveSnapshot(snapshot: DataSnapshot): void {
    try {
      const snapshots = this.getSnapshots();
      snapshots.push(snapshot);

      // Keep only the latest snapshots
      if (snapshots.length > this.MAX_SNAPSHOTS) {
        snapshots.splice(0, snapshots.length - this.MAX_SNAPSHOTS);
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(snapshots));
      console.log('Data integrity snapshot saved:', snapshot);
    } catch (error) {
      console.error('Error saving data integrity snapshot:', error);
    }
  }

  // Get all snapshots
  static getSnapshots(): DataSnapshot[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading data integrity snapshots:', error);
      return [];
    }
  }

  // Calculate a simple checksum for data integrity
  private static calculateChecksum(data: any[]): string {
    const dataString = JSON.stringify(data.map(item => ({
      id: item.id,
      customer: item.customer,
      item: item.item,
      budget2026: item.budget2026,
      budgetValue2026: item.budgetValue2026
    })));
    
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < dataString.length; i++) {
      const char = dataString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(16);
  }

  // Monitor data changes and detect potential loss
  static monitorDataChange(beforeData: any[], afterData: any[], user: any, activity: string): {
    isDataLoss: boolean;
    report: string;
    recommendations: string[];
  } {
    const beforeSnapshot = this.createTemporarySnapshot(beforeData, user, `Before: ${activity}`);
    const afterSnapshot = this.createTemporarySnapshot(afterData, user, `After: ${activity}`);

    const isDataLoss = afterSnapshot.itemCount < beforeSnapshot.itemCount ||
                      afterSnapshot.budgetItemsCount < beforeSnapshot.budgetItemsCount;

    let report = `Data Change Monitor Report:\n`;
    report += `Activity: ${activity}\n`;
    report += `Items: ${beforeSnapshot.itemCount} → ${afterSnapshot.itemCount}\n`;
    report += `Budget Items: ${beforeSnapshot.budgetItemsCount} → ${afterSnapshot.budgetItemsCount}\n`;
    report += `Total Budget Value: $${beforeSnapshot.totalBudgetValue.toLocaleString()} → $${afterSnapshot.totalBudgetValue.toLocaleString()}\n`;
    report += `Data Loss Detected: ${isDataLoss ? 'YES ⚠️' : 'NO ✅'}\n`;

    const recommendations: string[] = [];
    
    if (isDataLoss) {
      recommendations.push('IMMEDIATE ACTION: Data loss detected in table update');
      recommendations.push('Restore from latest backup to prevent permanent loss');
      recommendations.push('Review filter settings and update logic');
      recommendations.push('Ensure originalTableData is updated alongside tableData');
    } else {
      recommendations.push('Data integrity maintained - all activities preserved');
      recommendations.push('Continue monitoring for any unexpected changes');
    }

    // Save both snapshots for audit trail
    this.saveSnapshot(beforeSnapshot);
    this.saveSnapshot(afterSnapshot);

    return { isDataLoss, report, recommendations };
  }

  // Create temporary snapshot without saving
  private static createTemporarySnapshot(data: any[], user: any, activity: string): DataSnapshot {
    const budgetItems = data.filter(item => item.budget2026 > 0 || item.budgetValue2026 > 0);
    const totalBudgetValue = data.reduce((sum, item) => sum + (item.budgetValue2026 || 0), 0);
    const checksum = this.calculateChecksum(data);
    
    return {
      timestamp: new Date().toISOString(),
      itemCount: data.length,
      budgetItemsCount: budgetItems.length,
      totalBudgetValue,
      checksum,
      userActivity: `${user?.name || 'Unknown'}: ${activity}`
    };
  }

  // Get the latest snapshot
  static getLatestSnapshot(): DataSnapshot | null {
    const snapshots = this.getSnapshots();
    return snapshots.length > 0 ? snapshots[snapshots.length - 1] : null;
  }

  // Check if data has changed since last snapshot
  static hasDataChanged(currentData: any[], user: any): boolean {
    const latestSnapshot = this.getLatestSnapshot();
    if (!latestSnapshot) return true;

    const currentSnapshot = this.createTemporarySnapshot(currentData, user, 'Current state check');
    return currentSnapshot.checksum !== latestSnapshot.checksum;
  }

  // Generate integrity report
  static generateIntegrityReport(): string {
    const snapshots = this.getSnapshots();
    if (snapshots.length === 0) {
      return 'No data integrity snapshots available.';
    }

    const latest = snapshots[snapshots.length - 1];
    let report = `=== DATA INTEGRITY REPORT ===\n`;
    report += `Last Updated: ${latest.timestamp}\n`;
    report += `Total Items: ${latest.itemCount}\n`;
    report += `Budget Items: ${latest.budgetItemsCount}\n`;
    report += `Total Budget Value: $${latest.totalBudgetValue.toLocaleString()}\n`;
    report += `Last Activity: ${latest.userActivity}\n\n`;

    if (snapshots.length > 1) {
      const previous = snapshots[snapshots.length - 2];
      const itemChange = latest.itemCount - previous.itemCount;
      const budgetChange = latest.budgetItemsCount - previous.budgetItemsCount;
      
      report += `=== RECENT CHANGES ===\n`;
      report += `Items Changed: ${itemChange >= 0 ? '+' : ''}${itemChange}\n`;
      report += `Budget Items Changed: ${budgetChange >= 0 ? '+' : ''}${budgetChange}\n`;
      
      if (itemChange < 0 || budgetChange < 0) {
        report += `⚠️  WARNING: Data reduction detected\n`;
      } else {
        report += `✅ No data loss detected\n`;
      }
    }

    return report;
  }

  // Clear old snapshots (maintenance function)
  static clearOldSnapshots(daysToKeep: number = 7): void {
    const snapshots = this.getSnapshots();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const filteredSnapshots = snapshots.filter(snapshot => 
      new Date(snapshot.timestamp) > cutoffDate
    );

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredSnapshots));
    console.log(`Cleared ${snapshots.length - filteredSnapshots.length} old snapshots`);
  }
}

export default DataIntegrityMonitor;
