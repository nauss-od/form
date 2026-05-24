export interface MrzResult {
  fullNamePassport: string;
  passportNumber: string;
  passportExpiry: string;
  birthDate: string;
  nationality: string;
  issuingCountry: string;
  sex: string;
}

function clean(s: string): string {
  return s.replace(/[^A-Z0-9<]/g, '');
}

function digits(n: number): string {
  return String(n).padStart(2, '0');
}

function parseDate(yymmdd: string): string {
  if (!yymmdd || yymmdd.length < 6) return '';
  const yy = parseInt(yymmdd.substring(0, 2), 10);
  const mm = yymmdd.substring(2, 4);
  const dd = yymmdd.substring(4, 6);
  if (isNaN(yy)) return '';
  const fullYear = yy >= 40 ? 1900 + yy : 2000 + yy;
  return `${fullYear}-${mm}-${dd}`;
}

export function parseMrz(raw: string): MrzResult | null {
  // Normalize: uppercase, keep < and alphanumeric
  const text = raw.toUpperCase().replace(/[^A-Z0-9<]/g, '');

  // Find all candidate lines (30+ chars, or starting with P)
  const candidates: string[] = [];
  let i = 0;
  while (i < text.length) {
    // Try to find a line starting with P (passport indicator)
    const pIdx = text.indexOf('P', i);
    if (pIdx === -1 || pIdx > i + 5) {
      // No P found nearby, just take chunks
      break;
    }
    // From P, take next 44 chars (or up to 50)
    const line1 = text.substring(pIdx, Math.min(pIdx + 50, text.length));
    // Find the second line: after line1, look for a line starting with alphanumeric
    const rest = text.substring(pIdx + line1.length);
    const line2Match = rest.match(/^[A-Z0-9<]{30,50}/);
    if (line2Match) {
      candidates.push(line1.substring(0, 44));
      candidates.push(line2Match[0].substring(0, 44));
      break;
    }
    i = pIdx + 1;
  }

  // Fallback: if no P found, try to find two consecutive long strings
  if (candidates.length === 0) {
    const chunks: string[] = [];
    let cur = '';
    for (const ch of text) {
      cur += ch;
      // If we have a long enough chunk, check if next char ends a "line"
      if (cur.length >= 30) {
        chunks.push(cur);
        cur = '';
      }
    }
    if (cur.length >= 30) chunks.push(cur);

    // Take first two chunks that are 30-50 chars
    const valid = chunks.filter(c => c.length >= 30 && c.length <= 50);
    if (valid.length >= 2) {
      candidates.push(valid[0].substring(0, 44));
      candidates.push(valid[1].substring(0, 44));
    }
  }

  if (candidates.length < 2) return null;

  let line1 = clean(candidates[0]).padEnd(44, '<').substring(0, 44);
  let line2 = clean(candidates[1]).padEnd(44, '<').substring(0, 44);

  // Line 1 must start with P
  if (line1[0] !== 'P') {
    // Try prepending P
    line1 = 'P' + line1.substring(0, 43);
  }

  // Extract surname from line1 (between pos 5 and <<)
  const nameField = line1.substring(5);
  const nameParts = nameField.split(/<+/).filter(Boolean);
  const surname = nameParts[0] || '';
  const givenNames = nameParts.slice(1).join(' ');
  const fullNamePassport = givenNames ? `${givenNames} ${surname}` : surname;

  // Extract from line2
  const passportNumber = line2.substring(0, 10).replace(/</g, '');
  const nationality = line2.substring(11, 14).replace(/</g, '');
  const rawDob = line2.substring(14, 20);
  const sex = line2.substring(21, 22);
  const rawExpiry = line2.substring(22, 28);

  const birthDate = parseDate(rawDob);
  const passportExpiry = parseDate(rawExpiry);

  if (!passportNumber) return null;

  return {
    fullNamePassport: fullNamePassport.trim() || '',
    passportNumber,
    passportExpiry,
    birthDate,
    nationality,
    issuingCountry: line1.substring(2, 5).replace(/</g, ''),
    sex: sex === 'M' || sex === 'F' ? sex : '',
  };
}
