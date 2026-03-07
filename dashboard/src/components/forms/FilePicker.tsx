import { ComponentProps } from 'react';
import Dropzone, { DropzoneOptions } from 'react-dropzone';
import { FaFile } from 'react-icons/fa';
import { MdUpload } from 'react-icons/md';
import { FormCard } from './Form';
import { useController } from 'react-hook-form';
import { ControlledInput } from './types';
import { useFileUrl } from '@/utils/use-file-url';

export type FilePickerFormProps = {
  options?: DropzoneOptions;
  placeholder?: string;
};

export const FilePickerForm: ControlledInput<FilePickerFormProps, File[] | undefined | null> = ({
  control,
  controller,
  options,
  placeholder,
}) => {
  const {
    field: { value, onChange, ref, ...field },
    fieldState,
  } = useController(controller);

  const empty = value == null || value.length === 0;

  return (
    <FormCard {...control} error={fieldState.error?.message}>
      <Dropzone ref={ref} {...options} onDrop={onChange}>
        {({ getInputProps, getRootProps }) => (
          <div
            className="w-full bg-zinc-50 dark:bg-black/20 border border-dashed border-zinc-300 dark:border-zinc-700 hover:border-indigo-400 dark:hover:border-cyan-500 rounded-2xl p-5 cursor-pointer transition-colors"
            {...getRootProps()}
          >
            <Input input={getInputProps(field as any)} />
            {empty ? (
              <div className="flex flex-col items-center justify-center text-zinc-500 dark:text-zinc-400 text-center gap-2 py-4">
                <MdUpload className="w-12 h-12 opacity-80" />
                <span className="font-medium text-sm">{placeholder ?? 'Upload Files'}</span>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {(value as File[])?.map((file, i) => (
                  <FilePreview key={i} file={file} />
                ))}
              </div>
            )}
          </div>
        )}
      </Dropzone>
    </FormCard>
  );
};

function Input({ input }: { input: ComponentProps<'input'> }) {
  return <input {...input} />;
}

function FilePreview({ file }: { file: File }) {
  const url = useFileUrl(file);

  return (
    <div className="flex flex-row gap-3 w-full items-center p-2 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900/50">
      {file.type.startsWith('image/') ? (
        <img alt={file.name} className="max-w-[60px] max-h-[60px] object-cover rounded-lg" src={url} />
      ) : (
        <div className="flex items-center justify-center rounded-lg bg-indigo-500 dark:bg-cyan-600 w-[50px] h-[50px] shrink-0 text-white">
          <FaFile className="w-6 h-6" />
        </div>
      )}
      <div className="flex flex-col items-start flex-1 min-w-0">
        <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate w-full">
          {file.name}
        </span>
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          {(file.size / 1024).toFixed(1)} KB
        </span>
      </div>
    </div>
  );
}
