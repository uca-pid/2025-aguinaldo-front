import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import 'dayjs/locale/es';

// Verificar que dayjs existe y tiene la función extend antes de usarla
if (dayjs && typeof dayjs.extend === 'function') {
  dayjs.extend(utc);
  dayjs.extend(timezone);
  dayjs.extend(customParseFormat);
  dayjs.extend(isSameOrAfter);
  dayjs.extend(isSameOrBefore);

  // Verificar que timezone plugin está disponible antes de configurar
  if (dayjs.tz && typeof dayjs.tz.setDefault === 'function') {
    dayjs.tz.setDefault('America/Argentina/Buenos_Aires');
  }

  // Verificar que locale está disponible antes de configurar
  if (typeof dayjs.locale === 'function') {
    dayjs.locale('es');
  }
}

export default dayjs;