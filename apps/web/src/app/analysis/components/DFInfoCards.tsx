"use client";

import React from "react";
import { DfInfo } from "./mockData";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

interface DFInfoCardsProps {
  dfInfo: DfInfo;
}

const PropRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between items-center py-1 text-sm border-b border-[#30363d] last:border-0">
    <span className="text-[#8b949e]">{label}</span>
    <span className="font-mono text-[#8b949e] truncate max-w-[60%] text-right" title={value}>
      {value}
    </span>
  </div>
);

export default function DFInfoCards({ dfInfo }: DFInfoCardsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
      {/* Destination */}
      <Card className="bg-[#0d1117] border-[#30363d]">
        <CardHeader className="p-3 border-b border-[#30363d]">
          <CardTitle className="text-sm font-semibold text-[#79c0ff]">Destination</CardTitle>
        </CardHeader>
        <CardContent className="p-3">
          <PropRow label="expr" value={dfInfo.destination.expr} />
          <PropRow label="base_name" value={dfInfo.destination.base_name} />
          <PropRow label="region" value={dfInfo.destination.region} />
          <PropRow label="path_kind" value={dfInfo.destination.path_kind} />
        </CardContent>
      </Card>

      {/* Capacity */}
      <Card className="bg-[#0d1117] border-[#30363d]">
        <CardHeader className="p-3 border-b border-[#30363d]">
          <CardTitle className="text-sm font-semibold text-[#56d364]">Capacity</CardTitle>
        </CardHeader>
        <CardContent className="p-3">
          <PropRow label="expr" value={dfInfo.capacity.expr} />
          <PropRow label="token" value={dfInfo.capacity.token} />
          <PropRow label="value" value={dfInfo.capacity.value} />
          <PropRow label="length_basis" value={dfInfo.capacity.length_basis} />
        </CardContent>
      </Card>

      {/* Request */}
      <Card className="bg-[#0d1117] border-[#30363d]">
        <CardHeader className="p-3 border-b border-[#30363d]">
          <CardTitle className="text-sm font-semibold text-[#bc8cff]">Request</CardTitle>
        </CardHeader>
        <CardContent className="p-3">
          <PropRow label="bytes.expr" value={dfInfo.request.bytes.expr} />
          <PropRow label="token" value={dfInfo.request.token} />
          <PropRow label="value" value={dfInfo.request.value} />
          <PropRow label="length_basis" value={dfInfo.request.length_basis} />
        </CardContent>
      </Card>

      {/* Validation */}
      <Card className="bg-[#0d1117] border-[#30363d]">
        <CardHeader className="p-3 border-b border-[#30363d]">
          <CardTitle className="text-sm font-semibold text-[#d29922]">Validation</CardTitle>
        </CardHeader>
        <CardContent className="p-3">
          <PropRow label="lower" value={dfInfo.validation.lower} />
          <PropRow label="upper" value={dfInfo.validation.upper} />
          <PropRow label="upper_vs_capacity" value={dfInfo.validation.upper_vs_capacity} />
          <PropRow label="index_origin_chain" value={dfInfo.validation.index_origin_chain} />
        </CardContent>
      </Card>

      {/* Diagnostics */}
      <Card className="bg-[#0d1117] border-[#30363d]">
        <CardHeader className="p-3 border-b border-[#30363d]">
          <CardTitle className="text-sm font-semibold text-[#ff7b72]">Diagnostics</CardTitle>
        </CardHeader>
        <CardContent className="p-3">
          <PropRow label="class" value={dfInfo.diagnostics.class} />
          <PropRow label="overflow_risk" value={dfInfo.diagnostics.overflow_risk} />
          <PropRow label="notes" value={dfInfo.diagnostics.notes} />
        </CardContent>
      </Card>

      {/* Root Cause */}
      <Card className="bg-[#0d1117] border-[#30363d]">
        <CardHeader className="p-3 border-b border-[#30363d]">
          <CardTitle className="text-sm font-semibold text-[#d29922]">Root Cause</CardTitle>
        </CardHeader>
        <CardContent className="p-3">
          <PropRow label="kind" value={dfInfo.root_cause.kind} />
          <PropRow label="class_family" value={dfInfo.root_cause.class_family} />
        </CardContent>
      </Card>
    </div>
  );
}
