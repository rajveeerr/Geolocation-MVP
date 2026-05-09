import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ChefHat,
  ImageIcon,
  Loader2,
  Plus,
  Settings2,
  Tags,
  Trash2,
  X,
} from 'lucide-react';
import { MerchantProtectedRoute } from '@/components/auth/MerchantProtectedRoute';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { ImageUploadModal } from '@/components/common/ImageUploadModal';
import { useToast } from '@/hooks/use-toast';
import { PATHS } from '@/routing/paths';
import { cn } from '@/lib/utils';
import {
  useCateringCategories,
  useCateringItem,
  useCreateCateringItem,
  useUpdateCateringItem,
} from '@/hooks/useCatering';
import type {
  CateringItemPayload,
  CateringOptionInput,
  CateringPricingType,
} from '@/types/catering';

const panelClass =
  'rounded-[1.45rem] border border-neutral-200/80 bg-white/95 shadow-[0_8px_22px_rgba(15,23,42,0.045)]';

interface ChoiceState {
  /** Stable id for React keys; persists across renders. */
  uid: string;
  label: string;
  description: string;
  priceModifier: number;
  isDefault: boolean;
  isPopular: boolean;
}

interface OptionState {
  uid: string;
  name: string;
  selectionType: 'SINGLE' | 'MULTIPLE';
  isRequired: boolean;
  maxSelections: number;
  choices: ChoiceState[];
}

interface FormState {
  name: string;
  category: string;
  description: string;
  imageUrl: string;
  pricingType: CateringPricingType;
  pricePerPerson: string;
  fixedPrice: string;
  minPeople: string;
  maxPeople: string;
  servesCount: string;
  tags: string[];
  packagingType: string;
  dietaryInfo: string[];
  isPopular: boolean;
  specialInstructions: boolean;
  isActive: boolean;
  options: OptionState[];
}

const DIETARY_OPTIONS = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Nut-Free', 'Halal', 'Kosher'];
const PACKAGING_OPTIONS = ['Individual Packaging', 'Family Style', 'Buffet', 'Boxed Lunch', 'Platter'];

const newUid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const blankChoice = (): ChoiceState => ({
  uid: newUid(),
  label: '',
  description: '',
  priceModifier: 0,
  isDefault: false,
  isPopular: false,
});

const blankOption = (): OptionState => ({
  uid: newUid(),
  name: '',
  selectionType: 'SINGLE',
  isRequired: false,
  maxSelections: 1,
  choices: [blankChoice()],
});

const initialState = (): FormState => ({
  name: '',
  category: '',
  description: '',
  imageUrl: '',
  pricingType: 'PER_PERSON',
  pricePerPerson: '0',
  fixedPrice: '',
  minPeople: '1',
  maxPeople: '',
  servesCount: '',
  tags: [],
  packagingType: '',
  dietaryInfo: [],
  isPopular: false,
  specialInstructions: true,
  isActive: true,
  options: [],
});

const fromExisting = (item: ReturnType<typeof useCateringItem>['data']): FormState => {
  if (!item) return initialState();
  return {
    name: item.name,
    category: item.category,
    description: item.description ?? '',
    imageUrl: item.imageUrl ?? '',
    pricingType: item.pricingType,
    pricePerPerson: String(item.pricePerPerson),
    fixedPrice: item.fixedPrice != null ? String(item.fixedPrice) : '',
    minPeople: String(item.minPeople),
    maxPeople: item.maxPeople != null ? String(item.maxPeople) : '',
    servesCount: item.servesCount != null ? String(item.servesCount) : '',
    tags: item.tags,
    packagingType: item.packagingType ?? '',
    dietaryInfo: item.dietaryInfo,
    isPopular: item.isPopular,
    specialInstructions: item.specialInstructions,
    isActive: item.isActive,
    options: item.options.map((opt) => ({
      uid: newUid(),
      name: opt.name,
      selectionType: opt.maxSelections > 1 ? 'MULTIPLE' : 'SINGLE',
      isRequired: opt.isRequired || opt.minSelections > 0,
      maxSelections: opt.maxSelections,
      choices: opt.choices.map((c) => ({
        uid: newUid(),
        label: c.label,
        description: c.description ?? '',
        priceModifier: c.priceModifier,
        isDefault: c.isDefault,
        isPopular: c.isPopular,
      })),
    })),
  };
};

