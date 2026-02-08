const { Telegraf, Markup } = require('telegraf')
const Database = require('better-sqlite3')
const axios = require('axios')

const BOT_TOKEN = '8316748932:AAEiCsi8Ko0hyhW6WYSe-ANDW1K40aFZR2Y'
const OWNER_ID = 8062935882
const STORE_NAME = 'WALZY REKBER STORE'
const ADMIN_USERNAME = 'WalzyExploit'

const QRIS_IMAGE = 'https://i.postimg.cc/SKvzQmpc/QRIS.png'
const BANNER_IMAGE = 'https://i.postimg.cc/8C0rkTVz/1766936441710.png'

const PAYMENT_DATA = {
    dana:'082298902274',
    gopay:'082298902274',
    seabank:'901984771499',
    shopeepay:'082298902274',
    holder_name:'HARxxxnto'
}

const bot = new Telegraf(BOT_TOKEN)
const db = new Database('rekber.db')

db.exec(`
CREATE TABLE IF NOT EXISTS invoices (
 id TEXT PRIMARY KEY,
 buyer INTEGER,
 chat INTEGER,
 nominal INTEGER,
 fee INTEGER,
 total INTEGER,
 status TEXT,
 message INTEGER,
 created INTEGER
);
`)

const esc = t=>t.replace(/([_*[\]()~`>#+\-=|{}.!\\])/g,'\\$1')
const rp = n=>'Rp '+Number(n).toLocaleString('id-ID')
const mask = n=>n.replace(/(\d{3,4})\d+(\d{3,4})/,'$1****$2')
const fee = n=>n<=50000?15000:n<=99000?20000:n<=150000?25000:30000
const invID = ()=>'INV-'+Date.now().toString(36).toUpperCase()
const isGroup = ctx=>['group','supergroup'].includes(ctx.chat?.type)
const isOwner = ctx=>ctx.from?.id===OWNER_ID

const menu = async(ctx,edit=false)=>{
 if(!isGroup(ctx))return
 const text=esc(`
━━━━━━━━━━━━━━━━━━━━━━
${STORE_NAME}
━━━━━━━━━━━━━━━━━━━━━━

🔐 Aman
📦 Otomatis
🌐 Real-Time
`.trim())
 const kb=Markup.inlineKeyboard([
  [Markup.button.callback('🧾 Buat Invoice','ask')],
  [Markup.button.callback('📊 Riwayat','history')],
  [Markup.button.url('🧑‍💻 Admin',`https://t.me/${ADMIN_USERNAME}`)]
 ])
 if(edit){
  try{await ctx.editMessageMedia({type:'photo',media:BANNER_IMAGE,caption:text},{parse_mode:'MarkdownV2',...kb})}
  catch{await ctx.replyWithPhoto(BANNER_IMAGE,{caption:text,parse_mode:'MarkdownV2',...kb})}
 }else{
  await ctx.replyWithPhoto(BANNER_IMAGE,{caption:text,parse_mode:'MarkdownV2',...kb})
 }
}

bot.start(ctx=>menu(ctx))
bot.action('main',ctx=>menu(ctx,true))

bot.action('ask',async ctx=>{
 if(!isGroup(ctx))return
 const active=db.prepare('SELECT id FROM invoices WHERE buyer=? AND chat=? AND status=?')
 .get(ctx.from.id,ctx.chat.id,'MENUNGGU TRANSFER')
 if(active)return ctx.answerCbQuery('Masih ada invoice aktif',{show_alert:true})
 await ctx.deleteMessage().catch(()=>{})
 await ctx.reply(esc('Masukkan nominal'),{parse_mode:'MarkdownV2',reply_markup:{force_reply:true}})
})

