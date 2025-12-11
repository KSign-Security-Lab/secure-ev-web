

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CheckCircle2, Plug, Zap, FileText, BookOpen, ExternalLink, ShieldCheck } from "lucide-react";
import { Reveal } from "~/components/common/Reveal";
import { Button } from "~/components/ui/button";
import { GlassCard } from "~/components/ui/glass-card";
import { Badge } from "~/components/ui/badge";
import { RecentFuzzingStats } from "~/components/page/fuzzing/RecentFuzzingStats";

export default function FuzzingLandingPage() {
  return (
    <div className="flex flex-col w-full min-h-screen bg-slate-950 text-white font-sans selection:bg-blue-500/30">
      {/* Hero Section */}
      <section className="relative w-full px-6 md:px-24 pt-20 pb-20 flex flex-col md:flex-row items-center gap-16 justify-between">
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
           <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px]" />
           <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px]" />
        </div>

        {/* Text Left */}
        <div className="flex-1 space-y-8 z-10">
          {/* World's First Badge */}
          {/* World's First Badge */}
          <Badge variant="blue" className="mt-4 border-blue-500/30">
            <span className="flex h-2 w-2 rounded-full bg-blue-400 mr-2 animate-pulse"></span>
              The World's First Native Fuzzer for OCPP & EV Charging Networks
          </Badge>

          <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-tight">
            EV Charger Infrastructure{" "}
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Fuzzing
            </span>
          </h1>
          <p className="text-lg md:text-xl text-slate-400 max-w-lg leading-relaxed">
            Backed by KSign's 25 years of security expertise. Automated vulnerability detection for the next generation of electric mobility.
          </p>
          
          <div className="pt-4">
            <Link href="/fuzzing/jobs">
              <Button 
                size="lg" 
                className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-6 text-lg rounded-full shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:shadow-[0_0_30px_rgba(59,130,246,0.6)] transition-all duration-300 border border-blue-400/20"
              >
                Create Fuzzing Job
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Image Right */}
        <div className="flex-1 relative z-10 flex justify-center">
            <div className="relative w-full max-w-2xl aspect-square flex items-center justify-center">
                {/* Glow effect specific to image */}
                <div className="absolute inset-0 bg-blue-500/20 blur-[60px] rounded-full scale-75 transform translate-y-4" />
                <Image 
                    src="/assets/fuzzing/ev-hero-shield.png" 
                    alt="EV Security Shield"
                    width={800}
                    height={800}
                    style={{ 
                        maskImage: "linear-gradient(to bottom, transparent, black 10%, black 90%, transparent), linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
                        maskComposite: "intersect",
                        WebkitMaskImage: "linear-gradient(to bottom, transparent, black 10%, black 90%, transparent), linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
                        WebkitMaskComposite: "source-in"
                    }}
                    className="object-contain drop-shadow-[0_0_60px_rgba(59,130,246,0.3)] relative z-10 transform scale-110"
                />
            </div>
        </div>
      </section>

      {/* Supported Protocols Strip */}
      <section className="w-full border-y border-slate-800/60 bg-slate-900/30 backdrop-blur-md">
        <Reveal width="100%">
        <div className="max-w-7xl mx-auto px-6 py-20">
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
                {["OCPP 1.6J", "OCPP 2.0.1", "ISO 15118", "WebSocket Secure (WSS)"].map((protocol) => (
                    <div key={protocol} className="flex items-center space-x-2 group cursor-default">
                        <CheckCircle2 className="w-5 h-5 text-blue-500 group-hover:text-cyan-400 transition-colors" />
                        <span className="text-lg font-bold text-slate-300 group-hover:text-white transition-colors">{protocol}</span>
                    </div>
                ))}
            </div>
        </div>
        </Reveal>
      </section>

      {/* Recent Jobs Section */}
      <section className="w-full px-6 md:px-24 py-16 bg-slate-950 border-b border-slate-800/50">
        <Reveal width="100%">
          <div className="max-w-7xl mx-auto">
             <RecentFuzzingStats />
          </div>
        </Reveal>
      </section>

      {/* Why Fuzzing Matters */}
      <section className="w-full px-6 md:px-24 pt-24 pb-24 bg-slate-900 relative z-10">
        <Reveal width="100%">
        <div className="max-w-4xl mx-auto text-center mb-16 space-y-8 py-12">
            <h2 className="text-3xl md:text-5xl font-bold">
                Beyond Standard <span className="text-blue-400">Compliance</span>
            </h2>
            <p className="text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto">
                Attackers don't follow the spec. Neither should your tests. We identify zero-day vulnerabilities in OCPP implementations that standard validators miss.
            </p>
        </div>
        </Reveal>
        
        {/* Feature Cards (Bento Grid) - Repurposed here */}
        <div className="w-full">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Card 1 */}
                {/* Card 1 */}
                <GlassCard className="p-8">
                    <div className="mb-6 w-40 h-40 relative flex items-center justify-center rounded-2xl bg-blue-500/10 group-hover:scale-105 transition-transform duration-300 overflow-hidden">
                         <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                         <Image 
                            src="/assets/fuzzing/icon-protocol-fuzzing.png" 
                            alt="Protocol" 
                            width={200} 
                            height={200}
                            style={{ 
                                maskImage: "linear-gradient(to bottom, transparent, black 10%, black 90%, transparent), linear-gradient(to right, transparent, black 20%, black 80%, transparent)",
                                maskComposite: "intersect",
                                WebkitMaskImage: "linear-gradient(to bottom, transparent, black 10%, black 90%, transparent), linear-gradient(to right, transparent, black 20%, black 80%, transparent)",
                                WebkitMaskComposite: "source-in"
                            }}
                            className="object-contain w-full h-full p-2" 
                         />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">Protocol Fuzzing</h3>
                    <p className="text-slate-400 leading-relaxed">
                        Deep inspection of OCPP 1.6/2.0.1 and custom implementation logic to uncover protocol-level flaws.
                    </p>
                </GlassCard>

                {/* Card 2 */}
                {/* Card 2 */}
                <GlassCard variant="cyan" className="p-8">
                     <div className="mb-6 w-40 h-40 relative flex items-center justify-center rounded-2xl bg-cyan-500/10 group-hover:scale-105 transition-transform duration-300 overflow-hidden">
                         <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                         <Image 
                            src="/assets/fuzzing/icon-vulnerability-detection.png" 
                            alt="Vulnerability" 
                            width={200} 
                            height={200}
                            style={{ 
                                maskImage: "linear-gradient(to bottom, transparent, black 10%, black 90%, transparent), linear-gradient(to right, transparent, black 20%, black 80%, transparent)",
                                maskComposite: "intersect",
                                WebkitMaskImage: "linear-gradient(to bottom, transparent, black 10%, black 90%, transparent), linear-gradient(to right, transparent, black 20%, black 80%, transparent)",
                                WebkitMaskComposite: "source-in"
                            }}
                            className="object-contain w-full h-full p-2"
                         />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">Vulnerability Detection</h3>
                    <p className="text-slate-400 leading-relaxed">
                        Automated detection of buffer overflows, injection vectors, and logic bypasses in real-time.
                    </p>
                </GlassCard>

                {/* Card 3 */}
                {/* Card 3 */}
                <GlassCard className="p-8">
                     <div className="mb-6 w-40 h-40 relative flex items-center justify-center rounded-2xl bg-blue-500/10 group-hover:scale-105 transition-transform duration-300 overflow-hidden">
                         <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                         <Image 
                            src="/assets/fuzzing/icon-ocpp-security.png" 
                            alt="OCPP" 
                            width={200} 
                            height={200}
                            style={{ 
                                maskImage: "linear-gradient(to bottom, transparent, black 10%, black 90%, transparent), linear-gradient(to right, transparent, black 20%, black 80%, transparent)",
                                maskComposite: "intersect",
                                WebkitMaskImage: "linear-gradient(to bottom, transparent, black 10%, black 90%, transparent), linear-gradient(to right, transparent, black 20%, black 80%, transparent)",
                                WebkitMaskComposite: "source-in"
                            }}
                            className="object-contain w-full h-full p-2"
                        />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">OCPP Security</h3>
                    <p className="text-slate-400 leading-relaxed">
                        Validation limits and security conformance testing specifically tailored for EV charging infrastructure.
                    </p>
                </GlassCard>
            </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="w-full px-6 md:px-24 py-20 bg-slate-900/20 relative">
         <Reveal width="100%">
         <div className="max-w-7xl mx-auto">
             <div className="text-center mb-16">
                 <h2 className="text-3xl md:text-5xl font-bold mb-4">How It Works</h2>
                 <p className="text-slate-400 text-lg">Secure your infrastructure in three simple steps.</p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                 {/* Connector Line (Desktop) */}
                 <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-blue-900/0 via-blue-500/30 to-blue-900/0 -z-10" />

                 {/* Step 1 */}
                 <div className="relative flex flex-col items-center text-center group">
                     <div className="w-24 h-24 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-6 shadow-xl group-hover:border-blue-500/50 group-hover:shadow-[0_0_30px_rgba(59,130,246,0.2)] transition-all duration-300">
                         <Plug className="w-12 h-12 text-blue-500" />
                     </div>
                     <h3 className="text-xl font-bold text-white mb-3">Connect</h3>
                     <p className="text-slate-400 leading-relaxed max-w-xs">
                        Link your CSMS or Charging Station (EVSE) via our secure proxy.
                     </p>
                 </div>

                 {/* Step 2 */}
                 <div className="relative flex flex-col items-center text-center group">
                     <div className="w-24 h-24 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-6 shadow-xl group-hover:border-cyan-500/50 group-hover:shadow-[0_0_30px_rgba(6,182,212,0.2)] transition-all duration-300">
                         <Zap className="w-12 h-12 text-cyan-500" />
                     </div>
                     <h3 className="text-xl font-bold text-white mb-3">Attack</h3>
                     <p className="text-slate-400 leading-relaxed max-w-xs">
                        Select from pre-built fuzzing vectors (SQL Injection, Buffer Overflow, Malformed Packets).
                     </p>
                 </div>

                 {/* Step 3 */}
                 <div className="relative flex flex-col items-center text-center group">
                     <div className="w-24 h-24 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-6 shadow-xl group-hover:border-blue-500/50 group-hover:shadow-[0_0_30px_rgba(59,130,246,0.2)] transition-all duration-300">
                         <FileText className="w-12 h-12 text-blue-500" />
                     </div>
                     <h3 className="text-xl font-bold text-white mb-3">Analyze</h3>
                     <p className="text-slate-400 leading-relaxed max-w-xs">
                        Receive real-time reports with actionable remediation steps.
                     </p>
                 </div>
             </div>
          </div>
         </Reveal>
      </section>

      {/* Resources Section */}
      <section className="w-full px-6 md:px-24 py-20 bg-slate-900 border-t border-slate-800">
        <Reveal width="100%">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">Resources</h2>
              <p className="text-slate-400 text-lg">Documentation and guides to help you get started.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               <GlassCard className="p-8 hover:bg-slate-800/50 transition-colors group">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-6 text-blue-400 group-hover:text-blue-300 group-hover:scale-110 transition-all">
                     <BookOpen size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Documentation</h3>
                  <p className="text-slate-400 mb-6">Comprehensive guides on setting up your first fuzzing job and interpreting results.</p>
                  <span className="inline-flex items-center text-slate-500 cursor-not-allowed font-medium">
                     Coming Soon
                  </span>
               </GlassCard>

               <GlassCard className="p-8 hover:bg-slate-800/50 transition-colors group">
                  <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mb-6 text-purple-400 group-hover:text-purple-300 group-hover:scale-110 transition-all">
                     <ShieldCheck size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Vulnerability Database</h3>
                  <p className="text-slate-400 mb-6">Explore our database of known EV charging vulnerabilities and CVEs.</p>
                  <Link href="/abilities" className="inline-flex items-center text-purple-400 hover:text-purple-300 font-medium">
                     Browse Database <ArrowRight size={16} className="ml-2" />
                  </Link>
               </GlassCard>

               <GlassCard className="p-8 hover:bg-slate-800/50 transition-colors group">
                  <div className="w-12 h-12 bg-cyan-500/10 rounded-lg flex items-center justify-center mb-6 text-cyan-400 group-hover:text-cyan-300 group-hover:scale-110 transition-all">
                     <ExternalLink size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">OCPP Compliance</h3>
                  <p className="text-slate-400 mb-6">Official OCA tools and compliance testing guidelines for OCPP 1.6 & 2.0.1.</p>
                  <a href="https://www.openchargealliance.org/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-cyan-400 hover:text-cyan-300 font-medium">
                     Visit OCA <ExternalLink size={16} className="ml-2" />
                  </a>
               </GlassCard>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Stats Bar (Footer) */}
      <section className="w-full mt-auto border-t border-slate-800/60 bg-slate-900/30 backdrop-blur-md">
        <Reveal width="100%" delay={500}>
        <div className="w-full px-6 md:px-24 py-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-slate-800/50">
                 <div className="flex flex-col items-center text-center space-y-2 pt-4 md:pt-0">
                    <h4 className="text-xl font-bold text-white mb-2">Automated Efficiency</h4>
                    <p className="text-sm text-slate-400 max-w-xs mx-auto">Reduce manual testing efforts with fully autonomous fuzzing pipelines designed for CI/CD.</p>
                 </div>
                 <div className="flex flex-col items-center text-center space-y-2 pt-4 md:pt-0">
                    <h4 className="text-xl font-bold text-blue-400 mb-2">Deep Inspection</h4>
                    <p className="text-sm text-slate-400 max-w-xs mx-auto">Comprehensive analysis of OCPP 1.6J, 2.0.1, and ISO 15118 message structures.</p>
                 </div>
                 <div className="flex flex-col items-center text-center space-y-2 pt-4 md:pt-0">
                    <h4 className="text-xl font-bold text-white mb-2">Zero Noise</h4>
                    <p className="text-sm text-slate-400 max-w-xs mx-auto">Deterministic logic ensures every reported finding is a reproducible vulnerability.</p>
                 </div>
            </div>
        </div>
        </Reveal>
      </section>
    </div>
  );
}
