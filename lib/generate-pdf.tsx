import React from 'react';
import {
  Document, Page, View, Text, Image, Font, StyleSheet, Link, renderToBuffer,
} from '@react-pdf/renderer';
import fs from 'fs';
import path from 'path';

const TEAL = '#016564';
const TEAL_DARK = '#014948';
const GOLD = '#d0b284';
const WHITE = '#ffffff';
const LINE = '#c9d7d7';
const MUTED = '#667777';

const fontData = fs.readFileSync(path.join(process.cwd(), 'public/fonts/Cairo-Variable.ttf'));
Font.register({
  family: 'Cairo',
  src: `data:font/ttf;base64,${fontData.toString('base64')}`,
});

const logoData = fs.readFileSync(path.join(process.cwd(), 'public/images/nauss-logo-gold.png'));
const logoSrc = `data:image/png;base64,${logoData.toString('base64')}`;

const styles = StyleSheet.create({
  page: {
    padding: 36,
    fontFamily: 'Cairo',
  },
  header: {
    padding: 16,
    marginBottom: 18,
    borderRadius: 14,
    backgroundColor: TEAL,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    color: WHITE,
    fontWeight: 700,
    marginTop: 8,
    textAlign: 'center',
  },
  headerSub: {
    fontSize: 10,
    color: GOLD,
    marginTop: 2,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 12,
    color: TEAL_DARK,
    fontWeight: 700,
    marginBottom: 6,
    borderBottom: `1px solid ${GOLD}`,
    paddingBottom: 2,
    textAlign: 'right',
  },
  infoRow: {
    flexDirection: 'row-reverse',
    marginBottom: 3,
  },
  infoBlock: {
    flex: 1,
    padding: '3 5',
    alignItems: 'flex-end',
  },
  infoLabel: {
    fontSize: 7,
    color: MUTED,
    marginBottom: 1,
    textAlign: 'right',
  },
  infoValue: {
    fontSize: 9,
    color: TEAL_DARK,
    fontWeight: 700,
    textAlign: 'right',
  },
  insuranceBlock: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#f4f8f8',
    borderWidth: 1,
    borderColor: LINE,
    borderStyle: 'solid',
    marginBottom: 14,
    alignItems: 'flex-end',
  },
  insuranceTitle: {
    fontSize: 10,
    color: TEAL_DARK,
    fontWeight: 700,
    marginBottom: 4,
    textAlign: 'right',
  },
  insuranceRow: {
    flexDirection: 'row-reverse',
    marginBottom: 1,
  },
  insuranceLabel: {
    fontSize: 8,
    color: MUTED,
    width: 130,
    textAlign: 'right',
  },
  insuranceValue: {
    fontSize: 8,
    color: TEAL_DARK,
    fontWeight: 700,
    textAlign: 'right',
  },
  insuranceNote: {
    fontSize: 7,
    color: MUTED,
    marginTop: 3,
    textAlign: 'right',
  },
  table: {
    width: '100%',
    marginBottom: 16,
  },
  tableHeaderRow: {
    flexDirection: 'row-reverse',
    backgroundColor: TEAL,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  tableHeaderCell: {
    padding: '6 4',
    color: WHITE,
    fontSize: 8,
    fontWeight: 700,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row-reverse',
    borderBottomWidth: 1,
    borderBottomColor: LINE,
    borderBottomStyle: 'solid',
    alignItems: 'center',
  },
  tableRowAlt: {
    flexDirection: 'row-reverse',
    backgroundColor: '#f4f8f8',
    borderBottomWidth: 1,
    borderBottomColor: LINE,
    borderBottomStyle: 'solid',
    alignItems: 'center',
  },
  tableCell: {
    padding: '6 4',
    fontSize: 7,
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
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: LINE,
    borderTopStyle: 'solid',
    paddingTop: 8,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 7,
    color: MUTED,
    marginBottom: 1,
    textAlign: 'center',
  },
  creditText: {
    fontSize: 6,
    color: '#99aaaa',
    textAlign: 'center',
  },
});

interface Participant {
  index: number;
  fullNamePassport: string;
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
  return date.toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'numeric', day: 'numeric' });
}

function ParticipantsTable({ participants, baseUrl }: { participants: Participant[]; baseUrl: string }) {
  const colWidths = ['10%', '55%', '35%'];
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
            src={logoSrc}
            style={{ width: 80 }}
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
        <View style={[styles.infoRow, { marginBottom: 3 }]}>
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
