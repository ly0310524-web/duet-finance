import {z} from 'zod';
import {parseDate} from './time';
import {entrySchema,Entry} from './ledger';

export type ParseResult={entries:Entry[]}|{question:string};

const marketNames={US:'美區',UK:'英區',EU:'歐盟'} as const;
function normalize(input:string){return input.replace(/美区/g,'美區').replace(/英区/g,'英區').replace(/美国/g,'美國').replace(/英国/g,'英國').replace(/欧盟/g,'歐盟').replace(/欧区/g,'歐區').replace(/人民币/g,'人民幣').replace(/台币|臺幣/g,'台幣').replace(/工资/g,'薪資').replace(/奖金/g,'獎金').replace(/购物/g,'購物').replace(/娱乐/g,'娛樂').replace(/存钱/g,'存錢').replace(/取钱/g,'取錢').replace(/昨天|昨日/g,'昨天');}

/**
 * Fast local parsing for the conversational forms people actually use.
 * Explicit 收入/支出 always means the daily ledger unless a market/company is named.
 */
export function ruleParse(original:string):ParseResult|null{
 const text=normalize(original.normalize('NFKC')).trim();
 const clean=text.replace(/\d{4}-\d{2}-\d{2}/g,'');
 const amounts=[...clean.matchAll(/\d[\d,]*(?:\.\d+)?/g)];
 if(amounts.length!==1)return {question:amounts.length===0?'請補上金額，例如「支出200吃飯」。':'這句有多個金額，請用換行分開每一筆。'};
 if(/-\s*\d/.test(clean))return {question:'金額必須大於零，請用收入或支出表示方向。'};
 const amount=Number(amounts[0][0].replaceAll(',',''));
 if(amount<=0)return {question:'金額必須大於零。'};
 const market=/美區|美國|\bUS\b/i.test(text)?'US':/英區|英國|\bUK\b/i.test(text)?'UK':/歐盟|歐區|\bEU\b/i.test(text)?'EU':undefined;
 const marketCount=[/美區|美國|\bUS\b/i,/英區|英國|\bUK\b/i,/歐盟|歐區|\bEU\b/i].filter(r=>r.test(text)).length;
 if(marketCount>1)return {question:'這筆屬於哪個市場？請指定美國、英國或歐盟其中一個。'};
 const company=!!market||/公司|企業|企业/.test(text);
 if(company&&!market)return {question:'公司帳本需要市場，請回覆美區、英區或歐盟。'};
 const saving=/^\s*(存|取)|\b(存入|取出)\b/.test(text);
 const directionText=text.replace(/收據|收据/g,'');
 const income=/收入|入帳|入账|進帳|进账|入款|收款|收到|收取|收錢|收钱|收|薪資|薪水|工資|工资|獎金|奖金|副業|佣金|回款|到帳|到账|領到|领到|賺到|赚到|賺|赚/.test(directionText)||/^\s*取/.test(text);
 const expense=/支出|花費|花费|花了|花|消費|消费|付款|支付|付錢|付钱|付了|付|購買|购买|買|买|刷卡|扣款|扣了|繳費|缴费|繳|缴|買單|买单|房租|交通/.test(text);
 if(income&&expense)return {question:'這筆同時出現收入和支出用詞，請確認要記成哪一種。'};
 const explicit=income||expense||saving;
 if(company&&!explicit)return {question:'這筆公司款項是收入還是支出？'};
 // Bare forms such as 午餐200 remain supported through the known vocabulary.
 const known=/早餐|午餐|晚餐|餐飲|餐饮|外賣|外卖|購物|交通|居住|娛樂|旅行|醫療|医疗|房租|水電|水电|網路費|网络费|咖啡|買鞋|买鞋|薪資|薪水|獎金|奖金|副業|買菜|吃飯|吃饭/.test(text);
 if(!company&&!saving&&!explicit&&!known&&!/日常/.test(text))return null;
 const currency=/TWD|NTD|NT\$|台幣|新台幣/i.test(text)?'TWD':/USD|美元|美金/i.test(text)?'USD':/GBP|英鎊|英镑/i.test(text)?'GBP':/EUR|歐元/i.test(text)?'EUR':'CNY';
 if(saving&&currency!=='CNY')return {question:'共同存取款請使用人民幣金額，例如「存 1000」。'};
 const direction=income?'income':'expense';
 const withoutMeta=text.replace(/\d[\d,]*(?:\.\d+)?/g,'').replace(/(?:元|塊|块|人民幣|台幣|美元|美金|英鎊|歐元|CNY|TWD|USD|GBP|EUR)/gi,'').replace(/美區|美國|英區|英國|歐盟|歐區|\bUS\b|\bUK\b|\bEU\b/gi,'').replace(/公司|企業|企业|日常/g,'').replace(/收入|入帳|入账|進帳|进账|入款|收到|收取|收款|收錢|收钱|收|薪資|薪水|工資|工资|獎金|奖金|副業|佣金|回款|到帳|到账|領到|领到|賺到|赚到|賺|赚|支出|花費|花费|花了|花|消費|消费|付款|支付|付錢|付钱|付了|付|刷卡|扣款|扣了|繳費|缴费|繳|缴|買單|买单|購買|购买|存入|取出|存錢|存钱|存|取/g,'').replace(/收據|收据|昨天|今天|日期/g,'').replace(/[：:，,、。.!！?？]/g,' ').replace(/\s+/g,' ').trim();
 const knownCategory=text.match(/早餐|午餐|晚餐|外賣|外卖|網路費|网络费|水電費|水电费|水電|水电|買衣服|买衣服|買鞋|买鞋|購物|購買|购物|买|買|交通|居住|娛樂|娱乐|旅行|醫療|医疗|房租|咖啡|打車|打车|薪資|薪水|獎金|奖金|副業|買菜|吃飯|吃饭/)?.[0];
 const category=saving?(direction==='expense'?'存錢':'存款取出'):withoutMeta.slice(0,40)||(knownCategory|| (company?'公司收支':direction==='income'?'其他收入':'其他支出'));
 return {entries:[entrySchema.parse({ledger:company?'company':'daily',market, direction,kind:saving?'save':'normal',category,amount,currency,note:original,date:parseDate(text)})]};
}

