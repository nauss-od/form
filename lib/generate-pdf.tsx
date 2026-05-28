import React from 'react';
import ReactPDF, {
  Document, Page, View, Text, Image, Font, StyleSheet, Link,
} from '@react-pdf/renderer';
import path from 'path';

const TEAL = '#016564';
const TEAL_DARK = '#014948';
const GOLD = '#d0b284';
const GOLD_DARK = '#b8975c';
const WHITE = '#ffffff';
const LINE = '#c9d7d7';
const MUTED = '#667777';

Font.register({
  family: 'Cairo',
  fonts: [
    { src: path.join(process.cwd(), 'public/fonts/Cairo-Variable.ttf'), fontWeight: 400 },
    { src: path.join(process.cwd(), 'public/fonts/Cairo-Variable.ttf'), fontWeight: 700 },
    { src: path.join(process.cwd(), 'public/fonts/Cairo-Variable.ttf'), fontWeight: 900 },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Cairo',
    direction: 'rtl',
    position: 'relative',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.04,
  },
  header: {
    padding: 24,
    marginBottom: 28,
    borderRadius: 20,
    backgroundColor: TEAL,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    color: WHITE,
    fontWeight: 700,
    marginTop: 12,
  },
  headerSub: {
    fontSize: 12,
    color: GOLD,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    color: TEAL_DARK,
    fontWeight: 700,
    marginBottom: 12,
    borderBottom: `2px solid ${GOLD}`,
    paddingBottom: 4,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  infoItem: {
    width: '33%',
    padding: 8,
  },
  infoLabel: {
    fontSize: 9,
    color: MUTED,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 11,
    color: TEAL_DARK,
    fontWeight: 700,
  },
  table: {
    width: '100%',
    marginBottom: 24,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: TEAL,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  tableHeaderCell: {
    padding: '8 6',
    color: WHITE,
    fontSize: 9,
    fontWeight: 700,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: LINE,
    borderBottomStyle: 'solid',
  },
  tableRowAlt: {
    flexDirection: 'row',
    backgroundColor: '#f4f8f8',
    borderBottomWidth: 1,
    borderBottomColor: LINE,
    borderBottomStyle: 'solid',
  },
  tableCell: {
    padding: '8 6',
    fontSize: 9,
    color: TEAL_DARK,
    textAlign: 'center',
  },
  link: {
    color: '#0563C1',
    textDecoration: 'underline',
    fontSize: 8,
  },
  insuranceBox: {
    marginTop: 20,
    padding: 16,
    borderRadius: 14,
    backgroundColor: '#f4f8f8',
    borderWidth: 1,
    borderColor: LINE,
    borderStyle: 'solid',
  },
  insuranceTitle: {
    fontSize: 12,
    color: TEAL_DARK,
    fontWeight: 700,
    marginBottom: 8,
  },
  insuranceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  insuranceLabel: {
    fontSize: 10,
    color: MUTED,
  },
  insuranceValue: {
    fontSize: 10,
    color: TEAL_DARK,
    fontWeight: 700,
  },
  footer: {
    marginTop: 32,
    borderTopWidth: 1,
    borderTopColor: LINE,
    borderTopStyle: 'solid',
    paddingTop: 12,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 8,
    color: MUTED,
    marginBottom: 2,
  },
  creditText: {
    fontSize: 7,
    color: '#99aaaa',
  },
});

interface Participant {
  index: number;
  fullNamePassport: string;
  passportNumber: string;
  passportExpiry: string;
  nationalId: string;
  mobile: string;
  birthDate: string;
  iban: string;
  id: string;
}

interface CourseInfo {
  activityName: string | null;
  venue: string | null;
  startDate: Date | null;
  endDate: Date | null;
  createdByName: string;
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function formatDate(date: Date | null | undefined): string {
  if (!date) return '—';
  return date.toLocaleDateString('ar-SA', { year: 'numeric', month: 'numeric', day: 'numeric' });
}

function formatReportDate(date: Date): string {
  return date.toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function ParticipantsTable({ participants, baseUrl }: { participants: Participant[]; baseUrl: string }) {
  const colWidths = ['6%', '24%', '12%', '12%', '12%', '12%', '12%', '10%'];
  const headers = ['م', 'الاسم', 'رقم الجواز', 'انتهاء الجواز', 'رقم الهوية', 'الجوال', 'تاريخ الميلاد', 'الرابط'];

  return (
    <View style={styles.table}>
      <View style={styles.tableHeaderRow}>
        {headers.map((h, i) => (
          <View key={h} style={[styles.tableHeaderCell, { width: colWidths[i] }]}>
            <Text>{h}</Text>
          </View>
        ))}
      </View>
      {participants.map((p, idx) => (
        <View key={p.id} style={idx % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
          <Text style={[styles.tableCell, { width: colWidths[0] }]}>{p.index}</Text>
          <Text style={[styles.tableCell, { width: colWidths[1] }]}>{p.fullNamePassport}</Text>
          <Text style={[styles.tableCell, { width: colWidths[2] }]}>{p.passportNumber}</Text>
          <Text style={[styles.tableCell, { width: colWidths[3] }]}>{p.passportExpiry}</Text>
          <Text style={[styles.tableCell, { width: colWidths[4] }]}>{p.nationalId}</Text>
          <Text style={[styles.tableCell, { width: colWidths[5] }]}>{p.mobile}</Text>
          <Text style={[styles.tableCell, { width: colWidths[6] }]}>{p.birthDate}</Text>
          <View style={[styles.tableCell, { width: colWidths[7] }]}>
            <Link src={`${baseUrl}/participant/${p.id}`} style={styles.link}>
              <Text>لمعلومات المشارك كاملة</Text>
            </Link>
          </View>
        </View>
      ))}
    </View>
  );
}

export async function generatePdfBuffer(
  course: CourseInfo,
  participants: Participant[],
  baseUrl: string,
): Promise<Buffer> {
  const insuranceStart = course.startDate ? addDays(course.startDate, -1) : null;
  const insuranceEnd = course.endDate ? addDays(course.endDate, 3) : null;

  const PdfDocument = (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Image
            src={path.join(process.cwd(), 'public/images/nauss-logo-gold.png')}
            style={{ width: 120 }}
          />
          <Text style={styles.headerTitle}>جامعة نايف العربية للعلوم الأمنية</Text>
          <Text style={styles.headerSub}>كلية التدريب — منصة تأمين المشاركين</Text>
        </View>

        <Text style={styles.sectionTitle}>بيانات الدورة</Text>
        <View style={styles.infoGrid}>
          {[
            { label: 'النشاط', value: course.activityName || '—' },
            { label: 'المكان', value: course.venue || '—' },
            { label: 'تاريخ البداية', value: formatDate(course.startDate) },
            { label: 'تاريخ النهاية', value: formatDate(course.endDate) },
            { label: 'عدد المشاركين', value: String(participants.length) },
            { label: 'إعداد', value: course.createdByName },
          ].map(item => (
            <View key={item.label} style={styles.infoItem}>
              <Text style={styles.infoLabel}>{item.label}</Text>
              <Text style={styles.infoValue}>{item.value}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>قائمة المشاركين</Text>
        <ParticipantsTable participants={participants} baseUrl={baseUrl} />

          <View style={styles.insuranceBox}>
          <Text style={styles.insuranceTitle}>بيانات التأمين الطبي المقترحة</Text>
          <View style={styles.insuranceRow}>
            <Text style={styles.insuranceLabel}>تاريخ بداية التأمين:</Text>
            <Text style={styles.insuranceValue}>{insuranceStart ? formatReportDate(insuranceStart) : '—'}</Text>
          </View>
          <View style={styles.insuranceRow}>
            <Text style={styles.insuranceLabel}>تاريخ نهاية التأمين:</Text>
            <Text style={styles.insuranceValue}>{insuranceEnd ? formatReportDate(insuranceEnd) : '—'}</Text>
          </View>
          <View style={[styles.insuranceRow, { marginTop: 6, borderTopWidth: 1, borderTopColor: LINE, borderTopStyle: 'solid', paddingTop: 6 }]}>
            <Text style={{ fontSize: 9, color: MUTED, flex: 1 }}>
              * بداية التأمين قبل الدورة بيوم، ونهايته بعد الدورة بثلاثة أيام.
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            تم التصدير من منصة تأمين المشاركين — {formatReportDate(new Date())}
          </Text>
          <Text style={styles.creditText}>طُوِّر بواسطة نايف الشهراني</Text>
        </View>
      </Page>
    </Document>
  );

  const buffer = await ReactPDF.renderToBuffer(PdfDocument);
  return buffer;
}
