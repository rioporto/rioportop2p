"use client";

import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils/cn";

/**
 * Select Component - Dropdown premium com múltiplas variantes
 * Suporta pesquisa, múltipla seleção e estilos skeumórficos
 */
interface ISelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  description?: string;
}

interface ISelectProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Opções do select */
  options: ISelectOption[];
  /** Valor selecionado */
  value?: string | string[];
  /** Callback de mudança */
  onChange?: (value: string | string[]) => void;
  /** Label do campo */
  label?: string;
  /** Placeholder */
  placeholder?: string;
  /** Mensagem de erro */
  error?: string;
  /** Dica/ajuda */
  hint?: string;
  /** Variante visual */
  variant?: "flat" | "elevated" | "glass" | "gradient" | "neon" | "neumorphic";
  /** Permite múltipla seleção */
  multiple?: boolean;
  /** Permite pesquisa */
  searchable?: boolean;
  /** Desabilitado */
  disabled?: boolean;
  /** Tamanho */
  size?: "sm" | "md" | "lg";
  /** Ícone */
  icon?: React.ReactNode;
  /** Limpa seleção */
  clearable?: boolean;
  /** Máximo de itens visíveis */
  maxHeight?: number;
  /** Animação */
  animate?: "fadeIn" | "scaleUp" | "slideInRight" | "slideInLeft";
  /** Tema */
  theme?: "light" | "dark";
}

