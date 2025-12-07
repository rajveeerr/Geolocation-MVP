// web/src/components/merchant/create-deal/DealHiddenVisibilityStep.tsx
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useDealCreation } from '@/context/DealCreationContext';
import { OnboardingStepLayout } from '../onboarding/OnboardingStepLayout';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { 
  EyeOff, 
  QrCode, 
  MapPin, 
  Share2, 
  Clock, 
  Calendar, 
  Users, 
  Utensils,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const weekdays = [
  { key: 'MONDAY', short: 'MON', full: 'Monday' },
  { key: 'TUESDAY', short: 'TUE', full: 'Tuesday' },
  { key: 'WEDNESDAY', short: 'WED', full: 'Wednesday' },
  { key: 'THURSDAY', short: 'THU', full: 'Thursday' },
  { key: 'FRIDAY', short: 'FRI', full: 'Friday' },
  { key: 'SATURDAY', short: 'SAT', full: 'Saturday' },
  { key: 'SUNDAY', short: 'SUN', full: 'Sunday' },
];

export const DealHiddenVisibilityStep = () => {
  const { state, dispatch } = useDealCreation();
  const navigate = useNavigate();

  // Ensure deal type is HIDDEN
  useEffect(() => {
    if (state.dealType !== 'HIDDEN') {
      dispatch({ type: 'UPDATE_FIELD', field: 'dealType', value: 'HIDDEN' });
    }
    // Initialize visibility config if not set
    if (!state.hiddenDealVisibility) {
      dispatch({
        type: 'UPDATE_FIELD',
        field: 'hiddenDealVisibility',
        value: {
          accessCode: true,
          qrCode: false,
          tapIns: false,
          socialSharing: false,
          tapInConfig: {
            showInAllCheckIns: true,
          },
        },
      });
    }
  }, [state.dealType, state.hiddenDealVisibility, dispatch]);

  const visibility = state.hiddenDealVisibility || {
    accessCode: true,
    qrCode: false,
    tapIns: false,
    socialSharing: false,
    tapInConfig: { showInAllCheckIns: true },
  };

  const updateVisibility = (updates: Partial<typeof visibility>) => {
    dispatch({
      type: 'UPDATE_FIELD',
      field: 'hiddenDealVisibility',
      value: { ...visibility, ...updates },
    });
  };

  const updateTapInConfig = (updates: Partial<typeof visibility.tapInConfig>) => {
    updateVisibility({
      tapInConfig: {
        ...visibility.tapInConfig,
        ...updates,
      },
    });
  };

  // Validation
  const canProceed = true; // All fields are optional, but at least accessCode is always true

  return (
    <OnboardingStepLayout
      title="Configure deal visibility"
      subtitle="Choose where and when customers can discover your hidden deal"
      onNext={() => navigate('/merchant/deals/create/hidden/basics')}
      onBack={() => navigate('/merchant/deals/create/hidden')}
      isNextDisabled={!canProceed}
      progress={40}
    >
      <div className="space-y-8 max-w-4xl mx-auto">
        {/* Visibility Options */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 rounded-xl border border-neutral-200 bg-white p-6"
        >
          <div className="flex items-center gap-2">
            <EyeOff className="h-5 w-5 text-brand-primary-600" />
            <h3 className="text-lg font-semibold text-neutral-900">Visibility Options</h3>
          </div>
          <p className="text-sm text-neutral-600">
            Select where customers can access your hidden deal. Access code is always enabled.
          </p>

          <div className="space-y-4">
            {/* Access Code - Always enabled */}
            <div className="flex items-center justify-between rounded-lg border border-neutral-200 bg-neutral-50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-primary-100">
                  <EyeOff className="h-5 w-5 text-brand-primary-600" />
                </div>
                <div>
                  <Label className="text-base font-semibold text-neutral-900">Access Code / Link</Label>
                  <p className="text-sm text-neutral-600">Share via direct link or access code</p>
                </div>
              </div>
              <Switch checked={true} disabled className="opacity-50" />
            </div>

            {/* QR Code */}
            <div className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white p-4 hover:border-brand-primary-300 transition-colors">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100">
                  <QrCode className="h-5 w-5 text-neutral-600" />
                </div>
                <div>
                  <Label className="text-base font-semibold text-neutral-900">QR Code</Label>
                  <p className="text-sm text-neutral-600">Generate QR code for easy sharing</p>
                </div>
              </div>
              <Switch
                checked={visibility.qrCode}
                onCheckedChange={(checked) => updateVisibility({ qrCode: checked })}
              />
            </div>

            {/* Tap-ins / Check-ins */}
            <div className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white p-4 hover:border-brand-primary-300 transition-colors">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100">
                  <MapPin className="h-5 w-5 text-neutral-600" />
                </div>
                <div>
                  <Label className="text-base font-semibold text-neutral-900">Tap-ins / Check-ins</Label>
                  <p className="text-sm text-neutral-600">Show deal when customers check in at your location</p>
                </div>
              </div>
              <Switch
                checked={visibility.tapIns}
                onCheckedChange={(checked) => updateVisibility({ tapIns: checked })}
              />
            </div>

            {/* Social Media Sharing */}
            <div className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white p-4 hover:border-brand-primary-300 transition-colors">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100">
                  <Share2 className="h-5 w-5 text-neutral-600" />
                </div>
                <div>
                  <Label className="text-base font-semibold text-neutral-900">Social Media Sharing</Label>
                  <p className="text-sm text-neutral-600">Allow customers to share the deal on social media</p>
                </div>
              </div>
              <Switch
                checked={visibility.socialSharing}
                onCheckedChange={(checked) => updateVisibility({ socialSharing: checked })}
              />
            </div>
          </div>
        </motion.div>

        {/* Tap-in Configuration */}
        <AnimatePresence>
          {visibility.tapIns && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-6 rounded-xl border-2 border-brand-primary-200 bg-brand-primary-50/30 p-6"
            >
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-brand-primary-600" />
                <h3 className="text-lg font-semibold text-neutral-900">Tap-in Configuration</h3>
              </div>
              <p className="text-sm text-neutral-600">
                Configure when and how your hidden deal appears during customer check-ins.
              </p>

              {/* Show in all check-ins */}
              <div className="space-y-4 rounded-lg border border-neutral-200 bg-white p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-semibold text-neutral-900">Show in All Check-ins</Label>
                    <p className="text-sm text-neutral-600">Display deal for every customer who checks in</p>
                  </div>
                  <Switch
                    checked={visibility.tapInConfig?.showInAllCheckIns ?? true}
                    onCheckedChange={(checked) => updateTapInConfig({ showInAllCheckIns: checked })}
                  />
                </div>
              </div>

              {/* Specific Times */}
              <AnimatePresence>
                {!visibility.tapInConfig?.showInAllCheckIns && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4 rounded-lg border border-neutral-200 bg-white p-4"
                  >
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-brand-primary-600" />
                      <Label className="text-base font-semibold text-neutral-900">Specific Times</Label>
                    </div>
                    <Input
                      type="text"
                      value={visibility.tapInConfig?.specificTimes || ''}
                      onChange={(e) => updateTapInConfig({ specificTimes: e.target.value.trim() || undefined })}
                      placeholder="e.g., 09:00-17:00"
                      className="h-12"
                    />
                    <p className="text-xs text-neutral-500">
                      Format: HH:MM-HH:MM (24-hour format). Leave empty to show at any time.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Specific Days */}
              <AnimatePresence>
                {!visibility.tapInConfig?.showInAllCheckIns && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4 rounded-lg border border-neutral-200 bg-white p-4"
                  >
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-brand-primary-600" />
                      <Label className="text-base font-semibold text-neutral-900">Specific Days</Label>
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
                      {weekdays.map((day) => {
                        const isSelected = visibility.tapInConfig?.specificDays?.includes(day.key) ?? false;
                        return (
                          <motion.button
                            key={day.key}
                            type="button"
                            onClick={() => {
                              const currentDays = visibility.tapInConfig?.specificDays || [];
                              const newDays = isSelected
                                ? currentDays.filter(d => d !== day.key)
                                : [...currentDays, day.key];
                              updateTapInConfig({ specificDays: newDays.length > 0 ? newDays : undefined });
                            }}
                            className={`rounded-lg border-2 p-2 text-sm transition-all ${
                              isSelected
                                ? 'border-brand-primary-500 bg-brand-primary-50 text-brand-primary-700'
                                : 'border-neutral-200 bg-white text-neutral-600 hover:border-brand-primary-300'
                            }`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {day.short}
                          </motion.button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* User Type Restrictions */}
              <div className="space-y-4 rounded-lg border border-neutral-200 bg-white p-4">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-brand-primary-600" />
                  <Label className="text-base font-semibold text-neutral-900">Customer Type</Label>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium text-neutral-700">First-time Visitors Only</Label>
                      <p className="text-xs text-neutral-500">Show deal only to customers checking in for the first time</p>
                    </div>
                    <Switch
                      checked={visibility.tapInConfig?.firstTimeOnly ?? false}
                      onCheckedChange={(checked) => {
                        updateTapInConfig({
                          firstTimeOnly: checked ? true : undefined,
                          returningOnly: checked ? undefined : visibility.tapInConfig?.returningOnly,
                        });
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium text-neutral-700">Returning Customers Only</Label>
                      <p className="text-xs text-neutral-500">Show deal only to customers who have checked in before</p>
                    </div>
                    <Switch
                      checked={visibility.tapInConfig?.returningOnly ?? false}
                      onCheckedChange={(checked) => {
                        updateTapInConfig({
                          returningOnly: checked ? true : undefined,
                          firstTimeOnly: checked ? undefined : visibility.tapInConfig?.firstTimeOnly,
                        });
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Menu Item Info */}
              <div className="space-y-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
                <div className="flex items-start gap-3">
                  <Utensils className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <Label className="text-base font-semibold text-amber-900">Menu Items</Label>
                    <p className="text-sm text-amber-700 mt-1">
                      You'll select menu items in the next step. All items in hidden deals are automatically hidden from public view and will only be visible to customers who access the deal using the access code, link, or when checking in (if tap-ins are enabled).
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Info Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-lg border border-blue-200 bg-blue-50 p-4"
        >
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-900 mb-1">How Visibility Works</h4>
              <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                <li>Access Code: Always enabled - customers can use the code or link to access the deal</li>
                {visibility.qrCode && <li>QR Code: Customers can scan a QR code to access the deal</li>}
                {visibility.tapIns && (
                  <>
                    <li>Tap-ins: Deal appears when customers check in at your location</li>
                    {visibility.tapInConfig?.showInAllCheckIns && <li>Shown in all check-ins</li>}
                    {visibility.tapInConfig?.specificTimes && (
                      <li>Time restriction: {visibility.tapInConfig.specificTimes}</li>
                    )}
                    {visibility.tapInConfig?.specificDays && visibility.tapInConfig.specificDays.length > 0 && (
                      <li>Days: {visibility.tapInConfig.specificDays.join(', ')}</li>
                    )}
                  </>
                )}
                {visibility.socialSharing && <li>Social Sharing: Customers can share the deal on social media</li>}
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </OnboardingStepLayout>
  );
};

