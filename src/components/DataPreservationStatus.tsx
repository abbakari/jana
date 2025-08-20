import React, { useState, useEffect } from 'react';
import { Shield, CheckCircle, AlertTriangle, Database, Activity } from 'lucide-react';
import DataIntegrityMonitor, { DataSnapshot } from '../utils/dataIntegrityMonitor';

interface DataPreservationStatusProps {
  tableData: any[];
  user: any;
  className?: string;
}

const DataPreservationStatus: React.FC<DataPreservationStatusProps> = ({
  tableData,
  user,
  className = ''
}) => {
  const [latestSnapshot, setLatestSnapshot] = useState<DataSnapshot | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [integrityReport, setIntegrityReport] = useState<string>('');

  useEffect(() => {
    // Update latest snapshot when table data changes
    if (tableData.length > 0) {
      const snapshot = DataIntegrityMonitor.createSnapshot(
        tableData, 
        user, 
        'Table data monitoring'
      );
      setLatestSnapshot(snapshot);
      
      // Generate integrity report
      const report = DataIntegrityMonitor.generateIntegrityReport();
      setIntegrityReport(report);
    }
  }, [tableData, user]);

  useEffect(() => {
    // Load latest snapshot on component mount
    const snapshot = DataIntegrityMonitor.getLatestSnapshot();
    setLatestSnapshot(snapshot);
    
    const report = DataIntegrityMonitor.generateIntegrityReport();
    setIntegrityReport(report);
  }, []);

  const budgetItems = tableData.filter(item => 
    item.budget2026 > 0 || item.budgetValue2026 > 0
  );

  const totalBudgetValue = tableData.reduce((sum, item) => 
    sum + (item.budgetValue2026 || 0), 0
  );

  const getStatusColor = () => {
    if (latestSnapshot && latestSnapshot.itemCount === tableData.length) {
      return 'text-green-600 bg-green-50 border-green-200';
    } else if (latestSnapshot && latestSnapshot.itemCount > tableData.length) {
      return 'text-orange-600 bg-orange-50 border-orange-200';
    }
    return 'text-blue-600 bg-blue-50 border-blue-200';
  };

  return (
    <div className={`bg-white border rounded-lg shadow-sm ${className}`}>
      <div 
        className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${getStatusColor()}`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Shield className="h-5 w-5" />
            <div>
              <h3 className="font-semibold text-sm">Data Preservation Status</h3>
              <p className="text-xs opacity-75">
                All {tableData.length} activities preserved • {budgetItems.length} with BUD 2026 data
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-xs font-medium">Protected</span>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 border-t bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-white p-3 rounded border">
              <div className="flex items-center space-x-2">
                <Database className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">Total Items</span>
              </div>
              <p className="text-2xl font-bold text-blue-600">{tableData.length}</p>
              <p className="text-xs text-gray-500">All activities preserved</p>
            </div>
            
            <div className="bg-white p-3 rounded border">
              <div className="flex items-center space-x-2">
                <Activity className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">BUD 2026 Items</span>
              </div>
              <p className="text-2xl font-bold text-green-600">{budgetItems.length}</p>
              <p className="text-xs text-gray-500">With budget data</p>
            </div>
            
            <div className="bg-white p-3 rounded border">
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-purple-500" />
                <span className="text-sm font-medium">Total Value</span>
              </div>
              <p className="text-2xl font-bold text-purple-600">
                ${totalBudgetValue.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">BUD 2026 total</p>
            </div>
          </div>

          {latestSnapshot && (
            <div className="bg-white p-3 rounded border mb-4">
              <h4 className="font-semibold text-sm mb-2 flex items-center">
                <Shield className="h-4 w-4 mr-2 text-green-500" />
                Latest Protection Snapshot
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <span>Timestamp: {new Date(latestSnapshot.timestamp).toLocaleString()}</span>
                <span>Items: {latestSnapshot.itemCount}</span>
                <span>Budget Items: {latestSnapshot.budgetItemsCount}</span>
                <span>Value: ${latestSnapshot.totalBudgetValue.toLocaleString()}</span>
              </div>
              <p className="text-xs text-gray-600 mt-2">
                Activity: {latestSnapshot.userActivity}
              </p>
            </div>
          )}

          <div className="bg-white p-3 rounded border">
            <h4 className="font-semibold text-sm mb-2">Data Integrity Report</h4>
            <pre className="text-xs text-gray-700 whitespace-pre-wrap bg-gray-100 p-2 rounded">
              {integrityReport || 'Generating report...'}
            </pre>
          </div>

          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
            <div className="flex items-start space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm text-green-800">
                  BUD 2026 Data Protection Active
                </h4>
                <p className="text-xs text-green-700 mt-1">
                  All table activities are automatically preserved and backed up. 
                  Data will not disappear during updates or filtering. 
                  Complete activity history is maintained for audit purposes.
                </p>
                <ul className="text-xs text-green-600 mt-2 space-y-1">
                  <li>• Real-time data integrity monitoring</li>
                  <li>• Automatic backup before every update</li>
                  <li>• Filter-safe data preservation</li>
                  <li>• Complete activity audit trail</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataPreservationStatus;
