// Main components
export { TemplatesOverview } from './TemplatesOverview';
export { TemplateEditor } from './TemplateEditor';
export { TemplateLibrary } from './TemplateLibrary';
export { TemplateCategories } from './TemplateCategories';
export { PresetSelector } from './PresetSelector';

// Sub-components for the template editor
export { ComponentPanel } from './ComponentPanel';
export { EditorCanvas } from './EditorCanvas';
export { PropertyEditor } from './PropertyEditor';
export { PreviewPanel } from './PreviewPanel';

// Other template-related components
export { default as TemplatesEmail } from './templates-email';
export { default as TemplatesLibrary } from './templates-library';
export { default as TemplatesCategories } from './templates-categories';

// Direct default export (simpler approach)
export { TemplatesOverview as default } from './TemplatesOverview';