function ChipInput({
  label,
  values,
  onChange,
  placeholder,
}: {
  label: string;
  values: string[];
  onChange: (next: string[]) => void;
  placeholder: string;
}) {
  const [draft, setDraft] = useState('');
  const add = () => {
    const v = draft.trim();
    if (!v) return;
    if (values.includes(v)) {
      setDraft('');
      return;
    }
    onChange([...values, v]);
    setDraft('');
  };
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-neutral-700">{label}</Label>
      <div className="flex flex-wrap gap-1.5">
        {values.map((v) => (
          <span
            key={v}
            className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-700"
          >
            {v}
            <button
              type="button"
              onClick={() => onChange(values.filter((x) => x !== v))}
              className="text-neutral-400 hover:text-neutral-700"
              aria-label={`Remove ${v}`}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              add();
            }
          }}
          placeholder={placeholder}
          className="h-10"
        />
        <Button type="button" variant="secondary" size="sm" onClick={add} className="rounded-full px-4">
          Add
        </Button>
      </div>
    </div>
  );
}

function MultiToggleChips({
  options,
  values,
  onChange,
}: {
  options: string[];
  values: string[];
  onChange: (next: string[]) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const selected = values.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            onClick={() =>
              onChange(selected ? values.filter((v) => v !== opt) : [...values, opt])
            }
            className={cn(
              'rounded-full border px-3 py-1.5 text-xs font-medium transition',
              selected
                ? 'border-brand-primary-500 bg-brand-primary-50 text-brand-primary-700'
                : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300',
            )}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function OptionEditor({
  option,
  onChange,
  onRemove,
}: {
  option: OptionState;
  onChange: (next: OptionState) => void;
  onRemove: () => void;
}) {
  const set = <K extends keyof OptionState>(key: K, value: OptionState[K]) =>
    onChange({ ...option, [key]: value });

  const updateChoice = (uid: string, patch: Partial<ChoiceState>) =>
    set(
      'choices',
      option.choices.map((c) => (c.uid === uid ? { ...c, ...patch } : c)),
    );

  const removeChoice = (uid: string) =>
    set(
      'choices',
      option.choices.filter((c) => c.uid !== uid),
    );

  return (
    <div className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-3">
          <div>
            <Label className="text-sm font-medium text-neutral-700">Group name</Label>
            <Input
              value={option.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="e.g. Select size, Add sides"
              className="mt-1 h-10"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <Label className="text-sm font-medium text-neutral-700">Selection</Label>
              <select
                value={option.selectionType}
                onChange={(e) => {
                  const next = e.target.value as 'SINGLE' | 'MULTIPLE';
                  onChange({
                    ...option,
                    selectionType: next,
                    maxSelections: next === 'SINGLE' ? 1 : Math.max(option.maxSelections, 2),
                  });
                }}
                className="mt-1 h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm"
              >
                <option value="SINGLE">Single (radio)</option>
                <option value="MULTIPLE">Multiple (checkboxes)</option>
              </select>
            </div>

            {option.selectionType === 'MULTIPLE' && (
              <div>
                <Label className="text-sm font-medium text-neutral-700">Max selections</Label>
                <Input
                  type="number"
                  min={2}
                  value={option.maxSelections}
                  onChange={(e) => set('maxSelections', Math.max(2, Number(e.target.value) || 2))}
                  className="mt-1 h-10"
                />
              </div>
            )}

            <div>
              <Label className="text-sm font-medium text-neutral-700">Required</Label>
              <div className="mt-2 flex h-10 items-center gap-2">
                <Switch checked={option.isRequired} onCheckedChange={(v) => set('isRequired', v)} />
                <span className="text-xs text-neutral-500">{option.isRequired ? 'Customer must pick' : 'Optional'}</span>
              </div>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onRemove}
          className="rounded-full border border-neutral-200 p-1.5 text-neutral-400 transition hover:bg-rose-50 hover:text-rose-600"
          aria-label="Remove option group"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-2 border-t border-neutral-100 pt-4">
        <Label className="text-sm font-medium text-neutral-700">Choices</Label>
        {option.choices.length === 0 ? (
          <p className="text-xs text-neutral-500">No choices yet. Add at least one.</p>
        ) : (
          <div className="space-y-2">
            {option.choices.map((choice) => (
              <div key={choice.uid} className="rounded-xl border border-neutral-200 bg-neutral-50/50 p-3">
                <div className="grid gap-2 sm:grid-cols-[1fr_120px_auto]">
                  <Input
                    value={choice.label}
                    onChange={(e) => updateChoice(choice.uid, { label: e.target.value })}
                    placeholder="Choice label (e.g. Macaroni Salad)"
                    className="h-10"
                  />
                  <div className="relative">
                    <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-xs text-neutral-400">+$</span>
                    <Input
                      type="number"
                      step="0.01"
                      value={choice.priceModifier}
                      onChange={(e) => updateChoice(choice.uid, { priceModifier: Number(e.target.value) || 0 })}
                      placeholder="0.00"
                      className="h-10 pl-8"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeChoice(choice.uid)}
                    className="rounded-full p-2 text-neutral-400 hover:bg-neutral-200 hover:text-neutral-700"
                    aria-label="Remove choice"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-2 flex flex-wrap gap-3 text-xs text-neutral-600">
                  <label className="inline-flex items-center gap-1.5">
                    <input
                      type="checkbox"
                      checked={choice.isDefault}
                      onChange={(e) => updateChoice(choice.uid, { isDefault: e.target.checked })}
                    />
                    Pre-selected
                  </label>
                  <label className="inline-flex items-center gap-1.5">
                    <input
                      type="checkbox"
                      checked={choice.isPopular}
                      onChange={(e) => updateChoice(choice.uid, { isPopular: e.target.checked })}
                    />
                    "Most popular" badge
                  </label>
                </div>
              </div>
            ))}
          </div>
        )}
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => set('choices', [...option.choices, blankChoice()])}
          className="rounded-full"
        >
          <Plus className="mr-1 h-3.5 w-3.5" />
          Add choice
        </Button>
      </div>
    </div>
  );
}

