import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/server';
import { prisma } from '@/lib/db/prisma';
import * as XLSX from 'xlsx';
import { stringify } from 'papaparse';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get request data
    const { ids, format = 'csv' } = await request.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'No contacts specified for export' }, { status: 400 });
    }

    // Fetch contacts from database
    const contacts = await prisma.contact.findMany({
      where: { id: { in: ids } },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        company: true,
        title: true,
        status: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
        lastContactedAt: true,
        nextFollowUpDate: true,
        address: true,
        socialProfiles: true,
        tags: {
          select: {
            name: true,
          },
        },
      },
    });

    if (contacts.length === 0) {
      return NextResponse.json(
        { error: 'No contacts found with the specified IDs' },
        { status: 404 }
      );
    }

    // Format contacts for export
    const formattedContacts = contacts.map(contact => ({
      First_Name: contact.firstName,
      Last_Name: contact.lastName,
      Email: contact.email,
      Phone: contact.phone || '',
      Company: contact.company || '',
      Title: contact.title || '',
      Status: contact.status || '',
      Tags: contact.tags?.map(tag => tag.name).join(', ') || '',
      Notes: contact.notes || '',
      Created_At: formatDate(contact.createdAt),
      Updated_At: formatDate(contact.updatedAt),
      Last_Contacted: contact.lastContactedAt ? formatDate(contact.lastContactedAt) : '',
      Next_Follow_Up: contact.nextFollowUpDate ? formatDate(contact.nextFollowUpDate) : '',
      Street: contact.address?.street || '',
      City: contact.address?.city || '',
      State: contact.address?.state || '',
      Postal_Code: contact.address?.postalCode || '',
      Country: contact.address?.country || '',
      LinkedIn: contact.socialProfiles?.linkedin || '',
      Twitter: contact.socialProfiles?.twitter || '',
      Facebook: contact.socialProfiles?.facebook || '',
      Instagram: contact.socialProfiles?.instagram || '',
    }));

    // Generate export file based on format
    let exportData: Uint8Array;
    let contentType: string;
    let filename: string;

    switch (format) {
      case 'csv':
        exportData = await generateCSV(formattedContacts);
        contentType = 'text/csv';
        filename = 'contacts_export.csv';
        break;

      case 'xlsx':
        exportData = await generateExcel(formattedContacts);
        contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        filename = 'contacts_export.xlsx';
        break;

      case 'vcf':
        exportData = await generateVCF(contacts);
        contentType = 'text/vcard';
        filename = 'contacts_export.vcf';
        break;

      case 'json':
        exportData = Buffer.from(JSON.stringify(formattedContacts, null, 2));
        contentType = 'application/json';
        filename = 'contacts_export.json';
        break;

      default:
        return NextResponse.json({ error: 'Unsupported export format' }, { status: 400 });
    }

    // Return file for download
    const response = new NextResponse(exportData, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });

    return response;
  } catch (error) {
    console.error('Export error:', error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ error: 'An error occurred during export' }, { status: 500 });
  }
}

// Generate CSV export
async function generateCSV(contacts: any[]): Promise<Uint8Array> {
  const csv = stringify(contacts, { header: true });
  return Buffer.from(csv);
}

// Generate Excel export
async function generateExcel(contacts: any[]): Promise<Uint8Array> {
  // Create workbook
  const workbook = XLSX.utils.book_new();

  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(contacts);

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Contacts');

  // Generate file
  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

  return buffer;
}

// Generate VCF (vCard) export
async function generateVCF(contacts: any[]): Promise<Uint8Array> {
  const vCards = contacts
    .map(contact => {
      // Format vCard string
      return `BEGIN:VCARD
VERSION:3.0
N:${contact.lastName};${contact.firstName};;;
FN:${contact.firstName} ${contact.lastName}
ORG:${contact.company || ''}
TITLE:${contact.title || ''}
EMAIL;TYPE=INTERNET:${contact.email}
TEL;TYPE=CELL:${contact.phone || ''}
${
  contact.address?.street
    ? `ADR;TYPE=WORK:;;${contact.address.street};${contact.address.city || ''};${
        contact.address.state || ''
      };${contact.address.postalCode || ''};${contact.address.country || ''}`
    : ''
}
${contact.socialProfiles?.linkedin ? `URL;TYPE=LinkedIn:${contact.socialProfiles.linkedin}` : ''}
${contact.socialProfiles?.twitter ? `URL;TYPE=Twitter:${contact.socialProfiles.twitter}` : ''}
NOTE:${contact.notes || ''}
REV:${new Date().toISOString()}
END:VCARD
`;
    })
    .join('\n');

  return Buffer.from(vCards);
}

// Format date for export
function formatDate(date: Date | string): string {
  if (!date) return '';

  const d = new Date(date);
  return d.toISOString().split('T')[0];
}
