import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, Edit2 } from "lucide-react";

export const DataTable = ({
  columns,
  data,
  onEdit,
  onDelete,
  loading,
  editDisabled = false,
  deleteDisabled = false,
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No hay datos disponibles</p>
      </div>
    )
  }

  const getNestedValue = (obj, path) => {
    return path.split(".").reduce((current, prop) => current?.[prop], obj)
  }

  return (
    <div className="border rounded-lg overflow-hidden bg-card shadow-sm hover:shadow-md transition-shadow">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              {columns.map((col) => (
                <TableHead key={col.key} className="font-semibold text-foreground">
                  {col.label}
                </TableHead>
              ))}
              {(onEdit || onDelete) && <TableHead className="font-semibold text-foreground">Acciones</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, idx) => (
              <TableRow key={idx} className="hover:bg-muted/50 transition-colors border-b last:border-b-0">
                {columns.map((col) => (
                  <TableCell key={col.key} className="py-3 text-sm">
                    {col.render ? col.render(row) : getNestedValue(row, col.key)}
                  </TableCell>
                ))}
                {(onEdit || onDelete) && (
                  <TableCell className="py-3">
                    <div className="flex gap-2">
                      {onEdit && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onEdit(row)}
                          disabled={editDisabled}
                          title={editDisabled ? "No tienes permiso para editar" : "Editar"}
                          className="hover:bg-blue-50 dark:hover:bg-blue-950"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      )}
                      {onDelete && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => onDelete(row)}
                          disabled={deleteDisabled}
                          title={deleteDisabled ? "No tienes permiso para eliminar" : "Eliminar"}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
