import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Download
} from 'lucide-react';
import { useBulkUploadMenuItems } from '@/hooks/useMerchantMenuManagement';
import { useAiMenuParse } from '@/hooks/useAi';
import { toast } from 'sonner';

interface BulkMenuUploadProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BulkMenuUpload: React.FC<BulkMenuUploadProps> = ({ isOpen, onClose }) => {
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [rawText, setRawText] = useState('');
  const [parsedItems, setParsedItems] = useState<
    { name: string; price: number; category?: string; description?: string }[]
  >([]);

  const bulkUploadMutation = useBulkUploadMenuItems();
  const aiMenuParse = useAiMenuParse();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    const isCSV = selectedFile.name.endsWith('.csv') || selectedFile.type === 'text/csv';
    const isExcel = selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls') || 
                   selectedFile.type.includes('excel') || selectedFile.type.includes('spreadsheet');

    if (!isCSV && !isExcel) {
      setErrors(['Please upload a CSV or Excel file (.csv, .xlsx, .xls)']);
      return;
    }

    setFile(selectedFile);
    setErrors([]);
  };

  const handleBulkUpload = async () => {
    if (!file) {
      toast.error('Please select a file to upload');
      return;
    }

    setIsProcessing(true);
    setErrors([]);

    try {
      const result = await bulkUploadMutation.mutateAsync(file);
      toast.success(`Successfully uploaded ${result.created} menu items`);
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      onClose();
    } catch (error: any) {
      console.error('Upload error:', error);
      if (error.message) {
        setErrors([error.message]);
      } else {
        setErrors(['Failed to upload menu items. Please check your file format.']);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAiParse = async () => {
    const text = rawText.trim();
    if (!text) {
      setErrors(['Paste your menu text first.']);
      return;
    }

    setErrors([]);
    setParsedItems([]);

    try {
      const res = await aiMenuParse.mutateAsync({ text: text.slice(0, 4000) });
      const items = (res.items || []).map((item) => ({
        name: item.name,
        price: item.price,
        category: item.category,
        description: item.description,
      }));
      setParsedItems(items);
      if (!items.length) {
        setErrors(['AI could not find any menu items in your text. Try simplifying it.']);
      }
    } catch (error: any) {
      setErrors([
        error?.message ||
          'Failed to parse menu text. Please try again or use the CSV/Excel upload instead.',
      ]);
    }
  };

  const downloadTemplate = () => {
    const csvContent = [
      'name,price,category,description,isAvailable,imageUrl,preparationTime,calories,allergens,dietaryInfo,ingredients',
      'Margherita Pizza,15.99,Pizza,Classic tomato and mozzarella,true,https://example.com/pizza.jpg,20,300,"gluten,dairy","vegetarian","tomato,mozzarella,basil"',
      'Caesar Salad,12.50,Salad,Fresh romaine with caesar dressing,true,https://example.com/salad.jpg,10,200,"dairy","vegetarian","romaine,parmesan,croutons"'
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'menu_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Bulk Upload Menu Items</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* File Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Menu Items File
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="menu-file">Select CSV or Excel File</Label>
                <Input
                  id="menu-file"
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileUpload}
                  ref={fileInputRef}
                  className="mt-1"
                />
                <p className="mt-1 text-sm text-neutral-500">
                  Supported formats: CSV, Excel (.xlsx, .xls)
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={downloadTemplate}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download Template
                </Button>
                <span className="text-sm text-gray-500">
                  Download our CSV template to get started
                </span>
              </div>

              {/* Selected File Display */}
              {file && (
                <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-800">{file.name}</p>
                    <p className="text-xs text-green-600">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setFile(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                    }}
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI Menu Parser */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Paste Menu Text (AI)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="menu-text">Paste or type your menu</Label>
                <textarea
                  id="menu-text"
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder={'Margherita Pizza $12.99\nCaesar Salad $8.50\nGarlic Bread $5'}
                  className="mt-1 h-32 w-full rounded-md border border-neutral-300 p-2 text-sm"
                />
                <p className="mt-1 text-sm text-neutral-500">
                  Paste plain text, a screenshot OCR result, or a copied PDF menu. AI will turn it into
                  structured items you can review.
                </p>
              </div>

              <div className="flex items-center justify-between gap-2">
                <Button
                  variant="outline"
                  onClick={handleAiParse}
                  disabled={aiMenuParse.isPending || !rawText.trim()}
                  className="flex items-center gap-2"
                >
                  {aiMenuParse.isPending ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-900 border-t-transparent" />
                      Parsing with AI...
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4" />
                      Parse with AI
                    </>
                  )}
                </Button>
                <span className="text-xs text-neutral-500">
                  We never save drafts until you confirm upload.
                </span>
              </div>

              {parsedItems.length > 0 && (
                <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm font-medium text-neutral-800">
                      Preview ({parsedItems.length} item{parsedItems.length === 1 ? '' : 's'})
                    </p>
                  </div>
                  <div className="max-h-48 space-y-2 overflow-y-auto text-sm">
                    {parsedItems.map((item, idx) => (
                      <div
                        key={`${item.name}-${idx}`}
                        className="flex items-start justify-between gap-2 rounded-md bg-white p-2"
                      >
                        <div>
                          <p className="font-semibold text-neutral-900">{item.name}</p>
                          {item.description && (
                            <p className="text-xs text-neutral-600 line-clamp-2">
                              {item.description}
                            </p>
                          )}
                          {item.category && (
                            <p className="mt-0.5 text-[11px] text-neutral-500">
                              Category: {item.category}
                            </p>
                          )}
                        </div>
                        <p className="whitespace-nowrap text-sm font-semibold text-green-700">
                          ${item.price.toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                  <p className="mt-2 text-[11px] text-neutral-500">
                    To save these items permanently, download our CSV template above, paste this data
                    in, and upload — or quickly recreate key dishes using the form view.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Errors */}
          {errors.length > 0 && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                <div className="space-y-1">
                  {errors.map((error, index) => (
                    <div key={index} className="text-sm text-red-700">{error}</div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Upload Progress */}
          {isProcessing && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm">Processing upload...</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose} disabled={isProcessing}>
              Cancel
            </Button>
            <Button 
              onClick={handleBulkUpload} 
              disabled={!file || isProcessing}
              className="flex items-center gap-2"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Upload File
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};