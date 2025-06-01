// src/components/FilesTabContent.jsx
import React from 'react';
import {
  FileText as FileTextIcon,
  FileCode,
  FileImage,
  FileSpreadsheet,
  FileArchive,
  Download,
  Trash2,
  UploadCloud,
  PlusCircle
} from 'lucide-react';
import { formatDate } from '../../../utils/utils'; // Assuming you have this utility

// Helper to get file icon based on type
const getFileIcon = (type) => {
  switch (type) {
    case 'pdf':
      return <FileTextIcon className="h-8 w-8 text-red-500 flex-shrink-0" />;
    case 'doc':
    case 'docx':
      return <FileCode className="h-8 w-8 text-blue-500 flex-shrink-0" />; // Using FileCode for .doc
    case 'xls':
    case 'xlsx':
      return <FileSpreadsheet className="h-8 w-8 text-green-500 flex-shrink-0" />;
    case 'img':
    case 'png':
    case 'jpg':
    case 'jpeg':
      return <FileImage className="h-8 w-8 text-purple-500 flex-shrink-0" />;
    default:
      return <FileArchive className="h-8 w-8 text-slate-500 flex-shrink-0" />; // Generic icon
  }
};

export function FilesTabContent({ files }) {
  const handleUploadClick = () => {
    // Placeholder for actual file upload logic
    alert('File upload functionality to be implemented.');
  };

  const handleDownload = (file) => {
    alert(`Downloading ${file.name}... (dummy action)`);
    // In a real app: window.location.href = file.url;
  };

  const handleDelete = (fileId) => {
    alert(`Deleting file ${fileId}... (dummy action)`);
    // In a real app: call an API to delete the file and update state
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-200">
        <h3 className="text-xl font-semibold text-slate-800">Attached Files</h3>
        <button
          onClick={handleUploadClick}
          className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md text-sm transition-colors"
        >
          <UploadCloud className="h-4 w-4 mr-2" />
          Upload New File
        </button>
      </div>

      {(!files || files.length === 0) ? (
        <div className="text-center py-10">
          <FileArchive className="h-16 w-16 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-500 text-lg">No files attached to this contact yet.</p>
          <p className="text-slate-400 text-sm mt-2">Click "Upload New File" to add documents.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
            >
              <div className="flex items-center space-x-3 flex-grow min-w-0"> {/* min-w-0 for truncation */}
                {getFileIcon(file.type)}
                <div className="flex-grow min-w-0"> {/* min-w-0 for truncation */}
                  <p className="text-sm font-medium text-slate-800 truncate" title={file.name}>{file.name}</p>
                  <p className="text-xs text-slate-500">
                    {file.size} • Uploaded: {formatDate(file.uploadedDate)}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2 flex-shrink-0 ml-4">
                <button
                  onClick={() => handleDownload(file)}
                  title="Download File"
                  className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-100 rounded-md transition-colors"
                >
                  <Download className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(file.id)}
                  title="Delete File"
                  className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-100 rounded-md transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
       {/* Alternative Upload Button / Area if list is empty, or a more prominent one */}
       {files && files.length > 0 && (
        <div className="mt-8 flex justify-center">
             <button
                onClick={handleUploadClick}
                className="flex items-center text-blue-600 hover:text-blue-700 font-semibold py-2 px-4 rounded-md text-sm transition-colors hover:bg-blue-50"
            >
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Another File
            </button>
        </div>
       )}
    </div>
  );
}