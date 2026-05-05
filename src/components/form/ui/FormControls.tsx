"use client";

import React, { ChangeEvent, InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

// ── Field wrapper ────────────────────────────────────────────────────────────
export function FieldGroup({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${className}`}>{children}</div>;
}

export function FullField({ children }: { children: React.ReactNode }) {
  return <div className="sm:col-span-2">{children}</div>;
}

// ── Label ────────────────────────────────────────────────────────────────────
export function Label({ htmlFor, required, children }: { htmlFor: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="block text-xs font-semibold text-gray-300 uppercase tracking-wide mb-1.5">
      {children}
      {required && <span className="text-red-400 ml-1" aria-hidden="true">*</span>}
    </label>
  );
}

// ── Error message ────────────────────────────────────────────────────────────
export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="mt-1 text-xs text-red-400 flex items-center gap-1">
      <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
      {message}
    </p>
  );
}

// ── Base input class ─────────────────────────────────────────────────────────
const baseInput = (error?: string) =>
  `w-full bg-white/5 border rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600
   focus:outline-none focus:ring-2 transition-all
   ${error ? "border-red-500/60 focus:ring-red-500/30" : "border-white/15 focus:ring-indigo-500/40"}`;

// ── Text / email / tel / number / date Input ─────────────────────────────────
interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  onChange: (val: string) => void;
}

export function Input({ id, label, required, error, onChange, className, ...rest }: InputProps) {
  return (
    <div className={className}>
      <Label htmlFor={id} required={required}>{label}</Label>
      <input
        id={id}
        aria-required={required}
        aria-describedby={error ? `${id}-error` : undefined}
        aria-invalid={!!error}
        className={baseInput(error)}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
        {...rest}
      />
      <FieldError message={error} />
    </div>
  );
}

// ── Select ───────────────────────────────────────────────────────────────────
interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "onChange"> {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  options: string[];
  placeholder?: string;
  onChange: (val: string) => void;
}

export function Select({ id, label, required, error, options, placeholder = "— Select —", onChange, className, ...rest }: SelectProps) {
  return (
    <div className={className}>
      <Label htmlFor={id} required={required}>{label}</Label>
      <select
        id={id}
        aria-required={required}
        aria-invalid={!!error}
        className={`${baseInput(error)} bg-[#0f1624] appearance-none`}
        onChange={(e: ChangeEvent<HTMLSelectElement>) => onChange(e.target.value)}
        {...rest}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <FieldError message={error} />
    </div>
  );
}

// ── Textarea ─────────────────────────────────────────────────────────────────
interface TextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "onChange"> {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  onChange: (val: string) => void;
}

export function Textarea({ id, label, required, error, onChange, className, ...rest }: TextareaProps) {
  return (
    <div className={className}>
      <Label htmlFor={id} required={required}>{label}</Label>
      <textarea
        id={id}
        aria-required={required}
        aria-invalid={!!error}
        className={`${baseInput(error)} resize-none`}
        rows={3}
        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)}
        {...rest}
      />
      <FieldError message={error} />
    </div>
  );
}

// ── Radio group ──────────────────────────────────────────────────────────────
interface RadioGroupProps {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (val: string) => void;
  className?: string;
}

export function RadioGroup({ id, label, required, error, options, value, onChange, className }: RadioGroupProps) {
  return (
    <div className={className}>
      <Label htmlFor={id} required={required}>{label}</Label>
      <div className="flex flex-wrap gap-3 mt-1" role="radiogroup" aria-labelledby={`${id}-label`}>
        {options.map((opt) => (
          <label key={opt.value} className="flex items-center gap-2 cursor-pointer group">
            <input
              type="radio"
              name={id}
              value={opt.value}
              checked={value === opt.value}
              onChange={() => onChange(opt.value)}
              className="w-4 h-4 accent-indigo-500"
              aria-label={opt.label}
            />
            <span className={`text-sm transition-colors ${value === opt.value ? "text-white font-medium" : "text-gray-400 group-hover:text-gray-200"}`}>
              {opt.label}
            </span>
          </label>
        ))}
      </div>
      <FieldError message={error} />
    </div>
  );
}

// ── Section heading ──────────────────────────────────────────────────────────
export function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-4 pb-2 border-b border-white/10">
      {children}
    </h3>
  );
}

// ── Nav buttons ──────────────────────────────────────────────────────────────
interface StepNavProps {
  onBack?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  backLabel?: string;
  nextDisabled?: boolean;
  isSubmit?: boolean;
}

export function StepNav({ onBack, onNext, nextLabel = "Continue →", backLabel = "← Back", nextDisabled, isSubmit }: StepNavProps) {
  return (
    <div className="flex items-center justify-between pt-6 border-t border-white/10 mt-6">
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-3 rounded-xl border border-white/15 text-gray-300 hover:bg-white/5 hover:text-white text-sm font-medium transition-all"
        >
          {backLabel}
        </button>
      ) : <div />}
      <button
        type={isSubmit ? "submit" : "button"}
        onClick={isSubmit ? undefined : onNext}
        disabled={nextDisabled}
        className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {nextLabel}
      </button>
    </div>
  );
}

// ── Info note ────────────────────────────────────────────────────────────────
export function InfoNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 p-3 bg-indigo-500/10 border border-indigo-500/25 rounded-xl mb-4">
      <span className="text-indigo-400 text-sm mt-0.5 flex-shrink-0">ℹ️</span>
      <p className="text-xs text-indigo-300 leading-relaxed">{children}</p>
    </div>
  );
}
