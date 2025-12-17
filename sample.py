import json
import uuid
import random
from datetime import datetime, timedelta

# --- Configuration ---
OUTPUT_FILENAME = "fuzzing_report_1000_runs.json"
NUM_RUNS = 1000
JOB_ID = str(uuid.uuid4())
START_TIME = datetime.utcnow()

# --- Constants & Fuzz Vectors ---
OCPP_ACTIONS = [
    "BootNotification", "Heartbeat", "Authorize", "StartTransaction", 
    "StopTransaction", "MeterValues", "StatusNotification", "DataTransfer"
]

# Strings simulating various attack vectors
FUZZ_PAYLOADS = [
    # SQL Injection
    "' OR '1'='1",
    "admin'; DROP TABLE users; --",
    # Buffer Overflow / Large Payloads
    "A" * 1024,
    "A" * 10000,
    # XSS / Script Injection
    "<script>alert(1)</script>",
    "javascript:void(0)",
    # Format String
    "%s%s%s%s%s",
    # Integer Overflows
    999999999999999999999,
    -1,
    # Special Characters
    "\x00\x01\x02",
    "😊😊😊😊",
    # Empty/Null
    "",
    None
]

STATUS_WEIGHTS = ["ok"] * 70 + ["error"] * 25 + ["timeout"] * 5

def generate_timestamp(offset_seconds):
    return (START_TIME + timedelta(seconds=offset_seconds)).isoformat() + "Z"

def generate_fuzz_input(action):
    """Generates a mock OCPP message, occasionally inserting fuzz vectors."""
    msg_id = str(uuid.uuid4())[:8]
    
    # 20% chance to insert a raw fuzz string directly, 
    # 80% chance to put it inside a valid JSON structure
    if random.random() < 0.2:
        payload = random.choice(FUZZ_PAYLOADS)
        # Raw malformed packet
        return f"[2, \"{msg_id}\", \"{action}\", {payload}]"
    else:
        # Structured packet with potentially fuzzy values
        val = random.choice(FUZZ_PAYLOADS)
        if action == "Authorize":
            data = {"idTag": val}
        elif action == "BootNotification":
            data = {"chargePointVendor": "VendorX", "chargePointModel": val}
        elif action == "StartTransaction":
            data = {"connectorId": 1, "idTag": "Tag1", "meterStart": val if isinstance(val, int) else 0, "timestamp": datetime.utcnow().isoformat()}
        else:
            data = {"key": val}
            
        return json.dumps([2, msg_id, action, data])

def generate_fuzz_output(input_str, result_type):
    """Generates a mock output based on the result type."""
    if result_type == "timeout":
        return ""
    elif result_type == "error":
        return json.dumps([4, "UnknownId", "ProtocolError", "Payload parsing failed", {}])
    else:
        # Success response
        return json.dumps([3, "UnknownId", {"status": "Accepted"}])

def generate_runs(count):
    runs = []
    for i in range(count):
        action = random.choice(OCPP_ACTIONS)
        result = random.choice(STATUS_WEIGHTS)
        
        inp = generate_fuzz_input(action)
        out = generate_fuzz_output(inp, result)
        
        run = {
            "type": action,
            "input": inp,
            "output": out,
            "result": result
        }
        runs.append(run)
    return runs

def main():
    # Construct the full FuzzingJobWithReport object
    data = {
        "id": JOB_ID,
        "name": f"Automated Fuzzing Run - {NUM_RUNS} Iterations",
        "targetType": "OCPP_CHARGER",
        "targetDevice": "CHARGER",
        "environment": "CI/CD Pipeline Runner",
        "connectionConfig": {
            "listenIp": "127.0.0.1",
            "port": 9220,
            "ocppVersion": "1.6J",
            "websocketPath": "/ocpp"
        },
        "fuzzingParameters": {
            "duration": NUM_RUNS * 0.5, # approx 0.5s per run
            "maxTestCases": NUM_RUNS,
            "aggressivenessLevel": "high",
            "mutatePayloadFields": True,
            "timingJitter": True
        },
        "scope": OCPP_ACTIONS,
        "status": "COMPLETED",
        "createdAt": START_TIME.isoformat() + "Z",
        "updatedAt": generate_timestamp(NUM_RUNS * 0.5),
        "report": {
            "jobId": JOB_ID,
            "targetType": "OCPP_CHARGER",
            "startedAt": START_TIME.isoformat() + "Z",
            "finishedAt": generate_timestamp(NUM_RUNS * 0.5),
            "fuzzingParameters": {
                "duration": NUM_RUNS * 0.5,
                "maxTestCases": NUM_RUNS,
                "aggressivenessLevel": "high",
                "mutatePayloadFields": True,
                "timingJitter": True
            },
            "rawLogLocation": f"/var/logs/fuzzer/{JOB_ID}.log",
            "runs": generate_runs(NUM_RUNS)
        }
    }

    # Write to file
    with open(OUTPUT_FILENAME, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)
    
    print(f"✅ Successfully generated {OUTPUT_FILENAME} with {NUM_RUNS} runs.")

if __name__ == "__main__":
    main()