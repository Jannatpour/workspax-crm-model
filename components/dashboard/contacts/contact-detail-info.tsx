'use client';

import React from 'react';
import { Contact } from '@/lib/contacts/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, Phone, Building, MapPin, Globe, Calendar, Clock, ExternalLink } from 'lucide-react';
import { formatPhoneNumber } from '@/lib/contacts/utils';

interface ContactDetailInfoProps {
  contact: Contact;
}

export function ContactDetailInfo({ contact }: ContactDetailInfoProps) {
  // Format the date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Contact Information Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          <div className="space-y-2">
            <div className="flex items-center text-sm">
              <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
              <a href={`mailto:${contact.email}`} className="text-primary hover:underline">
                {contact.email}
              </a>
            </div>

            {contact.phone && (
              <div className="flex items-center text-sm">
                <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                <a href={`tel:${contact.phone}`} className="text-primary hover:underline">
                  {formatPhoneNumber(contact.phone)}
                </a>
              </div>
            )}

            {contact.company && (
              <div className="flex items-center text-sm">
                <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{contact.company}</span>
              </div>
            )}

            {contact.title && (
              <div className="flex items-center text-sm">
                <span className="h-4 w-4 mr-2" />
                <span className="text-muted-foreground">{contact.title}</span>
              </div>
            )}
          </div>

          {/* Display address if available */}
          {contact.address && Object.values(contact.address).some(value => value) && (
            <div className="pt-3 border-t">
              <div className="flex items-start text-sm">
                <MapPin className="h-4 w-4 mr-2 text-muted-foreground mt-0.5" />
                <div>
                  {contact.address.street && <div>{contact.address.street}</div>}
                  {(contact.address.city ||
                    contact.address.state ||
                    contact.address.postalCode) && (
                    <div>
                      {contact.address.city}
                      {contact.address.city && contact.address.state && ', '}
                      {contact.address.state} {contact.address.postalCode}
                    </div>
                  )}
                  {contact.address.country && <div>{contact.address.country}</div>}
                </div>
              </div>
            </div>
          )}

          {/* Display dates */}
          <div className="pt-3 border-t space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>Created</span>
              </div>
              <span>{formatDate(contact.createdAt)}</span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>Last Updated</span>
              </div>
              <span>{formatDate(contact.updatedAt)}</span>
            </div>

            {contact.lastContactedAt && (
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>Last Contacted</span>
                </div>
                <span>{formatDate(contact.lastContactedAt)}</span>
              </div>
            )}

            {contact.nextFollowUpDate && (
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>Next Follow-up</span>
                </div>
                <span>{formatDate(contact.nextFollowUpDate)}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Social Profiles Card */}
      {contact.socialProfiles && Object.values(contact.socialProfiles).some(value => value) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium">Social Profiles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
            {contact.socialProfiles.linkedin && (
              <div className="flex items-center justify-between text-sm">
                <span>LinkedIn</span>
                <Button variant="link" size="sm" className="h-6 p-0" asChild>
                  <a
                    href={contact.socialProfiles.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Profile
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </Button>
              </div>
            )}

            {contact.socialProfiles.twitter && (
              <div className="flex items-center justify-between text-sm">
                <span>Twitter</span>
                <Button variant="link" size="sm" className="h-6 p-0" asChild>
                  <a
                    href={contact.socialProfiles.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Profile
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </Button>
              </div>
            )}

            {contact.socialProfiles.facebook && (
              <div className="flex items-center justify-between text-sm">
                <span>Facebook</span>
                <Button variant="link" size="sm" className="h-6 p-0" asChild>
                  <a
                    href={contact.socialProfiles.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Profile
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </Button>
              </div>
            )}

            {contact.socialProfiles.instagram && (
              <div className="flex items-center justify-between text-sm">
                <span>Instagram</span>
                <Button variant="link" size="sm" className="h-6 p-0" asChild>
                  <a
                    href={contact.socialProfiles.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Profile
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Notes Card */}
      {contact.notes && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium">Notes</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-sm whitespace-pre-wrap">{contact.notes}</div>
          </CardContent>
        </Card>
      )}

      {/* Enrichment Data */}
      {contact.isEnriched && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium">Enrichment Data</CardTitle>
            <CardDescription>
              Data enriched via Apollo.io on {formatDate(contact.enrichedAt)}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            {contact.companyData && (
              <div className="space-y-2 mb-4">
                <h4 className="text-sm font-medium">Company Information</h4>

                {contact.companyData.website && (
                  <div className="flex items-center text-sm">
                    <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
                    <a
                      href={contact.companyData.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {contact.companyData.website}
                    </a>
                  </div>
                )}

                {contact.companyData.industry && (
                  <div className="flex items-center text-sm">
                    <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>Industry: {contact.companyData.industry}</span>
                  </div>
                )}

                {contact.companyData.size && (
                  <div className="flex items-center text-sm">
                    <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>Company Size: {contact.companyData.size}</span>
                  </div>
                )}
              </div>
            )}

            {contact.location && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Location Information</h4>

                <div className="flex items-center text-sm">
                  <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>
                    {[contact.location.city, contact.location.state, contact.location.country]
                      .filter(Boolean)
                      .join(', ')}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