bot.on('text',async ctx=>{
 if(!isGroup(ctx))return
 if(ctx.message.text.startsWith('/')||ctx.message.text.startsWith('.'))return
 const nominal=parseInt(ctx.message.text.replace(/\D/g,''))
 if(isNaN(nominal)||nominal<1000)return
 const f=fee(nominal)
 const total=nominal+f
 const id=invID()
 const text=esc(`
━━━━━━━━━━━━━━━━━━━━━━
🧾 INVOICE ${id}
━━━━━━━━━━━━━━━━━━━━━━

Status : ⏳ MENUNGGU TRANSFER

Harga : ${rp(nominal)}
Fee   : ${rp(f)}
━━━━━━
Total : ${rp(total)}

DANA      : ${mask(PAYMENT_DATA.dana)}
GOPAY     : ${mask(PAYMENT_DATA.gopay)}
SEABANK   : ${mask(PAYMENT_DATA.seabank)}
SHOPEEPAY : ${mask(PAYMENT_DATA.shopeepay)}

A/N : ${PAYMENT_DATA.holder_name}
`.trim())

 const msg=await ctx.replyWithPhoto(QRIS_IMAGE,{
  caption:text,
  parse_mode:'MarkdownV2',
  ...Markup.inlineKeyboard([
   [Markup.button.callback('👁 Nomor Lengkap',`show_${id}`)],
   [Markup.button.callback('🏠 Menu','main')]
  ])
 })

 db.prepare('INSERT INTO invoices VALUES (?,?,?,?,?,?,?,?,?)')
 .run(id,ctx.from.id,ctx.chat.id,nominal,f,total,'MENUNGGU TRANSFER',msg.message_id,Date.now())

 axios.post('http://localhost:3000/update',{id}).catch(()=>{})

 bot.telegram.sendMessage(ctx.from.id,esc(`Invoice ${id}\nTotal ${rp(total)}`),{parse_mode:'MarkdownV2'}).catch(()=>{})

 setTimeout(async()=>{
  const inv=db.prepare('SELECT * FROM invoices WHERE id=?').get(id)
  if(!inv||inv.status!=='MENUNGGU TRANSFER')return
  db.prepare('UPDATE invoices SET status=? WHERE id=?').run('DIBATALKAN OTOMATIS',id)
  await bot.telegram.editMessageCaption(inv.chat,inv.message,null,
   esc(`INVOICE ${id}\nStatus : DIBATALKAN`),{parse_mode:'MarkdownV2'}).catch(()=>{})
  axios.post('http://localhost:3000/update',{id}).catch(()=>{})
 },600000)
})

bot.on('photo',async ctx=>{
 if(!isGroup(ctx))return
 const inv=db.prepare('SELECT * FROM invoices WHERE buyer=? AND chat=? AND status=?')
 .get(ctx.from.id,ctx.chat.id,'MENUNGGU TRANSFER')
 if(!inv)return
 db.prepare('UPDATE invoices SET status=? WHERE id=?').run('BUKTI DIKIRIM',inv.id)
 await bot.telegram.editMessageCaption(inv.chat,inv.message,null,
  esc(`INVOICE ${inv.id}\nStatus : BUKTI DIKIRIM`),{parse_mode:'MarkdownV2'}).catch(()=>{})
 bot.telegram.sendMessage(inv.buyer,esc(`Bukti diterima\nInvoice ${inv.id}`),{parse_mode:'MarkdownV2'}).catch(()=>{})
 axios.post('http://localhost:3000/update',{id:inv.id}).catch(()=>{})
})

bot.action(/show_(.+)/,async ctx=>{
 const id=ctx.match[1]
 const inv=db.prepare('SELECT * FROM invoices WHERE id=?').get(id)
 if(!inv||inv.buyer!==ctx.from.id)return ctx.answerCbQuery('Akses ditolak',{show_alert:true})
 const sent=await ctx.reply(esc(`
DANA      : ${PAYMENT_DATA.dana}
GOPAY     : ${PAYMENT_DATA.gopay}
SEABANK   : ${PAYMENT_DATA.seabank}
SHOPEEPAY : ${PAYMENT_DATA.shopeepay}
A/N : ${PAYMENT_DATA.holder_name}
`),{parse_mode:'MarkdownV2'})
 setTimeout(()=>ctx.deleteMessage(sent.message_id).catch(()=>{}),30000)
})

bot.hears(/^\.ok (INV-.+)/i,ctx=>{
 if(!isOwner(ctx))return
 const id=ctx.match[1]
 const inv=db.prepare('SELECT * FROM invoices WHERE id=?').get(id)
 if(!inv)return
 db.prepare('UPDATE invoices SET status=? WHERE id=?').run('DANA AMAN',id)
 bot.telegram.editMessageCaption(inv.chat,inv.message,null,
  esc(`INVOICE ${id}\nStatus : DANA AMAN`),{parse_mode:'MarkdownV2'}).catch(()=>{})
 bot.telegram.sendMessage(inv.buyer,esc(`Invoice ${id}\nDana aman`),{parse_mode:'MarkdownV2'}).catch(()=>{})
 axios.post('http://localhost:3000/update',{id}).catch(()=>{})
})

bot.launch()
process.once('SIGINT',()=>bot.stop())
process.once('SIGTERM',()=>bot.stop())