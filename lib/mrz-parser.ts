export interface MrzResult {
  fullNamePassport: string;
  passportNumber: string;
  passportExpiry: string; // YYYY-MM-DD
  birthDate: string;      // YYYY-MM-DD
  nationality: string;
  issuingCountry: string;
  sex: string;
}

function checkDigit(data: string): number {
  const weights = [7, 3, 1];
  let sum = 0;
  for (let i = 0; i < data.length; i++) {
    const ch = data[i];
    let val: number;
    if (ch >= '0' && ch <= '9') val = ch.charCodeAt(0) - 48;
    else if (ch >= 'A' && ch <= 'Z') val = ch.charCodeAt(0) - 55;
    else if (ch === '<') val = 0;
    else return -1;
    sum += val * weights[i % 3];
  }
  return sum % 10;
}

function cleanMrzLine(s: string): string {
  return s.replace(/[^A-Z0-9<]/g, '').toUpperCase();
}

function parseDate(yymmdd: string): string {
  if (!yymmdd || yymmdd.length !== 6) return '';
  const yy = parseInt(yymmdd.substring(0, 2), 10);
  const mm = yymmdd.substring(2, 4);
  const dd = yymmdd.substring(4, 6);
  const fullYear = yy >= 40 ? 1900 + yy : 2000 + yy;
  return `${fullYear}-${mm}-${dd}`;
}

function extractName(line: string): string {
  // After position 4 (type + issuing country), the rest is name
  const nameField = line.substring(5).replace(/<+/g, ' ').trim();
  // Split by double space (which was <<)
  const parts = nameField.split(/\s{2,}/);
  // parts[0] = surname, parts[1] = given names
  const surname = parts[0] || '';
  const givenNames = parts.length > 1 ? parts.slice(1).join(' ') : '';
  // Return "GIVEN_NAME SURNAME" or just what we have
  const full = givenNames ? `${givenNames} ${surname}` : surname;
  return full.trim().replace(/\s+/g, ' ');
}

export function parseMrz(text: string): MrzResult | null {
  // Clean input: keep only alphanumeric, <, and newlines
  const cleaned = text.replace(/[^\w<]/g, '').toUpperCase();
  
  // Try to find 2 consecutive lines of 44 chars each
  const lines = cleaned.split(/\s+/).filter(l => l.length >= 30);
  
  let line1 = '';
  let line2 = '';
  
  for (let i = 0; i < lines.length - 1; i++) {
    const a = cleanMrzLine(lines[i]);
    const b = cleanMrzLine(lines[i + 1]);
    if (a.length >= 44 && b.length >= 44) {
      line1 = a.substring(0, 44);
      line2 = b.substring(0, 44);
      break;
    }
  }

  if (!line1 || !line2) return null;

  // Line 1 validation: should start with P
  if (line1[0] !== 'P') return null;

  // Parse
  const issuingCountry = line1.substring(2, 5);
  const fullNamePassport = extractName(line1);

  const passportNumber = line2.substring(0, 10).replace(/</g, '');
  const nationality = line2.substring(11, 14).replace(/</g, '');
  const rawDob = line2.substring(14, 20);
  const sex = line2.substring(21, 22);
  const rawExpiry = line2.substring(22, 28);

  const birthDate = parseDate(rawDob);
  const passportExpiry = parseDate(rawExpiry);

  if (!passportNumber || !birthDate || !passportExpiry) return null;

  return {
    fullNamePassport,
    passportNumber,
    passportExpiry,
    birthDate,
    nationality,
    issuingCountry,
    sex,
  };
}
