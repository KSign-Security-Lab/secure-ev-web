"use client";

export type RiskLevel = "HIGH" | "MEDIUM" | "LOW";

export interface Signature {
  id: string;
  patternId: string;
  cwe: string;
  risk: RiskLevel;
  sinkMode: string;
  api: string;
  region: string;
}

export interface StatementFlowStep {
  id: string;
  step: string;
  description: string;
  weight: number;
  tags: string[];
}

export interface SignatureDetail extends Signature {
  sid: string;
  sinkStatement: string;
  bufferVsRequest: {
    capacity: number;
    request: number;
    unit: string;
    details: string;
    destSnippet?: string;
    srcSnippet?: string;
  };
  diagnostic: {
    class: string;
    taint: string;
    validation: {
      upper: boolean;
      lower: boolean;
    };
  };
  codeContext: string;
  statementFlow: StatementFlowStep[];
  semanticTags: string[];
}

export const mockSignatures: Signature[] = [
  {
    id: "1",
    patternId: "CWE122_CWE193_malloc_cpy",
    cwe: "CWE-122",
    risk: "HIGH",
    sinkMode: "COPY_FUNC",
    api: "strcpy",
    region: "HEAP",
  },
  {
    id: "2",
    patternId: "CWE121_CWE131_memcpy",
    cwe: "CWE-121",
    risk: "HIGH",
    sinkMode: "COPY_FUNC",
    api: "memcpy",
    region: "STACK",
  },
  {
    id: "3",
    patternId: "CWE121_CWE129_fget_bad",
    cwe: "CWE-121",
    risk: "HIGH",
    sinkMode: "INDEX_WRITE",
    api: "-",
    region: "STACK",
  },
  {
    id: "4",
    patternId: "CWE122_CWE131_memmove",
    cwe: "CWE-122",
    risk: "HIGH",
    sinkMode: "COPY_FUNC",
    api: "memmove",
    region: "HEAP",
  },
  {
    id: "5",
    patternId: "CWE121_CWE135",
    cwe: "CWE-121",
    risk: "HIGH",
    sinkMode: "COPY_FUNC",
    api: "wcscpy",
    region: "STACK",
  },
  {
    id: "6",
    patternId: "CWE121_char_type_overrun_memcpy",
    cwe: "CWE-121",
    risk: "HIGH",
    sinkMode: "COPY_FUNC",
    api: "memcpy",
    region: "STRUCT",
  },
  {
    id: "7",
    patternId: "CWE121_CWE129_connect_bad",
    cwe: "CWE-121",
    risk: "MEDIUM",
    sinkMode: "INDEX_WRITE",
    api: "-",
    region: "STACK",
  },
  {
    id: "8",
    patternId: "CWE122_CWE193_memcpy_bad",
    cwe: "CWE-122",
    risk: "MEDIUM",
    sinkMode: "COPY_FUNC",
    api: "memcpy",
    region: "HEAP",
  },
  {
    id: "9",
    patternId: "CWE-121_193_char_alloca_cpy",
    cwe: "CWE-121",
    risk: "LOW",
    sinkMode: "COPY_FUNC",
    api: "strcpy",
    region: "STACK",
  },
  {
    id: "10",
    patternId: "CWE122_CWE129_param_origin",
    cwe: "CWE-122",
    risk: "LOW",
    sinkMode: "INDEX_WRITE",
    api: "-",
    region: "HEAP",
  },
];

export const mockSignatureDetails: Record<string, SignatureDetail> = {
  "1": {
    id: "1",
    patternId: "CWE122_CWE193_malloc_cpy",
    sid: "sid-aligned-85636840",
    cwe: "CWE-122",
    risk: "HIGH",
    sinkMode: "COPY_FUNC",
    api: "strcpy",
    region: "HEAP",
    sinkStatement: "strcpy(data, source)",
    bufferVsRequest: {
      capacity: 10,
      request: 11,
      unit: "bytes",
      details: "capacity exceeded: 11B > 10B",
      destSnippet: "dst: malloc(10 * sizeof(char))",
      srcSnippet: "src: char source[10+1]",
    },
    diagnostic: {
      class: "size_gt_capacity",
      taint: "none",
      validation: {
        upper: false,
        lower: false,
      },
    },
    codeContext: `char * data
data = (char *)malloc(10 * sizeof(char))
char source[10+1]
source[10+1] = SRC_STRING
\u25b6 strcpy(data, source)             \u2190 SINK

#DF_RISK: HIGH
#DF_VALIDATION: SIZE_GT_CAPACITY`,
    statementFlow: [
      { id: "s1", step: "declare", description: "char * data", weight: 0.50, tags: [] },
      { id: "s2", step: "declare", description: "char * dataBadBuffer", weight: 0.50, tags: [] },
      { id: "s3", step: "call", description: "ALLOCA((10)*sizeof(char))", weight: 0.66, tags: ["STACK_ALLOC"] },
      { id: "s4", step: "assign", description: "*dataBadBuffer = ALLOCA(...)", weight: 0.64, tags: ["PTR_BIND"] },
      { id: "s8", step: "assign", description: "data = dataBadBuffer", weight: 0.58, tags: ["ASSIGN"] },
      { id: "s10", step: "stack_alloc", description: "char source[10+1]", weight: 0.61, tags: ["STACK_ALLOC"] },
      { id: "s12", step: "SINK", description: "strcpy(data, source)", weight: 0.88, tags: ["SINK:COPY"] },
    ],
    semanticTags: [
      "SINK:COPY:FUNC:STD:strcpy",
      "COPY_SIZE_GT_CAP",
      "STRING_NUL_SENSITIVE",
      "STACK_ALLOC:DYNAMIC",
      "SAFE_ALLOC_SIZEOF",
      "ASSIGN:POINTER_BIND",
      "STACK_ALLOC:STATIC",
      "NUL_TERMINATOR",
    ],
  },
};
