import * as XLSX from 'xlsx';

export interface ExcelExportOptions {
  fileName: string;
  sheetName?: string;
  reportTitle?: string;
  metadata?: Record<string, string>;
  data: Record<string, any>[];
  columns?: { key: string; header: string; width?: number }[];
}

export function exportToExcel(options: ExcelExportOptions) {
  const { fileName, sheetName = 'Report Data', reportTitle, metadata, data, columns } = options;

  let exportData: any[] = [];

  // Transform data based on specified columns if provided
  if (columns && columns.length > 0) {
    exportData = data.map((row) => {
      const formattedRow: Record<string, any> = {};
      columns.forEach((col) => {
        formattedRow[col.header] = row[col.key] !== undefined && row[col.key] !== null ? row[col.key] : '-';
      });
      return formattedRow;
    });
  } else {
    exportData = data;
  }

  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();

  // If report title and metadata are provided, build rows
  const fullRows: any[][] = [];

  if (reportTitle) {
    fullRows.push([reportTitle]);
    fullRows.push([`Generated on: ${new Date().toISOString().replace('T', ' ').slice(0, 19)} WIB`]);
    fullRows.push(['Organization: PT Kencana Enamel & Cookware Nusantara - R&D Division']);
    fullRows.push(['Supervisor: Ayu Jamilatul Janah']);

    if (metadata) {
      Object.entries(metadata).forEach(([k, v]) => {
        fullRows.push([`${k}: ${v}`]);
      });
    }
    fullRows.push([]); // blank separator row
  }

  const ws = XLSX.utils.aoa_to_sheet(fullRows);

  // Append tabular data
  XLSX.utils.sheet_add_json(ws, exportData, {
    origin: fullRows.length > 0 ? fullRows.length : 0,
    skipHeader: false,
  });

  // Calculate column widths
  if (exportData.length > 0) {
    const keys = Object.keys(exportData[0]);
    ws['!cols'] = keys.map((key) => {
      const maxLen = Math.max(
        key.length,
        ...exportData.map((r) => (r[key] ? String(r[key]).length : 0))
      );
      return { wch: Math.min(Math.max(maxLen + 4, 12), 40) };
    });
  }

  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  // Auto clean file extension
  const cleanName = fileName.endsWith('.xlsx') ? fileName : `${fileName}.xlsx`;
  XLSX.writeFile(wb, cleanName);
}

export function printCurrentView(title: string) {
  window.print();
}
