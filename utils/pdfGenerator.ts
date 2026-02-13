import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { P2HFormState, P2HSection } from '../types';
import { LOGO_BASE64 } from './logoBase64';

/**
 * Generates a P2H Excavator PDF matching the ALBI-FM-OPR-03 form layout.
 * Portrait, one page, two-column inspection table.
 */
export const generateP2HPDF = (data: P2HFormState) => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const { metadata, answers = {}, sections } = data;
    const pageW = doc.internal.pageSize.getWidth();
    const marginL = 8;
    const marginR = 8;
    const contentW = pageW - marginL - marginR;

    // ============================================================
    // HEADER BOX — Company | Title | Document Info
    // ============================================================
    const headerTop = 8;
    const headerH = 24;
    doc.setDrawColor(0);
    doc.setLineWidth(0.4);

    // Outer box
    doc.rect(marginL, headerTop, contentW, headerH);

    // Column dividers
    const col1W = contentW * 0.28;
    const col2W = contentW * 0.40;
    const col3W = contentW - col1W - col2W;
    const colDiv1 = marginL + col1W;
    const colDiv2 = colDiv1 + col2W;
    doc.line(colDiv1, headerTop, colDiv1, headerTop + headerH);
    doc.line(colDiv2, headerTop, colDiv2, headerTop + headerH);

    // Left: Logo + Company name
    const logoSize = 14;
    const logoX = marginL + (col1W - logoSize) / 2;
    try {
        doc.addImage(LOGO_BASE64, 'PNG', logoX, headerTop + 1, logoSize, logoSize);
    } catch (e) { /* logo load failed */ }
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('PT Alam Lestari', marginL + col1W / 2, headerTop + 17, { align: 'center' });
    doc.text('Baratamaindo', marginL + col1W / 2, headerTop + 21, { align: 'center' });

    // Center: Title
    const centerX = colDiv1 + col2W / 2;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('PEMERIKSAAN DAN PERAWATAN HARIAN', centerX, headerTop + 9, { align: 'center' });
    doc.text('UNIT EXCAVATOR', centerX, headerTop + 15, { align: 'center' });

    // Right: Doc info — 4 rows with lines
    const docRowH = headerH / 4;
    for (let i = 1; i < 4; i++) {
        doc.line(colDiv2, headerTop + docRowH * i, marginL + contentW, headerTop + docRowH * i);
    }

    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'normal');
    const labelX = colDiv2 + 2;
    const valueX = colDiv2 + col3W * 0.55;

    doc.text('Nomor', labelX, headerTop + docRowH * 0 + 3.5);
    doc.text(': ALBI-FM-OPR-03', valueX, headerTop + docRowH * 0 + 3.5);
    doc.text('Tanggal Terbit', labelX, headerTop + docRowH * 1 + 3.5);
    doc.text(': 20 Agustus 2025', valueX, headerTop + docRowH * 1 + 3.5);
    doc.text('Revisi', labelX, headerTop + docRowH * 2 + 3.5);
    doc.text(': 01', valueX, headerTop + docRowH * 2 + 3.5);
    doc.text('Halaman', labelX, headerTop + docRowH * 3 + 3.5);
    doc.text(': 1 dari 1', valueX, headerTop + docRowH * 3 + 3.5);

    // ============================================================
    // METADATA SECTION — 4 rows of fields + Shift on right
    // ============================================================
    let curY = headerTop + headerH + 1;
    const metaH = 18;
    const metaRowH = metaH / 4;

    doc.setLineWidth(0.3);
    doc.rect(marginL, curY, contentW, metaH);

    // Labels + values
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');

    const metaLabelX = marginL + 2;
    const metaValX = marginL + 28;
    const dotLine = '..............................................................................................................................';

    doc.text('Kode Unit', metaLabelX, curY + metaRowH * 0 + 3.2);
    doc.text(`: ${metadata.unitCode || dotLine}`, metaValX, curY + metaRowH * 0 + 3.2);

    doc.text('Nama Operator', metaLabelX, curY + metaRowH * 1 + 3.2);
    doc.text(`: ${metadata.operatorName || dotLine}`, metaValX, curY + metaRowH * 1 + 3.2);

    doc.text('HM', metaLabelX, curY + metaRowH * 2 + 3.2);
    doc.text(`: ${metadata.hmStart || dotLine}`, metaValX, curY + metaRowH * 2 + 3.2);

    doc.text('Tanggal', metaLabelX, curY + metaRowH * 3 + 3.2);
    doc.text(`: ${metadata.date || dotLine}`, metaValX, curY + metaRowH * 3 + 3.2);

    // Horizontal lines between rows
    for (let i = 1; i < 4; i++) {
        doc.setDrawColor(180);
        doc.line(marginL, curY + metaRowH * i, marginL + contentW * 0.72, curY + metaRowH * i);
    }

    // Shift box on the right
    const shiftBoxX = marginL + contentW * 0.72;
    doc.setDrawColor(0);
    doc.line(shiftBoxX, curY, shiftBoxX, curY + metaH);

    const shiftCenterX = shiftBoxX + (marginL + contentW - shiftBoxX) / 2;
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.text('Shift :', shiftBoxX + 3, curY + 5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    const shift = metadata.shift || '';
    // Checkboxes for shift
    const cbSize = 2.5;
    const cbY1 = curY + 8;
    const cbY2 = curY + 13;
    doc.rect(shiftBoxX + 15, cbY1 - 2, cbSize, cbSize);
    doc.text('I (Siang)', shiftBoxX + 19, cbY1);
    // Match: "Shift 1", "1", "I", "Siang"
    const isShift1 = shift === 'Shift 1' || shift === '1' || shift === 'I' || shift.toLowerCase().includes('siang');
    if (isShift1) {
        // Draw checkmark inside checkbox
        const cx1 = shiftBoxX + 15 + cbSize / 2;
        const cy1 = cbY1 - 2 + cbSize / 2;
        doc.setLineWidth(0.4);
        doc.line(cx1 - 0.8, cy1, cx1 - 0.2, cy1 + 0.6);
        doc.line(cx1 - 0.2, cy1 + 0.6, cx1 + 0.8, cy1 - 0.5);
        doc.setLineWidth(0.3);
    }

    doc.rect(shiftBoxX + 15, cbY2 - 2, cbSize, cbSize);
    doc.text('II (Malam)', shiftBoxX + 19, cbY2);
    // Match: "Shift 2", "2", "II", "Malam"
    const isShift2 = shift === 'Shift 2' || shift === '2' || shift === 'II' || shift.toLowerCase().includes('malam');
    if (isShift2) {
        // Draw checkmark inside checkbox
        const cx2 = shiftBoxX + 15 + cbSize / 2;
        const cy2 = cbY2 - 2 + cbSize / 2;
        doc.setLineWidth(0.4);
        doc.line(cx2 - 0.8, cy2, cx2 - 0.2, cy2 + 0.6);
        doc.line(cx2 - 0.2, cy2 + 0.6, cx2 + 0.8, cy2 - 0.5);
        doc.setLineWidth(0.3);
    }

    curY += metaH + 1;

    // ============================================================
    // TWO-COLUMN INSPECTION TABLE
    // ============================================================
    const leftSections = sections.filter(s =>
        ['mesin', 'undercarriage', 'attachment', 'cabin'].includes(s.id)
    );
    const rightSections = sections.filter(s =>
        ['electrical', 'hydraulic'].includes(s.id)
    );

    const colGap = 1.5;
    const colW = (contentW - colGap) / 2;
    const leftX = marginL;
    const rightColX = marginL + colW + colGap;

    const condOptions = ['C', 'K', 'B', 'N', 'R'];

    // Kategori map
    const kategoriMap: Record<string, string> = {
        'oli_mesin': 'Kritis', 'v_belt': 'Kritis', 'radiator': 'Kritis',
        'hose_radiator': 'Kritis', 'fungsi_gas': 'Kritis', 'tangki_solar': 'Kritis',
        'shoe': 'Kritis', 'track_link': 'Kritis', 'track_tensioner': 'Kritis',
        'idler': 'Kritis', 'upper_roller': 'Non kritis', 'lower_roller': 'Non kritis',
        'motor_travel': 'Kritis', 'reduction_gear': 'Kritis', 'oil_motor_travel': 'Kritis',
        'hose_travel': 'Kritis', 'final_drive_segment': 'Kritis', 'tangga_naik': 'Non kritis',
        'boom': 'Kritis', 'bushing_boom': 'Non kritis', 'pin_boom': 'Non kritis',
        'seal_boom': 'Non kritis', 'arm': 'Kritis', 'bushing_arm': 'Non kritis',
        'pin_arm': 'Non kritis', 'seal_arm': 'Non kritis', 'link_bucket': 'Kritis',
        'bucket': 'Kritis', 'teeth_bucket': 'Non kritis', 'pin_bucket': 'Non kritis',
        'bushing_bucket': 'Non kritis', 'adapter_bucket': 'Non kritis', 'side_cutter_bucket': 'Non kritis',
        'kaca_spion': 'Kritis', 'kaca_pintu': 'Kritis', 'kaca_depan': 'Kritis',
        'radio': 'Kritis', 'ac': 'Kritis', 'karpet_kabin': 'Non kritis',
        'apar': 'Kritis', 'p3k': 'Kritis', 'seat_belt': 'Kritis',
        'instrumen_panel': 'Kritis', 'fuse_box': 'Kritis', 'wiper': 'Kritis',
        'accu': 'Kritis', 'dinamo_starter': 'Kritis', 'alternator': 'Kritis',
        'klakson_horm': 'Kritis', 'fuse_relay': 'Kritis', 'sensor_water_temp': 'Kritis',
        'sensor_oil_press': 'Kritis', 'sensor_oil_temp_hyd': 'Kritis', 'controller': 'Kritis',
        'sensor_fuel': 'Kritis', 'wiring_kabel': 'Kritis', 'lampu_lampu': 'Kritis',
        'motor_engine_stop': 'Kritis', 'motor_rpm': 'Kritis', 'swing_stop': 'Kritis',
        'cilinder_arm': 'Kritis', 'hose_arm': 'Kritis', 'cylinder_bucket': 'Kritis',
        'hose_bucket': 'Kritis', 'cylinder_boom': 'Kritis', 'hose_boom': 'Kritis',
        'main_pump': 'Kritis', 'control_valve': 'Kritis', 'hidrolic_tank': 'Kritis',
        'filter_oli_hidrolic': 'Non kritis', 'oil_hidrolic': 'Kritis', 'swing_motor': 'Kritis',
        'reduction_gear_swing': 'Kritis', 'oil_swing': 'Kritis', 'hose_swing': 'Kritis',
        'hose_hose_control': 'Kritis', 'hose_hose_main_pump': 'Kritis', 'hose_pilot': 'Kritis',
        'handle': 'Kritis', 'hose_handle': 'Kritis',
    };

    /**
     * Draw one column of inspection sections.
     * Layout: No. | Pemeriksaan | Kategori | C K B N R  (matching original)
     */
    const drawColumn = (startX: number, columnW: number, secs: P2HSection[], startY: number): number => {
        let y = startY;
        const fontSize = 6;
        const rowH = 3.8;

        // Column widths
        const noW = 7;
        const katW = 14;
        const condW = 5;
        const totalCondW = condW * 5; // 25
        const nameW = columnW - noW - katW - totalCondW;

        // ---- Table header row 1: No. | Pemeriksaan | Kategori | Kondisi ----
        const headerRowH = 4;
        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(0);
        doc.setLineWidth(0.3);

        // Draw header cells
        doc.rect(startX, y, noW, headerRowH * 2); // No spans 2 rows
        doc.rect(startX + noW, y, nameW, headerRowH * 2); // Pemeriksaan spans 2 rows
        doc.rect(startX + noW + nameW, y, katW, headerRowH * 2); // Kategori spans 2 rows
        doc.rect(startX + noW + nameW + katW, y, totalCondW, headerRowH); // "Kondisi" row 1
        // Row 2: individual C K B N R
        condOptions.forEach((_opt, i) => {
            doc.rect(startX + noW + nameW + katW + i * condW, y + headerRowH, condW, headerRowH);
        });

        doc.setFontSize(6);
        doc.setFont('helvetica', 'bold');
        doc.text('No.', startX + noW / 2, y + headerRowH + 1, { align: 'center' });
        doc.text('Pemeriksaan', startX + noW + nameW / 2, y + headerRowH + 1, { align: 'center' });
        doc.text('Kategori', startX + noW + nameW + katW / 2, y + headerRowH + 1, { align: 'center' });

        // "Kondisi" spanning header
        doc.text('Kondisi', startX + noW + nameW + katW + totalCondW / 2, y + 3, { align: 'center' });

        // Sub-header: C K B N R
        doc.setFontSize(5.5);
        condOptions.forEach((opt, i) => {
            doc.text(opt, startX + noW + nameW + katW + i * condW + condW / 2, y + headerRowH + 3, { align: 'center' });
        });

        y += headerRowH * 2;

        // ---- Draw sections ----
        secs.forEach(section => {
            if (section.id === 'approval') return;

            // Section header row
            doc.setFillColor(255, 255, 255);
            doc.setDrawColor(0);
            doc.setLineWidth(0.3);
            doc.rect(startX, y, columnW, rowH);
            doc.setFontSize(fontSize);
            doc.setFont('helvetica', 'bold');
            doc.text(section.title, startX + 1.5, y + 2.8);
            y += rowH;

            section.items.forEach((item, idx) => {
                doc.setDrawColor(0);
                doc.setLineWidth(0.15);

                // Row background
                doc.rect(startX, y, columnW, rowH);

                // Vertical lines
                doc.line(startX + noW, y, startX + noW, y + rowH);
                doc.line(startX + noW + nameW, y, startX + noW + nameW, y + rowH);
                doc.line(startX + noW + nameW + katW, y, startX + noW + nameW + katW, y + rowH);
                condOptions.forEach((_opt, i) => {
                    doc.line(startX + noW + nameW + katW + i * condW, y, startX + noW + nameW + katW + i * condW, y + rowH);
                });

                doc.setFontSize(fontSize);
                doc.setFont('helvetica', 'normal');

                // No
                doc.text(`${idx + 1}`, startX + noW / 2, y + 2.8, { align: 'center' });

                // Item name
                doc.text(item.label, startX + noW + 1, y + 2.8);

                // Kategori
                const kat = kategoriMap[item.id] || 'Kritis';
                doc.setFontSize(5);
                doc.text(kat, startX + noW + nameW + katW / 2, y + 2.8, { align: 'center' });

                // Condition checkmarks (drawn manually since Helvetica doesn't support ✓)
                const answer = answers[item.id] || '';
                condOptions.forEach((opt, i) => {
                    if (answer === opt) {
                        const cx = startX + noW + nameW + katW + i * condW + condW / 2;
                        const cy = y + rowH / 2;
                        const s = 1.0; // checkmark size
                        doc.setLineWidth(0.4);
                        doc.setDrawColor(0);
                        // Draw a checkmark: short line down-left, then long line up-right
                        doc.line(cx - s, cy, cx - s * 0.3, cy + s * 0.7);
                        doc.line(cx - s * 0.3, cy + s * 0.7, cx + s, cy - s * 0.5);
                        doc.setLineWidth(0.15);
                    }
                });

                y += rowH;
            });
        });

        return y;
    };

    const leftEndY = drawColumn(leftX, colW, leftSections, curY);
    const rightEndY = drawColumn(rightColX, colW, rightSections, curY);

    // ============================================================
    // LEGEND — below right column, inside bordered box
    // ============================================================
    let legendY = rightEndY + 1;
    const legendX = rightColX;
    const legendW = colW;

    // --- Keterangan box ---
    const ketBoxH = 14;
    doc.setDrawColor(0);
    doc.setLineWidth(0.3);
    doc.rect(legendX, legendY, legendW, ketBoxH);

    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'bold');
    doc.text('Keterangan :', legendX + 2, legendY + 3.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    const ketColMid = legendX + legendW / 2;
    doc.text('C  = Cukup', legendX + 4, legendY + 7);
    doc.text('N  = Normal', ketColMid, legendY + 7);
    doc.text('K  = Kurang', legendX + 4, legendY + 10);
    doc.text('R  = Rusak', ketColMid, legendY + 10);
    doc.text('B  = Bocor', legendX + 4, legendY + 13);

    legendY += ketBoxH;

    // --- Keterangan Kategori box ---
    const katBoxH = 16;
    doc.rect(legendX, legendY, legendW, katBoxH);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.text('Keterangan Kategori :', legendX + 2, legendY + 3.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.5);
    doc.text('Kritis: STOP Bekerja jika terdapat Jawaban Kurang/Rusak/Bocor', legendX + 2, legendY + 7);
    doc.text('Non Kritis: Mengikuti rekomendasi mekanik jika', legendX + 2, legendY + 10);
    doc.text('terdapat jawaban Kurang/Rusak/Bocor', legendX + 2, legendY + 12.5);
    doc.text('(Wajib diperbaiki dalam 1x24 Jam)', legendX + 2, legendY + 15);

    legendY += katBoxH;

    // ============================================================
    // CATATAN (Notes) — bordered box
    // ============================================================
    const footerY = Math.max(leftEndY, legendY) + 3;

    // Calculate wrapped text FIRST to determine box height
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'normal');
    const catatan = answers['catatan_umum'] || '';
    const catatanTextW = contentW - 20; // text starts at +18, so max width = contentW - 18 - 2(padding)
    const wrappedCatatan = doc.splitTextToSize(catatan, catatanTextW);
    const catatanLines = wrappedCatatan.length || 0;
    const lineH = 3;
    const catatanBoxH = Math.max(10, 7 + catatanLines * lineH);

    // Draw box
    doc.setDrawColor(0);
    doc.setLineWidth(0.3);
    doc.rect(marginL, footerY, contentW, catatanBoxH);

    // Label
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text('Catatan :', marginL + 2, footerY + 4);

    // Note text — starts after label, same line
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    if (catatan) {
        doc.text(wrappedCatatan, marginL + 18, footerY + 4);
    }

    // ============================================================
    // SIGNATURES — must fit within page (A4 height = 297mm)
    // ============================================================
    const sigY = footerY + catatanBoxH + 4;
    const sigLeftX = marginL + contentW * 0.2;
    const sigRightX = marginL + contentW * 0.75;

    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text('Dikerjakan oleh,', sigLeftX, sigY, { align: 'center' });
    doc.text('Diperiksa Oleh,', sigRightX, sigY, { align: 'center' });

    // Add signature images if available
    const sigImgW = 30;
    const sigImgH = 10;
    const signatureOperator = answers['signature_operator'] || '';
    if (signatureOperator && signatureOperator.startsWith('data:image')) {
        try {
            doc.addImage(signatureOperator, 'PNG', sigLeftX - sigImgW / 2, sigY + 1, sigImgW, sigImgH);
        } catch (e) {
            // Silently fail if image can't be added
        }
    }

    // Dotted signature lines
    doc.setDrawColor(0);
    doc.setLineDashPattern([1, 1], 0);
    doc.line(sigLeftX - 25, sigY + 12, sigLeftX + 25, sigY + 12);
    doc.line(sigRightX - 25, sigY + 12, sigRightX + 25, sigY + 12);
    doc.setLineDashPattern([], 0); // reset

    // Names
    const operatorName = metadata.operatorName || '........................';
    const pengawasName = answers['nama_pengawas'] || '........................';
    doc.setFont('helvetica', 'bold');
    doc.text(operatorName, sigLeftX, sigY + 16, { align: 'center' });
    doc.text(pengawasName, sigRightX, sigY + 16, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    // Operator
    doc.text('Operator', sigLeftX, sigY + 20, { align: 'center' });

    // Pengawas Signature
    const signatureSupervisor = metadata.supervisorSignature || answers['signature_supervisor'] || '';
    if (signatureSupervisor && signatureSupervisor.startsWith('data:image')) {
        try {
            doc.addImage(signatureSupervisor, 'PNG', sigRightX - sigImgW / 2, sigY + 1, sigImgW, sigImgH);
        } catch (e) {
            // Silently fail
        }
    }

    doc.text('Pengawas', sigRightX, sigY + 20, { align: 'center' });

    // ============================================================
    // SAVE
    // ============================================================
    doc.save(`P2H-${metadata.unitCode}-${metadata.date}.pdf`);
};
