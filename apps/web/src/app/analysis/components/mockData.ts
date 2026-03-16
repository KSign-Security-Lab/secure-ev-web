export interface DfInfo {
  destination: {
    expr: string;
    base_name: string;
    region: string;
    path_kind: string;
  };
  capacity: {
    expr: string;
    token: string;
    value: string;
    length_basis: string;
  };
  request: {
    bytes: { expr: string };
    token: string;
    value: string;
    length_basis: string;
  };
  validation: {
    lower: string;
    upper: string;
    upper_vs_capacity: string;
    index_origin_chain: string;
  };
  diagnostics: {
    class: string;
    overflow_risk: string;
    notes: string;
  };
  root_cause: {
    kind: string;
    class_family: string;
  };
}

export interface AnalysisResult {
  id: string;
  variant: string;
  status: "New" | "Open" | "Fixed" ;
  risk: "High" | "Medium" | "Low";
  sinkKind: "COPY_FUNC" | "INDEX_WRITE" | "MALLOC";
  functionName: string;
  filePath: string;
  lineInfo: string;
  startLine: number;
  endLine: number;
  dfInfo: DfInfo;
  evidenceRefs: string[];
}

export interface MockFile {
  path: string;
  type: "text" | "binary" | "large" | "unsupported";
  content?: string;
}

export const mockFiles: MockFile[] = [
  {
    path: "src/parser/network.c",
    type: "text",
    content: `#include <stdio.h>
#include <string.h>

void init_network() {
    printf("Network initialized.\\n");
}

int validate_packet(char* packet) {
    if (packet == NULL) return 0;
    return 1;
}

void process_data(char* data) {
    printf("Processing: %s\\n", data);
}

void handle_user_input(char* input) {
  char buffer[256];
  // Risk: Potential buffer overflow if input length > 256
  strcpy(buffer, input);
  process_data(buffer);
}

int main() {
    init_network();
    return 0;
}`,
  },
  {
    path: "src/core/registry.c",
    type: "text",
    content: `#include "registry.h"

#define REGISTRY_MAX_SIZE 1024
int registry_array[REGISTRY_MAX_SIZE];

void init_registry() {
    for(int i=0; i<REGISTRY_MAX_SIZE; i++) {
        registry_array[i] = 0;
    }
}

int update_registry(int index, int val) {
  if (index < 0) return -1;
  // Risk: Upper bound check missing
  registry_array[index] = val;
  return 0;
}

int get_registry(int index) {
    if (index >= 0 && index < REGISTRY_MAX_SIZE) {
        return registry_array[index];
    }
    return -1;
}`,
  },
  {
    path: "src/utils/logger.c",
    type: "text",
    content: `#include <stdio.h>
#include <string.h>

void write_log(const char* log) {
    printf("[LOG] %s\\n", log);
}

void log_event(const char* msg) {
  char log_buf[512];
  strncpy(log_buf, msg, sizeof(log_buf) - 1);
  log_buf[sizeof(log_buf) - 1] = '\\0';
  write_log(log_buf);
}
`,
  },
  {
    path: "src/assets/logo.png",
    type: "binary",
  },
  {
    path: "src/data/huge_dataset.csv",
    type: "large",
  }
];

