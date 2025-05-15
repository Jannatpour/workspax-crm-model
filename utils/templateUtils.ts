import { EmailComponent } from '../types';

/**
 * Base email template structure
 */
const newEmailTemplate = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Template</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 0;
      line-height: 1.6;
      color: #333;
      background-color: #f9f9f9;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }
    .content-area {
      min-height: 200px;
    }
    img {
      max-width: 100%;
      height: auto;
    }
    a {
      color: #007bff;
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
    /* Mobile Styles */
    @media only screen and (max-width: 480px) {
      .container {
        width: 100% !important;
      }
      div[style*="width: 50%"] {
        width: 100% !important;
        display: block !important;
      }
      div[style*="width: 33.33%"] {
        width: 100% !important;
        display: block !important;
      }
    }
  </style>
</head>
<body>
  <div class="container" id="template-container">
    <!-- Content will be placed here -->
  </div>
</body>
</html>
`;

/**
 * Generate HTML template from email components
 */
export function generateTemplateHtml(components: EmailComponent[]): string {
  if (components.length === 0) return newEmailTemplate;

  try {
    // Use DOMParser to work with the HTML template
    const parser = new DOMParser();
    const doc = parser.parseFromString(newEmailTemplate, 'text/html');
    const container = doc.getElementById('template-container');

    if (container) {
      // Clear existing content
      container.innerHTML = '';

      // Add each component
      components.forEach(component => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = component.content;
        const element = tempDiv.firstChild;
        if (element instanceof HTMLElement) {
          element.setAttribute('data-type', component.type);
          container.appendChild(element);
        }
      });
    }

    return doc.documentElement.outerHTML;
  } catch (error) {
    console.error('Error generating template HTML:', error);
    return newEmailTemplate;
  }
}

/**
 * Extract plain text content from HTML
 */
export function extractTextFromHtml(html: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  return doc.body.textContent || '';
}

/**
 * Sanitize HTML content to prevent XSS
 */
export function sanitizeHtml(html: string): string {
  // In a production app, use a proper sanitizer library
  // This is just a simple example
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '');
}

/**
 * Parse HTML to recreate component structure
 */
export function parseHtmlToComponents(
  html: string,
  componentTypes: Record<string, any>
): EmailComponent[] {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const container = doc.querySelector('#template-container') || doc.body;
    const elements = container.querySelectorAll(
      '[data-type], div, a, img, h1, h2, h3, p, blockquote, ul'
    );

    const parsedComponents: EmailComponent[] = [];

    elements.forEach((element, index) => {
      // Try to determine component type
      const dataType = element.getAttribute('data-type');
      let componentType = dataType || 'text';

      if (!dataType) {
        // Try to infer type from element structure
        if (element.tagName === 'H1' || element.tagName === 'H2') componentType = 'header';
        else if (element.tagName === 'IMG') componentType = 'image';
        else if (
          element.tagName === 'A' &&
          element.getAttribute('style')?.includes('background-color')
        )
          componentType = 'button';
        else if (element.tagName === 'BLOCKQUOTE') componentType = 'quote';
        else if (element.tagName === 'UL' || element.tagName === 'OL') componentType = 'list';
        else if (element.tagName === 'HR') componentType = 'divider';
      }

      // Find matching component
      const matchingComponentType = componentTypes[componentType];

      if (matchingComponentType && !element.closest('[data-parsed="true"]')) {
        // Mark this element as parsed to avoid nested duplicates
        element.setAttribute('data-parsed', 'true');

        parsedComponents.push({
          ...matchingComponentType,
          id: `${matchingComponentType.id}-${Date.now()}-${index}`,
          content: element.outerHTML,
        });
      }
    });

    return parsedComponents;
  } catch (error) {
    console.error('Error parsing HTML to components:', error);
    return [];
  }
}
