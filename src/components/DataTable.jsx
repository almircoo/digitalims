import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { Button } from "../components/ui/button"
import { Trash2, Edit2 } from "lucide-react"

export const DataTable = ({ columns, data, onEdit, onDelete, loading }) => {
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

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead key={col.key}>{col.label}</TableHead>
            ))}
            {(onEdit || onDelete) && <TableHead>Acciones</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, idx) => (
            <TableRow key={idx}>
              {columns.map((col) => (
                <TableCell key={col.key}>{col.render ? col.render(row) : row[col.key]}</TableCell>
              ))}
              {(onEdit || onDelete) && (
                <TableCell>
                  <div className="flex gap-2">
                    {onEdit && (
                      <Button size="sm" variant="outline" onClick={() => onEdit(row)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    )}
                    {onDelete && (
                      <Button size="sm" variant="destructive" onClick={() => onDelete(row)}>
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
  )
}
