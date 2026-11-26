"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import {
  Database,
  Server,
  ArrowRight,
  Shield,
  ShieldAlert,
  Rocket,
} from "lucide-react";
import Loading from "~/components/common/Loading/Loading";
import { PageHeader } from "~/components/common/PageHeader/PageHeader";
import { EmptyState } from "~/components/common/EmptyState/EmptyState";
import { PlatformChart, TacticChart, TypeChart } from "~/components/dashboard/AbilitiesCharts";
import { AgentsCharts } from "~/components/dashboard/AgentsCharts";
import { StatsCard } from "~/components/dashboard/StatsCard";
import { MitreCoverageCharts } from "~/components/dashboard/MitreCoverageCharts";
import trpc, { type RouterOutputs } from "~/lib/trpc";
import Link from "next/link";
import { useI18n } from "~/i18n/I18nProvider";

type AbilitiesStatistics = RouterOutputs["abilities"]["statistics"];
type AgentsStatistics = RouterOutputs["agents"]["statistics"];

export default function Dashboard() {
  const { t } = useI18n();
  const [abilitiesStats, setAbilitiesStats] = useState<
    AbilitiesStatistics | undefined
  >();
  const [agentsStats, setAgentsStats] = useState<
    AgentsStatistics | undefined
  >();
  const [isLoadingAbilities, setIsLoadingAbilities] = useState<boolean>(true);
  const [isLoadingAgents, setIsLoadingAgents] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;

    const fetchAbilitiesStats = async () => {
      setIsLoadingAbilities(true);
      try {
        const response = await trpc.abilities.statistics.query();
        if (!cancelled) {
          setAbilitiesStats(response);
        }
      } catch {
        if (!cancelled) {
          setAbilitiesStats(undefined);
        }
      } finally {
        if (!cancelled) {
          setIsLoadingAbilities(false);
        }
      }
    };

    const fetchAgentsStats = async () => {
      setIsLoadingAgents(true);
      try {
        const response = await trpc.agents.statistics.query();
        if (!cancelled) {
          setAgentsStats(response);
        }
      } catch {
        if (!cancelled) {
          setAgentsStats(undefined);
        }
      } finally {
        if (!cancelled) {
          setIsLoadingAgents(false);
        }
      }
    };

    fetchAbilitiesStats();
    fetchAgentsStats();

    return () => {
      cancelled = true;
    };
  }, []);

  // Share of all agents; nothing to show when there are no agents yet.
  const shareOf = (count?: number) =>
    agentsStats?.totalCount && count !== undefined
      ? t("dashboard.stats.shareOfAgents", {
          pct: Math.round((count / agentsStats.totalCount) * 100),
        })
      : undefined;

  return (
    <div className="flex flex-col w-full space-y-8">
      <PageHeader
        title={t("dashboard.title")}
        subtitle={t("dashboard.subtitle")}
        badge={t("dashboard.eyebrow")}
      />

      {/* Statistics Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title={t("dashboard.stats.totalAbilities")}
          value={abilitiesStats?.totalCount ?? 0}
          description={t("dashboard.stats.totalAbilitiesDesc")}
          icon={Database}
          variant="primary"
        />

        <StatsCard
          title={t("dashboard.stats.totalAgents")}
          value={agentsStats?.totalCount ?? 0}
          description={t("dashboard.stats.totalAgentsDesc")}
          icon={Server}
          variant="accent"
        />

        <StatsCard
          title={t("dashboard.stats.trustedAgents")}
          value={agentsStats?.trustedCount ?? 0}
          description={t("dashboard.stats.trustedAgentsDesc")}
          icon={Shield}
          variant="success"
          trend={shareOf(agentsStats?.trustedCount)}
        />

        <StatsCard
          title={t("dashboard.stats.untrustedAgents")}
          value={agentsStats?.untrustedCount ?? 0}
          description={t("dashboard.stats.untrustedAgentsDesc")}
          icon={ShieldAlert}
          variant="danger"
          trend={shareOf(agentsStats?.untrustedCount)}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* MITRE Coverage */}
        <Card className="border-neutral-200 lg:col-span-4">
          <CardHeader className="border-b border-neutral-200 pb-4">
            <div className="space-y-1">
              <CardTitle className="text-xl font-semibold text-neutral-950">
                {t("dashboard.mitre.title")}
              </CardTitle>
              <CardDescription className="text-sm text-neutral-500">
                {t("dashboard.mitre.desc")}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex flex-1 items-center justify-center pt-6">
            {isLoadingAbilities ? (
              <div className="flex justify-center items-center py-16">
                <Loading />
              </div>
            ) : abilitiesStats?.mitreCoverage ? (
              <div className="w-full space-y-4">
                <MitreCoverageCharts data={abilitiesStats.mitreCoverage} />
                <Link
                  href="/playground/coverage"
                  className="flex items-center justify-center gap-1 text-sm font-medium text-blue-700 hover:text-blue-900"
                >
                  {t("dashboard.viewAll")}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              <EmptyState
                icon={Shield}
                title={t("dashboard.mitre.empty")}
                className="border-none bg-transparent"
              />
            )}
          </CardContent>
        </Card>

        {/* Abilities by tactic */}
        <Card className="border-neutral-200 lg:col-span-8">
          <CardHeader className="border-b border-neutral-200 pb-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="text-xl font-semibold text-neutral-950">
                  {t("dashboard.abilities.title")}
                </CardTitle>
                <CardDescription className="text-sm text-neutral-500">
                  {t("dashboard.abilities.desc")}
                </CardDescription>
              </div>
              <Link href="/playground/abilities">
                <Button variant="tinted" size="sm">
                  {t("dashboard.viewAll")}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {isLoadingAbilities ? (
              <div className="flex justify-center items-center py-16">
                <Loading />
              </div>
            ) : abilitiesStats ? (
              <TacticChart data={abilitiesStats} />
            ) : (
              <EmptyState
                icon={Database}
                title={t("dashboard.abilities.empty")}
                className="border-none bg-transparent"
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Abilities by platform / type */}
      {abilitiesStats && !isLoadingAbilities && (
        <Card className="border-neutral-200">
          <CardHeader className="border-b border-neutral-200 pb-4">
            <div className="space-y-1">
              <CardTitle className="text-xl font-semibold text-neutral-950">
                {t("dashboard.abilities.platformTitle")}
              </CardTitle>
              <CardDescription className="text-sm text-neutral-500">
                {t("dashboard.abilities.platformDesc")}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="grid gap-6 pt-6 md:grid-cols-2">
            <PlatformChart data={abilitiesStats} />
            {abilitiesStats.byType.length > 0 && <TypeChart data={abilitiesStats} />}
          </CardContent>
        </Card>
      )}

      {/* Agents Visualization */}
      <Card className="border-neutral-200">
        <CardHeader className="border-b border-neutral-200 pb-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-xl font-semibold text-neutral-950">
                {t("dashboard.agents.title")}
              </CardTitle>
              <CardDescription className="text-sm text-neutral-500">
                {t("dashboard.agents.desc")}
              </CardDescription>
            </div>
            <Link href="/playground/agents">
              <Button variant="tinted" size="sm">
                {t("dashboard.viewAll")}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {isLoadingAgents ? (
            <div className="flex justify-center items-center py-16">
              <Loading />
            </div>
          ) : agentsStats && agentsStats.totalCount > 0 ? (
            <AgentsCharts data={agentsStats} />
          ) : agentsStats ? (
            <EmptyState
              icon={Server}
              title={t("dashboard.agents.emptyTitle")}
              description={t("dashboard.agents.emptyDesc")}
              className="border-none bg-transparent py-10"
              action={
                <Link
                  href="/playground/agents"
                  className="inline-flex h-9 items-center gap-2 rounded-md bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  <Rocket className="h-4 w-4" />
                  {t("dashboard.agents.deployCta")}
                </Link>
              }
            />
          ) : (
            <EmptyState
              icon={Server}
              title={t("dashboard.agents.empty")}
              className="border-none bg-transparent"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
