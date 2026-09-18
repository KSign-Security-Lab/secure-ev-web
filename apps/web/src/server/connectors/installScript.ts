import type { ConnectorAdapter } from "./types";

/**
 * Fluent Bit release the generated scripts install. Bump both together.
 * https://packages.fluentbit.io/windows/
 */
const FLUENT_BIT_VERSION = "5.1.1";

/**
 * One step of the install guide: prose the operator reads, then the exact
 * commands to copy. Keeping them apart lets the UI show a docs-style block
 * with the code isolated for a clean copy.
 */
export interface InstallStep {
  title: string;
  body: string;
  code: string;
}

function buildConfig(
  adapter: ConnectorAdapter,
  ingestUrl: string,
  token: string,
  isWindows: boolean
): string {
  const inputs = adapter.agentInputs ?? [];
  const url = new URL(ingestUrl);

  const inputStanzas = inputs
    .map((input) =>
      input.type === "winevtlog"
        ? [
            "[INPUT]",
            "    Name         winevtlog",
            `    Channels     ${input.target}`,
            `    Tag          ${input.tag}`,
            "    Interval_Sec 5",
            // Without a DB the plugin re-reads the channel from scratch on
            // every restart, which duplicates everything already collected.
            `    DB           ${input.dbPath ?? "fluent-bit-winevtlog.sqlite"}`,
            "    Read_Existing_Events false",
          ].join("\n")
        : [
            "[INPUT]",
            "    Name             tail",
            `    Path             ${input.target}`,
            `    Tag              ${input.tag}`,
            "    Refresh_Interval 5",
            // One offset DB per input: several tail inputs sharing a single
            // SQLite file contend for its lock inside the same process.
            `    DB               ${input.dbPath ?? `/var/lib/fluent-bit/${input.tag}.db`}`,
            ...(input.parser ? [`    Parser           ${input.parser}`] : []),
          ].join("\n")
    )
    .join("\n\n");

  // The http output does not send the tag, so Defender and Firewall events
  // would otherwise arrive indistinguishable under one integration key.
  const tagStanzas = inputs
    .map((input) =>
      [
        "[FILTER]",
        "    Name   record_modifier",
        `    Match  ${input.tag}`,
        `    Record source ${input.tag}`,
      ].join("\n")
    )
    .join("\n\n");

  return [
    "[SERVICE]",
    "    Flush        5",
    "    Daemon       Off",
    "    Log_Level    info",
    // Never rely on the service manager to keep the agent's output. A Windows
    // service discards stdout, and journald refuses new streams once it hits
    // its connection limit (seen on a busy Ubuntu host: 4096 streams, output
    // silently lost). A file is the one place diagnostics reliably survive.
    `    Log_File     ${isWindows ? "C:\\Program Files\\fluent-bit\\fluent-bit.log" : "/var/log/fluent-bit-bas.log"}`,
    ...(inputs.some((i) => i.parser)
      ? ["    Parsers_File /etc/fluent-bit/parsers.conf"]
      : []),
    "",
    inputStanzas,
    "",
    tagStanzas,
    "",
    "[OUTPUT]",
    "    Name          http",
    "    Match         *",
    `    Host          ${url.hostname}`,
    `    Port          ${url.port || (url.protocol === "https:" ? "443" : "80")}`,
    `    URI           ${url.pathname}`,
    ...(url.protocol === "https:" ? ["    tls           On"] : []),
    "    Format        json",
    "    Json_Date_Key collectedAt",
    // Reusing a keep-alive socket the server already closed while idle fails
    // the flush, and with the default single retry the chunk is dropped for
    // good. Verified on a Windows host: 2 of 9 events lost before, 0 after.
    "    net.keepalive off",
    "    Retry_Limit   5",
    `    Header        Authorization Bearer ${token}`,
    `    Header        X-Integration-Key ${adapter.key}`,
  ].join("\n");
}

/**
 * The install guide as ordered steps for an AGENT-mode product, mirroring how
 * Caldera hands out Sandcat deploy commands: the operator runs each block on
 * the host that holds the logs, and no agent code lives here. The ingest token
 * is embedded so /api/ingest can authenticate the host.
 */
