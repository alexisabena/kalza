import { useStaffStore, getStaffName } from '@/stores/staffStore'
import { StatusChip } from '@/components/StatusChip'
import { fmtDateTime } from '@/admin/lib/format'

// The audit trail: every status transition with its timestamp and, for
// staff-driven changes, the admin who approved it (wholesaler-admin-spec.md).
export function StatusHistoryLog({ history = [] }) {
  const staff = useStaffStore((s) => s.staff)

  if (history.length === 0) {
    return <p className="text-sm text-muted-foreground">Sin historial.</p>
  }

  return (
    <ol className="flex flex-col gap-0">
      {history.map((entry, i) => {
        const approver = entry.approver ? getStaffName(staff, entry.approver) : null
        const last = i === history.length - 1
        return (
          <li key={`${entry.status}-${entry.at}`} className="flex items-stretch gap-3">
            <div className="flex flex-col items-center pt-1">
              <span className="size-2 rounded-full bg-primary" aria-hidden="true" />
              {!last && <span className="w-px flex-1 bg-border" aria-hidden="true" />}
            </div>
            <div className="pb-4">
              <div className="flex items-center gap-2">
                <StatusChip status={entry.status} />
                <span className="text-xs text-muted-foreground">{fmtDateTime(entry.at)}</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {approver ? (
                  <>Aprobado por <span className="font-medium text-foreground">{approver}</span></>
                ) : (
                  'Automático'
                )}
              </p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
