import { Link } from 'react-router-dom';
import {
  Building2,
  Clock3,
  MapPin,
  Phone,
  Settings,
  Store,
  UserCircle2,
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/ui/badge';
import { PATHS } from '@/routing/paths';
import { useMerchantStatus } from '@/hooks/useMerchantStatus';
import { useMerchantStores } from '@/hooks/useMerchantStores';
import {
  MerchantMetaCard,
  MerchantPageIntro,
  MerchantPageState,
  merchantPanelClass,
} from '@/components/merchant/MerchantAppleUI';

const statusTone: Record<string, string> = {
  APPROVED: 'border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300',
  PENDING: 'border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300',
  REJECTED: 'border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300',
  SUSPENDED: 'border-border bg-muted text-foreground',
};

const formatStatus = (status?: string) =>
  status ? `${status.charAt(0)}${status.slice(1).toLowerCase()}` : 'Unknown';

const formatDate = (value?: string) => {
  if (!value) return 'Not available';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not available';
  return date.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  });
};

export const MerchantBusinessPage = () => {
  const { data: merchantData, isLoading } = useMerchantStatus();
  const { data: storesData, isLoading: storesLoading } = useMerchantStores();

  if (isLoading) {
    return (
      <div className="space-y-5">
        <div className="animate-pulse rounded-[1.5rem] border border-border/80 bg-card p-6">
          <div className="h-5 w-28 rounded bg-accent" />
          <div className="mt-4 h-8 w-72 rounded bg-accent" />
          <div className="mt-3 h-4 w-full max-w-2xl rounded bg-accent" />
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-28 animate-pulse rounded-[1.35rem] border border-border/80 bg-card" />
          ))}
        </div>
      </div>
    );
  }

  const merchant = merchantData?.data?.merchant;

  if (!merchant) {
    return (
      <MerchantPageState
        title="No business profile found"
        description="Complete merchant onboarding to create your business profile and start managing your workspace."
        action={
          <Button asChild size="lg" className="rounded-xl">
            <Link to={PATHS.MERCHANT_ONBOARDING}>Set up business</Link>
          </Button>
        }
      />
    );
  }

  const storeCount = storesData?.stores?.length ?? 0;
  const activeStoreCount = storesData?.stores?.filter((store) => store.active).length ?? 0;

  return (
    <div className="space-y-5">
      <MerchantPageIntro
        eyebrow="My Business"
        title={`${merchant.businessName} business profile`}
        description="Review your business identity, merchant status, location details, and the information powering your merchant workspace."
        aside={
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <MerchantMetaCard
              label="Merchant status"
              value={formatStatus(merchant.status)}
              caption="Current approval state for your business account."
            />
            <MerchantMetaCard
              label="Stores"
              value={storesLoading ? 'Loading...' : `${activeStoreCount}/${storeCount}`}
              caption="Active stores compared with your total connected locations."
            />
          </div>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div className={merchantPanelClass}>
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-[1rem] bg-muted text-foreground">
              <Building2 className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="text-[13px] text-muted-foreground">Business name</div>
              <div className="truncate text-[1.05rem] font-semibold text-foreground">{merchant.businessName}</div>
              <div className="mt-3">
                <Badge className={`border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${statusTone[merchant.status] || statusTone.SUSPENDED}`}>
                  {formatStatus(merchant.status)}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <div className={merchantPanelClass}>
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-[1rem] bg-muted text-foreground">
              <MapPin className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="text-[13px] text-muted-foreground">Primary location</div>
              <div className="text-[1.05rem] font-semibold text-foreground">
                {merchant.city || 'City not added'}
              </div>
              <div className="mt-1 text-[13px] leading-6 text-muted-foreground">
                {merchant.address || 'Address not added yet.'}
              </div>
            </div>
          </div>
        </div>

        <div className={merchantPanelClass}>
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-[1rem] bg-muted text-foreground">
              <Phone className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="text-[13px] text-muted-foreground">Contact</div>
              <div className="text-[1.05rem] font-semibold text-foreground">
                {merchant.phoneNumber || 'Phone not added'}
              </div>
              <div className="mt-1 text-[13px] text-muted-foreground">
                Keep this current so your team and guests can reach the business.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
        <div className={merchantPanelClass}>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[0.95rem] bg-muted text-foreground">
              <UserCircle2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-[15px] font-semibold text-foreground">About your business</h3>
              <p className="mt-1 text-[13px] text-muted-foreground">
                This is the core information currently saved for your merchant profile.
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-[1.1rem] border border-border/80 bg-muted/60 p-4">
            <div className="text-[13px] font-medium text-foreground">Description</div>
            <p className="mt-2 text-[13px] leading-6 text-muted-foreground">
              {merchant.description?.trim() || 'No business description has been added yet.'}
            </p>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button asChild className="w-full rounded-full bg-foreground px-5 text-background hover:bg-foreground/85 sm:w-auto">
              <Link to={PATHS.MERCHANT_STORES} className="inline-flex items-center justify-center whitespace-nowrap">
                <Store className="mr-2 h-4 w-4 shrink-0" />
                Manage Stores
              </Link>
            </Button>
            <Button
              asChild
              variant="secondary"
              className="w-full rounded-full border-border bg-card px-5 text-foreground hover:bg-muted sm:w-auto"
            >
              <Link to={PATHS.SETTINGS} className="inline-flex items-center justify-center whitespace-nowrap">
                <Settings className="mr-2 h-4 w-4 shrink-0" />
                Account Settings
              </Link>
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <div className={merchantPanelClass}>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-[0.95rem] bg-muted text-foreground">
                <Clock3 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-[15px] font-semibold text-foreground">Business timeline</h3>
                <p className="mt-1 text-[13px] text-muted-foreground">
                  Key dates for your merchant profile.
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <div className="rounded-[1rem] border border-border/80 bg-muted/60 p-4">
                <div className="text-[12px] font-medium uppercase tracking-[0.14em] text-muted-foreground">Created</div>
                <div className="mt-2 text-[15px] font-semibold text-foreground">{formatDate(merchant.createdAt)}</div>
              </div>
              <div className="rounded-[1rem] border border-border/80 bg-muted/60 p-4">
                <div className="text-[12px] font-medium uppercase tracking-[0.14em] text-muted-foreground">Last updated</div>
                <div className="mt-2 text-[15px] font-semibold text-foreground">{formatDate(merchant.updatedAt)}</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
