import React, { useState, useEffect, useRef } from 'react';
import { ApiKeyEntry, ApiKeyStatus, ApiKeyBulkUploadEntry } from '../types'; // Updated types
import IconButton from './IconButton';

const generateId = (): string => Date.now().toString(36) + Math.random().toString(36).substring(2);

interface ApiSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKeys: ApiKeyEntry[]; // Changed from apiConfigs
  activeApiKeyId: string | null; // Changed from activeApiConfigId
  onUpdateApiKeys: (keys: ApiKeyEntry[]) => void; // Changed from onUpdateConfigs
  onSetActiveApiKey: (keyId: string | null) => void; // Changed from onSetActiveConfig
  onCheckApiKeyStatus: (keyId: string) => Promise<void>; // Changed from onCheckConfigStatus
}

interface AccessibleIconProps extends React.SVGProps<SVGSVGElement> {
  iconTitle?: string;
}

const PlusCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);

const EditIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
  </svg>
);

const TrashIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12.56 0c1.153 0 2.24.032 3.287.098L11.8 3.75M3.25 5.79c.117-.18.256-.35.412-.507M20.75 5.79c-.117-.18-.256-.35-.412-.507m0 0L19.5 3.75M5.084 5.283A48.09 48.09 0 0 1 8.583 5.03m1.022.252L10.4 3.75m-1.32.75H9.82l-.287-.332" />
  </svg>
);

const CheckCircleIcon: React.FC<AccessibleIconProps> = ({ iconTitle, ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        {iconTitle && <title>{iconTitle}</title>}
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
);

const CloudArrowUpIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.322 0 4.5 4.5 0 0 1-1.41 8.775H6.75Z" />
  </svg>
);

