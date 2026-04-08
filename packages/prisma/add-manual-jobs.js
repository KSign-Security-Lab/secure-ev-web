const { PrismaClient } = require('./src');

const prisma = new PrismaClient();

async function main() {
  console.log("Adding manual fuzzing jobs...");

  // 1. Create Good Job
  const goodJob = await prisma.fuzzingJob.create({
    data: {
      name: "OCPP-Charger-Security-Audit-Pass",
      targetType: "OCPP_CHARGER",
      environment: "Simulation",
      status: "COMPLETED",
      authTokenHash: "dummy-hash-good",
      connectionConfig: {
        listenIp: "127.0.0.1",
        port: 8080,
        ocppVersion: "1.6J",
        websocketPath: "/ocpp",
        chargePointIdentity: "CP001"
      },
      fuzzingParameters: {
        duration: 60,
        maxTestCases: 100,
        aggressivenessLevel: "low"
      }
    }
  });

  await prisma.fuzzingReport.create({
    data: {
      jobId: goodJob.id,
      payload: {
        jobId: goodJob.id,
        targetType: "OCPP_CHARGER",
        startedAt: new Date(Date.now() - 3600000).toISOString(),
        finishedAt: new Date().toISOString(),
        fuzzingParameters: {
          duration: 60,
          maxTestCases: 100,
          aggressivenessLevel: "low"
        },
        runs: [
          { type: "Authorize", input: "[2, \"1\", \"Authorize\", {\"idTag\": \"TAG123\"}]", output: "[3, \"1\", {\"status\": \"Accepted\"}]", result: "ok" },
          { type: "BootNotification", input: "[2, \"2\", \"BootNotification\", {\"chargePointVendor\": \"Vendor\", \"chargePointModel\": \"Model\"}]", output: "[3, \"2\", {\"status\": \"Accepted\"}]", result: "ok" },
          { type: "Heartbeat", input: "[2, \"3\", \"Heartbeat\", {}]", output: "[3, \"3\", {}]", result: "ok" },
          { type: "StatusNotification", input: "[2, \"4\", \"StatusNotification\", {\"connectorId\": 1, \"errorCode\": \"NoError\", \"status\": \"Available\"}]", output: "[3, \"4\", {}]", result: "ok" },
          { type: "MeterValues", input: "[2, \"5\", \"MeterValues\", {\"connectorId\": 1, \"meterValue\": []}]", output: "[3, \"5\", {}]", result: "ok" }
        ]
      }
    }
  });
  console.log(`Created Good Job: ${goodJob.id}`);

  // 2. Create Vulnerable Job
  const vulnerableJob = await prisma.fuzzingJob.create({
    data: {
      name: "OCPP-Charger-Fuzzing-Vulnerabilities",
      targetType: "OCPP_CHARGER",
      environment: "Simulation",
      status: "COMPLETED",
      authTokenHash: "dummy-hash-vulnerable",
      connectionConfig: {
        listenIp: "192.168.1.50",
        port: 8888,
        ocppVersion: "1.6J",
        websocketPath: "/ws/ocpp",
        chargePointIdentity: "VULN-CHARGER-01"
      },
      fuzzingParameters: {
        duration: 300,
        maxTestCases: 1000,
        aggressivenessLevel: "high"
      }
    }
  });

  await prisma.fuzzingReport.create({
    data: {
      jobId: vulnerableJob.id,
      payload: {
        jobId: vulnerableJob.id,
        targetType: "OCPP_CHARGER",
        startedAt: new Date(Date.now() - 7200000).toISOString(),
        finishedAt: new Date(Date.now() - 3600000).toISOString(),
        fuzzingParameters: {
          duration: 300,
          maxTestCases: 1000,
          aggressivenessLevel: "high"
        },
        runs: [
          { type: "BootNotification", input: "[2, \"10\", \"BootNotification\", {\"chargePointVendor\": \"Vendor\", \"chargePointModel\": \"' OR '1'='1\"}]", output: "", result: "timeout" },
          { type: "Authorize", input: "[2, \"11\", \"Authorize\", {\"idTag\": \"A\".repeat(5000)}]", output: "[4, \"11\", \"ProtocolError\", \"Payload parsing failed\", {}]", result: "error" },
          { type: "Heartbeat", input: "[2, \"12\", \"Heartbeat\", \"<script>alert('XSS')</script>\"]", output: "[3, \"12\", {}]", result: "ok" },
          { type: "StatusNotification", input: "[2, \"13\", \"StatusNotification\", {\"key\": {\"nested\": \"json\"}}]", output: "[4, \"13\", \"ProtocolError\", \"Payload parsing failed\", {}]", result: "error" },
          { type: "DataTransfer", input: "[2, \"14\", \"DataTransfer\", {\"vendorId\": \"%s%s%s%s%s\"}]", output: "", result: "timeout" },
          { type: "StartTransaction", input: "[2, \"15\", \"StartTransaction\", {\"connectorId\": 1, \"idTag\": \"' OR 1=1 --\"}]", output: "", result: "timeout" }
        ]
      }
    }
  });
  console.log(`Created Vulnerable Job: ${vulnerableJob.id}`);
  
  console.log("Done.");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
