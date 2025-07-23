"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils/cn";

/**
 * Tooltip Component - Tooltip premium com múltiplas variantes e posicionamento inteligente
 * Suporta diferentes gatilhos, estilos e animações
 */
interface ITooltipProps {
  /** Conteúdo do tooltip */
  content: React.ReactNode;
  /** Elemento que ativa o tooltip */
  children: React.ReactElement;
  /** Posição preferida */
  position?: "top" | "bottom" | "left" | "right" | "auto";
  /** Variante visual */
  variant?: "dark" | "light" | "gradient" | "glass" | "neon";
  /** Tamanho */
  size?: "sm" | "md" | "lg";
  /** Delay para mostrar (ms) */
  showDelay?: number;
  /** Delay para esconder (ms) */
  hideDelay?: number;
  /** Gatilho */
  trigger?: "hover" | "click" | "focus" | "manual";
  /** Estado controlado */
  isOpen?: boolean;
  /** Callback de mudança de estado */
  onOpenChange?: (isOpen: boolean) => void;
  /** Mostra seta */
  arrow?: boolean;
  /** Distância do elemento (px) */
  offset?: number;
  /** Máxima largura */
  maxWidth?: number;
  /** Desabilitado */
  disabled?: boolean;
  /** Anima entrada/saída */
  animate?: boolean;
  /** Classe customizada */
  className?: string;
  /** Permite interação com o tooltip */
  interactive?: boolean;
  /** Tema forçado */
  theme?: "light" | "dark";
}

