'use client';

import { useEffect, useState } from 'react';

export default function AdminSettingsPage() {
  const [temperature, setTemperature] = useState<number>(0.7);
  const [minP, setMinP] = useState<number>(0.1);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const res = await fetch('/api/admin/models');
      if (res.ok) {
        const data = await res.json();
        const v = data?.settings || {};
        if (typeof v.temperature === 'number') setTemperature(v.temperature);
        if (typeof v.min_p === 'number') setMinP(v.min_p);
      }
    };
    load();
  }, []);

  const save = async () => {
    try {
      setSaving(true);
      setMessage(null);
      const res = await fetch('/api/admin/models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ temperature, min_p: minP }),
      });
      if (!res.ok) throw new Error('Save failed');
      setMessage('Saved');
    } catch (e) {
      setMessage('Error saving');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow w-full max-w-md">
        <h1 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Model Parameters</h1>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Temperature</label>
            <input
              type="number"
              step="0.01"
              min={0}
              max={2}
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-transparent"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">min_p</label>
            <input
              type="number"
              step="0.01"
              min={0}
              max={1}
              value={minP}
              onChange={(e) => setMinP(parseFloat(e.target.value))}
              className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-transparent"
            />
          </div>
          <button
            onClick={save}
            disabled={saving}
            className="w-full px-4 py-2 rounded-md bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
          {message && <div className="text-sm text-gray-600 dark:text-gray-300">{message}</div>}
        </div>
      </div>
    </div>
  );
}


