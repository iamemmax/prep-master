"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { SmallSpinner } from "@/components/ui/Spinner";
import { ErrorModal } from "@/components/ui/ErrorModal";
import { useErrorModalState } from "@/hooks";
import { formatAxiosErrorMessage } from "@/utils";
import { AxiosError } from "axios";
import { Plus, Trash2, Search, Calendar } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Control,
  Controller,
  FieldErrors,
  UseFormRegister,
  useFieldArray,
  useForm,
  useWatch,
} from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { getNames } from "country-list";
import { useGetExamsByCountry } from "@/app/(auth)/apis/signup/getExamsByCountry";
import { useUpdateUserExams } from "../../util/apis/dashboard/updateUserExams";
import { useGetPracticeExamConfig } from "../../util/apis/practice/fetchExamConfig";
import toast from "react-hot-toast";

const COUNTRIES = getNames().sort((a, b) => a.localeCompare(b));
const LEVELS = ["Beginner", "Intermediate", "Advanced"] as const;

const examConfigSchema = z.object({
  country: z.string().min(1, "Country is required"),
  exam_type_id: z.number({ message: "Please select an exam" }).int().positive(),
  exam_date: z.string().optional(),
  target_score: z.string().min(1, "Target score is required"),
  daily_study_hours: z
    .number({ message: "Must be a number" })
    .min(0.5, "Min 0.5 hour")
    .max(24, "Max 24 hours"),
  current_level: z.enum(LEVELS, { message: "Pick your current level" }),
  send_progress_report: z.boolean(),
});

const updateExamsSchema = z.object({
  exams: z.array(examConfigSchema).min(1, "Add at least one exam"),
});

