'use client';

import { useState } from 'react';
import hybridDbService from '../services/hybridDb';

export default function DataExportImport() {
  const [exportOptions, setExportOptions] = useState({
    source: 'all',
    type: 'all',
    starred: 'all',
    dateRange: 'all'
  });
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportSuccess, setExportSuccess] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      setExportError(null);
      setExportSuccess(false);

      // Prepare export options
      const options: any = {};
      
      if (exportOptions.source !== 'all') {
        options.source = exportOptions.source;
      }
      
      if (exportOptions.type !== 'all') {
        options.type = exportOptions.type;
      }
      
      if (exportOptions.starred !== 'all') {
        options.starred = exportOptions.starred === 'starred';
      }
      
      if (exportOptions.dateRange === 'custom' && startDate && endDate) {
        options.dateRange = {
          start: new Date(startDate),
          end: new Date(endDate)
        };
      }

      // Get CSV data
      const csvData = await hybridDbService.exportToCSV(options);
      
      // Create a blob and download link
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      // Set up download attributes
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      link.setAttribute('href', url);
      link.setAttribute('download', `data-organizer-export-${dateStr}.csv`);
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setExportSuccess(true);
    } catch (error) {
      console.error('Export error:', error);
      setExportError('Failed to export data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="card p-6 shadow-md">
      <h2 className="text-xl font-semibold mb-4 gradient-text">Export & Import Data</h2>
      
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-3">Export Data</h3>
        <p className="text-gray-600 mb-4">
          Export your messages to a CSV file that you can open in Excel, Google Sheets, or other applications.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
            <select
              value={exportOptions.source}
              onChange={(e) => setExportOptions({...exportOptions, source: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Sources</option>
              <option value="whatsapp">WhatsApp Only</option>
              <option value="telegram">Telegram Only</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message Type</label>
            <select
              value={exportOptions.type}
              onChange={(e) => setExportOptions({...exportOptions, type: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Types</option>
              <option value="text">Text Only</option>
              <option value="link">Links Only</option>
              <option value="image">Images Only</option>
              <option value="video">Videos Only</option>
              <option value="file">Files Only</option>
              <option value="app">App Messages Only</option>
              <option value="other">Other Types</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Starred Status</label>
            <select
              value={exportOptions.starred}
              onChange={(e) => setExportOptions({...exportOptions, starred: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Messages</option>
              <option value="starred">Starred Only</option>
              <option value="unstarred">Unstarred Only</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
            <select
              value={exportOptions.dateRange}
              onChange={(e) => setExportOptions({...exportOptions, dateRange: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Time</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
        </div>
        
        {exportOptions.dateRange === 'custom' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        )}
        
        {exportError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
            {exportError}
          </div>
        )}
        
        {exportSuccess && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md">
            Export successful! Your file has been downloaded.
          </div>
        )}
        
        <button
          onClick={handleExport}
          disabled={isExporting || (exportOptions.dateRange === 'custom' && (!startDate || !endDate))}
          className={`px-4 py-2 rounded-md text-white font-medium flex items-center ${
            isExporting || (exportOptions.dateRange === 'custom' && (!startDate || !endDate))
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          {isExporting ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Exporting...
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              Export to CSV
            </>
          )}
        </button>
      </div>
      
      <div className="border-t pt-6">
        <h3 className="text-lg font-medium mb-3">Import Data (Coming Soon)</h3>
        <p className="text-gray-600 mb-4">
          Import messages from a CSV file. This feature will be available in a future update.
        </p>
        
        <button
          disabled
          className="px-4 py-2 bg-gray-400 text-white rounded-md font-medium flex items-center cursor-not-allowed"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
          </svg>
          Import from CSV
        </button>
      </div>
    </div>
  );
} 