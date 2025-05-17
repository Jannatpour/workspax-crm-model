'use client';

import { useEffect } from 'react';
import { useRouter, useParams, usePathname, useSearchParams } from 'next/navigation';
import { useDashboard } from '@/context/dashboard-context';
import { ContactsPage } from '@/components/contacts/contacts-page';
import { ContactDetail } from '@/components/contacts/contacts-detail';
import { ContactForm } from '@/components/contacts/contacts-form';
import { ContactsImport } from '@/components/contacts/contacts-import';
import { ContactsExport } from '@/components/contacts/contacts-export';
import { LoadingSpinner } from '@/components/ui/loading';

export default function ContactsRouteHandler() {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { currentSection, changeSection, sectionParams } = useDashboard();

  // Convert URL path to dashboard section
  useEffect(() => {
    const handlePathRouting = () => {
      if (!pathname.startsWith('/dashboard/contacts')) return;

      // Parse the path segments to determine the appropriate section
      const pathSegments = pathname.split('/').filter(Boolean);

      if (pathSegments.length === 2) {
        // Just /dashboard/contacts
        changeSection('contacts');
        return;
      }

      // /dashboard/contacts/[action]
      if (pathSegments.length === 3) {
        const action = pathSegments[2];

        switch (action) {
          case 'new':
            changeSection('contacts-new');
            break;
          case 'import':
            changeSection('contacts-import');
            break;
          case 'export':
            changeSection('contacts-export');
            break;
          case 'tags':
            changeSection('contacts-tags');
            break;
          case 'groups':
            changeSection('contacts-groups');
            break;
          default:
            // This could be a contact ID
            changeSection('contacts-detail', { id: action });
            break;
        }
        return;
      }

      // /dashboard/contacts/[id]/[action]
      if (pathSegments.length === 4) {
        const id = pathSegments[2];
        const action = pathSegments[3];

        switch (action) {
          case 'edit':
            changeSection('contacts-edit', { id });
            break;
          case 'notes':
            changeSection('contacts-notes', { id });
            break;
          case 'activity':
            changeSection('contacts-activity', { id });
            break;
          default:
            changeSection('contacts-detail', { id });
            break;
        }
        return;
      }
    };

    handlePathRouting();
  }, [pathname, changeSection]);

  // Sync dashboard section to URL
  useEffect(() => {
    const syncSectionToUrl = () => {
      if (!currentSection) return;

      if (currentSection === 'contacts') {
        if (pathname !== '/dashboard/contacts') {
          router.push('/dashboard/contacts');
        }
        return;
      }

      if (currentSection === 'contacts-new') {
        router.push('/dashboard/contacts/new');
        return;
      }

      if (currentSection === 'contacts-import') {
        router.push('/dashboard/contacts/import');
        return;
      }

      if (currentSection === 'contacts-export') {
        router.push('/dashboard/contacts/export');
        return;
      }

      if (currentSection === 'contacts-detail' && sectionParams?.id) {
        router.push(`/dashboard/contacts/${sectionParams.id}`);
        return;
      }

      if (currentSection === 'contacts-edit' && sectionParams?.id) {
        router.push(`/dashboard/contacts/${sectionParams.id}/edit`);
        return;
      }
    };

    syncSectionToUrl();
  }, [currentSection, sectionParams, router, pathname]);

  // Render the appropriate component based on the current section
  const renderContent = () => {
    switch (currentSection) {
      case 'contacts':
        return <ContactsPage />;

      case 'contacts-detail':
        return <ContactDetail />;

      case 'contacts-new':
        return <ContactForm />;

      case 'contacts-edit':
        return <ContactForm />;

      case 'contacts-import':
        return <ContactsImport />;

      case 'contacts-export':
        return <ContactsExport />;

      default:
        if (currentSection?.startsWith('contacts')) {
          return <ContactsPage />;
        }

        // If we're on the contacts page but the section is something else,
        // let's show a loading spinner briefly and then redirect to contacts
        setTimeout(() => {
          changeSection('contacts');
        }, 100);
        return <LoadingSpinner />;
    }
  };

  return <div className="h-full">{renderContent()}</div>;
}
