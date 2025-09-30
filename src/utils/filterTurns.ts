import dayjs from "dayjs";

export function filterTurns (myTurns: any, statusFilter: any) {
    return myTurns.filter((turn: any) => {
      let matchesStatus = true;
      if (statusFilter) {
        matchesStatus = turn.status === statusFilter;
      }
      return matchesStatus;
    })
    .sort((a: any, b: any) => {
      const getStatusPriority = (turn: any) => {
        const isPast = dayjs(turn.scheduledAt).isBefore(dayjs());
        
        if (turn.status === 'SCHEDULED') {
          return isPast ? 2 : 1;
        } else if (turn.status === 'CANCELED') {
          return 3;
        }
        return 4;
      };
      
      const statusComparison = getStatusPriority(a) - getStatusPriority(b);
      
      if (statusComparison !== 0) {
        return statusComparison;
      }
      return dayjs(b.scheduledAt).valueOf() - dayjs(a.scheduledAt).valueOf();
    })
}