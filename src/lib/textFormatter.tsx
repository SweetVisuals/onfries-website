import React, { useState, useRef } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

interface TextFormatterProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

interface FormattingState {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  fontSize: string;
  color: string;
}

const TextFormatter: React.FC<TextFormatterProps> = ({
  value,
  onChange,
  placeholder = "Enter text...",
  className = ""
}) => {
  const [formatting, setFormatting] = useState<FormattingState>({
    bold: false,
    italic: false,
    underline: false,
    fontSize: '16',
    color: '#000000'
  });

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const applyTextFormatting = (format: 'bold' | 'italic' | 'underline') => {
    const textarea = textareaRef.current;
    if (!textarea || textarea.selectionStart === textarea.selectionEnd) {
      return false; // No selection to format
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    
    let formattedText = selectedText;
    let tag = '';
    
    // Apply the specific formatting
    switch (format) {
      case 'bold':
        tag = 'strong';
        break;
      case 'italic':
        tag = 'em';
        break;
      case 'underline':
        tag = 'u';
        break;
    }
    
    // Check if already formatted with this tag
    const regex = new RegExp(`<${tag}>`, 'i');
    if (regex.test(formattedText)) {
      // Remove formatting
      formattedText = formattedText
        .replace(new RegExp(`<\\/?${tag}>`, 'gi'), '');
    } else {
      // Add formatting
      formattedText = `<${tag}>${formattedText}</${tag}>`;
    }
    
    const newValue = value.substring(0, start) + formattedText + value.substring(end);
    onChange(newValue);
    
    // Restore cursor position
    setTimeout(() => {
      if (textarea) {
        textarea.focus();
        textarea.setSelectionRange(start, start + formattedText.length);
      }
    }, 0);
    
    return true;
  };

  const applyStyleFormatting = (name: string, styleValue: string) => {
    const textarea = textareaRef.current;
    if (!textarea || textarea.selectionStart === textarea.selectionEnd) {
      return false; // No selection to format
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    
    let formattedText = selectedText;
    
    // Remove existing span formatting
    formattedText = formattedText.replace(/<span[^>]*>/gi, '').replace(/<\/span>/gi, '');
    
    // Apply new formatting
    const size = name === 'fontSize' ? styleValue : formatting.fontSize;
    const color = name === 'color' ? styleValue : formatting.color;
    
    if (size !== '16' || color !== '#000000') {
      formattedText = `<span style="font-size:${size}px;color:${color}">${formattedText}</span>`;
    }
    
    const newValue = value.substring(0, start) + formattedText + value.substring(end);
    onChange(newValue);
    
    return true;
  };

  const updateFormatting = (updates: Partial<FormattingState>) => {
    setFormatting(prev => ({ ...prev, ...updates }));
  };

  const toggleFormat = (format: 'bold' | 'italic' | 'underline') => {
    applyTextFormatting(format);
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value: inputValue } = e.target;
    if (name === 'fontSize' || name === 'color') {
      updateFormatting({ [name]: inputValue });
      applyStyleFormatting(name, inputValue);
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Formatting Toolbar */}
      <div className="flex flex-wrap items-center gap-2 p-2 border rounded-lg bg-muted/50">
        <Button
          type="button"
          variant={formatting.bold ? "default" : "outline"}
          size="sm"
          onClick={() => toggleFormat('bold')}
          className="px-3"
        >
          <strong>B</strong>
        </Button>
        
        <Button
          type="button"
          variant={formatting.italic ? "default" : "outline"}
          size="sm"
          onClick={() => toggleFormat('italic')}
          className="px-3"
        >
          <em>I</em>
        </Button>
        
        <Button
          type="button"
          variant={formatting.underline ? "default" : "outline"}
          size="sm"
          onClick={() => toggleFormat('underline')}
          className="px-3"
        >
          <u>U</u>
        </Button>
        
        <div className="flex items-center gap-1">
          <Label htmlFor="fontSize" className="text-xs">Size:</Label>
          <Input
            id="fontSize"
            name="fontSize"
            type="number"
            value={formatting.fontSize}
            onChange={handleInputChange}
            className="w-16 h-8 text-xs"
            min="8"
            max="72"
            step="1"
          />
        </div>
        
        <div className="flex items-center gap-1">
          <Label htmlFor="color" className="text-xs">Color:</Label>
          <Input
            id="color"
            name="color"
            type="color"
            value={formatting.color}
            onChange={handleInputChange}
            className="w-10 h-8 p-1"
          />
        </div>
      </div>
      
      {/* Text Area */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={value.replace(/<[^>]*>/g, '')} // Strip HTML for display
          onChange={handleTextareaChange}
          placeholder={placeholder}
          className="w-full min-h-[80px] p-3 border border-input bg-background rounded-lg resize-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus-visible:outline-none focus-visible:border-transparent text-foreground dark:text-white placeholder:text-muted-foreground"
          style={{
            fontSize: `${formatting.fontSize}px`,
            fontWeight: formatting.bold ? 'bold' : 'normal',
            fontStyle: formatting.italic ? 'italic' : 'normal',
            textDecoration: formatting.underline ? 'underline' : 'none'
          }}
        />
        <p className="text-xs text-muted-foreground mt-1">
          Select text and use the toolbar to apply formatting
        </p>
        {!textareaRef.current || textareaRef.current.selectionStart === textareaRef.current.selectionEnd ? (
          <p className="text-xs text-amber-600 mt-1">
            ⚠️ No text selected. Select text to apply formatting.
          </p>
        ) : (
          <p className="text-xs text-green-600 mt-1">
            ✓ Text selected. Formatting will be applied to selected text.
          </p>
        )}
      </div>
    </div>
  );
};

// Utility function to convert formatted text to plain text for storage
export const stripHtmlTags = (html: string): string => {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
};

// Utility function to preview formatted text
export const renderFormattedText = (html: string) => {
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
};

export default TextFormatter;