import { useRef } from 'react';
import { Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  onFilesSelected: (files: FileList) => void;
  disabled?: boolean;
}

export function FileUploadButton({ onFilesSelected, disabled }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => inputRef.current?.click()}
        disabled={disabled}
        className="h-9 w-9 rounded-xl flex-shrink-0 text-muted-foreground"
        title="Attach file"
      >
        <Paperclip className="h-4 w-4" />
      </Button>
      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) {
            onFilesSelected(e.target.files);
            e.target.value = '';
          }
        }}
      />
    </>
  );
}
