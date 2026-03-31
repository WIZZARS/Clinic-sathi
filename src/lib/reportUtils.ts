import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Bill } from '../types';

export const generateDailyReport = async (
  dateLabel: string,
  bills: Bill[],
  clinicName: string = 'ClinicSathi Medical',
) => {
  const totalRevenue = bills
    .filter((b) => b.payment_status === 'paid')
    .reduce((sum, b) => sum + b.total, 0);
  const pendingRevenue = bills
    .filter((b) => b.payment_status === 'unpaid')
    .reduce((sum, b) => sum + b.total, 0);

  const html = `
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 20px; color: #333; }
          h1 { color: #4C3BCF; margin-bottom: 5px; }
          h3 { color: #666; margin-top: 0; }
          .summary { display: flex; justify-content: space-between; background: #f5f6fa; padding: 15px; border-radius: 8px; margin: 20px 0; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
          th { background-color: #f5f6fa; color: #666; font-weight: bold; }
          .paid { color: #00C896; font-weight: bold; }
          .unpaid { color: #E63946; font-weight: bold; }
        </style>
      </head>
      <body>
        <h1>${clinicName}</h1>
        <h3>Daily Billing Report - ${dateLabel}</h3>

        <div class="summary">
          <div><strong>Total Collected:</strong> NPR ${totalRevenue.toLocaleString()}</div>
          <div><strong>Pending Payments:</strong> NPR ${pendingRevenue.toLocaleString()}</div>
          <div><strong>Total Bills:</strong> ${bills.length}</div>
        </div>

        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Patient</th>
              <th>Services</th>
              <th>Amount (NPR)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${bills
              .map(
                (b) => `
              <tr>
                <td>#${b.id.substring(0, 6)}</td>
                <td>${b.patient?.full_name || 'Unknown'}</td>
                <td>${b.items.map((i) => i.name).join(', ')}</td>
                <td>${b.total.toLocaleString()}</td>
                <td class="${b.payment_status}">${b.payment_status.toUpperCase()}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      </body>
    </html>
  `;

  try {
    const { uri } = await Print.printToFileAsync({ html });
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    }
  } catch (error) {
    console.error('Failed to generate or share PDF', error);
    throw error;
  }
};
