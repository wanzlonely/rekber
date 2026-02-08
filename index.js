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
    holder_name: " HARxxxnto"
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
Selamat datang di layanan Jasa Rekber **Walzy Exploit**.

💰 **RATE CARD (BIAYA ADMIN):**
• 1k - 5k   : ${formatRp(1000)}
• 6k - 10k  : ${formatRp(2000)}
• 11k - 20k : ${formatRp(3000)}
• 21k - 50k : ${formatRp(5000)}
• 50k++     : ${formatRp(10000)}

👇 **KLIK TOMBOL DI BAWAH UNTUK TRANSAKSI:**
`;

    const keyboard = Markup.inlineKeyboard([
        [Markup.button.callback('💸 Mulai Transaksi (Hitung Fee)', 'ask_nominal')],
        [Markup.button.callback('🏧 Cek List Rekening', 'payment_list')],
        [Markup.button.callback('📜 Aturan', 'rules_menu')],
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
    const message = `
🔢 **MASUKKAN HARGA BARANG**
━━━━━━━━━━━━━━━━━━━━━━━━

Silakan balas pesan ini dengan mengetik **HARGA BARANG** (Nominal) saja.
Bot akan otomatis menghitung Fee Admin.

📝 **Contoh:**
Ketik: \`50000\`
Ketik: \`15000\`

👇 *Silakan ketik angkanya sekarang...*
`;
    await ctx.reply(message, { parse_mode: 'Markdown' });
});

bot.on('text', async (ctx) => {
    const text = ctx.message.text;

    if (text.startsWith('.') || text.startsWith('/')) return;

    const cleanNumber = parseInt(text.replace(/[^0-9]/g, ''));

    if (isNaN(cleanNumber) || cleanNumber < 1000) return;

    const fee = hitungFee(cleanNumber);
    const total = cleanNumber + fee;

    const message = `
💳 **TAGIHAN PEMBAYARAN**
━━━━━━━━━━━━━━━━━━━━━━━━
Dihitung otomatis oleh System:

💵 **Harga Barang:** ${formatRp(cleanNumber)}
⚙️ **Biaya Admin:** ${formatRp(fee)}
━━━━━━━━━━━━━━━━━━━━━━━━
💰 **TOTAL TRANSFER: ${formatRp(total)}**

Silakan transfer **PAS** (${formatRp(total)}) ke:

💠 **SCAN QRIS (ALL E-WALLET):**
*(Gambar di atas)*

💠 **MANUAL TRANSFER:**
🏦 **DANA:** \`${PAYMENT_DATA.dana}\`
🏦 **GOPAY:** \`${PAYMENT_DATA.gopay}\`
🏦 **SEABANK:** \`${PAYMENT_DATA.seabank}\`
👤 **A/N:** \`${PAYMENT_DATA.holder_name}\`

⚠️ *Kirim bukti transfer sekarang agar diproses!*
`;

    await ctx.replyWithPhoto(QRIS_IMAGE, {
        caption: message,
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
             [Markup.button.callback('🔙 Hitung Ulang', 'ask_nominal')],
             [Markup.button.callback('🏠 Menu Utama', 'main_menu')]
        ])
    });
});

bot.action('payment_list', async (ctx) => {
    const message = `
🏧 **LIST REKENING RESMI**
━━━━━━━━━━━━━━━━━━━━━━━━
Hanya transfer ke nomor berikut:

🏦 **DANA**
\`${PAYMENT_DATA.dana}\`

🏦 **GOPAY**
\`${PAYMENT_DATA.gopay}\`

🏦 **SEABANK**
\`${PAYMENT_DATA.seabank}\`

🏦 **SHOPEEPAY**
\`${PAYMENT_DATA.shopeepay}\`

👤 **A/N:** \`${PAYMENT_DATA.holder_name}\`
`;
    await ctx.editMessageMedia({ type: 'photo', media: QRIS_IMAGE, caption: message, parse_mode: 'Markdown' }, 
        Markup.inlineKeyboard([[Markup.button.callback('🔙 Kembali', 'main_menu')]])
    );
});

bot.action('rules_menu', async (ctx) => {
    const message = `
📜 **ATURAN TRANSAKSI**
━━━━━━━━━━━━━━━━━━━━━━━━
1. Buat grup dengan Admin.
2. Klik tombol "Mulai Transaksi" di Bot.
3. Masukkan harga barang.
4. Transfer sesuai Total.
5. Tunggu konfirmasi Admin.
`;
    await ctx.editMessageCaption(message, { parse_mode: 'Markdown', ...Markup.inlineKeyboard([[Markup.button.callback('🔙 Kembali', 'main_menu')]]) });
});

bot.hears(/^\.d/i, (ctx) => {
    if (!isOwner(ctx)) return;

    const message = `
✅ **DANA SUDAH DIAMANKAN**
━━━━━━━━━━━━━━━━━━━━━━━━
👤 **Status:** Pembayaran Buyer Terverifikasi Valid
💰 **Keterangan:** Dana telah masuk ke rekening Admin.

📢 **INSTRUKSI SELANJUTNYA:**

1️⃣ **UNTUK SELLER:**
Silakan segera kirimkan Data/Barang/Akun kepada Buyer sekarang juga.
*Wajib kirim bukti pengiriman di grup ini.*

2️⃣ **UNTUK BUYER:**
Silakan tunggu Seller mengirimkan pesanan. Segera cek dan amankan data jika sudah diterima.

⚠️ *Transaksi sedang berlangsung. Dilarang menghapus chat!*
━━━━━━━━━━━━━━━━━━━━━━━━
🤖 *System by ${STORE_NAME}*
`;
    ctx.reply(message, { parse_mode: 'Markdown' });
});

bot.hears(/^\.pay/i, (ctx) => {
    if (!isOwner(ctx)) return;

    const message = `
🎉 **TRANSAKSI SUKSES (DONE)**
━━━━━━━━━━━━━━━━━━━━━━━━
✅ **Status:** Barang Diterima & Sesuai
💸 **Tahap:** Pencairan Dana ke Seller

Kepada **Seller**, silakan balas pesan ini dengan format pencairan dana:

📝 **FORMAT CAIR:**
\`Bank/E-wallet :\`
\`Nomor Rekening:\`
\`Atas Nama     :\`

⏳ *Dana akan diproses Admin segera setelah data diterima.*

Terima kasih sudah menggunakan jasa **${STORE_NAME}**! 🤝
━━━━━━━━━━━━━━━━━━━━━━━━
`;
    ctx.reply(message, { parse_mode: 'Markdown' });
});

bot.launch().then(() => console.log('Bot Rekber Started'));
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