export const Tooltip: React.FC<ITooltipProps> = ({
  content,
  children,
  position = "auto",
  variant = "dark",
  size = "md",
  showDelay = 200,
  hideDelay = 0,
  trigger = "hover",
  isOpen: controlledIsOpen,
  onOpenChange,
  arrow = true,
  offset = 8,
  maxWidth = 250,
  disabled = false,
  animate = true,
  className,
  interactive = false,
  theme,
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [actualPosition, setActualPosition] = useState(position);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  const [arrowStyle, setArrowStyle] = useState<React.CSSProperties>({});
  const [isAnimating, setIsAnimating] = useState(false);
  
  const triggerRef = useRef<HTMLElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const showTimeoutRef = useRef<NodeJS.Timeout>();
  const hideTimeoutRef = useRef<NodeJS.Timeout>();

  // Use controlled state if provided
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;

  const setIsOpen = (value: boolean) => {
    if (controlledIsOpen === undefined) {
      setInternalIsOpen(value);
    }
    onOpenChange?.(value);
  };

  // Calculate position
  const calculatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;

    let finalPosition = position;
    let top = 0;
    let left = 0;

    // Auto positioning
    if (position === "auto") {
      const spaceTop = triggerRect.top;
      const spaceBottom = viewportHeight - triggerRect.bottom;
      const spaceLeft = triggerRect.left;
      const spaceRight = viewportWidth - triggerRect.right;

      if (spaceTop > tooltipRect.height + offset && spaceTop > spaceBottom) {
        finalPosition = "top";
      } else if (spaceBottom > tooltipRect.height + offset) {
        finalPosition = "bottom";
      } else if (spaceLeft > tooltipRect.width + offset && spaceLeft > spaceRight) {
        finalPosition = "left";
      } else {
        finalPosition = "right";
      }
    }

    // Calculate coordinates based on position
    switch (finalPosition) {
      case "top":
        top = triggerRect.top - tooltipRect.height - offset + scrollY;
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2 + scrollX;
        break;
      case "bottom":
        top = triggerRect.bottom + offset + scrollY;
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2 + scrollX;
        break;
      case "left":
        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2 + scrollY;
        left = triggerRect.left - tooltipRect.width - offset + scrollX;
        break;
      case "right":
        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2 + scrollY;
        left = triggerRect.right + offset + scrollX;
        break;
    }

    // Keep tooltip within viewport
    if (left < 8) left = 8;
    if (left + tooltipRect.width > viewportWidth - 8) {
      left = viewportWidth - tooltipRect.width - 8;
    }
    if (top < 8) top = 8;
    if (top + tooltipRect.height > viewportHeight - 8) {
      top = viewportHeight - tooltipRect.height - 8;
    }

    // Calculate arrow position
    const arrowSize = 8;
    let arrowTop = "50%";
    let arrowLeft = "50%";
    let arrowTransform = "translate(-50%, -50%)";

    switch (finalPosition) {
      case "top":
        arrowTop = "100%";
        arrowTransform = "translate(-50%, -50%) rotate(45deg)";
        break;
      case "bottom":
        arrowTop = "0";
        arrowTransform = "translate(-50%, -50%) rotate(45deg)";
        break;
      case "left":
        arrowLeft = "100%";
        arrowTransform = "translate(-50%, -50%) rotate(45deg)";
        break;
      case "right":
        arrowLeft = "0";
        arrowTransform = "translate(-50%, -50%) rotate(45deg)";
        break;
    }

    setActualPosition(finalPosition);
    setTooltipStyle({
      position: "absolute",
      top: `${top}px`,
      left: `${left}px`,
      maxWidth: `${maxWidth}px`,
    });
    setArrowStyle({
      position: "absolute",
      width: `${arrowSize}px`,
      height: `${arrowSize}px`,
      top: arrowTop,
      left: arrowLeft,
      transform: arrowTransform,
    });
  };

  // Show tooltip
  const show = () => {
    if (disabled || !content) return;

    clearTimeout(hideTimeoutRef.current);
    
    if (showDelay > 0) {
      showTimeoutRef.current = setTimeout(() => {
        setIsOpen(true);
        setIsAnimating(true);
      }, showDelay);
    } else {
      setIsOpen(true);
      setIsAnimating(true);
    }
  };

  // Hide tooltip
  const hide = () => {
    clearTimeout(showTimeoutRef.current);
    
    if (hideDelay > 0) {
      hideTimeoutRef.current = setTimeout(() => {
        setIsAnimating(false);
        setTimeout(() => setIsOpen(false), animate ? 200 : 0);
      }, hideDelay);
    } else {
      setIsAnimating(false);
      setTimeout(() => setIsOpen(false), animate ? 200 : 0);
    }
  };

  // Event handlers
  const handleMouseEnter = () => {
    if (trigger === "hover") show();
  };

  const handleMouseLeave = () => {
    if (trigger === "hover" && !interactive) hide();
  };

  const handleClick = () => {
    if (trigger === "click") {
      if (isOpen) hide();
      else show();
    }
  };

  const handleFocus = () => {
    if (trigger === "focus") show();
  };

  const handleBlur = () => {
    if (trigger === "focus") hide();
  };

  // Update position when open
  useEffect(() => {
    if (isOpen) {
      calculatePosition();
      const handleUpdate = () => calculatePosition();
      
      // Recalculate on scroll and resize
      window.addEventListener("scroll", handleUpdate, true);
      window.addEventListener("resize", handleUpdate);
      
      return () => {
        window.removeEventListener("scroll", handleUpdate, true);
        window.removeEventListener("resize", handleUpdate);
      };
    }
  }, [isOpen]);

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      clearTimeout(showTimeoutRef.current);
      clearTimeout(hideTimeoutRef.current);
    };
  }, []);

  // Clone children and attach ref
  const childrenWithRef = React.cloneElement(children, {
    ref: triggerRef,
    onMouseEnter: (e: React.MouseEvent) => {
      children.props.onMouseEnter?.(e);
      handleMouseEnter();
    },
    onMouseLeave: (e: React.MouseEvent) => {
      children.props.onMouseLeave?.(e);
      handleMouseLeave();
    },
    onClick: (e: React.MouseEvent) => {
      children.props.onClick?.(e);
      handleClick();
    },
    onFocus: (e: React.FocusEvent) => {
      children.props.onFocus?.(e);
      handleFocus();
    },
    onBlur: (e: React.FocusEvent) => {
      children.props.onBlur?.(e);
      handleBlur();
    },
    "aria-describedby": isOpen ? "tooltip" : undefined,
  });

  const variants = {
    dark: [
      "bg-gray-900 text-white",
      "shadow-lg",
    ],
    light: [
      theme === "dark" ? "bg-gray-700 text-white" : "bg-white text-gray-900",
      "shadow-xl border",
      theme === "dark" ? "border-gray-600" : "border-gray-200",
    ],
    gradient: [
      "gradient-primary text-white",
      "shadow-lg",
    ],
    glass: [
      theme === "dark" ? "glass-dark text-white" : "glass text-gray-900",
      "shadow-lg backdrop-blur-md",
    ],
    neon: [
      "bg-gray-900 text-primary-400",
      "border border-primary-500",
      "shadow-primary",
    ],
  };

  const sizes = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-2 text-sm",
    lg: "px-4 py-3 text-base",
  };

  const animationStyles = animate
    ? {
        opacity: isAnimating ? 1 : 0,
        transform: isAnimating
          ? "scale(1)"
          : actualPosition === "top"
          ? "scale(0.95) translateY(4px)"
          : actualPosition === "bottom"
          ? "scale(0.95) translateY(-4px)"
          : actualPosition === "left"
          ? "scale(0.95) translateX(4px)"
          : "scale(0.95) translateX(-4px)",
        transition: "all 200ms cubic-bezier(0.4, 0, 0.2, 1)",
      }
    : {};

  const arrowVariants = {
    dark: "bg-gray-900",
    light: theme === "dark" ? "bg-gray-700" : "bg-white border border-gray-200",
    gradient: "gradient-primary",
    glass: theme === "dark" ? "glass-dark" : "glass",
    neon: "bg-gray-900 border border-primary-500",
  };

  const tooltipContent = isOpen && (
    <div
      ref={tooltipRef}
      id="tooltip"
      role="tooltip"
      className={cn(
        "z-50 rounded-lg",
        variants[variant],
        sizes[size],
        className
      )}
      style={{ ...tooltipStyle, ...animationStyles }}
      onMouseEnter={interactive && trigger === "hover" ? () => clearTimeout(hideTimeoutRef.current) : undefined}
      onMouseLeave={interactive && trigger === "hover" ? hide : undefined}
    >
      {content}
      
      {/* Arrow */}
      {arrow && (
        <div
          className={cn(
            "pointer-events-none",
            arrowVariants[variant]
          )}
          style={arrowStyle}
        />
      )}
    </div>
  );

  return (
    <>
      {childrenWithRef}
      {typeof window !== "undefined" && createPortal(tooltipContent, document.body)}
    </>
  );
};

/**
 * TooltipProvider - Provider para configuração global de tooltips
 */
interface ITooltipProviderProps {
  children: React.ReactNode;
  /** Delay padrão para mostrar */
  showDelay?: number;
  /** Delay padrão para esconder */
  hideDelay?: number;
  /** Desabilita todos os tooltips */
  disabled?: boolean;
}

const TooltipContext = React.createContext<{
  showDelay: number;
  hideDelay: number;
  disabled: boolean;
}>({
  showDelay: 200,
  hideDelay: 0,
  disabled: false,
});

export const TooltipProvider: React.FC<ITooltipProviderProps> = ({
  children,
  showDelay = 200,
  hideDelay = 0,
  disabled = false,
}) => {
  return (
    <TooltipContext.Provider value={{ showDelay, hideDelay, disabled }}>
      {children}
    </TooltipContext.Provider>
  );
};

export const useTooltipContext = () => React.useContext(TooltipContext);