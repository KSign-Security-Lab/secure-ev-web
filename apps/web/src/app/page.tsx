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
} from "lucide-react";
import Loading from "~/components/common/Loading/Loading";
import { AbilitiesCharts } from "~/components/dashboard/AbilitiesCharts";
import { AgentsCharts } from "~/components/dashboard/AgentsCharts";
import { StatsCard } from "~/components/dashboard/StatsCard";
import { MitreCoverageCharts } from "~/components/dashboard/MitreCoverageCharts";
import trpc, { type RouterOutputs } from "~/lib/trpc";
import Link from "next/link";

type AbilitiesStatistics = RouterOutputs["abilities"]["statistics"];
type AgentsStatistics = RouterOutputs["agents"]["statistics"];

export default function Dashboard() {
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

  return (
    <div className="flex flex-col w-full space-y-8">
      {/* Statistics Cards */}
      {/* Statistics Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="전체 취약점 (Total Abilities)"
          value={abilitiesStats?.totalCount ?? 0}
          description="Available attack techniques"
          icon={Database}
          variant="primary"
        />

        <StatsCard
          title="전체 에이전트 (Total Agents)"
          value={agentsStats?.totalCount ?? 0}
          description="시스템의 활성 에이전트"
          icon={Server}
          variant="accent"
        />

        <StatsCard
          title="신뢰할 수 있는 에이전트 (Trusted Agents)"
          value={agentsStats?.trustedCount ?? 0}
          description="Verified and trusted"
          icon={Shield}
          variant="success"
          trend={
            agentsStats?.totalCount
              ? `${Math.round(
                  (agentsStats.trustedCount / agentsStats.totalCount) * 100
                )}%`
              : "0%"
          }
        />

        <StatsCard
          title="신뢰할 수 없는 에이전트 (Untrusted Agents)"
          value={agentsStats?.untrustedCount ?? 0}
          description="Require verification"
          icon={ShieldAlert}
          variant="danger"
          trend={
            agentsStats?.totalCount
              ? `${Math.round(
                  (agentsStats.untrustedCount / agentsStats.totalCount) * 100
                )}%`
              : "0%"
          }
        />
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-4">
        {/* MITRE Coverage Visualization */}
        <Card className="border-base-700/50 lg:col-span-1">
          <CardHeader className="border-b border-base-700/50 pb-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="text-xl font-semibold text-white">
                  MITRE ATT&CK 커버리지 (MITRE ATT&CK Coverage)
                </CardTitle>
                <CardDescription className="text-sm text-neutral-400">
                  MITRE ATT&CK Matrix와 비교한 전체 기법 커버리지
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {isLoadingAbilities ? (
              <div className="flex justify-center items-center py-16">
                <Loading />
              </div>
            ) : abilitiesStats?.mitreCoverage ? (
              <MitreCoverageCharts data={abilitiesStats.mitreCoverage} />
            ) : (
              <div className="text-center text-neutral-400 py-16">
                <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">
                  No coverage data available
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Abilities Visualization */}
        <Card className="border-base-700/50 lg:col-span-3">
          <CardHeader className="border-b border-base-700/50 pb-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="text-xl font-semibold text-white">
                  Abilities Distribution
                </CardTitle>
                <CardDescription className="text-sm text-neutral-400">
                  Visual breakdown of attack techniques and capabilities
                </CardDescription>
              </div>
              <Link href="/abilities">
                <Button variant="tinted" size="sm">
                  View all
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
              <AbilitiesCharts data={abilitiesStats} />
            ) : (
              <div className="text-center text-neutral-400 py-16">
                <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No abilities available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Agents Visualization */}
      <Card className="border-base-700/50">
        <CardHeader className="border-b border-base-700/50 pb-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-xl font-semibold text-white">
                에이전트 분포 (Agents Distribution)
              </CardTitle>
              <CardDescription className="text-sm text-neutral-400">
                시스템 내 활성 에이전트의 시각적 분류
              </CardDescription>
            </div>
            <Link href="/agents">
              <Button variant="tinted" size="sm">
                View all
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
          ) : agentsStats ? (
            <AgentsCharts data={agentsStats} />
          ) : (
            <div className="text-center text-neutral-400 py-16">
              <Server className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">사용 가능한 에이전트가 없습니다</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
