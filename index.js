const { Telegraf, Markup } = require('telegraf');

const BOT_TOKEN = '8316748932:AAEiCsi8Ko0hyhW6WYSe-ANDW1K40aFZR2Y';
const OWNER_ID = 8062935882; 
const STORE_NAME = 'WALZY REKBER STORE';
const ADMIN_USERNAME = 'WalzyExploit';

const QRIS_IMAGE = 'https://i.postimg.cc/SKvzQmpc/QRIS.png';
const BANNER_IMAGE = 'https://i.postimg.cc/8C0rkTVz/1766936441710.png';

const PAYMENT_DATA = {
    dana: "0822-9890-2274",
    gopay: "0822-9890-2274",
    seabank: "901984771499",
    shopeepay: "0822-9890-2274",
    holder_name: "𝙒𝙖𝙡𝙯 𝙀𝙭𝙥𝙡𝙤𝙞𝙩"
};

const bot = new Telegraf(BOT_TOKEN);

const formatRp = (angka) => 'Rp ' + Number(angka).toLocaleString('id-ID');

const hitungFee = (nominal) => {
    if (nominal <= 5000) return 1000;
    if (nominal <= 10000) return 2000;
    if (nominal <= 20000) return 3000;
    if (nominal <= 50000) return 5000;
    if (nominal <= 100000) return 8000;
    return 10000;
};

const isOwner = (ctx) => ctx.from && ctx.from.id === OWNER_ID;

const showMainMenu = async (ctx, isEdit = false) => {
    const message = `
━━━ ❖ 𝗢𝗙𝗙𝗜𝗖𝗜𝗔𝗟 𝗥𝗘𝗞𝗕𝗘𝗥 ❖ ━━━
✨ **${STORE_NAME}** ✨
━━━━━━━━━━━━━━━━━━━━━━━━

Halo, ${ctx.from.first_name}! 👋
Gunakan bot ini untuk transaksi aman di dalam grup.

💰 **RATE CARD (BIAYA ADMIN):**
• 1k - 5k   : ${formatRp(1000)}
• 6k - 10k  : ${formatRp(2000)}
• 11k - 20k : ${formatRp(3000)}
• 21k - 50k : ${formatRp(5000)}
• 50k++     : ${formatRp(10000)}

👇 **CARA TRANSAKSI CEPAT:**
Ketik: \`.deal [nominal]\`
Contoh: \`.deal 50000\`

*Atau gunakan tombol di bawah:*
`;

    const keyboard = Markup.inlineKeyboard([
        [Markup.button.callback('💸 Hitung Fee Manual', 'ask_nominal')],
        [Markup.button.callback('🏧 List Rekening', 'payment_list')],
        [Markup.button.url('💬 Chat Admin', `https://t.me/${ADMIN_USERNAME}`)]
    ]);

    if (isEdit) {
        try {
            await ctx.editMessageMedia({ type: 'photo', media: BANNER_IMAGE, caption: message, parse_mode: 'Markdown' }, keyboard);
        } catch (e) {
            await ctx.replyWithPhoto(BANNER_IMAGE, { caption: message, parse_mode: 'Markdown', ...keyboard });
        }
    } else {
        await ctx.replyWithPhoto(BANNER_IMAGE, { caption: message, parse_mode: 'Markdown', ...keyboard });
    }
};

bot.start((ctx) => showMainMenu(ctx, false));
bot.action('main_menu', (ctx) => showMainMenu(ctx, true));

bot.action('ask_nominal', async (ctx) => {
    await ctx.deleteMessage();
    await ctx.reply('🔢 Silakan **REPLY/BALAS** pesan ini dengan nominal harga barang (Angka saja).', {
        reply_markup: { force_reply: true }
    });
});

