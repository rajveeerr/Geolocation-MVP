import React, { useState } from 'react';
import { CategoryDropdown } from '@/components/common/CategoryDropdown';
import { CategorySelector } from '@/components/common/CategorySelector';
import { Button } from '@/components/common/Button';

export const CategoryExample: React.FC = () => {
  const [selectedCategory1, setSelectedCategory1] = useState<string>('');
  const [selectedCategory2, setSelectedCategory2] = useState<string>('');

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">Category Selection Examples</h2>
        <p className="text-neutral-600 mb-6">
          Choose from available deal categories fetched from the backend.
        </p>
      </div>

      {/* Simple Dropdown Example */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Simple Category Dropdown</h3>
        <CategoryDropdown
          value={selectedCategory1}
          onChange={setSelectedCategory1}
          placeholder="Choose a category"
          required
        />
        {selectedCategory1 && (
          <p className="text-sm text-neutral-600">
            Selected: <span className="font-medium">{selectedCategory1}</span>
          </p>
        )}
      </div>

      {/* Advanced Selector Example */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Advanced Category Selector</h3>
        <CategorySelector
          value={selectedCategory2}
          onChange={setSelectedCategory2}
          placeholder="Search and select a category"
          searchable
        />
        {selectedCategory2 && (
          <p className="text-sm text-neutral-600">
            Selected: <span className="font-medium">{selectedCategory2}</span>
          </p>
        )}
      </div>

      {/* Reset Buttons */}
      <div className="flex gap-4">
        <Button 
          variant="outline" 
          onClick={() => setSelectedCategory1('')}
          disabled={!selectedCategory1}
        >
          Reset Dropdown
        </Button>
        <Button 
          variant="outline" 
          onClick={() => setSelectedCategory2('')}
          disabled={!selectedCategory2}
        >
          Reset Selector
        </Button>
      </div>

      {/* Usage Instructions */}
      <div className="bg-neutral-50 p-4 rounded-lg">
        <h4 className="font-semibold mb-2">Usage Instructions:</h4>
        <ul className="text-sm text-neutral-600 space-y-1">
          <li>• <strong>CategoryDropdown:</strong> Simple select dropdown with basic styling</li>
          <li>• <strong>CategorySelector:</strong> Advanced dropdown with search, icons, and descriptions</li>
          <li>• Both components automatically fetch categories from the backend</li>
          <li>• Categories include icons, labels, and descriptions</li>
          <li>• Components handle loading states and error handling</li>
        </ul>
      </div>
    </div>
  );
};