export function buildInstallSteps(
  adapter: ConnectorAdapter,
  ingestUrl: string,
  token: string
): InstallStep[] {
  const inputs = adapter.agentInputs ?? [];
  const isWindows = inputs.some((input) => input.type === "winevtlog");
  const config = buildConfig(adapter, ingestUrl, token, isWindows);

  if (isWindows) {
    const installer = `fluent-bit-${FLUENT_BIT_VERSION}-win64.exe`;
    return [
      {
        title: "1. Fluent Bit 설치",
        body: "대상 Windows 호스트에서 관리자 권한 PowerShell(관리자로 실행)을 열고 아래를 실행하세요.",
        code: [
          `Invoke-WebRequest -Uri "https://packages.fluentbit.io/windows/${installer}" -OutFile "$env:TEMP\\${installer}"`,
          `Start-Process -Wait -FilePath "$env:TEMP\\${installer}" -ArgumentList "/S"`,
        ].join("\n"),
      },
      {
        title: "2. 수집 설정 작성",
        body: "아래를 실행하면 인증 토큰이 포함된 설정 파일이 생성됩니다. 그대로 붙여넣으세요.",
        code: [
          "$cfg = @'",
          config,
          "'@",
          '$cfg | Set-Content -Path "C:\\Program Files\\fluent-bit\\conf\\bas.conf" -Encoding ASCII',
        ].join("\n"),
      },
      {
        title: "3. 서비스 등록 및 시작",
        body: "부팅 시 자동 실행되는 Windows 서비스로 등록하고 시작합니다.",
        code: [
          `$binPath = '"C:\\Program Files\\fluent-bit\\bin\\fluent-bit.exe" -c "C:\\Program Files\\fluent-bit\\conf\\bas.conf"'`,
          "New-Service -Name 'fluent-bit-bas' -DisplayName 'Fluent Bit (BAS ingest)' -BinaryPathName $binPath -StartupType Automatic",
          "Start-Service -Name 'fluent-bit-bas'",
        ].join("\n"),
      },
      {
        title: "4. 확인",
        body: "서비스 상태를 확인합니다. STATE가 RUNNING이면 정상이며, 잠시 후 이 화면의 상태가 정상으로 바뀝니다.",
        code: "sc.exe query fluent-bit-bas",
      },
      {
        title: "문제 확인 / 정리",
        body: "로그가 올라오지 않으면 진단 로그를 확인하세요. 테스트를 끝낼 때는 정리 명령을 실행합니다.",
        code: [
          "# 진단",
          "Get-Content 'C:\\Program Files\\fluent-bit\\fluent-bit.log' -Tail 50",
          "# 정리",
          "Stop-Service fluent-bit-bas; sc.exe delete fluent-bit-bas",
        ].join("\n"),
      },
    ];
  }

  return [
    {
      title: "1. Fluent Bit 설치",
      body: "대상 호스트에서 root로(sudo -i) 아래를 실행하세요.",
      code: "curl -fsSL https://raw.githubusercontent.com/fluent/fluent-bit/master/install.sh | sh",
    },
    {
      title: "2. 수집 설정 작성",
      body: "아래를 실행하면 인증 토큰이 포함된 설정 파일이 생성됩니다. 그대로 붙여넣으세요.",
      code: [
        "mkdir -p /var/lib/fluent-bit",
        "cat > /etc/fluent-bit/bas.conf <<'FLUENTBIT'",
        config,
        "FLUENTBIT",
      ].join("\n"),
    },
    {
      title: "3. 서비스 등록 및 시작",
      body: "부팅 시 자동 실행되는 systemd 서비스로 등록하고 시작합니다.",
      code: [
        "cat > /etc/systemd/system/fluent-bit-bas.service <<'UNIT'",
        "[Unit]",
        "Description=Fluent Bit (BAS ingest)",
        "After=network-online.target",
        "Wants=network-online.target",
        "",
        "[Service]",
        "ExecStart=/opt/fluent-bit/bin/fluent-bit -c /etc/fluent-bit/bas.conf",
        "Restart=always",
        "RestartSec=5",
        "",
        "[Install]",
        "WantedBy=multi-user.target",
        "UNIT",
        "systemctl daemon-reload",
        "systemctl enable --now fluent-bit-bas",
      ].join("\n"),
    },
    {
      title: "4. 확인",
      body: "서비스가 active이면 정상이며, 잠시 후 이 화면의 상태가 정상으로 바뀝니다.",
      code: "systemctl is-active fluent-bit-bas",
    },
    {
      title: "문제 확인 / 정리",
      body: "로그가 올라오지 않으면 진단 로그를 확인하세요. 테스트를 끝낼 때는 정리 명령을 실행합니다.",
      code: [
        "# 진단",
        "tail -n 50 /var/log/fluent-bit-bas.log",
        "# 정리",
        "systemctl disable --now fluent-bit-bas; rm /etc/systemd/system/fluent-bit-bas.service; systemctl daemon-reload",
      ].join("\n"),
    },
  ];
}