const prosesInvoice = async (ctx, nominalInput) => {
    const cleanNumber = parseInt(nominalInput.replace(/[^0-9]/g, ''));
    if (isNaN(cleanNumber) || cleanNumber < 1000) return;

    const fee = hitungFee(cleanNumber);
    const total = cleanNumber + fee;

    const message = `
💳 **INVOICE TRANSAKSI**
━━━━━━━━━━━━━━━━━━━━━━━━
👤 **Buyer:** ${ctx.from.first_name}
⚠️ **Status:** Menunggu Pembayaran

💵 **Harga:** ${formatRp(cleanNumber)}
⚙️ **Admin:** ${formatRp(fee)}
━━━━━━━━━━━━━━━━━━━━━━━━
💰 **TOTAL: ${formatRp(total)}**

Silakan transfer **PAS** ke:

💠 **QRIS (ALL PAYMENT):**
*(Scan gambar di atas)*

🏦 **DANA/E-WALLET:**
\`${PAYMENT_DATA.dana}\`
(a/n ${PAYMENT_DATA.holder_name})

*Jangan lupa kirim bukti transfer!*
`;

    await ctx.replyWithPhoto(QRIS_IMAGE, {
        caption: message,
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
             [Markup.button.callback('❌ Batal / Hitung Ulang', 'main_menu')]
        ])
    });
};

bot.on('text', async (ctx) => {
    const text = ctx.message.text;

    if (text.toLowerCase().startsWith('.deal')) {
        const nominal = text.split(' ')[1];
        if (!nominal) return ctx.reply('⚠️ Format salah. Ketik: `.deal 50000`', { reply_to_message_id: ctx.message.message_id });
        return prosesInvoice(ctx, nominal);
    }

    if (ctx.message.reply_to_message && ctx.message.reply_to_message.from.id === ctx.botInfo.id) {
        if (ctx.message.reply_to_message.text.includes('REPLY/BALAS')) {
            return prosesInvoice(ctx, text);
        }
    }
});

bot.action('payment_list', async (ctx) => {
    const message = `
🏧 **LIST REKENING WALZY**
━━━━━━━━━━━━━━━━━━━━━━━━
🏦 **DANA**
\`${PAYMENT_DATA.dana}\`

🏦 **GOPAY**
\`${PAYMENT_DATA.gopay}\`

🏦 **SEABANK**
\`${PAYMENT_DATA.seabank}\`

👤 **A/N:** \`${PAYMENT_DATA.holder_name}\`
`;
    await ctx.editMessageMedia({ type: 'photo', media: QRIS_IMAGE, caption: message, parse_mode: 'Markdown' }, 
        Markup.inlineKeyboard([[Markup.button.callback('🔙 Kembali', 'main_menu')]])
    );
});

bot.hears(/^\.d/i, (ctx) => {
    if (!isOwner(ctx)) return;
    
    ctx.deleteMessage().catch(() => {});

    const message = `
✅ **DANA SUDAH DIAMANKAN**
━━━━━━━━━━━━━━━━━━━━━━━━
💰 **Status:** PAID / LUNAS
👤 **Admin:** Verifikasi Sukses

📢 **INSTRUKSI:**

📦 **KEPADA SELLER:**
Silakan **KIRIM DATA/BARANG** ke Buyer sekarang juga.
*(Wajib kirim bukti di sini setelah mengirim)*

🛒 **KEPADA BUYER:**
Mohon tunggu & segera amankan data jika sudah diterima.

⚠️ *Bot memantau transaksi ini.*
━━━━━━━━━━━━━━━━━━━━━━━━
🤖 *System by ${STORE_NAME}*
`;
    ctx.reply(message, { parse_mode: 'Markdown' });
});

bot.hears(/^\.pay/i, (ctx) => {
    if (!isOwner(ctx)) return;

    ctx.deleteMessage().catch(() => {});

    const message = `
🎉 **TRANSAKSI SELESAI (DONE)**
━━━━━━━━━━━━━━━━━━━━━━━━
✅ **Barang:** Diterima Buyer
💸 **Status:** Pencairan Dana

👋 **Halo Seller,**
Silakan balas pesan ini dengan data pencairanmu:

📝 **FORMAT:**
\`Bank/E-wallet :\`
\`Nomor Rekening:\`
\`Atas Nama     :\`

⏳ *Dana OTW cair dalam 1-5 Menit.*
━━━━━━━━━━━━━━━━━━━━━━━━
`;
    ctx.reply(message, { parse_mode: 'Markdown' });
});

bot.launch().then(() => console.log('Bot Rekber Started'));
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
