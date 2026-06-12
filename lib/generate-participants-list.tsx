import React from 'react';
import {
  Document, Page, View, Text, Image, Font, StyleSheet, renderToBuffer,
} from '@react-pdf/renderer';
import fs from 'fs';
import path from 'path';

const TEAL = '#016564';
const TEAL_DARK = '#014948';
const GOLD = '#d0b284';
const WHITE = '#ffffff';
const LINE = '#c9d7d7';
const MUTED = '#667777';
const BG = '#f4f8f8';

const fontData = fs.readFileSync(path.join(process.cwd(), 'public/fonts/Cairo-Variable.ttf'));
Font.register({ family: 'Cairo', src: `data:font/ttf;base64,${fontData.toString('base64')}` });

const logoData = fs.readFileSync(path.join(process.cwd(), 'public/images/nauss-logo-gold.png'));
const logoSrc = `data:image/png;base64,${logoData.toString('base64')}`;

const s = StyleSheet.create({
  page: { padding: '28 36', fontFamily: 'Cairo', backgroundColor: WHITE },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingBottom: 14, borderBottomWidth: 2, borderBottomColor: TEAL, borderBottomStyle: 'solid',
    marginBottom: 16,
  },
  headerLeft: { alignItems: 'flex-start' },
  headerRight: { alignItems: 'flex-end' },
  uniNameEn: { fontSize: 10, color: TEAL_DARK, fontWeight: 700 },
  uniNameAr: { fontSize: 9, color: MUTED, marginTop: 2 },
  docTitle: { fontSize: 14, color: TEAL, fontWeight: 700, letterSpacing: 0.5 },
  docSubtitle: { fontSize: 8, color: GOLD, marginTop: 2 },

  // Course info box
  infoBox: {
    backgroundColor: BG, borderRadius: 8, padding: '10 14',
    borderLeftWidth: 3, borderLeftColor: TEAL, borderLeftStyle: 'solid',
    marginBottom: 16,
  },
  infoTitle: { fontSize: 9, color: GOLD, fontWeight: 700, marginBottom: 6, letterSpacing: 0.8 },
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  infoItem: { width: '47%', marginBottom: 4 },
  infoLabel: { fontSize: 7, color: MUTED },
  infoValue: { fontSize: 9, color: TEAL_DARK, fontWeight: 700 },

  // Table
  tableTitle: {
    fontSize: 10, color: TEAL_DARK, fontWeight: 700,
    marginBottom: 8, letterSpacing: 0.4,
  },
  table: { width: '100%', marginBottom: 20 },
  tableHead: {
    flexDirection: 'row', backgroundColor: TEAL,
    borderTopLeftRadius: 6, borderTopRightRadius: 6,
  },
  tableHeadCell: { padding: '7 5', color: WHITE, fontSize: 8, fontWeight: 700, textAlign: 'center' },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1, borderBottomColor: LINE, borderBottomStyle: 'solid',
  },
  tableRowAlt: {
    flexDirection: 'row', backgroundColor: '#eef4f4',
    borderBottomWidth: 1, borderBottomColor: LINE, borderBottomStyle: 'solid',
  },
  tableCell: { padding: '6 5', fontSize: 8, color: TEAL_DARK, textAlign: 'center' },

  // Footer
  footer: {
    position: 'absolute', bottom: 24, left: 36, right: 36,
    borderTopWidth: 1, borderTopColor: LINE, borderTopStyle: 'solid',
    paddingTop: 8, flexDirection: 'row', justifyContent: 'space-between',
  },
  footerLeft: { fontSize: 7, color: MUTED },
  footerRight: { fontSize: 7, color: MUTED, textAlign: 'right' },
  footerBold: { fontSize: 8, color: TEAL_DARK, fontWeight: 700 },
});

export interface ParticipantForList {
  index: number;
  fullNamePassport: string;
  passportNumber: string;
  birthDate: Date | null;
}

export interface StaffForList {
  name: string;
  passportNo: string | null;
  jobTitle: string;
}

export interface CourseForList {
  activityName: string | null;
  venue: string | null;
  startDate: Date | null;
  endDate: Date | null;
  createdByName: string;
}

// Reverse Arabic text for correct RTL display in @react-pdf/renderer
function fixArabic(text: string): string {
  if (!text) return text;
  // Check if text contains Arabic characters
  if (!/[؀-ۿ]/.test(text)) return text;
  // Reverse words for RTL display in PDF
  return text.split(' ').reverse().join(' ');
}

