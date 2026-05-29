import React from 'react';
import {
  Document, Page, View, Text, Image, Font, StyleSheet, Link, renderToBuffer,
} from '@react-pdf/renderer';
import path from 'path';

const TEAL = '#016564';
const TEAL_DARK = '#014948';
const GOLD = '#d0b284';
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
    padding: 36,
    fontFamily: 'Cairo',
    direction: 'rtl',
  },
  header: {
    padding: 20,
    marginBottom: 20,
    borderRadius: 16,
    backgroundColor: TEAL,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    color: WHITE,
    fontWeight: 700,
    marginTop: 10,
  },
  headerSub: {
    fontSize: 11,
    color: GOLD,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 13,
    color: TEAL_DARK,
    fontWeight: 700,
    marginBottom: 8,
    borderBottom: `1.5px solid ${GOLD}`,
    paddingBottom: 3,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  infoBlock: {
    flex: 1,
    padding: '4 6',
  },
  infoLabel: {
    fontSize: 8,
    color: MUTED,
    marginBottom: 1,
  },
  infoValue: {
    fontSize: 10,
    color: TEAL_DARK,
    fontWeight: 700,
  },
  divider: {
    height: 1,
    backgroundColor: LINE,
    marginVertical: 12,
  },
  insuranceBlock: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#f4f8f8',
    marginBottom: 16,
  },
  insuranceTitle: {
    fontSize: 11,
    color: TEAL_DARK,
    fontWeight: 700,
    marginBottom: 6,
  },
  insuranceRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  insuranceLabel: {
    fontSize: 9,
    color: MUTED,
    width: 140,
  },
  insuranceValue: {
    fontSize: 9,
    color: TEAL_DARK,
    fontWeight: 700,
  },
  insuranceNote: {
    fontSize: 8,
    color: MUTED,
    marginTop: 4,
    fontStyle: 'italic',
  },
  table: {
    width: '100%',
    marginBottom: 20,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: TEAL,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  tableHeaderCell: {
    padding: '7 5',
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
    alignItems: 'center',
  },
  tableRowAlt: {
    flexDirection: 'row',
    backgroundColor: '#f4f8f8',
    borderBottomWidth: 1,
    borderBottomColor: LINE,
    borderBottomStyle: 'solid',
    alignItems: 'center',
  },
  tableCell: {
    padding: '7 5',
    fontSize: 8,
    color: TEAL_DARK,
    textAlign: 'center',
  },
  tableLink: {
    color: '#0563C1',
    textDecoration: 'underline',
    fontSize: 7,
    textAlign: 'center',
  },
  footer: {
    marginTop: 24,
    borderTopWidth: 1,
    borderTopColor: LINE,
    borderTopStyle: 'solid',
    paddingTop: 10,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 7,
    color: MUTED,
    marginBottom: 1,
  },
  creditText: {
    fontSize: 6,
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
  const colWidths = ['10%', '50%', '40%'];
  const headers = ['م', 'اسم المشارك', 'رابط معلومات المشارك'];

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
          <View style={[styles.tableCell, { width: colWidths[2] }]}>
            <Link src={`${baseUrl}/participant/${p.id}`} style={styles.tableLink}>
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
            style={{ width: 100 }}
          />
          <Text style={styles.headerTitle}>جامعة نايف العربية للعلوم الأمنية</Text>
          <Text style={styles.headerSub}>كلية التدريب — منصة تأمين المشاركين</Text>
        </View>

        <Text style={styles.sectionTitle}>بيانات الدورة</Text>
        <View style={styles.infoRow}>
          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>النشاط</Text>
            <Text style={styles.infoValue}>{course.activityName || '—'}</Text>
          </View>
          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>المكان</Text>
            <Text style={styles.infoValue}>{course.venue || '—'}</Text>
          </View>
          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>تاريخ البداية</Text>
            <Text style={styles.infoValue}>{formatDate(course.startDate)}</Text>
          </View>
        </View>
        <View style={[styles.infoRow, { marginBottom: 4 }]}>
          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>تاريخ النهاية</Text>
            <Text style={styles.infoValue}>{formatDate(course.endDate)}</Text>
          </View>
          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>إعداد</Text>
            <Text style={styles.infoValue}>{course.createdByName}</Text>
          </View>
          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>عدد المشاركين</Text>
            <Text style={styles.infoValue}>{String(participants.length)}</Text>
          </View>
        </View>

        <View style={styles.insuranceBlock}>
          <Text style={styles.insuranceTitle}>تواريخ التأمين الطبي المقترحة</Text>
          <View style={styles.insuranceRow}>
            <Text style={styles.insuranceLabel}>تاريخ بداية التأمين:</Text>
            <Text style={styles.insuranceValue}>{insuranceStart ? formatDate(insuranceStart) : '—'}</Text>
          </View>
          <View style={styles.insuranceRow}>
            <Text style={styles.insuranceLabel}>تاريخ نهاية التأمين:</Text>
            <Text style={styles.insuranceValue}>{insuranceEnd ? formatDate(insuranceEnd) : '—'}</Text>
          </View>
          <Text style={styles.insuranceNote}>بداية التأمين قبل الدورة بيوم، ونهايته بعد الدورة بثلاثة أيام</Text>
        </View>

        <Text style={styles.sectionTitle}>قائمة المشاركين</Text>
        <ParticipantsTable participants={participants} baseUrl={baseUrl} />

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            تم التصدير من منصة تأمين المشاركين — {formatReportDate(new Date())}
          </Text>
          <Text style={styles.creditText}>طُوِّر بواسطة نايف الشهراني</Text>
        </View>
      </Page>
    </Document>
  );

  const buffer = await renderToBuffer(PdfDocument);
  return buffer;
}