type UpdateExamsForm = z.output<typeof updateExamsSchema>;
type ExamRowValue = UpdateExamsForm["exams"][number];

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function UpdateExamsModal({ open, onClose }: Props) {
  const {
    isErrorModalOpen,
    setErrorModalState,
    openErrorModalWithMessage,
    errorModalMessage,
  } = useErrorModalState();

  const { data: configResp, isLoading: loadingConfig } = useGetPracticeExamConfig();

  // This modal is add-only: existing exams are never pre-filled into the form;
  // it always opens with a fresh empty row so the user can register a new
  // exam. Existing exam_type_ids are tracked separately so the picker can
  // hide exams the user has already added.
  const existingExamTypeIds = useMemo(
    () =>
      new Set(
        // Backend can occasionally return entries with a null exam_type (e.g.
        // a freshly-created config row before the join hydrates). Skip those
        // rather than crashing the whole render.
        (configResp?.data ?? [])
          .filter((entry) => entry.exam_type != null)
          .map((entry) => entry.exam_type.id),
      ),
    [configResp],
  );

  const defaultValues: UpdateExamsForm = useMemo(
    () => ({ exams: [emptyRow()] }),
    [],
  );

  const {
    control,
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm<UpdateExamsForm>({
    resolver: zodResolver(updateExamsSchema),
    defaultValues,
  });

  // Re-seed the form whenever the modal opens or the server-side config
  // changes, so we never show stale rows from a previous edit.
  useEffect(() => {
    if (open) reset(defaultValues);
  }, [open, defaultValues, reset]);

  const { fields, append, remove } = useFieldArray({ control, name: "exams" });

  // Watch the whole exams array at the parent — each row gets its country
  // passed down as a prop. (Per-row useWatch on a field-array path inside a
  // sub-component is unreliable; this mirrors how the onboarding screen does
  // it, where useWatch sits next to the form root.)
  const watchedExams = useWatch({ control, name: "exams" }) ?? [];

  const { mutate: save, isPending } = useUpdateUserExams();

  function onSubmit(data: UpdateExamsForm) {
    const payload = data.exams.map((e) => ({
      country: e.country,
      exam_type_id: e.exam_type_id,
      exam_date: e.exam_date || null,
      target_score: e.target_score || null,
      daily_study_hours: e.daily_study_hours ?? null,
      current_level: e.current_level || null,
      send_progress_report: e.send_progress_report,
    }));
    save(payload, {
      onSuccess: () => {
        toast.success(payload.length > 1 ? "Your new exams have been added." : "Your new exam has been added.");
        onClose();
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onError: (error: any) => {
        const message =
          error?.response?.data?.errors?.message ||
          error?.response?.data?.message ||
          formatAxiosErrorMessage(error as AxiosError) ||
          "Couldn't update your exams. Please try again.";
        openErrorModalWithMessage(String(message));
      },
    });
  }

  return (
    <>
      <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
        <DialogContent
          className="sm:max-w-2xl max-h-[90dvh] overflow-hidden p-0 bg-white dark:bg-zinc-900"
          showCloseButton={false}
          style={{ zIndex: 9999 }}
        >
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col max-h-[90dvh]">
            <DialogHeader className="px-6 pt-5 pb-4 border-b border-slate-100 dark:border-zinc-800 shrink-0">
              <DialogTitle className="text-base font-semibold text-slate-900 dark:text-zinc-100">
                Add a new exam
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 dark:text-zinc-400">
                Register a new exam for your study plan. Exams already in your profile won&apos;t appear in the list.
              </DialogDescription>
            </DialogHeader>

            <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4 bg-slate-50/50 dark:bg-zinc-950/40">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                  Exams · <span className="tabular-nums text-slate-700 dark:text-zinc-200">{fields.length}</span>
                </p>
                <button
                  type="button"
                  onClick={() => append(emptyRow())}
                  className="inline-flex items-center gap-1 h-7 px-2.5 rounded-md text-[11px] font-semibold text-indigo-600 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors"
                >
                  <Plus size={12} /> Add exam
                </button>
              </div>

              {errors.exams?.message && (
                <p className="text-[11px] text-rose-500">{errors.exams.message}</p>
              )}

              <div className="space-y-3">
                {fields.map((field, idx) => {
                  // Hide exams already in the user's profile *and* exams
                  // picked in any other row of this form, so the same exam
                  // can never be added twice.
                  const otherRowIds = watchedExams
                    .map((r, i) => (i !== idx ? r?.exam_type_id : undefined))
                    .filter((v): v is number => typeof v === "number");
                  const excluded = new Set<number>([
                    ...existingExamTypeIds,
                    ...otherRowIds,
                  ]);
                  return (
                    <ExamConfigRow
                      key={field.id}
                      idx={idx}
                      excludedExamTypeIds={excluded}
                      control={control}
                      register={register}
                      errors={errors}
                      canRemove={fields.length > 1}
                      onRemove={() => remove(idx)}
                    />
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center gap-2 px-6 py-3 border-t border-slate-100 dark:border-zinc-800 shrink-0 bg-white dark:bg-zinc-900">
              <Button
                type="button"
                onClick={onClose}
                variant="outline"
                className="flex-1 h-10 text-sm border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-200 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending || loadingConfig}
                className="flex-1 h-10 text-sm font-semibold inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {isPending ? <>Adding <SmallSpinner /></> : loadingConfig ? <>Loading <SmallSpinner /></> : "Add exam"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ErrorModal
        isErrorModalOpen={isErrorModalOpen}
        setErrorModalState={() => setErrorModalState(false)}
        subheading={errorModalMessage || "Please check your inputs and try again."}
      />
    </>
  );
}

// ─── Row ─────────────────────────────────────────────────────────────────────

interface RowProps {
  idx: number;
  /** Exam type ids that should be hidden from this row's picker (already in
   *  the user's profile, or picked in another row of the form). */
  excludedExamTypeIds: Set<number>;
  control: Control<UpdateExamsForm>;
  register: UseFormRegister<UpdateExamsForm>;
  errors: FieldErrors<UpdateExamsForm>;
  canRemove: boolean;
  onRemove: () => void;
}

function ExamConfigRow({ idx, excludedExamTypeIds, control, register, errors, canRemove, onRemove }: RowProps) {
  const rowErr = errors.exams?.[idx];
  const { data: examsResp, isLoading: loadingExams } = useGetExamsByCountry();
  const allExams = useMemo(() => examsResp?.data ?? [], [examsResp]);
  const examOptions = useMemo(
    () => allExams.filter((e) => !excludedExamTypeIds.has(e.id)),
    [allExams, excludedExamTypeIds],
  );
  const allExamsAlreadyAdded =
    !loadingExams && allExams.length > 0 && examOptions.length === 0;

  // Merge RHF's ref with our own so we can imperatively call showPicker() on
  // the native date input from a custom button.
  const dateInputRef = useRef<HTMLInputElement | null>(null);
  const dateReg = register(`exams.${idx}.exam_date`);

  return (
    <div className="group rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900/60 p-4 shadow-xs hover:border-slate-300 dark:hover:border-zinc-600 transition-colors">
      <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-slate-100 dark:border-zinc-800">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-wide text-slate-700 dark:text-zinc-200">
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-indigo-100 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 text-[10px] tabular-nums">
            {idx + 1}
          </span>
          Exam configuration
        </span>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 dark:text-zinc-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
            aria-label={`Remove exam ${idx + 1}`}
          >
            <Trash2 size={12} /> Remove
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-3">
        {/* Country */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">Country</label>
          <Controller
            name={`exams.${idx}.country`}
            control={control}
            render={({ field }) => (
              <CountrySelectWithSearch
                value={field.value}
                onValueChange={field.onChange}
                hasError={!!rowErr?.country}
              />
            )}
          />
          {rowErr?.country && (
            <p className="mt-1 text-[11px] text-rose-500">{rowErr.country.message}</p>
          )}
        </div>

        {/* Exam — searchable, independent of country */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">Exam</label>
          <Controller
            name={`exams.${idx}.exam_type_id`}
            control={control}
            render={({ field }) => (
              <ExamSelectWithSearch
                options={examOptions}
                value={field.value ? String(field.value) : ""}
                onValueChange={(v) => field.onChange(Number(v))}
                disabled={loadingExams || allExamsAlreadyAdded}
                placeholder={
                  loadingExams
                    ? "Loading exams…"
                    : allExamsAlreadyAdded
                    ? "You've added every available exam"
                    : "Select exam"
                }
                emptyHint={
                  allExamsAlreadyAdded
                    ? "You've added every available exam"
                    : "No exams available"
                }
                hasError={!!rowErr?.exam_type_id}
              />
            )}
          />
          {rowErr?.exam_type_id && (
            <p className="mt-1 text-[11px] text-rose-500">{rowErr.exam_type_id.message}</p>
          )}
        </div>

        {/* Exam date */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">Exam date</label>
          <div className="relative">
            <Input
              type="date"
              {...dateReg}
              ref={(el) => { dateReg.ref(el); dateInputRef.current = el; }}
              className={`h-10 text-xs bg-slate-50 dark:bg-zinc-800/50 dark:text-zinc-100 pr-9 [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-inner-spin-button]:hidden ${rowErr?.exam_date ? "border-rose-500" : ""}`}
            />
            <button
              type="button"
              onClick={() => {
                const el = dateInputRef.current;
                if (!el) return;
                if (typeof el.showPicker === "function") el.showPicker();
                else el.focus();
              }}
              aria-label="Open date picker"
              tabIndex={-1}
              className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center justify-center w-6 h-6 rounded-md text-slate-500 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors"
            >
              <Calendar size={14} />
            </button>
          </div>
          {rowErr?.exam_date && (
            <p className="mt-1 text-[11px] text-rose-500">{rowErr.exam_date.message}</p>
          )}
        </div>

        {/* Target score */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">Target score</label>
          <Input
            type="text"
            placeholder="e.g. 320"
            {...register(`exams.${idx}.target_score`)}
            className={`h-10 text-xs bg-slate-50 dark:bg-zinc-800/50 dark:text-zinc-100 ${rowErr?.target_score ? "border-rose-500" : ""}`}
          />
          {rowErr?.target_score && (
            <p className="mt-1 text-[11px] text-rose-500">{rowErr.target_score.message}</p>
          )}
        </div>

        {/* Daily study hours */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">Daily study hours</label>
          <Input
            type="number"
            step="0.5"
            min={0.5}
            max={24}
            {...register(`exams.${idx}.daily_study_hours`, { valueAsNumber: true })}
            className={`h-10 text-xs bg-slate-50 dark:bg-zinc-800/50 dark:text-zinc-100 ${rowErr?.daily_study_hours ? "border-rose-500" : ""}`}
          />
          {rowErr?.daily_study_hours && (
            <p className="mt-1 text-[11px] text-rose-500">{rowErr.daily_study_hours.message}</p>
          )}
        </div>

        {/* Current level */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">Current level</label>
          <Controller
            name={`exams.${idx}.current_level`}
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className={`h-10 w-full text-xs bg-slate-50 dark:bg-zinc-800/50 dark:text-zinc-100 ${rowErr?.current_level ? "border-rose-500" : ""}`}>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent className="z-10000" position="popper" sideOffset={4}>
                  {LEVELS.map((lvl) => (
                    <SelectItem key={lvl} value={lvl} className="text-xs">{lvl}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {rowErr?.current_level && (
            <p className="mt-1 text-[11px] text-rose-500">{rowErr.current_level.message}</p>
          )}
        </div>

        {/* Progress report */}
        <div className="sm:col-span-2 mt-1 pt-3 border-t border-slate-100 dark:border-zinc-800">
          <Controller
            name={`exams.${idx}.send_progress_report`}
            control={control}
            render={({ field }) => (
              <label className="inline-flex items-center gap-2 text-xs text-slate-600 dark:text-zinc-300 cursor-pointer select-none">
                <Checkbox
                  checked={!!field.value}
                  onCheckedChange={(c) => field.onChange(c === true)}
                  className="h-4 w-4 border-slate-300 dark:border-zinc-500 dark:bg-zinc-800 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600 dark:data-[state=checked]:bg-indigo-500 dark:data-[state=checked]:border-indigo-500 dark:data-[state=checked]:text-white"
                />
                Send weekly progress reports by email
              </label>
            )}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Searchable exam select ──────────────────────────────────────────────────

function ExamSelectWithSearch({
  options,
  value,
  onValueChange,
  disabled,
  placeholder,
  emptyHint,
  hasError,
}: {
  options: { id: number; name: string }[];
  value: string;
  onValueChange: (v: string) => void;
  disabled?: boolean;
  placeholder: string;
  emptyHint: string;
  hasError?: boolean;
}) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.name.toLowerCase().includes(q));
  }, [search, options]);

  return (
    <Select
      value={value}
      onValueChange={onValueChange}
      onOpenChange={(o) => { if (!o) setSearch(""); }}
      disabled={disabled}
    >
      <SelectTrigger className={`h-10 w-full text-xs bg-slate-50 dark:bg-zinc-800/50 dark:text-zinc-100 ${hasError ? "border-rose-500" : ""}`}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="z-10000 max-h-80" position="popper" sideOffset={4}>
        <div className="sticky top-0 z-10 bg-white dark:bg-zinc-900 border-b border-slate-100 dark:border-zinc-800 p-2">
          <div className="relative">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500 pointer-events-none" />
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.stopPropagation()}
              placeholder="Search exam..."
              className="w-full h-8 pl-7 pr-2 rounded-md text-xs bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 outline-none focus:border-indigo-400 transition-colors text-slate-700 dark:text-zinc-200 placeholder:text-slate-400 dark:placeholder:text-zinc-500"
            />
          </div>
        </div>
        {options.length === 0 ? (
          <div className="px-3 py-3 text-xs text-slate-400 dark:text-zinc-500 italic text-center">
            {emptyHint}
          </div>
        ) : filtered.length === 0 ? (
          <div className="px-3 py-3 text-xs text-slate-400 dark:text-zinc-500 italic text-center">
            No exams match &quot;{search}&quot;
          </div>
        ) : (
          filtered.map((o) => (
            <SelectItem key={o.id} value={String(o.id)} className="text-xs">{o.name}</SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
}

// ─── Searchable country select ───────────────────────────────────────────────

function CountrySelectWithSearch({
  value,
  onValueChange,
  hasError,
}: {
  value: string;
  onValueChange: (v: string) => void;
  hasError?: boolean;
}) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter((c) => c.toLowerCase().includes(q));
  }, [search]);

  return (
    <Select
      value={value}
      onValueChange={onValueChange}
      onOpenChange={(o) => { if (!o) setSearch(""); }}
    >
      <SelectTrigger className={`h-10 w-full text-xs bg-slate-50 dark:bg-zinc-800/50 dark:text-zinc-100 ${hasError ? "border-rose-500" : ""}`}>
        <SelectValue placeholder="Select country" />
      </SelectTrigger>
      <SelectContent className="z-10000 max-h-80" position="popper" sideOffset={4}>
        <div className="sticky top-0 z-10 bg-white dark:bg-zinc-900 border-b border-slate-100 dark:border-zinc-800 p-2">
          <div className="relative">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500 pointer-events-none" />
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              // Stop the select's typeahead from stealing the keystrokes.
              onKeyDown={(e) => e.stopPropagation()}
              placeholder="Search country..."
              className="w-full h-8 pl-7 pr-2 rounded-md text-xs bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 outline-none focus:border-indigo-400 transition-colors text-slate-700 dark:text-zinc-200 placeholder:text-slate-400 dark:placeholder:text-zinc-500"
            />
          </div>
        </div>
        {filtered.length === 0 ? (
          <div className="px-3 py-3 text-xs text-slate-400 dark:text-zinc-500 italic text-center">
            No countries match &quot;{search}&quot;
          </div>
        ) : (
          filtered.map((c) => (
            <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function emptyRow(): ExamRowValue {
  return {
    country: "",
    exam_type_id: undefined as unknown as number,
    exam_date: "",
    target_score: "",
    daily_study_hours: 1,
    current_level: "Intermediate",
    send_progress_report: false,
  };
}
