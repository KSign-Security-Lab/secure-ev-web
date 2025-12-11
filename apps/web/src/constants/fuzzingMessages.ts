export const MESSAGES_FROM_CHARGER_GROUPS = {
  "Core Profile": [
    "Authorize",
    "BootNotification",
    "DataTransfer", // Upstream
    "Heartbeat",
    "MeterValues",
    "StartTransaction",
    "StatusNotification",
    "StopTransaction",
  ],
  "Firmware": [
    "DiagnosticsStatusNotification",
    "FirmwareStatusNotification",
  ],
};

export const MESSAGES_FROM_SERVER_GROUPS = {
  "Core Profile": [
    "ChangeAvailability",
    "ChangeConfiguration",
    "ClearCache",
    "DataTransfer", // Downstream
    "GetConfiguration",
    "RemoteStartTransaction",
    "RemoteStopTransaction",
    "Reset",
    "UnlockConnector",
  ],
  "Firmware": [
    "GetDiagnostics",
    "UpdateFirmware",
  ],
  "Smart Charging": [
    "ClearChargingProfile",
    "GetCompositeSchedule",
    "SetChargingProfile",
  ],
  "Reservation": [
    "CancelReservation",
    "ReserveNow",
  ],
  "Local Auth": [
    "GetLocalListVersion",
    "SendLocalList",
  ],
  "Remote Trigger": [
    "TriggerMessage",
  ],
};

// Flattened versions for backward compatibility or easy iteration if needed (optional)
export const MESSAGES_FROM_CHARGER = Object.values(MESSAGES_FROM_CHARGER_GROUPS).flat();
export const MESSAGES_FROM_SERVER = Object.values(MESSAGES_FROM_SERVER_GROUPS).flat();
