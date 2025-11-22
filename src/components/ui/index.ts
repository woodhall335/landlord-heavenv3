/**
 * UI Components - Index
 *
 * Export all base UI components for easy import
 * Usage: import { Button, Card, Input } from "@/components/ui"
 */

export { Button, type ButtonProps } from "./Button";
export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  type CardProps,
} from "./Card";
export { Input, Textarea, type InputProps, type TextareaProps } from "./Input";
export {
  Badge,
  StatusBadge,
  PriceBadge,
  type BadgeProps,
  type StatusBadgeProps,
  type PriceBadgeProps,
} from "./Badge";
export { Container, type ContainerProps } from "./Container";
export { Modal } from "./Modal";
export { Toast, useToast } from "./Toast";
export { Loading } from "./Loading";
export { Dropdown } from "./Dropdown";
export { ErrorBoundary } from "./ErrorBoundary";
