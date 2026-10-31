import {lineUser} from '@/lib/db';
import {chat} from '@/lib/chat';
import {pairingReply,queryReply,sendReply,verifyLineSignature} from '@/lib/line';

// Render runs a single web process, so handle LINE events inline instead of
// relying on a separate background worker that is not present in the Docker image.
export async function POST(req:Request){
  try{
    const body=await req.text();
    const payload=JSON.parse(body);
    if(Array.isArray(payload.events)&&payload.events.length===0)return Response.json({ok:true});
    if(!verifyLineSignature(body,req.headers.get('x-line-signature')||''))return Response.json({error:'invalid_signature'},{status:401});
    for(const event of payload.events||[]){
      if(!event?.source?.userId||!event.replyToken)continue;
      let result:string|undefined;
      const user=await lineUser(event.source.userId);
      if(event.type==='message'&&event.message?.type==='text'&&!user&&event.message.text.trim()===(process.env.LINE_PAIRING_CODE||'')){
        result=await pairingReply(event);
      }else if(!user){
        result='此 LINE 帳號尚未授權，請先傳送配對碼。';
      }else if(event.type==='postback'){
        result=await queryReply(new URLSearchParams(event.postback?.data||'').get('action')||'');
      }else if(event.type==='message'&&event.message?.type==='text'){
        result=await chat(user.id,event.message.text,event.webhookEventId||event.message.id||'line');
      }
      if(result)await sendReply(event.replyToken,result);
    }
    return Response.json({ok:true});
  }catch(e){return Response.json({error:e instanceof Error?e.message:'Webhook 無法接收，請重送'},{status:503});}
}
