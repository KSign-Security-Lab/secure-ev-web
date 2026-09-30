"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  CheckCircle2,
  Plug,
  Zap,
  FileText,
  BookOpen,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { Reveal } from "~/components/common/Reveal";
import { IconCard } from "~/components/common/IconCard/IconCard";
import { Button } from "~/components/ui/button";
import { GlassCard } from "~/components/ui/glass-card";
import { Badge } from "~/components/ui/badge";
import { RecentFuzzingStats } from "~/components/page/fuzzing/RecentFuzzingStats";
import { useI18n } from "~/i18n/I18nProvider";

export default function FuzzingLandingPage() {
  const { t } = useI18n();

  return (
    <div className="flex flex-col w-full min-h-screen bg-neutral-100 text-neutral-900 font-sans selection:bg-blue-100">
      {/* Hero Section */}
      <section className="relative w-full px-6 md:px-24 py-4 flex flex-col md:flex-row items-center gap-16 justify-between">
        {/* Text Left */}
        <div className="flex-1 space-y-8 z-10">
          <Badge variant="blue" className="mt-4 border-blue-200">
            <span className="flex h-2 w-2 rounded-full bg-blue-600 mr-2 animate-pulse"></span>
            {t("fuzzing.landing.badge")}
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-tight text-neutral-950">
            {t("fuzzing.landing.heroTitlePrefix")}{" "}
            <span className="text-blue-700">
              {t("fuzzing.landing.heroTitleHighlight")}
            </span>
          </h1>
          <p className="text-lg md:text-xl text-neutral-500 max-w-lg leading-relaxed">
            {t("fuzzing.landing.heroDescription")}
          </p>
          <div className="pt-4">
            <Link href="/fuzzing/jobs">
              <Button
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg rounded-md shadow-sm transition-all duration-300 border border-blue-600"
              >
                {t("fuzzing.landing.createJob")}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Image Right */}
        <div className="flex-1 relative z-10 flex justify-center">
          <div className="relative w-full max-w-2xl aspect-square flex items-center justify-center">
            <Image
              src="/assets/fuzzing/ev-hero-shield.png"
              alt="EV Security Shield"
              width={800}
              height={800}
              className="object-contain relative z-10 transform scale-110"
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="w-full px-6 md:px-24 py-20 relative bg-neutral-100">
        <Reveal width="100%">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4 text-neutral-950">
                {t("fuzzing.landing.howItWorksTitle")}
              </h2>
              <p className="text-neutral-500 text-lg">
                {t("fuzzing.landing.howItWorksSubtitle")}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
              {/* Connector Line (Desktop) */}
              <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-neutral-200 -z-10" />

              {/* Step 1 */}
              <div className="relative flex flex-col items-center text-center group">
                <div className="w-24 h-24 rounded-lg border border-neutral-200 bg-white flex items-center justify-center mb-6 shadow-sm group-hover:border-blue-200 transition-all duration-300">
                  <Plug className="w-12 h-12 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-neutral-900 mb-3">
                  {t("fuzzing.landing.step.connectTitle")}
                </h3>
                <p className="text-neutral-500 leading-relaxed max-w-xs">
                  {t("fuzzing.landing.step.connectDescription")}
                </p>
              </div>

              {/* Step 2 */}
              <div className="relative flex flex-col items-center text-center group">
                <div className="w-24 h-24 rounded-lg border border-neutral-200 bg-white flex items-center justify-center mb-6 shadow-sm group-hover:border-sky-200 transition-all duration-300">
                  <Zap className="w-12 h-12 text-sky-600" />
                </div>
                <h3 className="text-xl font-bold text-neutral-900 mb-3">
                  {t("fuzzing.landing.step.attackTitle")}
                </h3>
                <p className="text-neutral-500 leading-relaxed max-w-xs">
                  {t("fuzzing.landing.step.attackDescription")}
                </p>
              </div>

              {/* Step 3 */}
              <div className="relative flex flex-col items-center text-center group">
                <div className="w-24 h-24 rounded-lg border border-neutral-200 bg-white flex items-center justify-center mb-6 shadow-sm group-hover:border-blue-200 transition-all duration-300">
                  <FileText className="w-12 h-12 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-neutral-900 mb-3">
                  {t("fuzzing.landing.step.analyzeTitle")}
                </h3>
                <p className="text-neutral-500 leading-relaxed max-w-xs">
                  {t("fuzzing.landing.step.analyzeDescription")}
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Why Fuzzing Matters */}
      <section className="w-full px-6 md:px-24 pt-12 pb-24 bg-white relative z-10">
        <Reveal width="100%">
          <div className="max-w-4xl mx-auto text-center mb-8 space-y-8 py-6">
            <h2 className="text-3xl md:text-5xl font-bold text-neutral-950">
              {t("fuzzing.landing.whyTitlePrefix")}{" "}
              <span className="text-blue-700">
                {t("fuzzing.landing.whyTitleHighlight")}
              </span>
              {t("fuzzing.landing.whyTitleSuffix")}
            </h2>
            <p className="text-xl text-neutral-500 leading-relaxed max-w-2xl mx-auto">
              {t("fuzzing.landing.whyDescription")}
            </p>
          </div>
        </Reveal>

        {/* Feature Cards (Bento Grid) - Repurposed here */}
        <div className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            {/* Card 1 */}
            <GlassCard className="p-8">
              <div className="mb-6 w-40 h-40 relative flex items-center justify-center rounded-lg bg-blue-50 group-hover:scale-105 transition-transform duration-300 overflow-hidden">
                <Image
                  src="/assets/fuzzing/icon-protocol-fuzzing.png"
                  alt="Protocol"
                  width={200}
                  height={200}
                  style={{
                    maskImage:
                      "linear-gradient(to bottom, transparent, black 10%, black 90%, transparent), linear-gradient(to right, transparent, black 20%, black 80%, transparent)",
                    maskComposite: "intersect",
                    WebkitMaskImage:
                      "linear-gradient(to bottom, transparent, black 10%, black 90%, transparent), linear-gradient(to right, transparent, black 20%, black 80%, transparent)",
                    WebkitMaskComposite: "source-in",
                  }}
                  className="object-contain w-full h-full p-2"
                />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-3">
                {t("fuzzing.landing.feature.protocolTitle")}
              </h3>
              <p className="text-neutral-500 leading-relaxed">
                {t("fuzzing.landing.feature.protocolDescription")}
              </p>
            </GlassCard>

            {/* Card 2 */}
            <GlassCard variant="cyan" className="p-8">
              <div className="mb-6 w-40 h-40 relative flex items-center justify-center rounded-lg bg-sky-50 group-hover:scale-105 transition-transform duration-300 overflow-hidden">
                <Image
                  src="/assets/fuzzing/icon-vulnerability-detection.png"
                  alt="Vulnerability"
                  width={200}
                  height={200}
                  style={{
                    maskImage:
                      "linear-gradient(to bottom, transparent, black 10%, black 90%, transparent), linear-gradient(to right, transparent, black 20%, black 80%, transparent)",
                    maskComposite: "intersect",
                    WebkitMaskImage:
                      "linear-gradient(to bottom, transparent, black 10%, black 90%, transparent), linear-gradient(to right, transparent, black 20%, black 80%, transparent)",
                    WebkitMaskComposite: "source-in",
                  }}
                  className="object-contain w-full h-full p-2"
                />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-3">
                {t("fuzzing.landing.feature.vulnerabilityTitle")}
              </h3>
              <p className="text-neutral-500 leading-relaxed">
                {t("fuzzing.landing.feature.vulnerabilityDescription")}
              </p>
            </GlassCard>

            {/* Card 3 */}
            <GlassCard className="p-8">
              <div className="mb-6 w-40 h-40 relative flex items-center justify-center rounded-lg bg-blue-50 group-hover:scale-105 transition-transform duration-300 overflow-hidden">
                <Image
                  src="/assets/fuzzing/icon-ocpp-security.png"
                  alt="OCPP"
                  width={200}
                  height={200}
                  style={{
                    maskImage:
                      "linear-gradient(to bottom, transparent, black 10%, black 90%, transparent), linear-gradient(to right, transparent, black 20%, black 80%, transparent)",
                    maskComposite: "intersect",
                    WebkitMaskImage:
                      "linear-gradient(to bottom, transparent, black 10%, black 90%, transparent), linear-gradient(to right, transparent, black 20%, black 80%, transparent)",
                    WebkitMaskComposite: "source-in",
                  }}
                  className="object-contain w-full h-full p-2"
                />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-3">
                {t("fuzzing.landing.feature.ocppSecurityTitle")}
              </h3>
              <p className="text-neutral-500 leading-relaxed">
                {t("fuzzing.landing.feature.ocppSecurityDescription")}
              </p>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* Recent Jobs Section */}
      <section className="w-full px-6 md:px-24 py-16 bg-neutral-100 border-b border-neutral-200">
        <Reveal width="100%">
          <div className="max-w-7xl mx-auto">
            <RecentFuzzingStats />
          </div>
        </Reveal>
      </section>

      {/* Supported Protocols Strip */}
      <section className="w-full border-y border-neutral-200 bg-white">
        <Reveal width="100%">
          <div className="max-w-7xl mx-auto px-6 py-20">
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
              {[
                "OCPP 1.6J",
                "OCPP 2.0.1",
                "ISO 15118",
                "WebSocket Secure (WSS)",
              ].map((protocol) => (
                <div
                  key={protocol}
                  className="flex items-center space-x-2 group cursor-default"
                >
                  <CheckCircle2 className="w-5 h-5 text-blue-600 group-hover:text-sky-600 transition-colors" />
                  <span className="text-lg font-bold text-neutral-700 group-hover:text-neutral-900 transition-colors">
                    {protocol}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="w-full px-6 md:px-24 py-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-neutral-200">
              <div className="flex flex-col items-center text-center space-y-2 pt-4 md:pt-0">
                <h4 className="text-xl font-bold text-neutral-900 mb-2">
                  {t("fuzzing.landing.protocolStrip.automationTitle")}
                </h4>
                <p className="text-sm text-neutral-500 max-w-xs mx-auto">
                  {t("fuzzing.landing.protocolStrip.automationDescription")}
                </p>
              </div>
              <div className="flex flex-col items-center text-center space-y-2 pt-4 md:pt-0">
                <h4 className="text-xl font-bold text-blue-700 mb-2">
                  {t("fuzzing.landing.protocolStrip.precisionTitle")}
                </h4>
                <p className="text-sm text-neutral-500 max-w-xs mx-auto">
                  {t("fuzzing.landing.protocolStrip.precisionDescription")}
                </p>
              </div>
              <div className="flex flex-col items-center text-center space-y-2 pt-4 md:pt-0">
                <h4 className="text-xl font-bold text-neutral-900 mb-2">
                  {t("fuzzing.landing.protocolStrip.accuracyTitle")}
                </h4>
                <p className="text-sm text-neutral-500 max-w-xs mx-auto">
                  {t("fuzzing.landing.protocolStrip.accuracyDescription")}
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Resources Section */}
      <section className="w-full px-6 md:px-24 py-20 bg-white border-t border-neutral-200">
        <Reveal width="100%">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4 text-neutral-950">
                {t("fuzzing.landing.resourcesTitle")}
              </h2>
              <p className="text-neutral-500 text-lg">
                {t("fuzzing.landing.resourcesSubtitle")}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <IconCard 
                icon={BookOpen}
                title={t("fuzzing.landing.resource.docsTitle")}
                description={t("fuzzing.landing.resource.docsDescription")}
                comingSoon
                variant="blue"
              />

              <IconCard 
                icon={ShieldCheck}
                title={t("fuzzing.landing.resource.vulnDbTitle")}
                description={t("fuzzing.landing.resource.vulnDbDescription")}
                href="/playground/abilities"
                ctaText={t("fuzzing.landing.resource.vulnDbCta")}
                variant="purple"
              />

              <IconCard 
                icon={ExternalLink}
                title={t("fuzzing.landing.resource.ocppTitle")}
                description={t("fuzzing.landing.resource.ocppDescription")}
                href="https://www.openchargealliance.org/"
                ctaText={t("fuzzing.landing.resource.ocppCta")}
                variant="cyan"
              />
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
