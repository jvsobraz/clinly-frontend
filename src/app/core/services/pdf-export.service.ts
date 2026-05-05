import { Injectable, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FinancialReport } from '../models/financial.model';

const INDIGO: [number, number, number] = [99, 102, 241];
const SLATE800: [number, number, number] = [30, 41, 59];
const SLATE500: [number, number, number] = [100, 116, 139];

@Injectable({ providedIn: 'root' })
export class PdfExportService {
  private t = inject(TranslateService);

  exportFinancialReport(
    report: FinancialReport,
    clinicName: string,
    fromDate: string,
    toDate: string
  ): void {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const lang = this.t.currentLang ?? 'pt-BR';
    const locale = lang === 'en' ? 'en-US' : 'pt-BR';
    const currency = locale === 'en-US' ? 'USD' : 'BRL';

    const fmt = (v: number) =>
      v.toLocaleString(locale, { style: 'currency', currency, minimumFractionDigits: 2 });

    const fmtDate = (iso: string) => {
      const d = new Date(iso);
      return d.toLocaleDateString(locale);
    };

    let y = 14;

    // ── Header ────────────────────────────────────────────────────────────────
    doc.setFillColor(...INDIGO);
    doc.rect(0, 0, 210, 28, 'F');

    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text(clinicName, 14, 12);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(this.t.instant('financial.title'), 14, 20);

    const periodLabel = `${fromDate}  →  ${toDate}`;
    doc.text(periodLabel, 210 - 14, 20, { align: 'right' });

    y = 36;

    // ── Summary cards ─────────────────────────────────────────────────────────
    const cards = [
      { label: this.t.instant('financial.totalRevenue'), value: fmt(report.totalRevenue), color: [22, 163, 74] as [number,number,number] },
      { label: this.t.instant('financial.pending'),      value: fmt(report.totalPending),  color: [234, 88, 12] as [number,number,number] },
      { label: this.t.instant('financial.paid'),         value: String(report.paidCount),  color: [99, 102, 241] as [number,number,number] },
      { label: this.t.instant('financial.unpaid'),       value: String(report.unpaidCount),color: [100, 116, 139] as [number,number,number] },
    ];

    const cardW = 44;
    const cardGap = 4;
    const cardX0 = 14;
    cards.forEach((c, i) => {
      const x = cardX0 + i * (cardW + cardGap);
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(x, y, cardW, 18, 2, 2, 'FD');

      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...c.color);
      doc.text(c.value, x + cardW / 2, y + 8, { align: 'center' });

      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...SLATE500);
      doc.text(c.label, x + cardW / 2, y + 14, { align: 'center' });
    });

    y += 26;

    // ── By Professional ───────────────────────────────────────────────────────
    if (report.byProfessional.length > 0) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...SLATE800);
      doc.text(this.t.instant('financial.byProfessional'), 14, y);
      y += 4;

      autoTable(doc, {
        startY: y,
        head: [['#', this.t.instant('financial.columns.professional'), this.t.instant('financial.appointments'), this.t.instant('financial.columns.amount')]],
        body: report.byProfessional.map((p, i) => [i + 1, p.name, p.count, fmt(p.revenue)]),
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: INDIGO, textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        columnStyles: { 0: { cellWidth: 10, halign: 'center' }, 2: { halign: 'center' }, 3: { halign: 'right' } },
        margin: { left: 14, right: 14 },
      });

      y = (doc as any).lastAutoTable.finalY + 8;
    }

    // ── By Service ────────────────────────────────────────────────────────────
    if (report.byService.length > 0) {
      if (y > 230) { doc.addPage(); y = 14; }

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...SLATE800);
      doc.text(this.t.instant('financial.byService'), 14, y);
      y += 4;

      autoTable(doc, {
        startY: y,
        head: [['#', this.t.instant('financial.columns.professional'), this.t.instant('financial.appointments'), this.t.instant('financial.columns.amount')]],
        body: report.byService.map((s, i) => [i + 1, s.name, s.count, fmt(s.revenue)]),
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: [34, 197, 94], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        columnStyles: { 0: { cellWidth: 10, halign: 'center' }, 2: { halign: 'center' }, 3: { halign: 'right' } },
        margin: { left: 14, right: 14 },
      });

      y = (doc as any).lastAutoTable.finalY + 8;
    }

    // ── Payments detail ───────────────────────────────────────────────────────
    if (report.payments.length > 0) {
      if (y > 220) { doc.addPage(); y = 14; }

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...SLATE800);
      doc.text(this.t.instant('financial.payments'), 14, y);
      y += 4;

      const statusMap: Record<string, string> = {
        Paid: this.t.instant('financial.status.paid'),
        Unpaid: this.t.instant('financial.status.unpaid'),
        Waived: this.t.instant('financial.status.waived'),
      };

      autoTable(doc, {
        startY: y,
        head: [[
          this.t.instant('financial.columns.patient'),
          this.t.instant('financial.columns.professional'),
          this.t.instant('financial.columns.date'),
          this.t.instant('financial.columns.amount'),
          this.t.instant('financial.columns.status'),
        ]],
        body: report.payments.map(p => [
          p.patientName,
          p.professionalName,
          fmtDate(p.scheduledAt),
          fmt(p.amountPaid ?? 0),
          statusMap[p.paymentStatus] ?? p.paymentStatus,
        ]),
        styles: { fontSize: 8.5, cellPadding: 2.5 },
        headStyles: { fillColor: [51, 65, 85], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        columnStyles: { 3: { halign: 'right' }, 4: { halign: 'center' } },
        margin: { left: 14, right: 14 },
        didDrawCell: (data) => {
          if (data.section === 'body' && data.column.index === 4) {
            const status = report.payments[data.row.index]?.paymentStatus;
            if (status === 'Paid')   doc.setTextColor(22, 163, 74);
            if (status === 'Unpaid') doc.setTextColor(234, 88, 12);
            if (status === 'Waived') doc.setTextColor(100, 116, 139);
          } else {
            doc.setTextColor(0);
          }
        },
      });
    }

    // ── Footer ────────────────────────────────────────────────────────────────
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(7.5);
      doc.setTextColor(...SLATE500);
      doc.text(
        `Clinly · ${new Date().toLocaleString(locale)} · ${i}/${pageCount}`,
        105, 290, { align: 'center' }
      );
    }

    const safeName = fromDate.replace(/\//g, '-');
    const safeTo   = toDate.replace(/\//g, '-');
    doc.save(`clinly_financeiro_${safeName}_${safeTo}.pdf`);
  }
}
