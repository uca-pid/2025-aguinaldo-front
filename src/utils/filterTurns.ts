import dayjs from "./dayjs.config";

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



export function turnsOfTheMonth (myTurns: any) {
    const currentMonth = dayjs().month();
    const currentYear = dayjs().year();
    const currentDay = dayjs().date();
    
    return myTurns.filter((turn: any) => {
      const turnDate = dayjs(turn.scheduledAt);
      const isCurrentMonth = turnDate.month() === currentMonth && turnDate.year() === currentYear;
      const isPast = turnDate.date() <= currentDay;
      
      return isCurrentMonth && isPast && turn.status != 'CANCELED';
    }).length;
}

export function upComingTurns (myTurns: any) {
    const now = dayjs();
    
    return myTurns.filter((turn: any) => {
      const turnDate = dayjs(turn.scheduledAt);
      const isUpcoming = turnDate.isAfter(now);
      const isScheduled = turn.status === 'SCHEDULED';
      
      return isUpcoming && isScheduled;
    }).length;
}


export function allPastTurnsThisMonth (myTurns: any) {
    const currentMonth = dayjs().month();
    const currentYear = dayjs().year();
    const currentDay = dayjs().date();
    
    return myTurns.filter((turn: any) => {
      const turnDate = dayjs(turn.scheduledAt);
      const isCurrentMonth = turnDate.month() === currentMonth && turnDate.year() === currentYear;
      const isPast = turnDate.date() <= currentDay;
      const isCompleted = turn.status != 'CANCELED';
      
      return isCurrentMonth && isPast && isCompleted ;
    }).length;
}