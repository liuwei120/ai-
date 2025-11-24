import React from 'react';

interface UploaderProps {
  onUpload: (base64: string, filename: string) => void;
  label?: string;
}

export const Uploader: React.FC<UploaderProps> = ({ onUpload, label = "Upload Image" }) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpload(reader.result as string, file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-2xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors group">
      <div className="flex flex-col items-center justify-center pt-5 pb-6">
        <div className="p-3 bg-white rounded-full shadow-sm mb-2 group-hover:scale-110 transition-transform">
            <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
            </svg>
        </div>
        <p className="text-sm text-gray-500 font-medium">{label}</p>
        <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</p>
      </div>
      <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
    </label>
  );
};
