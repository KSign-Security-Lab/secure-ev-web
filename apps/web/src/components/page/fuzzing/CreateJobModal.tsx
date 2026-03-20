"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Check, Zap, Server, Shield } from "lucide-react";
import { Modal } from "~/components/common/Modal/Modal";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";

import { TargetConfigForm } from "./TargetConfigForm";
import { FuzzingParamsForm } from "./FuzzingParamsForm";
import { MessageSelector } from "./MessageSelector";
import trpc from "~/lib/trpc";
import type {
  FuzzingTargetType,
  FuzzingTargetDevice,
  ConnectionConfig,
  FuzzingParameters,
} from "~/types/fuzzing";
import {
  iso15118ConnectionConfigSchema,
  ocppChargerConnectionConfigSchema,
  ocppServerConnectionConfigSchema,
} from "~/server/trpc/schemas/fuzzing";
import { MESSAGES_FROM_CHARGER_GROUPS, MESSAGES_FROM_SERVER_GROUPS } from "~/constants/fuzzingMessages";
import { cn } from "~/lib/utils";
import { useI18n } from "~/i18n/I18nProvider";

interface CreateJobModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (jobId: string) => void;
  jobId?: string;
}

type Step = 1 | 2 | 3 | 4;

export function CreateJobModal({
  open,
  onClose,
  onSuccess,
  jobId,
}: CreateJobModalProps) {
  const { t } = useI18n();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [name, setName] = useState("");
  const [environment, setEnvironment] = useState("dev");
  const [targetDevice, setTargetDevice] = useState<FuzzingTargetDevice | null>(null);
  const [scope, setScope] = useState<string[]>([]);
  const [targetType, setTargetType] = useState<FuzzingTargetType>("ISO15118");
  const [connectionConfig, setConnectionConfig] =
    useState<ConnectionConfig | null>(null);
  const [fuzzingParameters, setFuzzingParameters] =
    useState<FuzzingParameters | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (open && jobId) {
      trpc.fuzzing.getById.query({ jobId })
        .then((job) => {
            setName(job.name);
            setEnvironment(job.environment);
            setTargetType(job.targetType);
            if (job.targetDevice) setTargetDevice(job.targetDevice);
            setScope(job.scope as string[] || []);
            setConnectionConfig(job.connectionConfig as ConnectionConfig);
            setFuzzingParameters(job.fuzzingParameters as FuzzingParameters);
        })
        .catch((err) => {
            // eslint-disable-next-line no-console
            console.error("Failed to fetch job", err);
            setErrors({ submit: t("fuzzing.create.error.loadJob") });
        });
    } else if (open && !jobId) {
        // Reset form if opening in create mode
        setName("");
        setEnvironment("dev");
        setTargetDevice(null);
        setScope([]);
        setTargetType("ISO15118");
        setConnectionConfig(null);
        setFuzzingParameters(null);
        setErrors({});
        setCurrentStep(1);
    }
  }, [open, jobId, t]);

  // Update targetType default based on targetDevice change
  React.useEffect(() => {
    if (targetDevice === "CSMS") {
      setTargetType("OCPP_SERVER");
    } else if (targetDevice === "CHARGER" && targetType === "OCPP_SERVER") {
       // Only reset if we were in server mode
      setTargetType("ISO15118");
    }
  }, [targetDevice, targetType]);

  const totalSteps = 4;

  const validateStep = (step: Step): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!name.trim()) {
        newErrors.name = t("fuzzing.create.validation.jobNameRequired");
      }
      if (!environment.trim()) {
        newErrors.environment = t("fuzzing.create.validation.environmentRequired");
      }
    } else if (step === 2) {
      if (!targetDevice) {
         newErrors.targetDevice = t("fuzzing.create.validation.targetDeviceRequired");
      } else {
        // Only validate config if device is selected
        if (!connectionConfig) {
            newErrors.connectionConfig = t("fuzzing.create.validation.connectionConfigRequired");
        } else {
            let result;
            if (targetType === "ISO15118") {
            result = iso15118ConnectionConfigSchema.safeParse(connectionConfig);
            } else if (targetType === "OCPP_CHARGER") {
            result = ocppChargerConnectionConfigSchema.safeParse(connectionConfig);
            } else {
            result = ocppServerConnectionConfigSchema.safeParse(connectionConfig);
            }

            if (!result.success) {
            newErrors.connectionConfig = result.error.issues[0].message;
            }
        }
      }
    } else if (step === 3) {
      // Validation for Fuzzing Config step
      if (targetType !== "ISO15118" && scope.length === 0) {
        newErrors.scope = t("fuzzing.create.validation.scopeRequired");
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const [isStepTransitioning, setIsStepTransitioning] = useState(false);

  React.useEffect(() => {
    if (isStepTransitioning) {
        const timer = setTimeout(() => setIsStepTransitioning(false), 500);
        return () => clearTimeout(timer);
    }
  }, [isStepTransitioning]);

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < totalSteps) {
        setIsStepTransitioning(true);
        setCurrentStep((prev) => (prev + 1) as Step);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setIsStepTransitioning(true);
      setCurrentStep((prev) => (prev - 1) as Step);
      setErrors({});
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent premature submission via Enter key or other events
    if (currentStep !== totalSteps) {
        handleNext(); // Try to move to next step instead
        return;
    }

    if (!validateStep(4)) {
      return;
    }

    if (!targetDevice) return; // Should be caught by validation, but Type safety

    setIsSubmitting(true);
    try {
      let result;
      
      if (jobId) {
         // Update existing job
         result = await trpc.fuzzing.update.mutate({
            id: jobId,
            name,
            environment,
            targetType,
            targetDevice: targetDevice || undefined,
            scope,
            connectionConfig: connectionConfig!,
            fuzzingParameters: fuzzingParameters || undefined,
         });
      } else {
         // Create new job
         result = await trpc.fuzzing.create.mutate({
            name,
            environment,
            targetType,
            targetDevice: targetDevice || undefined,
            scope,
            connectionConfig: connectionConfig!,
            fuzzingParameters: fuzzingParameters || undefined,
         });
      }
      
      const job = result;

      // Store token in localStorage for later use
      if ("token" in job && typeof job.token === "string") {
        localStorage.setItem(`fuzzing_job_token_${job.id}`, job.token);
      }

      // Reset form (same as before but targetDevice=null)
      setName("");
      setEnvironment("dev");
      setTargetDevice(null);
      setScope([]);
      setTargetType("ISO15118");
      setConnectionConfig(null);
      setFuzzingParameters(null);
      setErrors({});
      setCurrentStep(1);

      // Close modal and call success callback
      onClose();
      if (onSuccess) {
        onSuccess(job.id);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to create job:", error);
      setErrors({
        submit: error instanceof Error ? error.message : t("fuzzing.create.error.createJob"),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      // Reset form on close
      setName("");
      setEnvironment("dev");
      setTargetDevice(null);
      setScope([]);
      setTargetType("ISO15118");
      setConnectionConfig(null);
      setFuzzingParameters(null);
      setErrors({});
      setCurrentStep(1);
      onClose();
    }
  };

  const getStepTitle = (step: Step): string => {
    switch (step) {
      case 1:
        return t("fuzzing.create.step.basicInfo");
      case 2:
        return t("fuzzing.create.step.targetConfig");
      case 3:
        return t("fuzzing.create.step.scopeConfig");
      case 4:
        return t("fuzzing.create.step.fuzzingParams");
      default:
        return "";
    }
  };

  const getStepDescription = (step: Step): string => {
    switch (step) {
      case 1:
        return t("fuzzing.create.stepDesc.basicInfo");
      case 2:
        return t("fuzzing.create.stepDesc.targetConfig");
      case 3:
        if (targetType === "ISO15118") {
          return t("fuzzing.create.stepDesc.scopeIso");
        }
        return targetDevice === "CHARGER" 
          ? t("fuzzing.create.stepDesc.scopeCharger")
          : t("fuzzing.create.stepDesc.scopeCsms");
      case 4:
        return t("fuzzing.create.stepDesc.fuzzingParams");
      default:
        return "";
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="name" className="text-slate-300">
                {t("fuzzing.create.form.jobName")} <span className="text-blue-500">*</span>
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("fuzzing.create.placeholder.jobName")}
                required
                aria-invalid={!!errors.name}
              />
              {errors.name && (
                <p className="text-sm text-red-400">{errors.name}</p>
              )}
            </div>

            <div className="space-y-3">
              <Label htmlFor="environment" className="text-slate-300">
                {t("fuzzing.create.form.environment")} <span className="text-blue-500">*</span>
              </Label>
              <Select value={environment} onValueChange={setEnvironment}>
                <SelectTrigger id="environment" className="w-full bg-slate-900 border-slate-700 text-white focus:ring-blue-500/20">
                  <SelectValue placeholder={t("fuzzing.create.placeholder.environment")} />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700 text-white">
                  <SelectItem value="dev" className="focus:bg-slate-800 focus:text-white">{t("fuzzing.environment.dev")}</SelectItem>
                  <SelectItem value="stage" className="focus:bg-slate-800 focus:text-white">{t("fuzzing.environment.stage")}</SelectItem>
                  <SelectItem value="prod" className="focus:bg-slate-800 focus:text-white">{t("fuzzing.environment.prod")}</SelectItem>
                </SelectContent>
              </Select>
              {errors.environment && (
                <p className="text-sm text-red-400">{errors.environment}</p>
              )}
            </div>
          </div>
        );


      case 2:
        return (
          <div className="space-y-8">
            <div className="space-y-3">
              <Label className="text-slate-300">{t("fuzzing.create.form.targetDevice")} <span className="text-blue-500">*</span></Label>
              <div className="grid grid-cols-2 gap-4">
                 <div
                    onClick={() => {
                        setTargetDevice("CHARGER");
                        setScope([]);
                    }}
                    className={cn(
                        "cursor-pointer rounded-xl border-2 p-4 flex flex-col items-center gap-2 transition-all",
                        targetDevice === "CHARGER"
                            ? "border-blue-500 bg-blue-500/10 text-blue-400"
                            : "border-slate-800 bg-slate-900/50 text-slate-500 hover:border-slate-700"
                    )}
                 >
                    <Zap size={24} />
                    <span className="font-semibold">{t("fuzzing.create.form.targetDeviceCharger")}</span>
                 </div>
                 <div
                    onClick={() => {
                        setTargetDevice("CSMS");
                        setScope([]);
                    }}
                    className={cn(
                        "cursor-pointer rounded-xl border-2 p-4 flex flex-col items-center gap-2 transition-all",
                        targetDevice === "CSMS"
                            ? "border-purple-500 bg-purple-500/10 text-purple-400"
                            : "border-slate-800 bg-slate-900/50 text-slate-500 hover:border-slate-700"
                    )}
                 >
                    <Server size={24} />
                    <span className="font-semibold">{t("fuzzing.create.form.targetDeviceCsms")}</span>
                 </div>
              </div>
              {errors.targetDevice && (
                <p className="text-sm text-red-400">{errors.targetDevice}</p>
              )}
            </div>

            {targetDevice && (
            <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="space-y-4">
              <Label className="text-slate-300">{t("fuzzing.create.form.targetProtocol")} <span className="text-blue-500">*</span></Label>
              <RadioGroup
                value={targetType}
                onValueChange={(value) => {
                  setTargetType(value as FuzzingTargetType);
                  setConnectionConfig(null);
                }}
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
              >
                { targetDevice === "CHARGER" && (
                    <>
                    <div className={cn(
                        "relative flex flex-col items-center gap-3 rounded-xl border-2 p-4 transition-all duration-200 hover:bg-slate-800/50",
                        targetType === "ISO15118"
                            ? "border-blue-500 bg-blue-500/5"
                            : "border-slate-800 bg-slate-900/50 hover:border-slate-700"
                    )}>
                    <RadioGroupItem value="ISO15118" id="iso15118" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    <div className={cn("p-3 rounded-full bg-slate-900", targetType === "ISO15118" ? "text-blue-400 ring-2 ring-blue-500/20" : "text-slate-500")}>
                        <Zap size={24} />
                    </div>
                    <Label htmlFor="iso15118" className="font-medium text-white text-center pointer-events-none">
                        ISO 15118<br/><span className="text-xs text-slate-400 font-normal">{t("fuzzing.create.form.protocolIsoSubtitle")}</span>
                    </Label>
                    </div>

                    <div className={cn(
                        "relative flex flex-col items-center gap-3 rounded-xl border-2 p-4 transition-all duration-200 hover:bg-slate-800/50",
                        targetType === "OCPP_CHARGER"
                            ? "border-cyan-500 bg-cyan-500/5"
                            : "border-slate-800 bg-slate-900/50 hover:border-slate-700"
                    )}>
                    <RadioGroupItem value="OCPP_CHARGER" id="ocpp-charger" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    <div className={cn("p-3 rounded-full bg-slate-900", targetType === "OCPP_CHARGER" ? "text-cyan-400 ring-2 ring-cyan-500/20" : "text-slate-500")}>
                        <Server size={24} />
                    </div>
                    <Label htmlFor="ocpp-charger" className="font-medium text-white text-center pointer-events-none">
                        OCPP<br/><span className="text-xs text-slate-400 font-normal">{t("fuzzing.create.form.protocolOcppChargerSubtitle")}</span>
                    </Label>
                    </div>
                    </>
                )}

                { targetDevice === "CSMS" && (
                    <div className={cn(
                        "relative flex flex-col items-center gap-3 rounded-xl border-2 p-4 transition-all duration-200 hover:bg-slate-800/50",
                        targetType === "OCPP_SERVER"
                            ? "border-purple-500 bg-purple-500/5"
                            : "border-slate-800 bg-slate-900/50 hover:border-slate-700"
                    )}>
                    <RadioGroupItem value="OCPP_SERVER" id="ocpp-server" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    <div className={cn("p-3 rounded-full bg-slate-900", targetType === "OCPP_SERVER" ? "text-purple-400 ring-2 ring-purple-500/20" : "text-slate-500")}>
                        <Shield size={24} />
                    </div>
                    <Label htmlFor="ocpp-server" className="font-medium text-white text-center pointer-events-none">
                        OCPP<br/><span className="text-xs text-slate-400 font-normal">{t("fuzzing.create.form.protocolOcppServerSubtitle")}</span>
                    </Label>
                    </div>
                )}
              </RadioGroup>
            </div>

            <div className="space-y-4">
              <Label className="text-slate-300">{t("fuzzing.create.form.connectionDetails")} <span className="text-blue-500">*</span></Label>
              <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-6">
                <TargetConfigForm
                  key={targetType}
                  targetType={targetType}
                  config={connectionConfig}
                  onChange={setConnectionConfig}
                />
              </div>
              {errors.connectionConfig && (
                <p className="text-sm text-red-400 flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-red-400" />
                  {errors.connectionConfig}
                </p>
              )}
            </div>
            </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
             {targetType === "ISO15118" ? (
                <div className="h-40 flex items-center justify-center rounded-lg border border-dashed border-slate-700 bg-slate-900/30 text-slate-400">
                    <div className="text-center">
                        <p className="text-lg font-medium text-slate-300">{t("fuzzing.create.scope.notSupportedTitle")}</p>
                        <p className="text-sm mt-1">{t("fuzzing.create.scope.notSupportedDescription")}</p>
                    </div>
                </div>
             ) : (
                <>
                <MessageSelector
                    messages={targetDevice === "CHARGER" ? MESSAGES_FROM_SERVER_GROUPS : MESSAGES_FROM_CHARGER_GROUPS}
                    selectedMessages={scope}
                    onChange={setScope}
                    title={targetDevice === "CHARGER" ? t("fuzzing.create.scope.serverToCharger") : t("fuzzing.create.scope.chargerToServer")}
                />
                {errors.scope && (
                  <p className="text-sm text-red-400 mt-2">{errors.scope}</p>
                )}
                </>
             )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="rounded-lg bg-slate-900/50 p-4 border border-slate-800 text-sm text-slate-400">
               {t("fuzzing.create.params.note")}
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-6">
                <FuzzingParamsForm
                parameters={fuzzingParameters}
                onChange={setFuzzingParameters}
                />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title=""
      className="max-w-4xl bg-slate-950 border border-slate-800 shadow-2xl p-0! overflow-hidden [&>div:first-child]:hidden space-y-0!"
    >   
      {/* Custom Header with Gradient */}
      <div className="relative w-full h-1 bg-linear-to-r from-blue-500 via-cyan-500 to-blue-600" />
      
      {/* Custom Title Bar */}
      <div className="flex items-center justify-between px-8 py-6 border-b border-slate-800/50">
        <h2 className="text-xl font-bold text-white">
          {jobId ? t("fuzzing.create.titleEdit") : t("fuzzing.create.titleCreate")}
        </h2>
        <button 
            onClick={handleClose}
            className="text-slate-400 hover:text-white transition-colors"
        >
            <div className="sr-only">{t("fuzzing.create.close")}</div>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      </div>

      <div className="p-8 pt-6">
        {/* Step Indicator */}
        <div className="mb-10">
            <div className="flex items-center justify-between relative z-10">
            {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex flex-col items-center relative z-10 group">
                    <div
                        className={cn(
                        "flex items-center justify-center w-12 h-12 rounded-2xl border-2 transition-all duration-300 shadow-lg",
                        currentStep === step
                            ? "bg-blue-600 border-blue-500 text-white shadow-blue-500/25 scale-110"
                            : currentStep > step
                            ? "bg-slate-900 border-blue-500/50 text-blue-400"
                            : "bg-slate-900 border-slate-800 text-slate-600"
                        )}
                    >
                        {currentStep > step ? (
                        <Check className="w-6 h-6" />
                        ) : (
                        <span className="text-lg font-bold">{step}</span>
                        )}
                    </div>
                    <span
                        className={cn(
                        "mt-3 text-xs font-semibold tracking-wider uppercase transition-colors duration-300",
                        currentStep === step
                            ? "text-blue-400"
                            : currentStep > step
                            ? "text-blue-500/70"
                            : "text-slate-600"
                        )}
                    >
                        {getStepTitle(step as Step)}
                    </span>
                </div>
            ))}
            
            {/* Connecting Lines */}
            <div className="absolute top-6 left-0 w-full h-0.5 bg-slate-800 -z-10" />
            <div 
                className="absolute top-6 left-0 h-0.5 bg-blue-500/50 -z-10 transition-all duration-500"
                style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
            />
            </div>
        </div>

        <form 
            onSubmit={handleSubmit} 
            className="space-y-8"
            onKeyDown={(e) => {
                if (e.key === "Enter" && e.target instanceof HTMLInputElement) {
                    e.preventDefault();
                }
            }}
        >
            <div className="min-h-[400px]">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-white mb-2">{getStepTitle(currentStep)}</h2>
                    <p className="text-slate-400">{getStepDescription(currentStep)}</p>
                </div>
                {renderStepContent()}
            </div>

            {/* Error Message */}
            {errors.submit && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <p className="text-sm text-red-400 font-medium">{errors.submit}</p>
            </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center pt-8 border-t border-slate-800/50">
            <Button
                type="button"
                variant="ghost"
                onClick={handlePrevious}
                disabled={currentStep === 1 || isSubmitting || isStepTransitioning}
                className="text-slate-400 hover:text-white hover:bg-slate-900"
            >
                <ChevronLeft className="w-4 h-4 mr-2" />
                {t("fuzzing.create.button.back")}
            </Button>

            <div className="flex gap-4">
                <Button
                type="button"
                variant="ghost"
                onClick={handleClose}
                disabled={isSubmitting}
                className="text-slate-400 hover:text-white hover:bg-slate-900"
                >
                {t("fuzzing.create.button.cancel")}
                </Button>
                {currentStep < totalSteps ? (
                <Button
                    type="button"
                    onClick={handleNext}
                    disabled={isSubmitting || isStepTransitioning}
                    className="bg-blue-600 hover:bg-blue-500 text-white min-w-[120px]"
                >
                    {t("fuzzing.create.button.next")}
                    <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
                ) : (
                <Button 
                    type="submit" 
                    disabled={isSubmitting || isStepTransitioning}
                    className="bg-blue-600 hover:bg-blue-500 text-white min-w-[140px] shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)]"
                >
                    {isSubmitting ? (
                        <div className="flex items-center gap-2">
                             <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                             <span>{t("fuzzing.create.button.creating")}</span>
                        </div>
                    ) : (
                        jobId ? t("fuzzing.create.button.saveChanges") : t("fuzzing.create.button.launch")
                    )}
                </Button>
                )}
            </div>
            </div>
        </form>
      </div>
    </Modal>
  );
}
