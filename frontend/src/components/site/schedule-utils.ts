import { useEffect, useState } from "react";
import { useSite } from "@/store/site";

export const daysEs = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

/** Calcula "Abierto/Cerrado" según la zona horaria configurada. Solo en cliente para evitar desajustes SSR. */
export function useOpenStatus() {
  const schedule = useSite((s) => s.schedule);
  const [status, setStatus] = useState<{ open: boolean; today: number; exception?: string | undefined; time: string } | null>(null);
  useEffect(() => {
    const calc = () => {
      const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: schedule.timezone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", weekday: "short", hour12: false,
      }).formatToParts(new Date());
      const g = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
      const date = `${g("year")}-${g("month")}-${g("day")}`;
      const hm = `${g("hour").replace("24", "00")}:${g("minute")}`;
      const today = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(g("weekday"));
      const ex = schedule.exceptions.find((e) => e.date === date);
      const day = schedule.days.find((d) => d.day === today);
      const open = !ex?.closed && !!day?.enabled && !!day.slots.some((s) => hm >= s.open && hm < s.close);
      setStatus({ open, today, exception: ex?.label, time: hm });
    };
    calc();
    const t = setInterval(calc, 30_000);
    return () => clearInterval(t);
  }, [schedule]);
  return status;
}
