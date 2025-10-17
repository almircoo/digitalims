import React from "react";
import { Package } from "lucide-react";
export const Footer = () => {
  return (
    <footer className="bg-background border-t border-border">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-6 w-6 text-primary" />
            <span className="text-lg font-semibold text-foreground">
              Digital IMS
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2025 Inventory Management System. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};
