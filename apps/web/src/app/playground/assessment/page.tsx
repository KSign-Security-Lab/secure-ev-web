"use client";

import { useState } from "react";
import { SaveIcon, Trash2 } from "lucide-react";
import SearchInput from "~/components/common/SearchInput/SearchInput";
import { Pagination } from "~/components/common/Pagination/Pagination";
import { useI18n } from "~/i18n/I18nProvider";
import { AssessmentTable, type AssessmentItem } from "~/components/page/playground/Assessment/AssessmentTable";

const MOCK_DATA: AssessmentItem[] = [
  {
    id: "1",
    name: "충전기 운영환경 방어 성능 평가",
    target: "CSMS, CP",
    attackCount: 11,
    repeatCount: 2,
    lastExecutionDate: "2026-04-10",
  },
  {
    id: "2",
    name: "충전기 보안성능 평가",
    target: "CP",
    attackCount: 4,
    repeatCount: 0,
    lastExecutionDate: null,
  },
];

export default function AssessmentPage() {
  const { t } = useI18n();
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 1;

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Simple filter for mock data
  const filteredData = MOCK_DATA.filter((item) =>
    item.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="flex flex-col w-full bg-base-900 p-8 rounded-xl shadow-2xl border border-white/5">
      {/* Top Controls */}
      <div className="flex justify-between w-full items-center mb-6">
        <div className="w-120">
          <SearchInput onSearch={handleSearch} />
        </div>

        <div className="flex space-x-3">
          <button className="px-4 py-2 bg-primary-500/10 text-primary-400 border border-primary-500/30 flex items-center rounded-lg hover:bg-primary-500/20 hover:border-primary-500/50 transition-all active:scale-95 shadow-lg shadow-primary-500/10">
            <SaveIcon className="w-4 h-4 mr-2" />
            <span className="text-sm font-semibold tracking-wide uppercase">
              {t("assessment.page.register")}
            </span>
          </button>
          <button className="px-4 py-2 bg-danger-500/10 text-danger-500 border border-danger-500/30 flex items-center rounded-lg hover:bg-danger-500/20 hover:border-danger-500/50 transition-all active:scale-95 shadow-lg shadow-danger-500/10">
            <Trash2 className="w-4 h-4 mr-2" />
            <span className="text-sm font-semibold tracking-wide uppercase">
              {t("assessment.page.delete")}
            </span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1 min-h-0 bg-base-950/30 rounded-lg overflow-hidden border border-white/5">
        {filteredData.length > 0 ? (
          <AssessmentTable data={filteredData} />
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-neutral-500 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="w-16 h-16 mb-4 rounded-full bg-base-800 flex items-center justify-center border border-white/5">
              <Trash2 className="w-8 h-8 opacity-20" />
            </div>
            <p className="text-lg font-medium">{t("assessment.page.empty")}</p>
          </div>
        )}
      </div>

      {/* Pagination Container */}
      {totalPages > 1 && (
        <div className="mt-8 pt-6 border-t border-white/5">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}
