import { Appointment, Order } from '../types';

/**
 * Escapes a cell value conforming to RFC 4180 CSV standard.
 */
function escapeCsvValue(val: any): string {
  if (val === null || val === undefined) return '""';
  const str = String(val).trim();
  // If string contains quotes, commas, newlines, escape internal quotes
  const escaped = str.replace(/"/g, '""');
  return `"${escaped}"`;
}

/**
 * Triggers a browser download of a CSV file with UTF-8 BOM for Microsoft Excel compatibility.
 */
export function downloadCsvBlob(csvContent: string, filename: string): void {
  if (typeof window === 'undefined') return;

  // UTF-8 BOM ensures non-ASCII & Urdu text renders properly in Excel
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exports appointment list to CSV for clinical and financial accounting.
 */
export function exportAppointmentsToCsv(
  appointments: Appointment[],
  filename?: string
): void {
  const headers = [
    'Appointment ID',
    'Token Number',
    'Appointment Date',
    'Time Slot',
    'Patient Name',
    'Contact Phone',
    'City',
    'Consultant Doctor',
    'Consultation Fee (PKR)',
    'Status',
    'Clinical Problem / Department',
    'Referral Notes',
  ];

  const rows = appointments.map((app) => {
    const fee = typeof app.doctorFee === 'number' ? app.doctorFee : 1500;
    const token = app.tokenNumber ? String(app.tokenNumber) : '';

    return [
      escapeCsvValue(app.id || ''),
      escapeCsvValue(token),
      escapeCsvValue(app.date || ''),
      escapeCsvValue(app.timeSlot || ''),
      escapeCsvValue(app.patientName || ''),
      escapeCsvValue(app.phone || ''),
      escapeCsvValue(app.city || ''),
      escapeCsvValue(app.doctorName || 'Senior Consultant'),
      escapeCsvValue(fee),
      escapeCsvValue(app.status || 'Pending'),
      escapeCsvValue(app.problem || app.testName || ''),
      escapeCsvValue(app.referralNotes || app.referralService || ''),
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\r\n');
  const defaultFilename = `HafizClinic_Appointments_${new Date().toISOString().split('T')[0]}.csv`;
  downloadCsvBlob(csvContent, filename || defaultFilename);
}

/**
 * Exports customer pharmacy and e-commerce orders to CSV for sales reconciliation.
 */
export function exportOrdersToCsv(
  orders: Order[],
  filename?: string
): void {
  const headers = [
    'Order ID',
    'Order Date',
    'Customer Name',
    'Phone',
    'City',
    'Delivery Address',
    'Ordered Items & Quantities',
    'Total Amount (PKR)',
    'Payment Method',
    'Order Status',
    'Tracking Number',
  ];

  const rows = orders.map((ord) => {
    // Format items string
    let itemsStr = '';
    if (Array.isArray(ord.items)) {
      itemsStr = ord.items
        .map((item: any) => {
          const pName = item.productName || item.product?.nameEnglish || item.product?.nameUrdu || (item.product as any)?.name || 'Product';
          const qty = item.quantity || 1;
          return `${pName} (x${qty})`;
        })
        .join('; ');
    }

    const totalAmount =
      typeof ord.totalAmountPKR === 'number'
        ? ord.totalAmountPKR
        : typeof (ord as any).totalPricePKR === 'number'
        ? (ord as any).totalPricePKR
        : 0;

    const orderDate = ord.date || ord.createdAt || new Date().toISOString().split('T')[0];

    return [
      escapeCsvValue(ord.id || ''),
      escapeCsvValue(orderDate),
      escapeCsvValue(ord.customerName || ''),
      escapeCsvValue(ord.phone || ''),
      escapeCsvValue(ord.city || ''),
      escapeCsvValue(ord.address || ''),
      escapeCsvValue(itemsStr),
      escapeCsvValue(totalAmount),
      escapeCsvValue(ord.paymentMethod || 'COD'),
      escapeCsvValue(ord.status || 'Pending'),
      escapeCsvValue(ord.trackingNumber || ''),
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\r\n');
  const defaultFilename = `HafizClinic_Orders_${new Date().toISOString().split('T')[0]}.csv`;
  downloadCsvBlob(csvContent, filename || defaultFilename);
}
