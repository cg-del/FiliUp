import React, { forwardRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  error?: string;
  rows?: number;
}

// Custom toolbar configuration for educational content
const toolbarOptions = [
  [{ 'header': [1, 2, 3, false] }], // Header sizes
  ['bold', 'italic', 'underline'], // Basic formatting
  [{ 'list': 'ordered'}, { 'list': 'bullet' }], // Lists
  [{ 'align': [] }], // Text alignment
  ['clean'] // Remove formatting
];

export const RichTextEditor = forwardRef<ReactQuill, RichTextEditorProps>(
  ({ value = '', onChange, placeholder = 'Enter your content...', className, error, rows = 5 }, ref) => {
    const handleChange = (content: string) => {
      onChange?.(content);
    };

    return (
      <div className="space-y-1">
        <ReactQuill
          ref={ref}
          theme="snow"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          modules={{
            toolbar: toolbarOptions
          }}
          formats={[
            'header', 'bold', 'italic', 'underline',
            'list', 'bullet', 'align', 'clean'
          ]}
          className={cn(
            "rich-text-editor",
            error && "border-red-500",
            className
          )}
          style={{
            minHeight: `${rows * 24}px` // Approximate line height
          }}
        />
        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}
        <style>{`
          .rich-text-editor .ql-toolbar {
            border-top: 1px solid hsl(var(--border));
            border-left: 1px solid hsl(var(--border));
            border-right: 1px solid hsl(var(--border));
            border-bottom: none;
            border-radius: 6px 6px 0 0;
            background: hsl(var(--background));
          }

          .rich-text-editor .ql-container {
            border-bottom: 1px solid hsl(var(--border));
            border-left: 1px solid hsl(var(--border));
            border-right: 1px solid hsl(var(--border));
            border-radius: 0 0 6px 6px;
            background: hsl(var(--background));
          }

          .rich-text-editor .ql-editor {
            min-height: ${rows * 24}px;
            font-size: 14px;
            line-height: 1.5;
            color: hsl(var(--foreground));
          }

          .rich-text-editor .ql-editor.ql-blank::before {
            color: hsl(var(--muted-foreground));
            font-style: normal;
          }

          .rich-text-editor .ql-toolbar .ql-picker-label {
            color: hsl(var(--foreground));
          }

          .rich-text-editor .ql-toolbar .ql-stroke {
            stroke: hsl(var(--foreground));
          }

          .rich-text-editor .ql-toolbar .ql-fill {
            fill: hsl(var(--foreground));
          }

          .rich-text-editor .ql-toolbar button:hover {
            background: hsl(var(--muted));
          }

          .rich-text-editor .ql-toolbar button.ql-active {
            background: hsl(var(--primary));
          }

          .rich-text-editor .ql-toolbar button.ql-active .ql-stroke {
            stroke: hsl(var(--primary-foreground));
          }

          .rich-text-editor .ql-toolbar button.ql-active .ql-fill {
            fill: hsl(var(--primary-foreground));
          }
        `}</style>
      </div>
    );
  }
);

RichTextEditor.displayName = 'RichTextEditor';
