export const enPlaygroundCommandFilterDropdownMessages = {
  "playground.filter.searchCommands": "Search commands",
  "playground.filter.noFilters": "No",
  "playground.filter.filters": "filters",
  "playground.filter.title": "Filter Commands",
  "playground.filter.searchByKeyword": "Search by name, command, description...",
  "playground.filter.loadingFilters": "Loading filters...",
  "playground.filter.platform": "Platform",
  "playground.filter.type": "Type",
  "playground.filter.technique": "Technique",
  "playground.filter.tactic": "Tactic",
  "playground.filter.any": "Any",
  "playground.filter.noOptionsFound": "No options found",
  "playground.filter.searchKeywordHint": "Type a keyword or select filters to search for commands.",
  "playground.filter.noCommandsByKeyword": "No commands found for that keyword.",
  "playground.filter.noCommandsByFilter": "No commands found. Try adjusting your filters.",
  "playground.filter.loadingMore": "Loading more...",
} as const;

type PlaygroundCommandFilterDropdownMessageKey = keyof typeof enPlaygroundCommandFilterDropdownMessages;

export const koPlaygroundCommandFilterDropdownMessages: Record<PlaygroundCommandFilterDropdownMessageKey, string> = {
  "playground.filter.searchCommands": "명령 검색",
  "playground.filter.noFilters": "필터",
  "playground.filter.filters": "개 필터",
  "playground.filter.title": "명령 필터",
  "playground.filter.searchByKeyword": "이름, 명령, 설명으로 검색...",
  "playground.filter.loadingFilters": "필터 로딩 중...",
  "playground.filter.platform": "플랫폼",
  "playground.filter.type": "유형",
  "playground.filter.technique": "기법",
  "playground.filter.tactic": "전술",
  "playground.filter.any": "전체",
  "playground.filter.noOptionsFound": "옵션이 없습니다",
  "playground.filter.searchKeywordHint": "명령을 찾으려면 키워드를 입력하거나 필터를 선택하세요.",
  "playground.filter.noCommandsByKeyword": "해당 키워드의 명령이 없습니다.",
  "playground.filter.noCommandsByFilter": "명령을 찾지 못했습니다. 필터를 조정해보세요.",
  "playground.filter.loadingMore": "더 불러오는 중...",
};
