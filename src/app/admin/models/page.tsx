'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Dialog } from '@headlessui/react';

interface Model {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive';
  type: string;
  config?: {
    temperature: number;
    min_p: number;
    max_tokens: number;
  };
}

export default function ModelsPage() {
  const [models, setModels] = useState<Model[]>([]);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [config, setConfig] = useState({
    temperature: 0.7,
    min_p: 0.05,
    max_tokens: 2048
  });

  // Fetch models when component mounts
  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await fetch('/api/admin/models');
        if (response.ok) {
          const data = await response.json();
          setModels(data.models);
        }
      } catch (error) {
        console.error('Error fetching models:', error);
      }
    };
    fetchModels();
  }, []);

  const handleModelSelect = (model: Model) => {
    setSelectedModel(model);
    setConfig(model.config || {
      temperature: 0.7,
      min_p: 0.05,
      max_tokens: 2048
    });
  };

  const handleConfigOpen = () => {
    setIsConfigOpen(true);
  };

  const handleSaveConfig = async () => {
    if (!selectedModel) return;

    try {
      const response = await fetch(`/api/admin/models/${selectedModel.id}/config`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      if (response.ok) {
        // Update the local state
        setModels(models.map(model => 
          model.id === selectedModel.id 
            ? { ...model, config } 
            : model
        ));
        setIsConfigOpen(false);
      } else {
        console.error('Failed to update model configuration');
      }
    } catch (error) {
      console.error('Error updating model configuration:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="md:flex md:items-center md:justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">AI Models</h1>
        <div className="mt-4 md:mt-0">
          <Link href="/admin/models/new">
            <button className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Add New Model
            </button>
          </Link>
        </div>
      </div>

      {/* Models List */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {models.length > 0 ? (
          models.map((model) => (
            <Card key={model.id}>
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">{model.name}</h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    model.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {model.status}
                  </span>
                </div>
                <p className="mt-2 text-sm text-gray-500">{model.description}</p>
                <p className="mt-2 text-sm text-gray-500">Type: {model.type}</p>
                <div className="mt-4 flex space-x-3">
                  <button 
                    onClick={() => {
                      handleModelSelect(model);
                      handleConfigOpen();
                    }}
                    className="text-sm text-indigo-600 hover:text-indigo-900"
                  >
                    Configure
                  </button>
                  <button className="text-sm text-red-600 hover:text-red-900">Delete</button>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="col-span-full">
            <div className="text-center">
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No models</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new model.</p>
              <div className="mt-6">
                <Link href="/admin/models/new">
                  <button className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    Add New Model
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Configuration Modal */}
      <Dialog
        open={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-sm rounded-lg bg-white p-6">
            <Dialog.Title className="text-lg font-medium text-gray-900 mb-4">
              Model Configuration
            </Dialog.Title>

            <div className="space-y-4">
              {/* Model Selection */}
              <div>
                <label htmlFor="model-select" className="block text-sm font-medium text-gray-700">
                  Select Model
                </label>
                <select
                  id="model-select"
                  value={selectedModel?.id || ''}
                  onChange={(e) => {
                    const model = models.find(m => m.id === e.target.value);
                    if (model) handleModelSelect(model);
                  }}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="">Select a model</option>
                  {models.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedModel && (
                <>
                  <div>
                    <label htmlFor="temperature" className="block text-sm font-medium text-gray-700">
                      Temperature
                    </label>
                    <input
                      type="number"
                      id="temperature"
                      min="0"
                      max="2"
                      step="0.1"
                      value={config.temperature}
                      onChange={(e) => setConfig({ ...config, temperature: parseFloat(e.target.value) })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                    <p className="mt-1 text-xs text-gray-500">Controls the randomness of the output (0-2)</p>
                  </div>

                  <div>
                    <label htmlFor="min_p" className="block text-sm font-medium text-gray-700">
                      Minimum P
                    </label>
                    <input
                      type="number"
                      id="min_p"
                      min="0"
                      max="1"
                      step="0.01"
                      value={config.min_p}
                      onChange={(e) => setConfig({ ...config, min_p: parseFloat(e.target.value) })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                    <p className="mt-1 text-xs text-gray-500">Minimum probability threshold for token selection (0-1)</p>
                  </div>

                  <div>
                    <label htmlFor="max_tokens" className="block text-sm font-medium text-gray-700">
                      Max Tokens
                    </label>
                    <input
                      type="number"
                      id="max_tokens"
                      min="1"
                      max="32768"
                      step="1"
                      value={config.max_tokens}
                      onChange={(e) => setConfig({ ...config, max_tokens: parseInt(e.target.value) })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                    <p className="mt-1 text-xs text-gray-500">Maximum length of the generated response (1-32768)</p>
                  </div>
                </>
              )}

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setIsConfigOpen(false)}
                  className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveConfig}
                  disabled={!selectedModel}
                  className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save
                </button>
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}
