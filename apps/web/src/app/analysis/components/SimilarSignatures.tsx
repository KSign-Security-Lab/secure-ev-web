"use client";

import React from "react";
import { mockSimilarSignatures, AnalysisResult } from "./mockData";
import { Badge } from "~/components/ui/badge";
import { Search } from "lucide-react";

interface SimilarSignaturesProps {
  result: AnalysisResult;
}

export default function SimilarSignatures({ result }: SimilarSignaturesProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-gray-950 p-4 rounded-lg border border-gray-800">
        <div>
          <h3 className="text-lg font-semibold text-gray-200">Similarity Candidates</h3>
          <p className="text-sm text-gray-500 mt-1">Found {mockSimilarSignatures.length} functionally similar signatures</p>
        </div>
        <Badge variant="blue">Target: {result.functionName}</Badge>
      </div>

      <div className="space-y-4">
        {mockSimilarSignatures.map((sim, idx) => (
          <div key={sim.id} className="border border-gray-800 bg-gray-900 rounded-lg p-5 hover:border-gray-700 transition-colors cursor-pointer">

            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center space-x-3 mb-1">
                  <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded font-mono">Rank #{idx + 1}</span>
                  <h4 className="font-semibold text-gray-200">{sim.functionName}</h4>
                </div>
                <p className="text-sm text-gray-500 font-mono">{sim.filePath}</p>
              </div>
              <button className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded transition" onClick={() => alert("Compare Runs feature is a placeholder and will be implemented later.")}>
                Compare Runs
              </button>
            </div>

            <div className="bg-gray-950 rounded p-3 mb-4">
              <p className="text-sm text-gray-300">
                <span className="text-blue-400 font-medium mr-2">Why Similar:</span>
                {sim.whySimilar}
              </p>
            </div>

            <div>
              <h5 className="text-xs uppercase text-gray-500 font-semibold mb-2">4-Axis Similarity Breakdown</h5>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-gray-800 rounded p-2 text-center">
                  <div className="text-lg font-mono text-green-400">{sim.scores.embedding}%</div>
                  <div className="text-xs text-gray-500 mt-1">Embedding</div>
                </div>
                <div className="bg-gray-800 rounded p-2 text-center">
                  <div className="text-lg font-mono text-blue-400">{sim.scores.tag}%</div>
                  <div className="text-xs text-gray-500 mt-1">TAG</div>
                </div>
                <div className="bg-gray-800 rounded p-2 text-center">
                  <div className="text-lg font-mono text-purple-400">{sim.scores.df}%</div>
                  <div className="text-xs text-gray-500 mt-1">DF Flow</div>
                </div>
                <div className="bg-gray-800 rounded p-2 text-center">
                  <div className="text-lg font-mono text-yellow-400">{sim.scores.core}%</div>
                  <div className="text-xs text-gray-500 mt-1">Core Logic</div>
                </div>
              </div>
            </div>

          </div>
        ))}
        {mockSimilarSignatures.length === 0 && (
          <div className="flex flex-col items-center justify-center p-12 text-gray-500 border border-gray-800 border-dashed rounded-lg bg-gray-900/50">
            <Search className="w-12 h-12 mb-4 text-gray-700" />
            <p>No similar signatures found for this analysis run.</p>
          </div>
        )}
      </div>
    </div>
  );
}
