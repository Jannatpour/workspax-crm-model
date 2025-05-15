/**
 * Type definitions for Email Template Editor components
 */

/**
 * Component category definition
 */
export interface ComponentCategory {
  id: string;
  name: string;
  icon: string;
}

/**
 * Email template component definition
 */
export interface EmailComponent {
  id: string;
  type: string;
  name: string;
  category: string;
  icon: string;
  preview: string;
  content: string;
  description?: string;
}

/**
 * Template preset definition
 */
export interface TemplatePreset {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  components: string[];
}

/**
 * Email template definition
 */
export interface EmailTemplate {
  id: string;
  name: string;
  description?: string;
  content: string;
  html: string;
  thumbnail?: string;
  createdAt: Date;
  updatedAt: Date;
  category?: string;
  tags?: string[];
  userId?: string;
  isDefault?: boolean;
}

/**
 * Property definition for component editing
 */
export interface PropertyDefinition {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'color' | 'number' | 'checkbox';
  options?: string[];
  defaultValue?: string | number | boolean;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}

/**
 * Preview mode type
 */
export type PreviewMode = 'desktop' | 'mobile' | 'tablet';

/**
 * Sort direction type
 */
export type SortDirection = 'asc' | 'desc';

/**
 * View mode type
 */
export type ViewMode = 'grid' | 'list';

/**
 * Sort by field type
 */
export type SortByField = 'name' | 'date';
