export function profitMetrics(income:number,expense:number){
 const profit=income-expense;
 return {profit,margin:income===0?0:profit/income*100};
}
