import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

const FileUpload = ({ onUpload, isUploading }) => {
    const onDrop = useCallback(async (acceptedFiles) => {
        if (acceptedFiles.length === 0) return;
        console.log(acceptedFiles);
        
        try {
            const file = acceptedFiles[0];
            // Convert file to base64
            const arrayBuffer = await file.arrayBuffer();
            const base64String = Buffer.from(arrayBuffer).toString('base64');
            
            const fileData = {
                type: file.type,
                file: base64String
            };
            
            onUpload(fileData);
        } catch (error) {
            console.error('Error processing file:', error);
        }
    }, [onUpload]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'text/plain': ['.txt'],
            'application/pdf': ['.pdf'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
        },
        multiple: false,
    });

    return (
        <div 
            {...getRootProps()} 
            className={`btn-upload flex-col gap-2 ${isDragActive ? 'border-primary-200' : ''} ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
            <input {...getInputProps()} disabled={isUploading} />
            <p className="text-center text-light-100">
                {isDragActive
                    ? 'Drop your notes here'
                    : isUploading
                    ? 'Uploading...'
                    : 'Drag and drop your notes here, or click to select'}
            </p>
            <p className="text-xs text-light-400">Supported formats: TXT, PDF, DOCX</p>
        </div>
    );
};

export default FileUpload; 