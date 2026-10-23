import React from 'react';
import MonthlyReportModal from './MonthlyReportModal';

export default function ExportModal({
  isOpen,
  onClose,
  onExportSuccess,
  selectedDate,
  initialEmployee,
  employees
}) {
  // Hitung initialMonth dari selectedDate jika ada, atau default ke bulan saat ini
  const initialMonth = selectedDate ? selectedDate.slice(0, 7) : '';

  return (
    <MonthlyReportModal
      isOpen={isOpen}
      onClose={onClose}
      initialMonth={initialMonth}
      initialEmployee={initialEmployee}
      employees={employees}
      onExportSuccess={onExportSuccess}
    />
  );
}
