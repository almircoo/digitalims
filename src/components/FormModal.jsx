import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { LoaderIcon } from "lucide-react";

export const FormModal = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  onSubmit,
  loading,
  submitText = "Guardar",
  showFooter = true,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{title}</DialogTitle>
          {description && <DialogDescription className="text-base">{description}</DialogDescription>}
        </DialogHeader>
        <div className="space-y-4">
          {children}
          {showFooter && (
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="text-base h-10">
                Cancelar
              </Button>
              <Button type="submit" disabled={loading} onClick={onSubmit} className="text-base h-10">
                {loading ? (
                  <>
                    <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  submitText
                )}
              </Button>
            </DialogFooter>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
