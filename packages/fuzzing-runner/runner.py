import json
import time
import uuid
import argparse
import random
from datetime import datetime, timezone

def generate_mock_report(config):
    job_id = config.get("jobId", str(uuid.uuid4()))
    target_type = config.get("targetType", "ISO15118")
    fuzzing_params = config.get("fuzzingParameters", {})
    
    start_time = datetime.now(timezone.utc).isoformat()
    
    # Simulate scanning duration
    print(f"Starting fuzzing job {job_id} on {target_type}...")
    print("Initializing connection...")
    time.sleep(1) 
    print("Running fuzzing tests...")
    
    # Mock findings generation
    findings = []
    
    # Chance to find vulnerabilities
    if random.random() > 0.3:
        findings.append({
            "id": str(uuid.uuid4()),
            "category": "protocol_violation",
            "severity": "high",
            "title": "Unexpected Header Field",
            "description": "The target accepted a malformed header field that should have been rejected.",
            "evidence": "Header: X-Unknown-Field: A"*50,
            "affectedMessages": ["SessionSetupReq"],
            "recommendation": "Enforce strict schema validation on incoming headers."
        })
        
    if random.random() > 0.7:
        findings.append({
            "id": str(uuid.uuid4()),
            "category": "crash",
            "severity": "critical",
            "title": "Buffer Overflow in XML Parser",
            "description": "Sending a large payload caused the connection to drop unexpectedly.",
            "evidence": "<Value>" + "A"*5000 + "</Value>",
            "affectedMessages": ["AuthorizeReq"],
            "recommendation": "Implement bounds checking on XML element values."
        })

    statistics = {
        "totalCases": random.randint(100, 1000),
        "crashes": len([f for f in findings if f["category"] == "crash"]),
        "timeouts": random.randint(0, 5),
        "uniqueFindings": len(findings)
    }
    
    end_time = datetime.now(timezone.utc).isoformat()
    
    report = {
        "jobId": job_id,
        "targetType": target_type,
        "startedAt": start_time,
        "finishedAt": end_time,
        "fuzzingParameters": fuzzing_params,
        "statistics": statistics,
        "findings": findings,
        "rawLogLocation": "/var/log/fuzzing/run.log"
    }
    
    return report

def main():
    parser = argparse.ArgumentParser(description="Standalone Fuzzing Runner")
    parser.add_argument("config", help="Path to the job configuration JSON file")
    parser.add_argument("--output", "-o", default="report.json", help="Path where to save the JSON report")
    
    args = parser.parse_args()
    
    try:
        with open(args.config, "r") as f:
            config = json.load(f)
            
        report = generate_mock_report(config)
        
        with open(args.output, "w") as f:
            json.dump(report, f, indent=2)
            
        print(f"Fuzzing completed using config: {args.config}")
        print(f"Report generated at: {args.output}")
        
    except FileNotFoundError:
        print(f"Error: Config file '{args.config}' not found.")
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    main()
