import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/server';
import { prisma } from '@/lib/db/prisma';
import { parse } from 'papaparse';
import * as XLSX from 'xlsx';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get form data with file
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Process file based on type
    const fileName = file.name.toLowerCase();
    let contacts: any[] = [];

    if (fileName.endsWith('.csv')) {
      // Process CSV file
      contacts = await processCSV(file);
    } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      // Process Excel file
      contacts = await processExcel(file);
    } else {
      return NextResponse.json(
        { error: 'Unsupported file format. Please use CSV or Excel (.xlsx, .xls)' },
        { status: 400 }
      );
    }

    if (contacts.length === 0) {
      return NextResponse.json({ error: 'No valid contacts found in file' }, { status: 400 });
    }

    // Import contacts to database
    const results = await importContacts(contacts, user.id);

    return NextResponse.json(results);
  } catch (error) {
    console.error('Import error:', error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ error: 'An error occurred during import' }, { status: 500 });
  }
}

// Process CSV file
async function processCSV(file: File): Promise<any[]> {
  const text = await file.text();

  return new Promise((resolve, reject) => {
    parse(text, {
      header: true,
      skipEmptyLines: true,
      complete: results => {
        const processedData = normalizeContactData(results.data);
        resolve(processedData);
      },
      error: error => {
        reject(new Error(`CSV parsing error: ${error}`));
      },
    });
  });
}

// Process Excel file
async function processExcel(file: File): Promise<any[]> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });

  // Get the first sheet
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];

  // Convert to JSON
  const data = XLSX.utils.sheet_to_json(worksheet);

  return normalizeContactData(data);
}

// Normalize contact data from different sources
function normalizeContactData(data: any[]): any[] {
  return data
    .map(row => {
      // Map common field variations
      const firstName = row.firstName || row.first_name || row['First Name'] || row.firstname || '';
      const lastName = row.lastName || row.last_name || row['Last Name'] || row.lastname || '';
      const email = row.email || row.Email || row['Email Address'] || row.email_address || '';
      const phone = row.phone || row.Phone || row['Phone Number'] || row.phone_number || '';
      const company = row.company || row.Company || row['Company Name'] || row.organization || '';
      const title = row.title || row.Title || row['Job Title'] || row.position || '';

      // Skip invalid entries
      if (!email) return null;

      return {
        firstName,
        lastName,
        email,
        phone,
        company,
        title,
        status: row.status || 'lead',
      };
    })
    .filter(Boolean); // Filter out null entries
}

// Import contacts to database
async function importContacts(contacts: any[], userId: string) {
  // Track results
  const results = {
    total: contacts.length,
    imported: 0,
    errors: 0,
    skipped: 0,
  };

  for (const contact of contacts) {
    try {
      // Check if contact already exists
      const existingContact = await prisma.contact.findFirst({
        where: { email: contact.email },
      });

      if (existingContact) {
        results.skipped++;
        continue;
      }

      // Create new contact
      await prisma.contact.create({
        data: {
          firstName: contact.firstName,
          lastName: contact.lastName,
          email: contact.email,
          phone: contact.phone || null,
          company: contact.company || null,
          title: contact.title || null,
          status: contact.status || 'lead',
          source: 'import',
          createdBy: userId,
        },
      });

      results.imported++;
    } catch (error) {
      console.error(`Error importing contact ${contact.email}:`, error);
      results.errors++;
    }
  }

  return results;
}
