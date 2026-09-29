import React from 'react'
import { Dialog as DialogPrimitive } from '@base-ui/react/dialog'
import { X } from 'lucide-react'
import { cn } from 'cn'

const Drawer = DialogPrimitive.Root
const DrawerTrigger = DialogPrimitive.Trigger
const DrawerClose = DialogPrimitive.Close
const DrawerPortal = DialogPrimitive.Portal

function DrawerBackdrop({ className, ...props }: DialogPrimitive.Backdrop.Props) {
  return (
    <DialogPrimitive.Backdrop
      className={cn(
        'fixed inset-0 z-40 bg-black/40 backdrop-blur-xs transition-opacity duration-300 data-ending-style:opacity-0 data-starting-style:opacity-0',
        className
      )}
      {...props}
    />
  )
}

interface DrawerContentProps extends DialogPrimitive.Popup.Props {
  children?: React.ReactNode
  showCloseButton?: boolean
}

function DrawerContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: DrawerContentProps) {
  return (
    <DrawerPortal>
      <DrawerBackdrop />
      <DialogPrimitive.Popup
        className={cn(
          'fixed inset-y-0 right-0 z-50 flex h-full w-full max-w-lg flex-col border-l border-border bg-card p-6 shadow-2xl transition-transform duration-300 ease-out data-ending-style:translate-x-full data-starting-style:translate-x-full sm:max-w-xl',
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            className="absolute top-4 right-4 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-hidden"
            aria-label="Закрыть"
          >
            <X className="size-4" />
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Popup>
    </DrawerPortal>
  )
}

function DrawerHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex flex-col space-y-1.5 pr-6 pb-4 border-b border-border/60', className)}
      {...props}
    />
  )
}

function DrawerTitle({ className, ...props }: DialogPrimitive.Title.Props) {
  return (
    <DialogPrimitive.Title
      className={cn(
        'text-base font-semibold leading-none tracking-tight text-foreground',
        className
      )}
      {...props}
    />
  )
}

function DrawerDescription({ className, ...props }: DialogPrimitive.Description.Props) {
  return (
    <DialogPrimitive.Description
      className={cn('text-xs text-muted-foreground', className)}
      {...props}
    />
  )
}

function DrawerFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'mt-auto flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 pt-4 border-t border-border/60',
        className
      )}
      {...props}
    />
  )
}

export {
  Drawer,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
}
