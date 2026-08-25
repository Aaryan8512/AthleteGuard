import * as React from 'react';
import { useToast } from '@/hooks/use-toast';
import { getMyAthlete } from '@/services/api';
import type { Athlete } from '@/types';
import { SectionCard } from '@/components/shared/SectionCard';
import { LoadingState, ErrorState } from '@/components/shared/States';
import { AthleteProfileContent, AthleteHeader } from '@/components/shared/AthleteProfileContent';
import { Lightbulb } from 'lucide-react';

export function AthleteProfilePage() {
  const { toast } = useToast();
  const [athlete, setAthlete] = React.useState<Athlete | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);

  const load = React.useCallback(() => {
    setLoading(true);
    setError(false);
    getMyAthlete()
      .then(setAthlete)
      .catch(() => {
        setError(true);
        toast({
          title: 'Could not load profile',
          variant: 'destructive',
        });
      })
      .finally(() => setLoading(false));
  }, [toast]);

  React.useEffect(() => {
    load();
  }, [load]);

  if (loading) return <LoadingState label="Loading athlete profile…" />;
  if (error || !athlete)
    return <ErrorState message="Profile unavailable." onRetry={load} />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Athlete Profile
          </h1>
          <p className="text-sm text-muted-foreground">
            Personal stats, history and recommendations
          </p>
        </div>
      </div>

      {/* Header card */}
      <SectionCard title="" subtitle="">
        <AthleteHeader athlete={athlete} />
      </SectionCard>

      {/* Recommendation banner */}
      <SectionCard
        title="Coach Recommendation"
        subtitle="Informational guidance"
        icon={<Lightbulb className="h-4 w-4" />}
      >
        <p className="text-sm leading-relaxed text-foreground">
          {athlete.recommendation}
        </p>
      </SectionCard>

      {/* Full profile content */}
      <AthleteProfileContent athlete={athlete} />
    </div>
  );
}
