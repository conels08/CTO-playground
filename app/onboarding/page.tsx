'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

interface QuitProfileFormData {
  quitDate: string;
  cigarettesPerDay: string;
  costPerPack: string;
  cigarettesPerPack: string;
  personalGoal: string;
}

export default function OnboardingPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<QuitProfileFormData>({
    quitDate: '',
    cigarettesPerDay: '',
    costPerPack: '',
    cigarettesPerPack: '20',
    personalGoal: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (field: keyof QuitProfileFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(''); // Clear error when user starts typing
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/quit-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quitDate: formData.quitDate,
          cigarettesPerDay: parseInt(formData.cigarettesPerDay),
          costPerPack: parseFloat(formData.costPerPack),
          cigarettesPerPack: parseInt(formData.cigarettesPerPack),
          personalGoal: formData.personalGoal || null
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to save profile');
      }

      // Redirect to dashboard on success
      router.push('/dashboard');
      
    } catch (err) {
      console.error('Error saving profile:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = () => {
    return formData.quitDate && 
           formData.cigarettesPerDay && 
           parseInt(formData.cigarettesPerDay) > 0 &&
           formData.costPerPack && 
           parseFloat(formData.costPerPack) > 0;
  };

  return (
    <div className="bg-gray-50 py-12">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">
            Start Your Smoke-Free Journey
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Let's set up your quit profile to start tracking your progress and celebrating your achievements.
          </p>
        </div>

        <Card title="Quit Profile Setup">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="quitDate" className="block text-sm font-medium text-gray-700 mb-2">
                Quit Date *
              </label>
              <input
                type="date"
                id="quitDate"
                value={formData.quitDate}
                onChange={(e) => handleInputChange('quitDate', e.target.value)}
                max={new Date().toISOString().split('T')[0]} // Can't choose future date
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
              <p className="mt-1 text-sm text-gray-500">
                The date you quit or plan to quit smoking
              </p>
            </div>

            <div>
              <label htmlFor="cigarettesPerDay" className="block text-sm font-medium text-gray-700 mb-2">
                Cigarettes per day *
              </label>
              <input
                type="number"
                id="cigarettesPerDay"
                value={formData.cigarettesPerDay}
                onChange={(e) => handleInputChange('cigarettesPerDay', e.target.value)}
                min="1"
                max="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 20"
                required
              />
              <p className="mt-1 text-sm text-gray-500">
                How many cigarettes did you typically smoke per day?
              </p>
            </div>

            <div>
              <label htmlFor="costPerPack" className="block text-sm font-medium text-gray-700 mb-2">
                Cost per pack *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">$</span>
                <input
                  type="number"
                  id="costPerPack"
                  value={formData.costPerPack}
                  onChange={(e) => handleInputChange('costPerPack', e.target.value)}
                  step="0.01"
                  min="0.01"
                  max="100"
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 12.50"
                  required
                />
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Average cost of a pack of cigarettes in your area
              </p>
            </div>

            <div>
              <label htmlFor="cigarettesPerPack" className="block text-sm font-medium text-gray-700 mb-2">
                Cigarettes per pack
              </label>
              <select
                id="cigarettesPerPack"
                value={formData.cigarettesPerPack}
                onChange={(e) => handleInputChange('cigarettesPerPack', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="10">10 cigarettes</option>
                <option value="20">20 cigarettes (standard)</option>
                <option value="25">25 cigarettes</option>
                <option value="30">30 cigarettes</option>
              </select>
              <p className="mt-1 text-sm text-gray-500">
                Standard packs are usually 20 cigarettes
              </p>
            </div>

            <div>
              <label htmlFor="personalGoal" className="block text-sm font-medium text-gray-700 mb-2">
                Personal Goal (Optional)
              </label>
              <textarea
                id="personalGoal"
                value={formData.personalGoal}
                onChange={(e) => handleInputChange('personalGoal', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., I want to save money for a vacation, improve my health for my family..."
              />
              <p className="mt-1 text-sm text-gray-500">
                What's your motivation for quitting? This will help keep you motivated!
              </p>
            </div>

            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={!isFormValid() || isLoading}
                className="flex-1"
              >
                {isLoading ? 'Saving...' : 'Start Tracking'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isLoading}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Your data is stored locally and securely. You can update these settings anytime from your dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}