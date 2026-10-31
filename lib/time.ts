export const ZONE = 'Asia/Taipei';
export function localDate(now = new Date()) { return new Intl.DateTimeFormat('sv-SE',{timeZone:ZONE,year:'numeric',month:'2-digit',day:'2-digit'}).format(now); }
export function currentMonth(now = new Date()) { return localDate(now).slice(0,7); }
export function monthRange(month:string) {
  if(!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) throw new Error('月份格式錯誤');
  const [y,m]=month.split('-').map(Number);
  return {gte:new Date(`${month}-01T00:00:00+08:00`),lt:new Date(Date.UTC(y,m,1,-8))};
}
export function shiftMonth(month:string,n:number) {const [y,m]=month.split('-').map(Number);return currentMonth(new Date(Date.UTC(y,m-1+n,15)));}
export function parseDate(text:string,now=new Date()) {
  const explicit=text.match(/(\d{4}-\d{2}-\d{2})/);
  let date=explicit?.[1] || localDate(now);
  if(/昨天|昨日/.test(text)) date=localDate(new Date(now.getTime()-86400000));
  const d=new Date(`${date}T12:00:00+08:00`);
  if(Number.isNaN(d.getTime())||localDate(d)!==date)throw new Error('日期不存在');
  return d;
}
