'use client';

import { useState } from 'react';

export default function CreateModelPage() {
  const [name, setName] = useState('');
  const [provider, setProvider] = useState('openai');
  const [endpoint, setEndpoint] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage(null);
      const res = await fetch('/api/admin/registry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, provider, endpoint }),
      });
      if (!res.ok) throw new Error('Failed');
      setMessage('Model created');
      setName('');
      setEndpoint('');
    } catch (e) {
      setMessage('Error creating model');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Create Model</h1>
      <form onSubmit={handleCreate} className="space-y-3 max-w-md">
        <div>
          <label className="block text-sm mb-1">Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-transparent" required />
        </div>
        <div>
          <label className="block text-sm mb-1">Provider</label>
          <input value={provider} onChange={(e) => setProvider(e.target.value)} className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-transparent" />
        </div>
        <div>
          <label className="block text-sm mb-1">Endpoint</label>
          <input value={endpoint} onChange={(e) => setEndpoint(e.target.value)} className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-transparent" />
        </div>
        <button type="submit" disabled={saving} className="px-4 py-2 rounded-md bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50">{saving ? 'Saving…' : 'Create'}</button>
        {message && <div className="text-sm mt-2">{message}</div>}
      </form>
    </div>
  );
}