export const Select = React.forwardRef<HTMLDivElement, ISelectProps>(
  (
    {
      options,
      value,
      onChange,
      label,
      placeholder = "Selecione uma opção",
      error,
      hint,
      variant = "flat",
      multiple = false,
      searchable = false,
      disabled = false,
      size = "md",
      icon,
      clearable = false,
      maxHeight = 300,
      animate,
      theme,
      className,
      ...props
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const selectRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Filtrar opções baseado na pesquisa
    const filteredOptions = searchTerm
      ? options.filter(option =>
          option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
          option.value.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : options;

    // Verificar se valor está selecionado
    const isSelected = (optionValue: string) => {
      if (multiple) {
        return Array.isArray(value) && value.includes(optionValue);
      }
      return value === optionValue;
    };

    // Obter label do valor selecionado
    const getSelectedLabel = () => {
      if (!value || (Array.isArray(value) && value.length === 0)) {
        return "";
      }

      if (multiple && Array.isArray(value)) {
        if (value.length === 1) {
          const option = options.find(opt => opt.value === value[0]);
          return option?.label || "";
        }
        return `${value.length} selecionados`;
      }

      const option = options.find(opt => opt.value === value);
      return option?.label || "";
    };

    // Handle selection
    const handleSelect = (optionValue: string) => {
      if (multiple) {
        const currentValues = Array.isArray(value) ? value : [];
        const newValues = currentValues.includes(optionValue)
          ? currentValues.filter(v => v !== optionValue)
          : [...currentValues, optionValue];
        onChange?.(newValues);
      } else {
        onChange?.(optionValue);
        setIsOpen(false);
      }
      setSearchTerm("");
    };

    // Handle clear
    const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange?.(multiple ? [] : "");
      setSearchTerm("");
    };

    // Keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (!isOpen && (e.key === "Enter" || e.key === " " || e.key === "ArrowDown")) {
        e.preventDefault();
        setIsOpen(true);
        return;
      }

      if (!isOpen) return;

      switch (e.key) {
        case "Escape":
          setIsOpen(false);
          setSearchTerm("");
          break;
        case "ArrowDown":
          e.preventDefault();
          setHighlightedIndex(prev =>
            prev < filteredOptions.length - 1 ? prev + 1 : 0
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setHighlightedIndex(prev =>
            prev > 0 ? prev - 1 : filteredOptions.length - 1
          );
          break;
        case "Enter":
          e.preventDefault();
          if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
            handleSelect(filteredOptions[highlightedIndex].value);
          }
          break;
      }
    };

    // Click outside handler
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
          setIsOpen(false);
          setSearchTerm("");
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Reset highlighted index when filtered options change
    useEffect(() => {
      setHighlightedIndex(-1);
    }, [searchTerm]);

    const baseStyles = [
      "relative w-full",
      animate && `animate-${animate}`,
    ];

    const triggerStyles = [
      "w-full flex items-center justify-between",
      "transition-all cursor-pointer",
      "focus:outline-none focus:ring-2 focus:ring-offset-2",
      variant === "neon" ? "focus:ring-offset-gray-900" : "focus:ring-offset-white",
      disabled && "opacity-60 cursor-not-allowed",
    ];

    const variants = {
      flat: [
        theme === "dark" ? "bg-gray-800" : "bg-white",
        "border-2",
        error ? "border-red-500" : theme === "dark" ? "border-gray-600" : "border-gray-300",
        "rounded-lg",
        theme === "dark" ? "text-white" : "text-gray-900",
        "hover:border-gray-400 dark:hover:border-gray-500",
        "focus:border-primary-500 focus:ring-primary-500/20",
      ],
      elevated: [
        theme === "dark" ? "bg-gray-800" : "bg-white",
        "border-2 border-transparent",
        "rounded-lg shadow-medium",
        theme === "dark" ? "text-white" : "text-gray-900",
        "hover:shadow-hard",
        "focus:shadow-hard focus:border-primary-500 focus:ring-primary-500/20",
      ],
      glass: [
        theme === "dark" ? "glass-dark" : "glass",
        "border",
        error ? "border-red-500/50" : "border-white/20",
        "rounded-lg shadow-soft",
        theme === "dark" ? "text-white" : "text-gray-700",
        "focus:border-white/50 focus:ring-white/20",
      ],
      gradient: [
        "bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700",
        "border-2 border-transparent",
        "rounded-lg shadow-inner-soft",
        theme === "dark" ? "text-white" : "text-gray-900",
        "focus:from-white focus:to-gray-50 dark:focus:from-gray-700 dark:focus:to-gray-600",
        "focus:shadow-inner-medium focus:border-primary-500 focus:ring-primary-500/20",
      ],
      neon: [
        "bg-gray-900",
        "border-2",
        error ? "border-red-500" : isOpen ? "border-primary-500" : "border-gray-700",
        "rounded-lg",
        "text-white",
        isOpen && !error && "shadow-primary animate-led-pulse",
        "focus:border-primary-500 focus:ring-primary-500/50",
      ],
      neumorphic: [
        theme === "dark" ? "bg-gray-800" : "bg-gray-100",
        "border-0",
        "rounded-lg",
        theme === "dark" ? "text-white" : "text-gray-900",
        isOpen ? "shadow-skeuomorphic-pressed" : "shadow-skeuomorphic-raised",
        "focus:ring-2 focus:ring-primary-500/20",
      ],
    };

    const sizes = {
      sm: "px-3 py-2 text-sm",
      md: "px-4 py-2.5 text-base",
      lg: "px-5 py-3 text-lg",
    };

    const dropdownStyles = [
      "absolute z-50 w-full mt-2",
      "bg-white dark:bg-gray-800",
      "border-2 border-gray-200 dark:border-gray-700",
      "rounded-lg shadow-xl",
      "overflow-hidden",
      "animate-fadeIn",
    ];

    return (
      <div className={cn(baseStyles, className)} ref={ref} {...props}>
        {/* Label */}
        {label && (
          <label className={cn(
            "block text-sm font-medium mb-1",
            theme === "dark" ? "text-gray-200" : "text-gray-700",
            disabled && "opacity-60"
          )}>
            {label}
          </label>
        )}

        {/* Select Container */}
        <div ref={selectRef} className="relative">
          {/* Status indicator for neon variant */}
          {variant === "neon" && (
            <span
              className={cn(
                "absolute -top-1 -right-1 w-2 h-2 rounded-full z-10",
                error ? "bg-red-500" : isOpen ? "bg-primary-500" : "bg-gray-600",
                (isOpen || error) && "animate-led-pulse"
              )}
              style={{
                boxShadow: `0 0 8px currentColor`,
              }}
            />
          )}

          {/* Trigger */}
          <div
            className={cn(
              triggerStyles,
              variants[variant],
              sizes[size],
              icon && "pl-10"
            )}
            onClick={() => !disabled && setIsOpen(!isOpen)}
            onKeyDown={handleKeyDown}
            tabIndex={disabled ? -1 : 0}
            role="button"
            aria-haspopup="listbox"
            aria-expanded={isOpen}
            aria-disabled={disabled}
          >
            {/* Icon */}
            {icon && (
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                {icon}
              </span>
            )}

            {/* Selected value or placeholder */}
            <span className={cn(
              "flex-1 text-left truncate",
              !getSelectedLabel() && (theme === "dark" ? "text-gray-400" : "text-gray-500")
            )}>
              {getSelectedLabel() || placeholder}
            </span>

            {/* Clear button */}
            {clearable && value && (Array.isArray(value) ? value.length > 0 : true) && (
              <button
                type="button"
                className={cn(
                  "mr-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200",
                  "focus:outline-none"
                )}
                onClick={handleClear}
                aria-label="Clear selection"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}

            {/* Dropdown arrow */}
            <svg
              className={cn(
                "w-5 h-5 text-gray-400 transition-transform",
                isOpen && "rotate-180"
              )}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          {/* Dropdown */}
          {isOpen && (
            <div className={cn(dropdownStyles)} style={{ maxHeight }}>
              {/* Search input */}
              {searchable && (
                <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                  <input
                    ref={inputRef}
                    type="text"
                    className={cn(
                      "w-full px-3 py-2 text-sm",
                      "bg-gray-50 dark:bg-gray-700",
                      "border border-gray-300 dark:border-gray-600",
                      "rounded-md",
                      "focus:outline-none focus:ring-2 focus:ring-primary-500/20",
                      "placeholder-gray-500 dark:placeholder-gray-400"
                    )}
                    placeholder="Pesquisar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    autoFocus
                  />
                </div>
              )}

              {/* Options list */}
              <div className="overflow-y-auto" style={{ maxHeight: maxHeight - (searchable ? 60 : 0) }}>
                {filteredOptions.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                    Nenhuma opção encontrada
                  </div>
                ) : (
                  filteredOptions.map((option, index) => (
                    <div
                      key={option.value}
                      className={cn(
                        "px-4 py-3 cursor-pointer transition-colors",
                        "hover:bg-gray-100 dark:hover:bg-gray-700",
                        isSelected(option.value) && "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400",
                        highlightedIndex === index && "bg-gray-100 dark:bg-gray-700",
                        option.disabled && "opacity-50 cursor-not-allowed"
                      )}
                      onClick={() => !option.disabled && handleSelect(option.value)}
                      onMouseEnter={() => setHighlightedIndex(index)}
                      role="option"
                      aria-selected={isSelected(option.value)}
                      aria-disabled={option.disabled}
                    >
                      <div className="flex items-center gap-3">
                        {/* Checkbox for multiple */}
                        {multiple && (
                          <div className={cn(
                            "w-4 h-4 rounded border-2 flex items-center justify-center",
                            isSelected(option.value)
                              ? "bg-primary-500 border-primary-500"
                              : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                          )}>
                            {isSelected(option.value) && (
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                        )}

                        {/* Option icon */}
                        {option.icon && (
                          <span className="flex-shrink-0">{option.icon}</span>
                        )}

                        {/* Option content */}
                        <div className="flex-1">
                          <div className={cn(
                            "text-sm font-medium",
                            isSelected(option.value) ? "" : theme === "dark" ? "text-white" : "text-gray-900"
                          )}>
                            {option.label}
                          </div>
                          {option.description && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                              {option.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Helper text */}
        {(hint || error) && (
          <div className="mt-1">
            {error ? (
              <p className="text-xs text-red-500 animate-fadeIn flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </p>
            ) : hint ? (
              <p className={cn(
                "text-xs",
                theme === "dark" ? "text-gray-400" : "text-gray-500"
              )}>
                {hint}
              </p>
            ) : null}
          </div>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";