function MerchantCateringFormInner() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const params = useParams<{ itemId?: string }>();
  const editingId = params.itemId ? Number(params.itemId) : null;
  const isEditing = editingId !== null && Number.isFinite(editingId);

  const { data: existingItem, isLoading: loadingExisting } = useCateringItem(isEditing ? editingId : null);
  const { data: existingCategories } = useCateringCategories();
  const createMutation = useCreateCateringItem();
  const updateMutation = useUpdateCateringItem(editingId ?? 0);

  const [form, setForm] = useState<FormState>(initialState);
  const [hydrated, setHydrated] = useState(!isEditing);
  const [imageModalOpen, setImageModalOpen] = useState(false);

  useEffect(() => {
    if (isEditing && existingItem && !hydrated) {
      setForm(fromExisting(existingItem));
      setHydrated(true);
    }
  }, [isEditing, existingItem, hydrated]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((p) => ({ ...p, [key]: value }));

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const buildPayload = (): { ok: true; payload: CateringItemPayload } | { ok: false; error: string } => {
    if (!form.name.trim()) return { ok: false, error: 'Name is required' };
    if (!form.category.trim()) return { ok: false, error: 'Category is required' };

    const minPeople = parseInt(form.minPeople, 10);
    if (!Number.isFinite(minPeople) || minPeople < 1) return { ok: false, error: 'Min people must be at least 1' };

    let maxPeople: number | null = null;
    if (form.maxPeople.trim()) {
      maxPeople = parseInt(form.maxPeople, 10);
      if (!Number.isFinite(maxPeople) || maxPeople < minPeople) {
        return { ok: false, error: 'Max people must be a number ≥ min people' };
      }
    }

    let pricePerPerson = 0;
    let fixedPrice: number | null = null;
    if (form.pricingType === 'PER_PERSON') {
      pricePerPerson = Number(form.pricePerPerson);
      if (!Number.isFinite(pricePerPerson) || pricePerPerson < 0) return { ok: false, error: 'Price per person must be ≥ 0' };
    } else {
      const fp = Number(form.fixedPrice);
      if (!Number.isFinite(fp) || fp < 0) return { ok: false, error: 'Fixed price must be ≥ 0' };
      fixedPrice = fp;
    }

    let servesCount: number | null = null;
    if (form.servesCount.trim()) {
      servesCount = parseInt(form.servesCount, 10);
      if (!Number.isFinite(servesCount) || servesCount < 1) return { ok: false, error: 'Serves count must be ≥ 1' };
    }

    // Validate options
    const optionPayload: CateringOptionInput[] = [];
    for (const [idx, opt] of form.options.entries()) {
      if (!opt.name.trim()) return { ok: false, error: `Option group #${idx + 1}: name is required` };
      if (opt.choices.length === 0) return { ok: false, error: `Option group "${opt.name}": add at least one choice` };
      for (const [cidx, c] of opt.choices.entries()) {
        if (!c.label.trim()) return { ok: false, error: `Option group "${opt.name}": choice #${cidx + 1} needs a label` };
      }
      optionPayload.push({
        name: opt.name.trim(),
        isRequired: opt.isRequired,
        minSelections: opt.isRequired ? 1 : 0,
        maxSelections: opt.selectionType === 'SINGLE' ? 1 : Math.max(2, opt.maxSelections),
        displayOrder: idx,
        choices: opt.choices.map((c, i) => ({
          label: c.label.trim(),
          description: c.description.trim() || null,
          priceModifier: c.priceModifier,
          isDefault: c.isDefault,
          isPopular: c.isPopular,
          displayOrder: i,
        })),
      });
    }

    return {
      ok: true,
      payload: {
        name: form.name.trim(),
        category: form.category.trim(),
        description: form.description.trim() || null,
        imageUrl: form.imageUrl.trim() || null,
        pricingType: form.pricingType,
        pricePerPerson,
        fixedPrice,
        minPeople,
        maxPeople,
        servesCount,
        tags: form.tags,
        packagingType: form.packagingType.trim() || null,
        dietaryInfo: form.dietaryInfo,
        isPopular: form.isPopular,
        specialInstructions: form.specialInstructions,
        isActive: form.isActive,
        options: optionPayload,
      },
    };
  };

  const handleSubmit = async () => {
    const built = buildPayload();
    if (!built.ok) {
      toast({ title: 'Check the form', description: built.error, variant: 'destructive' });
      return;
    }
    try {
      if (isEditing) {
        await updateMutation.mutateAsync(built.payload);
      } else {
        await createMutation.mutateAsync(built.payload);
      }
      navigate(PATHS.MERCHANT_CATERING);
    } catch {
      // hooks already toast on error
    }
  };

  const categorySuggestions = useMemo(
    () => (existingCategories ?? []).filter((c) => c && c !== form.category),
    [existingCategories, form.category],
  );

  if (isEditing && loadingExisting) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-2 py-4">
      <Link
        to={PATHS.MERCHANT_CATERING}
        className="inline-flex items-center gap-2 text-sm font-medium text-brand-primary-600 hover:underline"
      >
        <ArrowLeft className="h-4 w-4 shrink-0" />
        Back to catering
      </Link>

      <div className={`${panelClass} mt-4 p-6`}>
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-100">
            <ChefHat className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
              {isEditing ? 'Edit catering item' : 'New catering item'}
            </h1>
            <p className="mt-1 text-sm text-neutral-500">
              Per-person packages, platters, sandwiches — anything you cater. Customize options to match how you actually serve it.
            </p>
          </div>
        </div>

        {/* Section: Basic info */}
        <section className="mt-8 space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Basic info</h2>

          <div>
            <Label htmlFor="cat-name" className="text-sm font-medium text-neutral-700">
              Item name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="cat-name"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="e.g. Best Lunch Combo"
              className="mt-2 h-11"
              maxLength={200}
            />
          </div>

          <div>
            <Label htmlFor="cat-category" className="text-sm font-medium text-neutral-700">
              Category <span className="text-red-500">*</span>
            </Label>
            <p className="mt-0.5 text-xs text-neutral-500">Used to group items on your catering page.</p>
            <Input
              id="cat-category"
              value={form.category}
              onChange={(e) => set('category', e.target.value)}
              placeholder="e.g. Lunch Platters, Breakfast Packages"
              className="mt-2 h-11"
              list="cat-category-options"
              maxLength={100}
            />
            {categorySuggestions.length > 0 && (
              <datalist id="cat-category-options">
                {categorySuggestions.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            )}
            {categorySuggestions.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {categorySuggestions.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => set('category', c)}
                    className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs text-neutral-600 hover:bg-neutral-200"
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="cat-desc" className="text-sm font-medium text-neutral-700">
              Description
            </Label>
            <Textarea
              id="cat-desc"
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="What's included? Anything customers should know?"
              rows={3}
              maxLength={2000}
              className="mt-2 resize-none"
            />
          </div>

          <div>
            <Label className="text-sm font-medium text-neutral-700">Cover image</Label>
            <p className="mt-0.5 text-xs text-neutral-500">Shown on the customer catering page.</p>
            <div className="mt-2">
              {form.imageUrl ? (
                <div className="space-y-2">
                  <img src={form.imageUrl} alt="Cover" className="h-40 w-full rounded-xl border border-neutral-200 object-cover" />
                  <div className="flex gap-2">
                    <Button type="button" size="sm" variant="secondary" onClick={() => setImageModalOpen(true)} className="rounded-full">
                      <ImageIcon className="mr-1.5 h-3.5 w-3.5" />
                      Change
                    </Button>
                    <Button type="button" size="sm" variant="ghost" onClick={() => set('imageUrl', '')} className="rounded-full text-rose-600 hover:bg-rose-50">
                      Remove
                    </Button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setImageModalOpen(true)}
                  className="flex h-32 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-300 text-neutral-400 hover:border-neutral-400 hover:bg-neutral-50"
                >
                  <Plus className="h-6 w-6" />
                  <span className="mt-1 text-xs font-medium">Add image</span>
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Section: Pricing & serving */}
        <section className="mt-8 space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Pricing & serving</h2>

          <div>
            <Label className="text-sm font-medium text-neutral-700">Pricing type</Label>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {(['PER_PERSON', 'FIXED'] as CateringPricingType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => set('pricingType', type)}
                  className={cn(
                    'rounded-xl border-2 p-3 text-left text-sm transition',
                    form.pricingType === type
                      ? 'border-brand-primary-500 bg-brand-primary-50'
                      : 'border-neutral-200 hover:border-neutral-300',
                  )}
                >
                  <div className="font-semibold text-neutral-900">
                    {type === 'PER_PERSON' ? 'Per person' : 'Flat / fixed'}
                  </div>
                  <div className="mt-0.5 text-xs text-neutral-500">
                    {type === 'PER_PERSON' ? 'Customer picks # of people' : 'One total price (e.g. a tray)'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {form.pricingType === 'PER_PERSON' ? (
            <div>
              <Label htmlFor="cat-ppp" className="text-sm font-medium text-neutral-700">
                Price per person ($)
              </Label>
              <Input
                id="cat-ppp"
                type="number"
                step="0.01"
                min={0}
                value={form.pricePerPerson}
                onChange={(e) => set('pricePerPerson', e.target.value)}
                className="mt-2 h-11 sm:max-w-xs"
              />
            </div>
          ) : (
            <div>
              <Label htmlFor="cat-fp" className="text-sm font-medium text-neutral-700">
                Fixed price ($)
              </Label>
              <Input
                id="cat-fp"
                type="number"
                step="0.01"
                min={0}
                value={form.fixedPrice}
                onChange={(e) => set('fixedPrice', e.target.value)}
                className="mt-2 h-11 sm:max-w-xs"
              />
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <Label htmlFor="cat-min" className="text-sm font-medium text-neutral-700">
                Min people <span className="text-red-500">*</span>
              </Label>
              <Input
                id="cat-min"
                type="number"
                min={1}
                value={form.minPeople}
                onChange={(e) => set('minPeople', e.target.value)}
                className="mt-2 h-11"
              />
            </div>
            <div>
              <Label htmlFor="cat-max" className="text-sm font-medium text-neutral-700">
                Max people
              </Label>
              <Input
                id="cat-max"
                type="number"
                min={1}
                value={form.maxPeople}
                onChange={(e) => set('maxPeople', e.target.value)}
                placeholder="No limit"
                className="mt-2 h-11"
              />
            </div>
            <div>
              <Label htmlFor="cat-serves" className="text-sm font-medium text-neutral-700">
                Serves count
              </Label>
              <Input
                id="cat-serves"
                type="number"
                min={1}
                value={form.servesCount}
                onChange={(e) => set('servesCount', e.target.value)}
                placeholder="e.g. 10"
                className="mt-2 h-11"
              />
            </div>
          </div>
        </section>

        {/* Section: Tags & metadata */}
        <section className="mt-8 space-y-4">
          <div className="flex items-center gap-2">
            <Tags className="h-4 w-4 text-neutral-400" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Tags & metadata</h2>
          </div>

          <ChipInput
            label="Tags"
            values={form.tags}
            onChange={(v) => set('tags', v)}
            placeholder="e.g. Most ordered, Crowd favorite"
          />

          <div>
            <Label className="text-sm font-medium text-neutral-700">Dietary info</Label>
            <div className="mt-2">
              <MultiToggleChips
                options={DIETARY_OPTIONS}
                values={form.dietaryInfo}
                onChange={(v) => set('dietaryInfo', v)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="cat-pkg" className="text-sm font-medium text-neutral-700">
              Packaging
            </Label>
            <select
              id="cat-pkg"
              value={form.packagingType}
              onChange={(e) => set('packagingType', e.target.value)}
              className="mt-2 h-11 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm sm:max-w-xs"
            >
              <option value="">— Not specified —</option>
              {PACKAGING_OPTIONS.map((pkg) => (
                <option key={pkg} value={pkg}>{pkg}</option>
              ))}
            </select>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white p-3">
              <div>
                <p className="text-sm font-medium text-neutral-900">Most ordered</p>
                <p className="text-xs text-neutral-500">Show a "Most ordered" badge on this item</p>
              </div>
              <Switch checked={form.isPopular} onCheckedChange={(v) => set('isPopular', v)} />
            </div>
            <div className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white p-3">
              <div>
                <p className="text-sm font-medium text-neutral-900">Allow special instructions</p>
                <p className="text-xs text-neutral-500">Let customers add a note when ordering</p>
              </div>
              <Switch
                checked={form.specialInstructions}
                onCheckedChange={(v) => set('specialInstructions', v)}
              />
            </div>
          </div>
        </section>

        {/* Section: Options */}
        <section className="mt-8 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings2 className="h-4 w-4 text-neutral-400" />
              <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Customization options</h2>
            </div>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => set('options', [...form.options, blankOption()])}
              className="rounded-full"
            >
              <Plus className="mr-1 h-3.5 w-3.5" />
              Add group
            </Button>
          </div>

          {form.options.length === 0 ? (
            <p className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50/40 p-4 text-center text-xs text-neutral-500">
              No option groups yet. Add groups for things like "Select size", "Add sides", "Pick a salad".
            </p>
          ) : (
            <div className="space-y-3">
              {form.options.map((opt) => (
                <OptionEditor
                  key={opt.uid}
                  option={opt}
                  onChange={(next) =>
                    set('options', form.options.map((o) => (o.uid === opt.uid ? next : o)))
                  }
                  onRemove={() => set('options', form.options.filter((o) => o.uid !== opt.uid))}
                />
              ))}
            </div>
          )}
        </section>

        {/* Section: Visibility */}
        <section className="mt-8">
          <div className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white p-4">
            <div>
              <p className="text-sm font-semibold text-neutral-900">Active</p>
              <p className="text-xs text-neutral-500">When off, customers don't see this item.</p>
            </div>
            <Switch checked={form.isActive} onCheckedChange={(v) => set('isActive', v)} />
          </div>
        </section>

        {/* Footer */}
        <div className="mt-8 flex flex-col gap-3 border-t border-neutral-200 pt-6 sm:flex-row sm:justify-end">
          <Link to={PATHS.MERCHANT_CATERING} className="sm:order-1">
            <Button
              type="button"
              variant="secondary"
              disabled={isSubmitting}
              className="w-full rounded-full px-6 sm:w-auto"
            >
              Cancel
            </Button>
          </Link>
          <Button
            type="button"
            variant="primary"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full rounded-full px-6 sm:order-2 sm:w-auto"
          >
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isEditing ? 'Save changes' : 'Create item'}
          </Button>
        </div>
      </div>

      <ImageUploadModal
        open={imageModalOpen}
        onOpenChange={setImageModalOpen}
        onUploadComplete={(urls) => {
          if (urls[0]) set('imageUrl', urls[0]);
        }}
        context="venue_gallery"
        maxFiles={1}
        title="Upload catering image"
      />
    </div>
  );
}

export const MerchantCateringFormPage = () => (
  <MerchantProtectedRoute fallbackMessage="Only merchants can manage catering.">
    <MerchantCateringFormInner />
  </MerchantProtectedRoute>
);
