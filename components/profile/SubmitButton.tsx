"use client";

import type React from "react";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Save, Loader2 } from "lucide-react";

export function SubmitButton({ 
  children, 
  pending: externalPending 
}: { 
  children: React.ReactNode;
  pending?: boolean;
}) {
  const { pending: formPending } = useFormStatus();
  const pending = externalPending ?? formPending;
  return (
    <Button
      type="submit"
      disabled={pending}
      className="bg-accent hover:bg-accent/90 text-accent-foreground dark:bg-secondary dark:text-secondary-foreground dark:hover:bg-secondary/90 shadow-md hover:shadow-lg transition-all duration-200"
      size="lg"
    >
      {pending ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Saving...
        </>
      ) : (
        <>
          <Save className="w-4 h-4 mr-2" />
          {children}
        </>
      )}
    </Button>
  );
}
