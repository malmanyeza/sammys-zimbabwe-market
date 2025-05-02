
import { useTheme } from "next-themes"
import { Toaster as Sonner, toast as sonnerToast } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg !bg-white dark:!bg-slate-950",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          error: "!bg-white dark:!bg-slate-950 border-red-600",
          success: "!bg-white dark:!bg-slate-950 border-green-600",
          warning: "!bg-white dark:!bg-slate-950 border-yellow-600",
          info: "!bg-white dark:!bg-slate-950 border-blue-600",
        },
      }}
      {...props}
    />
  )
}

// Export the toast object with helper methods
export const toast = {
  // Default toast
  default: (message: string, options?: any) => {
    return sonnerToast(message, options);
  },
  // Success toast
  success: (message: string, options?: any) => {
    return sonnerToast.success(message, options);
  },
  // Error toast
  error: (message: string, options?: any) => {
    return sonnerToast.error(message, options);
  },
  // Warning toast
  warning: (message: string, options?: any) => {
    return sonnerToast.warning(message, options);
  },
  // Info toast
  info: (message: string, options?: any) => {
    return sonnerToast.info(message, options);
  }
}

export { Toaster }