export const mockResults: AnalysisResult[] = [
  {
    id: "vuln-5",
    variant: "Variant B",
    status: "New",
    risk: "Medium",
    sinkKind: "HARDCODED_SECRET",
    functionName: "connect_to_db",
    filePath: "src/utils/config.js",
    lineInfo: "10-12",
    startLine: 10,
    endLine: 12,
    evidenceRefs: ["EVD-999"],
    dfInfo: {
      diagnostics: {
        class: "Use of Hard-coded Credentials",
        notes: "A hardcoded API key was detected in the source code.",
        confidence: "High",
        impact: "Exposure of sensitive authentication material."
      },
      root_cause: {
        kind: "Hardcoded Secret",
        class_family: "Configuration"
      }
    }
  },
  {
    id: "res-001",
    variant: "Variant A",
    status: "New",
    risk: "High",
    sinkKind: "COPY_FUNC",
    functionName: "handle_user_input",
    filePath: "src/parser/network.c",
    lineInfo: "L15",
    startLine: 15,
    endLine: 20,
    evidenceRefs: ["Trace #412", "CFG Node 84"],
    dfInfo: {
      destination: {
        expr: "buffer",
        base_name: "buffer",
        region: "Stack",
        path_kind: "Direct",
      },
      capacity: {
        expr: "256",
        token: "256",
        value: "256",
        length_basis: "Constant",
      },
      request: {
        bytes: { expr: "strlen(input)" },
        token: "input",
        value: "Unknown",
        length_basis: "Tainted Input",
      },
      validation: {
        lower: "None",
        upper: "None",
        upper_vs_capacity: "Unbounded",
        index_origin_chain: "network_socket -> handle_user_input",
      },
      diagnostics: {
        class: "Buffer Overflow",
        overflow_risk: "Critical",
        notes: "No bounds checking prior to strcpy",
      },
      root_cause: {
        kind: "Missing Validation",
        class_family: "Input Handling",
      },
    },
  },
  {
    id: "res-002",
    variant: "Variant B",
    status: "Open",
    risk: "Medium",
    sinkKind: "INDEX_WRITE",
    functionName: "update_registry",
    filePath: "src/core/registry.c",
    lineInfo: "L10",
    startLine: 10,
    endLine: 15,
    evidenceRefs: ["Trace #88", "DFG Node 12"],
    dfInfo: {
      destination: {
        expr: "registry_array[index]",
        base_name: "registry_array",
        region: "Heap",
        path_kind: "Array Index",
      },
      capacity: {
        expr: "REGISTRY_MAX_SIZE",
        token: "REGISTRY_MAX_SIZE",
        value: "1024",
        length_basis: "Macro",
      },
      request: {
        bytes: { expr: "sizeof(int)" },
        token: "val",
        value: "4",
        length_basis: "Type Size",
      },
      validation: {
        lower: "index >= 0",
        upper: "None",
        upper_vs_capacity: "Unbounded",
        index_origin_chain: "API Call -> index parameter",
      },
      diagnostics: {
        class: "Out of Bounds Write",
        overflow_risk: "High",
        notes: "Upper bound validation missing for 'index'",
      },
      root_cause: {
        kind: "Incomplete Validation",
        class_family: "Array Access",
      },
    },
  },
  {
    id: "res-003",
    variant: "Variant C",
    status: "Fixed",
    risk: "Low",
    sinkKind: "COPY_FUNC",
    functionName: "log_event",
    filePath: "src/utils/logger.c",
    lineInfo: "L8",
    startLine: 8,
    endLine: 13,
    evidenceRefs: ["Trace #12", "Commit abc1234"],
    dfInfo: {
      destination: {
        expr: "log_buf",
        base_name: "log_buf",
        region: "Stack",
        path_kind: "Direct",
      },
      capacity: {
        expr: "sizeof(log_buf)",
        token: "512",
        value: "512",
        length_basis: "Constant",
      },
      request: {
        bytes: { expr: "strlen(msg)" },
        token: "msg",
        value: "Unknown",
        length_basis: "Parameter",
      },
      validation: {
        lower: "None",
        upper: "min(strlen(msg), 511)",
        upper_vs_capacity: "Safe",
        index_origin_chain: "Caller -> msg",
      },
      diagnostics: {
        class: "Safe Copy",
        overflow_risk: "None",
        notes: "Properly bounded strncpy used",
      },
      root_cause: {
        kind: "N/A",
        class_family: "N/A",
      },
    },
  },
];

export const mockSimilarSignatures = [
  {
    id: "sim-1",
    functionName: "parse_header",
    filePath: "src/parser/http.c",
    scores: {
      embedding: 94,
      tag: 88,
      df: 91,
      core: 96,
    },
    whySimilar: "Both functions lack upper bounds checking before a strcpy operation from an external socket read.",
  },
  {
    id: "sim-2",
    functionName: "read_config",
    filePath: "src/core/config.c",
    scores: {
      embedding: 82,
      tag: 75,
      df: 85,
      core: 80,
    },
    whySimilar: "Similar destination region (Stack) and missing capacity validation.",
  },
];
