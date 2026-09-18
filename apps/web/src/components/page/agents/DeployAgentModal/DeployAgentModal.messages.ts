export const enDeployAgentModalMessages = {
  "deploy.modal.title": "Deploy Agent",
  "deploy.modal.subtitle": "Install the Sandcat agent on a target host",
  "deploy.modal.close": "Close",
  "deploy.tab.deploy": "Deploy",
  "deploy.tab.config": "Configuration",

  "deploy.platform.label": "Platform",
  "deploy.platform.linux": "Linux",
  "deploy.platform.windows": "Windows",
  "deploy.platform.darwin": "macOS",

  "deploy.fields.label": "Options",
  "deploy.fields.reset": "Reset to default",
  "deploy.fields.extensionsHint":
    "Comma-separated, e.g. shells,shellcode,donut,proxy_http",

  "deploy.command.default": "Default",
  "deploy.command.copy": "Copy",
  "deploy.command.copied": "Command copied to clipboard",
  "deploy.command.copiedShort": "Copied",
  "deploy.command.copyFailed": "Could not copy to clipboard",
  "deploy.command.downloadScript": "Script",
  "deploy.command.scriptDownloaded": "Saved {filename}",
  "deploy.variations.show": "Variations ({count})",

  "deploy.binary.label": "Agent binary",
  "deploy.binary.description":
    "Download the compiled agent directly, for hosts without curl or outbound access.",
  "deploy.binary.download": "Download binary",
  "deploy.binary.downloading": "Building agent binary…",
  "deploy.binary.failed": "Agent binary download failed",
  "deploy.binary.architecture": "Architecture",

  "deploy.watcher.title": "Agent check-in",
  "deploy.watcher.idle":
    "Copy or download a command, then run it on the target host.",
  "deploy.watcher.waiting": "Waiting for the agent to call back…",
  "deploy.watcher.found": "{host} checked in as {paw}",
  "deploy.watcher.foundToast": "New agent checked in: {host} ({paw})",
  "deploy.watcher.timeout":
    "No new agent checked in after 5 minutes. Check the server address and the host's network access.",
  "deploy.watcher.retry": "Watch again",

  "deploy.state.loading": "Loading deployment commands…",
  "deploy.state.errorTitle": "Could not load deployment commands",
  "deploy.state.emptyTitle": "No Sandcat deployment configured",
  "deploy.state.emptyDescription":
    "The defend API returned no Sandcat install commands for Linux, Windows or macOS.",

  "deploy.config.title": "Agent configuration",
  "deploy.config.description":
    "Defaults applied to every agent that checks in to this server.",
  "deploy.config.implantName": "Implant name",
  "deploy.config.sleepMin": "Beacon min (s)",
  "deploy.config.sleepMax": "Beacon max (s)",
  "deploy.config.watchdog": "Watchdog (s)",
  "deploy.config.untrustedTimer": "Untrusted timer (s)",
  "deploy.config.save": "Save configuration",
  "deploy.config.saving": "Saving…",
  "deploy.config.saved": "Agent configuration saved",
  "deploy.config.saveFailed": "Could not save agent configuration",
  "deploy.config.errBeacon": "Beacon min must be less than or equal to beacon max",
  "deploy.config.errImplant": "Implant name cannot be empty",
  "deploy.config.errNegative": "Value must be 0 or greater",
} as const;

type DeployAgentModalMessageKey = keyof typeof enDeployAgentModalMessages;

export const koDeployAgentModalMessages: Record<
  DeployAgentModalMessageKey,
  string
> = {
  "deploy.modal.title": "에이전트 배포",
  "deploy.modal.subtitle": "대상 호스트에 Sandcat 에이전트를 설치합니다",
  "deploy.modal.close": "닫기",
  "deploy.tab.deploy": "배포",
  "deploy.tab.config": "설정",

  "deploy.platform.label": "플랫폼",
  "deploy.platform.linux": "리눅스",
  "deploy.platform.windows": "윈도우",
  "deploy.platform.darwin": "macOS",

  "deploy.fields.label": "옵션",
  "deploy.fields.reset": "기본값으로 되돌리기",
  "deploy.fields.extensionsHint":
    "쉼표로 구분, 예: shells,shellcode,donut,proxy_http",

  "deploy.command.default": "기본",
  "deploy.command.copy": "복사",
  "deploy.command.copied": "명령어를 클립보드에 복사했습니다",
  "deploy.command.copiedShort": "복사됨",
  "deploy.command.copyFailed": "클립보드에 복사하지 못했습니다",
  "deploy.command.downloadScript": "스크립트",
  "deploy.command.scriptDownloaded": "{filename} 저장됨",
  "deploy.variations.show": "변형 ({count})",

  "deploy.binary.label": "에이전트 바이너리",
  "deploy.binary.description":
    "curl 이나 외부 연결이 없는 호스트를 위해 컴파일된 에이전트를 직접 내려받습니다.",
  "deploy.binary.download": "바이너리 다운로드",
  "deploy.binary.downloading": "에이전트 바이너리 빌드 중…",
  "deploy.binary.failed": "에이전트 바이너리 다운로드에 실패했습니다",
  "deploy.binary.architecture": "아키텍처",

  "deploy.watcher.title": "에이전트 접속",
  "deploy.watcher.idle":
    "명령어를 복사하거나 내려받은 뒤 대상 호스트에서 실행하세요.",
  "deploy.watcher.waiting": "에이전트의 접속을 기다리는 중…",
  "deploy.watcher.found": "{host} 이(가) {paw} 로 접속했습니다",
  "deploy.watcher.foundToast": "새 에이전트 접속: {host} ({paw})",
  "deploy.watcher.timeout":
    "5분 동안 새 에이전트가 접속하지 않았습니다. 서버 주소와 호스트의 네트워크 연결을 확인하세요.",
  "deploy.watcher.retry": "다시 감시",

  "deploy.state.loading": "배포 명령어를 불러오는 중…",
  "deploy.state.errorTitle": "배포 명령어를 불러오지 못했습니다",
  "deploy.state.emptyTitle": "구성된 Sandcat 배포가 없습니다",
  "deploy.state.emptyDescription":
    "defend API 가 리눅스, 윈도우, macOS 용 Sandcat 설치 명령어를 반환하지 않았습니다.",

  "deploy.config.title": "에이전트 설정",
  "deploy.config.description":
    "이 서버에 접속하는 모든 에이전트에 적용되는 기본값입니다.",
  "deploy.config.implantName": "임플란트 이름",
  "deploy.config.sleepMin": "비컨 최소 (초)",
  "deploy.config.sleepMax": "비컨 최대 (초)",
  "deploy.config.watchdog": "워치독 (초)",
  "deploy.config.untrustedTimer": "비신뢰 타이머 (초)",
  "deploy.config.save": "설정 저장",
  "deploy.config.saving": "저장 중…",
  "deploy.config.saved": "에이전트 설정을 저장했습니다",
  "deploy.config.saveFailed": "에이전트 설정을 저장하지 못했습니다",
  "deploy.config.errBeacon": "비컨 최소값은 최대값보다 작거나 같아야 합니다",
  "deploy.config.errImplant": "임플란트 이름은 비워 둘 수 없습니다",
  "deploy.config.errNegative": "0 이상의 값이어야 합니다",
};