export async function parseMessage(text:string):Promise<ParseResult>{
 const parts=text.split(/[\n；;]/).map(s=>s.trim()).filter(Boolean);
 if(parts.length>1){if(parts.length>20)return {question:'每次最多記錄 20 筆。'};const entries:Entry[]=[];for(const part of parts){const parsed=await parseMessage(part);if('question'in parsed)return parsed;entries.push(...parsed.entries);}return {entries};}
 const rule=ruleParse(text);if(rule)return rule;
 if(!process.env.AI_API_KEY)return {question:'請告訴我收入或支出、金額與用途。沒有美國／英國／歐盟時會記入日常；公司帳本請加上市場。'};
 const result=await fetch(`${(process.env.AI_BASE_URL||'https://api.openai.com/v1').replace(/\/$/,'')}/chat/completions`,{method:'POST',headers:{Authorization:`Bearer ${process.env.AI_API_KEY}`,'Content-Type':'application/json'},signal:AbortSignal.timeout(15000),body:JSON.stringify({model:process.env.AI_MODEL||'gpt-4o-mini',temperature:0,response_format:{type:'json_object'},messages:[{role:'system',content:`你是私人記帳解析器。只輸出 JSON {entries:[{ledger:daily|company,market:US|UK|EU|null,direction:income|expense,kind:normal|save,category,note,amount,currency:CNY|TWD|USD|GBP|EUR,date:YYYY-MM-DD}]} 或 {question:追問}。日期使用 Asia/Taipei。沒有提到幣別時 currency 一律填 CNY；寫台幣、台币、TWD 或新台幣時填 TWD，並保留原始金額。沒有提到美國、英國、歐盟或公司時，一律 ledger=daily；「收入、收、收到、收款、入帳、進帳、薪資」代表收入；「支出、付、付款、支付、刷卡、扣款、消費、花費」代表支出。多種詞序都要辨識；若收入與支出詞同時出現則追問。提到公司但沒有市場時必須追問；可辨識元/塊/人民幣與中英文市場寫法。存錢是日常支出save；取錢是日常收入save。不得猜測金額。`},{role:'user',content:text}]})});
 if(!result.ok)throw new Error('AI 解析暫時無法使用');
 const body=await result.json();const raw=JSON.parse(body.choices[0].message.content);if(raw.question)return {question:z.string().max(500).parse(raw.question)};const entries=z.array(z.any()).min(1).max(20).parse(raw.entries).map(e=>entrySchema.parse({...e,date:parseDate(e.date)}));return {entries};
}
