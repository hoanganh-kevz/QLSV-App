import * as XLSX from 'xlsx';

export const exportService = {
    /**
     * Export an array of objects to an Excel (.xlsx) file
     * @param {Array} data - Array of objects to export
     * @param {Array} headers - Optional array of custom header labels
     * @param {string} fileName - Name of the downloaded file (without extension)
     * @param {string} sheetName - Name of the sheet inside the Excel file
     */
    exportToExcel: async (data, fileName = 'export', sheetName = 'Sheet1', headers = null) => {
        return new Promise((resolve) => {
            // Slight delay to allow UI to show loading state
            setTimeout(() => {
                try {
                    const wb = XLSX.utils.book_new();
                    let ws;
                    if (headers && data.length > 0) {
                        const keys = Object.keys(data[0]);
                        const dataAsArr = data.map(obj => keys.map(key => obj[key]));
                        dataAsArr.unshift(headers);
                        ws = XLSX.utils.aoa_to_sheet(dataAsArr);
                    } else {
                        ws = XLSX.utils.json_to_sheet(data);
                    }
                    XLSX.utils.book_append_sheet(wb, ws, sheetName);
                    XLSX.writeFile(wb, `${fileName}_${new Date().toISOString().split('T')[0]}.xlsx`);
                    resolve({ success: true, message: 'Exported successfully' });
                } catch (error) {
                    console.error('Export Error:', error);
                    resolve({ success: false, message: error.message || 'Failed to export to Excel' });
                }
            }, 600);
        });
    },

    /**
     * Triggers the native browser print dialog to export to PDF.
     */
    exportToPDF: async () => {
        return new Promise((resolve) => {
            setTimeout(() => {
                window.print();
                resolve({ success: true, message: 'Print dialog opened' });
            }, 300);
        });
    }
};
