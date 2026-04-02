import { cn } from '@/lib/utils';

export function StatusBadge({ status }) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold',
      status === 'Pending' && 'bg-warning/15 text-warning',
      status === 'In Progress' && 'bg-info/15 text-info',
      status === 'Resolved' && 'bg-success/15 text-success',
    )}>
      <span className={cn(
        'h-1.5 w-1.5 rounded-full',
        status === 'Pending' && 'bg-warning',
        status === 'In Progress' && 'bg-info',
        status === 'Resolved' && 'bg-success',
      )} />
      {status}
    </span>
  );
}

export function PriorityBadge({ priority }) {
  return (
    <span className={cn(
      'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold',
      priority === 'Low' && 'bg-muted text-muted-foreground',
      priority === 'Medium' && 'bg-warning/15 text-warning',
      priority === 'Urgent' && 'bg-destructive/15 text-destructive',
    )}>
      {priority}
    </span>
  );
}
