"use client";

import { useState } from "react";
import { SaveIcon, Trash2 } from "lucide-react";
import { useI18n } from "~/i18n/I18nProvider";
import { AssessmentTable, type AssessmentItem } from "~/components/page/playground/Assessment/AssessmentTable";
import { PageHeader } from "~/components/common/PageHeader/PageHeader";
import { FilterBar } from "~/components/common/FilterBar/FilterBar";
import { Button } from "~/components/ui/button";

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
    <div className="flex flex-col w-full gap-4">
      <PageHeader
        title={t("assessment.page.title")}
        subtitle={t("assessment.page.subtitle")}
        badge="Playground"
        actions={
          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2 border-slate-700/50 hover:bg-slate-800">
              <Trash2 className="w-4 h-4 text-red-500" />
              <span className="uppercase text-[10px] font-bold tracking-widest">{t("assessment.page.delete")}</span>
            </Button>
            <Button variant="tinted" className="gap-2 bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20">
              <SaveIcon className="w-4 h-4" />
              <span className="uppercase text-[10px] font-bold tracking-widest">{t("assessment.page.register")}</span>
            </Button>
          </div>
        }
      />

      <div className="flex flex-col gap-6 min-h-0 min-w-0">
        <FilterBar 
          handleSearch={handleSearch} 
          searchPlaceholder={t("assessment.page.searchPlaceholder")}
          className="bg-slate-900/50"
        />

        <div className="flex-1">
          <AssessmentTable 
            data={filteredData} 
            pagination={{
              currentPage,
              totalPages,
              onPageChange: handlePageChange,
              totalCount: filteredData.length
            }}
          />
        </div>
      </div>
    </div>
  );
}