const ExclamationCircleIcon: React.FC<AccessibleIconProps> = ({ iconTitle, ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        {iconTitle && <title>{iconTitle}</title>}
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
    </svg>
);

const QuestionMarkCircleIcon: React.FC<AccessibleIconProps> = ({ iconTitle, ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      {iconTitle && <title>{iconTitle}</title>}
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
    </svg>
);

const ApiSettingsModal: React.FC<ApiSettingsModalProps> = ({
  isOpen, onClose, apiKeys, activeApiKeyId, onUpdateApiKeys, onSetActiveApiKey, onCheckApiKeyStatus
}) => {
  const [editingApiKey, setEditingApiKey] = useState<ApiKeyEntry | null>(null);
  // Form state no longer includes modelName
  const [formState, setFormState] = useState<{ id?: string; name: string; apiKey: string }>({ name: '', apiKey: '' });
  const [showAddForm, setShowAddForm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setEditingApiKey(null);
      setShowAddForm(false);
      setFormState({ name: '', apiKey: '' });
    }
  }, [isOpen, apiKeys]);

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveApiKey = () => {
    if (!formState.name.trim() || !formState.apiKey.trim()) {
      alert("Name and API Key cannot be empty.");
      return;
    }
    let updatedKeys;
    if (editingApiKey) {
      updatedKeys = apiKeys.map(k => k.id === editingApiKey.id ? { ...k, ...formState, status: 'unchecked' as ApiKeyStatus } : k);
    } else {
      const newKey: ApiKeyEntry = { ...formState, id: generateId(), status: 'unchecked' };
      updatedKeys = [...apiKeys, newKey];
    }
    onUpdateApiKeys(updatedKeys);
    setEditingApiKey(null);
    setShowAddForm(false);
    setFormState({ name: '', apiKey: '' });
  };

  const handleEdit = (keyEntry: ApiKeyEntry) => {
    setEditingApiKey(keyEntry);
    setFormState({ id: keyEntry.id, name: keyEntry.name, apiKey: keyEntry.apiKey });
    setShowAddForm(true);
  };

  const handleDelete = (keyId: string) => {
    if (window.confirm("Are you sure you want to delete this API Key?")) {
      const updatedKeys = apiKeys.filter(k => k.id !== keyId);
      onUpdateApiKeys(updatedKeys);
      if (activeApiKeyId === keyId) {
        onSetActiveApiKey(updatedKeys.length > 0 ? updatedKeys[0].id : null);
      }
    }
  };

  const handleBulkUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          // Expecting ApiKeyBulkUploadEntry format (name, apiKey)
          const parsedContent = JSON.parse(content) as ApiKeyBulkUploadEntry[];
          if (!Array.isArray(parsedContent) || !parsedContent.every(item => item.name && item.apiKey)) {
            throw new Error("Invalid JSON format. Expected an array of objects with name and apiKey.");
          }
          const newKeys: ApiKeyEntry[] = parsedContent.map(item => ({
            id: generateId(),
            name: item.name,
            apiKey: item.apiKey,
            status: 'unchecked',
          }));
          onUpdateApiKeys([...apiKeys, ...newKeys]);
          alert(`${newKeys.length} API Keys uploaded successfully!`);
        } catch (error) {
          alert(`Error processing file: ${error instanceof Error ? error.message : String(error)}`);
        } finally {
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      };
      reader.readAsText(file);
    }
  };
  
  const getStatusIndicator = (status: ApiKeyStatus) => {
    switch (status) {
      case 'valid': return <CheckCircleIcon className="w-5 h-5 text-green-500" iconTitle="Valid"/>;
      case 'invalid': return <ExclamationCircleIcon className="w-5 h-5 text-red-500" iconTitle="Invalid" />;
      case 'checking': return <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" title="Checking..."></div>;
      case 'unchecked':
      default: return <QuestionMarkCircleIcon className="w-5 h-5 text-gray-400" iconTitle="Unchecked" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-gray-50 p-5 md:p-6 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-gray-800">API Key Management</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl leading-none">&times;</button>
        </div>

        {showAddForm || editingApiKey ? (
          <div className="mb-6 p-4 border border-gray-300 rounded-md bg-white shadow-sm">
            <h3 className="text-lg font-medium text-gray-700 mb-3">{editingApiKey ? 'Edit' : 'Add New'} API Key</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="apiKeyName" className="block text-sm font-medium text-gray-600 mb-1">Name</label>
                <input type="text" name="name" id="apiKeyName" value={formState.name} onChange={handleInputChange} placeholder="E.g., My Primary Key" className="w-full input-class"/>
              </div>
              <div>
                <label htmlFor="apiKey" className="block text-sm font-medium text-gray-600 mb-1">API Key</label>
                <input type="password" name="apiKey" id="apiKey" value={formState.apiKey} onChange={handleInputChange} placeholder="sk-or-..." className="w-full input-class"/>
              </div>
            </div>
            <div className="mt-4 flex justify-end space-x-2">
              <button onClick={() => { setShowAddForm(false); setEditingApiKey(null); setFormState({ name: '', apiKey: '' });}} className="btn-secondary">Cancel</button>
              <button onClick={handleSaveApiKey} className="btn-primary">{editingApiKey ? 'Update' : 'Save'} API Key</button>
            </div>
          </div>
        ) : (
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
             <button onClick={() => setShowAddForm(true)} className="btn-primary w-full sm:w-auto flex items-center justify-center">
                <PlusCircleIcon className="w-5 h-5 mr-2"/> Add New API Key
            </button>
            <div>
              <input type="file" accept=".json" onChange={handleBulkUpload} ref={fileInputRef} className="hidden" id="bulk-upload-input"/>
              <label htmlFor="bulk-upload-input" className="btn-secondary w-full sm:w-auto flex items-center justify-center cursor-pointer">
                  <CloudArrowUpIcon className="w-5 h-5 mr-2"/> Bulk Upload (.json)
              </label>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {apiKeys.length === 0 && !showAddForm && (
            <p className="text-center text-gray-500 py-4">No API Keys found. Add one to get started.</p>
          )}
          {apiKeys.map(keyEntry => (
            <div key={keyEntry.id} className={`p-3 rounded-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${activeApiKeyId === keyEntry.id ? 'bg-blue-100 border border-blue-400 shadow-md' : 'bg-white border border-gray-200 hover:shadow-sm'}`}>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-700 truncate" title={keyEntry.name}>{keyEntry.name}</p>
                <p className="text-xs text-gray-500">Key: ******{keyEntry.apiKey.slice(-4)}</p>
              </div>
              <div className="flex items-center space-x-1 sm:space-x-1.5 flex-shrink-0">
                {getStatusIndicator(keyEntry.status)}
                <IconButton onClick={() => onCheckApiKeyStatus(keyEntry.id)} disabled={keyEntry.status === 'checking'} ariaLabel="Check Status" className="text-gray-600 hover:text-blue-600 disabled:opacity-50">
                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 0 0-3.7-3.7 48.678 48.678 0 0 0-7.324 0 4.006 4.006 0 0 0-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l-3-3m3 3-3 3M4.5 12l3 3m-3-3 3-3" /></svg>
                </IconButton>
                <IconButton onClick={() => handleEdit(keyEntry)} ariaLabel="Edit API Key" className="text-gray-600 hover:text-green-600">
                  <EditIcon className="w-4 h-4" />
                </IconButton>
                <IconButton onClick={() => handleDelete(keyEntry.id)} ariaLabel="Delete API Key" className="text-gray-600 hover:text-red-600">
                  <TrashIcon className="w-4 h-4" />
                </IconButton>
                <button 
                  onClick={() => onSetActiveApiKey(keyEntry.id)} 
                  disabled={activeApiKeyId === keyEntry.id || keyEntry.status === 'invalid' || keyEntry.status === 'checking'}
                  className="px-2.5 py-1 text-xs font-medium rounded-md text-white bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {activeApiKeyId === keyEntry.id ? 'Active' : 'Set Active'}
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 flex justify-end">
            <button onClick={onClose} className="btn-secondary">Close</button>
        </div>
      </div>
    </div>
  );
};

export default ApiSettingsModal;