function fmtDate(d: Date | null): string {
  if (!d) return '—';
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function fmtDateLong(d: Date | null): string {
  if (!d) return '—';
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

const COL_WIDTHS = ['8%', '48%', '24%', '20%'];
const HEADERS = ['#', 'Participant Name', 'Passport No.', 'Date of Birth'];

export async function generateParticipantsListBuffer(
  course: CourseForList,
  participants: ParticipantForList[],
  staff: StaffForList[] = [],
): Promise<Buffer> {
  const today = new Date();

  const Doc = (
    <Document>
      <Page size="A4" style={s.page}>

        {/* Header */}
        <View style={s.header}>
          <View style={s.headerLeft}>
            <Text style={s.docTitle}>PARTICIPANTS LIST</Text>
            <Text style={s.docSubtitle}>Official Record — External Training Platform</Text>
            <Text style={[s.uniNameEn, { marginTop: 6, fontSize: 8, color: MUTED }]}>
              Naif Arab University for Security Sciences
            </Text>
          </View>
          <View style={s.headerRight}>
            <Image src={logoSrc} style={{ width: 70 }} />
          </View>
        </View>

        {/* Course info */}
        <View style={s.infoBox}>
          <Text style={s.infoTitle}>TRAINING ACTIVITY DETAILS</Text>
          <View style={s.infoGrid}>
            <View style={s.infoItem}>
              <Text style={s.infoLabel}>Activity / Program Title</Text>
              <Text style={[s.infoValue, { direction: 'rtl' }]}>{fixArabic(course.activityName || '—')}</Text>
            </View>
            <View style={s.infoItem}>
              <Text style={s.infoLabel}>Venue</Text>
              <Text style={[s.infoValue, { direction: 'rtl' }]}>{fixArabic(course.venue || '—')}</Text>
            </View>
            <View style={s.infoItem}>
              <Text style={s.infoLabel}>Start Date</Text>
              <Text style={s.infoValue}>{fmtDateLong(course.startDate)}</Text>
            </View>
            <View style={s.infoItem}>
              <Text style={s.infoLabel}>End Date</Text>
              <Text style={s.infoValue}>{fmtDateLong(course.endDate)}</Text>
            </View>
            <View style={s.infoItem}>
              <Text style={s.infoLabel}>Programme Coordinator</Text>
              <Text style={[s.infoValue, { direction: 'rtl' }]}>{fixArabic(course.createdByName)}</Text>
            </View>
            <View style={s.infoItem}>
              <Text style={s.infoLabel}>Total Participants</Text>
              <Text style={s.infoValue}>{String(participants.length)}</Text>
            </View>
          </View>
        </View>

        {/* Table title */}
        <Text style={s.tableTitle}>REGISTERED PARTICIPANTS</Text>

        {/* Table */}
        <View style={s.table}>
          <View style={s.tableHead}>
            {HEADERS.map((h, i) => (
              <View key={h} style={[s.tableHeadCell, { width: COL_WIDTHS[i] }]}>
                <Text>{h}</Text>
              </View>
            ))}
          </View>
          {participants.map((p, idx) => (
            <View key={p.index} style={idx % 2 === 0 ? s.tableRow : s.tableRowAlt}>
              <Text style={[s.tableCell, { width: COL_WIDTHS[0] }]}>{p.index}</Text>
              <Text style={[s.tableCell, { width: COL_WIDTHS[1] }, { textAlign: 'left' }]}>{p.fullNamePassport}</Text>
              <Text style={[s.tableCell, { width: COL_WIDTHS[2] }]}>{p.passportNumber}</Text>
              <Text style={[s.tableCell, { width: COL_WIDTHS[3] }]}>{fmtDate(p.birthDate)}</Text>
            </View>
          ))}
        </View>

        {/* NAUSS Staff */}
        {staff.length > 0 && (
          <>
            <Text style={[s.tableTitle, { marginTop: 16 }]}>NAUSS ACCOMPANYING STAFF</Text>
            <View style={s.table}>
              <View style={s.tableHead}>
                {['#', 'Name', 'Passport No.', 'Job Title'].map((h, i) => (
                  <View key={h} style={[s.tableHeadCell, { width: ['8%', '38%', '24%', '30%'][i] }]}>
                    <Text>{h}</Text>
                  </View>
                ))}
              </View>
              {staff.map((m, idx) => (
                <View key={idx} style={idx % 2 === 0 ? s.tableRow : s.tableRowAlt}>
                  <Text style={[s.tableCell, { width: '8%' }]}>{idx + 1}</Text>
                  <Text style={[s.tableCell, { width: '38%', textAlign: 'left' }]}>{m.name}</Text>
                  <Text style={[s.tableCell, { width: '24%' }]}>{m.passportNo || '—'}</Text>
                  <Text style={[s.tableCell, { width: '30%', textAlign: 'left' }]}>{m.jobTitle}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Footer */}
        <View style={s.footer} fixed>
          <View>
            <Text style={s.footerBold}>Training Operations Department</Text>
            <Text style={s.footerLeft}>Training Deputyship — NAUSS</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={s.footerLeft}>Issued: {fmtDate(today)}</Text>
            <Text style={s.footerLeft}>Page <Text render={({ pageNumber, totalPages }) => `${pageNumber} of ${totalPages}`} /></Text>
          </View>
        </View>

      </Page>
    </Document>
  );

  return renderToBuffer(Doc);
}
