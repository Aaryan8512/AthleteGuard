import * as React from 'react';
import { useToast } from '@/hooks/use-toast';
import { getTeamAthletes } from '@/services/api';
import type { TeamSummary, Athlete } from '@/types';
import { KpiCard } from '@/components/shared/KpiCard';
import { SectionCard } from '@/components/shared/SectionCard';
import { RiskPill, LoadPill } from '@/components/shared/StatusPills';
import { LoadingState, ErrorState } from '@/components/shared/States';
import { AthleteProfileContent, AthleteHeader } from '@/components/shared/AthleteProfileContent';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Users,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Search,
} from 'lucide-react';
import { Input } from '@/components/ui/input';

export function CoachDashboardPage() {
  const { toast } = useToast();
  const [team, setTeam] = React.useState<TeamSummary | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);
  const [selected, setSelected] = React.useState<Athlete | null>(null);
  const [query, setQuery] = React.useState('');

  const load = React.useCallback(() => {
    setLoading(true);
    setError(false);
    getTeamAthletes()
      .then(setTeam)
      .catch(() => {
        setError(true);
        toast({
          title: 'Could not load team',
          variant: 'destructive',
        });
      })
      .finally(() => setLoading(false));
  }, [toast]);

  React.useEffect(() => {
    load();
  }, [load]);

  if (loading) return <LoadingState label="Loading team roster…" />;
  if (error || !team)
    return <ErrorState message="Team data unavailable." onRetry={load} />;

  const filtered = team.athletes.filter(
    (a) =>
      a.name.toLowerCase().includes(query.toLowerCase()) ||
      a.sport.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Coach Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Team overview and risk monitoring
          </p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Total Athletes"
          value={team.totalAthletes}
          icon={<Users className="h-4 w-4" />}
        />
        <KpiCard
          label="Low Indicator"
          value={team.lowCount}
          deltaLabel="stable"
          status="good"
          icon={<ShieldCheck className="h-4 w-4" />}
        />
        <KpiCard
          label="Moderate"
          value={team.moderateCount}
          deltaLabel="watch"
          status="warn"
          icon={<ShieldAlert className="h-4 w-4" />}
        />
        <KpiCard
          label="Needs Attention"
          value={team.needsAttentionCount}
          deltaLabel="act now"
          status="danger"
          icon={<AlertTriangle className="h-4 w-4" />}
        />
      </div>

      {/* Roster table */}
      <SectionCard
        title="Team Roster"
        subtitle="Click an athlete to view full profile"
        icon={<Users className="h-4 w-4" />}
        action={
          <div className="relative w-44 sm:w-56">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search name or sport…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-8 pl-9 text-xs"
            />
          </div>
        }
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Athlete</TableHead>
              <TableHead className="hidden sm:table-cell">Sport</TableHead>
              <TableHead className="text-right">Performance</TableHead>
              <TableHead className="text-right">Recovery</TableHead>
              <TableHead className="hidden text-right md:table-cell">
                Training Load
              </TableHead>
              <TableHead className="text-right">Risk Indicator</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-8 text-center text-sm text-muted-foreground"
                >
                  No athletes match "{query}".
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((a) => (
                <TableRow
                  key={a.id}
                  onClick={() => setSelected(a)}
                  className="cursor-pointer"
                >
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                        {a.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2)}
                      </span>
                      <div className="leading-tight">
                        <p className="text-sm font-medium text-foreground">
                          {a.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground sm:hidden">
                          {a.sport}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden text-sm text-muted-foreground sm:table-cell">
                    {a.sport}
                  </TableCell>
                  <TableCell className="text-right text-sm font-medium tabular-nums">
                    {a.performanceScore}
                  </TableCell>
                  <TableCell className="text-right text-sm font-medium tabular-nums">
                    {a.recoveryScore}
                  </TableCell>
                  <TableCell className="hidden text-right md:table-cell">
                    <LoadPill level={a.loadLevel} />
                  </TableCell>
                  <TableCell className="text-right">
                    <RiskPill level={a.riskLevel} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </SectionCard>

      {/* Athlete detail drawer */}
      <Sheet
        open={!!selected}
        onOpenChange={(open) => !open && setSelected(null)}
      >
        <SheetContent
          side="right"
          className="w-full overflow-y-auto border-border bg-background p-0 sm:max-w-2xl"
        >
          {selected && (
            <>
              <SheetHeader className="border-b border-border p-5">
                <SheetTitle className="text-left">
                  <AthleteHeader athlete={selected} />
                </SheetTitle>
                <SheetDescription className="sr-only">
                  Detailed athlete profile and risk analysis
                </SheetDescription>
              </SheetHeader>
              <div className="p-5">
                <AthleteProfileContent athlete={selected} compact />
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
