import { query } from '../config/db.js';

const blogs = [
  {
    title: "BC Agents: Bharat ke Asli Banking Heroes",
    slug: "bc-agents-bharat-ke-asli-banking-heroes",
    category_id: 1,
    tag: "Finance",
    status: "published",
    published_at: "2025-06-01 10:00:00",
    cover_image_url: "https://images.pexels.com/photos/3943716/pexels-photo-3943716.jpeg?auto=compress&w=1200",
    excerpt: "Jaaniye kaise UFS Digital ke BC Agents gramin Bharat mein banking ki nayi kranti la rahe hain — ek ek gaon mein, ek ek parivar tak.",
    content: `<h2><span style="color: #0079c8;">BC Agent Kya Hota Hai?</span></h2><p>Business Correspondent (BC) Agent ek aisa vyakti hota hai jo bank ki taraf se seedha aapke gaon mein banking services provide karta hai. Yeh log <strong>bank ka chehra</strong> hote hain un logon ke liye jo kabhi bank branch nahi gaye.</p><h2>UFS Digital ka Network</h2><p>UFS Digital ke paas aaj <strong>23 states</strong> mein phela hua ek vishaal BC network hai. Hamare agents rozana <span style="color: #c87900;">2.5 lakh se zyada transactions</span> process karte hain.</p><blockquote>\"Pehle mujhe 40 km door bank jaana padta tha. Ab mere gaon mein hi sab kuch ho jaata hai.\" — Ramesh Kumar, Uttar Pradesh</blockquote><h2>Kya Kya Services Milti Hain?</h2><ul><li>Cash Deposit &amp; Withdrawal</li><li>AEPS (Aadhaar Enabled Payment System)</li><li>Money Transfer (IMPS/NEFT)</li><li>Account Opening</li><li>Insurance Premium Collection</li><li>Government Scheme Benefits</li></ul><h2><span style="color: #0079c8;">BC Agent Banne Ke Fayde</span></h2><p>Ek BC Agent banne se aapko milta hai:</p><ol><li><strong>Guaranteed Commission</strong> — har transaction par</li><li>Training &amp; Support — UFS Digital ki taraf se</li><li>Technology Platform — free of cost</li><li>Brand Recognition — trusted banking partner</li></ol><p>Agar aap bhi apne area mein financial inclusion ka hissa banna chahte hain, toh aaj hi <a href="/become-agent" rel="noopener noreferrer" target="_blank">BC Agent ke liye apply karein</a>.</p>`
  },
  {
    title: "Digital Payments in Rural India: The UFS Story",
    slug: "digital-payments-rural-india-ufs-story",
    category_id: 2,
    tag: "Technology",
    status: "published",
    published_at: "2025-05-20 10:00:00",
    cover_image_url: "https://images.pexels.com/photos/6289065/pexels-photo-6289065.jpeg?auto=compress&w=1200",
    excerpt: "From UPI setup to AEPS services, learn how UFS Digital is driving digital payment adoption in underserved communities across India.",
    content: `<h2><span style="color: #0079c8;">The Digital Payment Revolution</span></h2><p>India's digital payment ecosystem has grown <strong>exponentially</strong> over the last five years. But this growth has largely been concentrated in urban areas. UFS Digital is changing that narrative.</p><h2>Technology at the Last Mile</h2><p>Our proprietary platform enables BC agents to process transactions even in areas with <span style="color: #c87900;">low internet connectivity</span>. Using offline-first architecture, agents can:</p><ul><li>Process AEPS transactions with biometric authentication</li><li>Accept UPI payments via QR codes</li><li>Issue micro-insurance policies on the spot</li><li>Verify Aadhaar-linked bank accounts instantly</li></ul><h2>The Numbers Speak</h2><p>In FY 2024-25, UFS Digital processed over <strong>₹1,200 crore</strong> in digital transactions through our rural network. This represents a <span style="color: #0079c8;">340% growth</span> from the previous year.</p><blockquote>"Technology should not be a barrier — it should be a bridge. That is exactly what we are building at UFS Digital." — Priya Sharma, CTO</blockquote><h2>What's Next?</h2><p>We are currently piloting <strong>AI-powered fraud detection</strong> and <strong>vernacular language interfaces</strong> to make our platform even more accessible.</p>`
  },
  {
    title: "BC SAKHIs: Mahilaaon Ki Arthik Shakti",
    slug: "bc-sakhis-mahilaon-ki-arthik-shakti",
    category_id: 3,
    tag: "Empowerment",
    status: "published",
    published_at: "2025-05-10 10:00:00",
    cover_image_url: "https://images.pexels.com/photos/16599525/pexels-photo-16599525.jpeg?auto=compress&w=1200",
    excerpt: "Miliye un mahila udyamiyaon se jo apne gaon mein banking ki nayi pehchaan ban rahi hain — BC SAKHI programme ke zariye.",
    content: `<h2><span style="color: #0079c8;">BC SAKHI Programme Kya Hai?</span></h2><p>BC SAKHI (Self Assistance Kendra for Holistic Inclusion) ek aisa programme hai jisme <strong>mahilaaon ko BC Agent</strong> banaya jaata hai. Yeh sirf ek naukri nahi — yeh ek <span style="color: #c87900;">samajik kranti</span> hai.</p><h2>Sunita Ki Kahani</h2><p>Sunita Devi, Jharkhand ke ek chhote se gaon se hain. 2 saal pehle unke paas koi regular income nahi thi. Aaj woh UFS Digital ki BC SAKHI hain aur mahine mein <strong>₹18,000 se ₹25,000</strong> kamaati hain.</p><blockquote>"Pehle log mujhe sirf 'ghar wali' kehte the. Ab poora gaon mujhe 'Bank Didi' kehta hai." — Sunita Devi, Jharkhand</blockquote><h2>Programme Ke Fayde</h2><ul><li><strong>Free Training</strong> — 15 din ki comprehensive training</li><li>Starter Kit — device, printer, aur accessories</li><li>Monthly Stipend — training period mein</li><li>Performance Bonus — targets achieve karne par</li><li>Health Insurance — agent aur family ke liye</li></ul><h2>Abhi Tak Ki Uplabdhiyaan</h2><p>UFS Digital ke BC SAKHI programme mein abhi tak <strong>12,000+ mahilaaon</strong> ko training di ja chuki hai. Inke zariye <span style="color: #0079c8;">8 lakh se zyada gramin mahilaaon</span> ko pehli baar banking services mili hain.</p>`
  },
  {
    title: "Kisan4U: Khet Se Bazaar Tak Ka Safar",
    slug: "kisan4u-khet-se-bazaar-tak",
    category_id: 2,
    tag: "Technology",
    status: "published",
    published_at: "2025-04-15 10:00:00",
    cover_image_url: "https://images.pexels.com/photos/2933243/pexels-photo-2933243.jpeg?auto=compress&w=1200",
    excerpt: "UFS Digital ka Kisan4U platform kaise kisan bhaion ko seedha buyers se connect kar raha hai aur beechiye ki zaroorat khatam kar raha hai.",
    content: `<h2><span style="color: #0079c8;">Kisan4U: Ek Nayi Soch</span></h2><p>Bharat mein 86% kisan <strong>chhote aur marginal farmers</strong> hain. Inki sabse badi problem hai — unki fasal ka sahi daam nahi milta. <strong>Kisan4U</strong> is problem ka solution hai.</p><h2>Platform Kaise Kaam Karta Hai?</h2><ol><li>Kisan apni fasal ki details platform par upload karta hai</li><li>Verified buyers directly bid karte hain</li><li>Best price par deal confirm hoti hai</li><li>Payment seedha kisan ke bank account mein</li><li>Logistics support bhi available hai</li></ol><h2>Real Impact</h2><p>Madhya Pradesh ke Hoshangabad district mein gehu ugaane wale <strong>Ramkhelawan ji</strong> ko pehle ₹1,800/quintal milta tha. Kisan4U ke zariye unhe ₹2,350/quintal mila — <span style="color: #c87900;">30% zyada!</span></p><blockquote>"Pehle mujhe nahi pata tha ki meri fasal ki asli kimat kya hai. Ab main khud decide karta hoon." — Ramkhelawan Patel, Hoshangabad</blockquote><h2>Features</h2><ul><li>Real-time Mandi Prices</li><li>Weather Forecast Integration</li><li>Crop Advisory in Hindi</li><li>Direct Bank Transfer</li><li>Logistics &amp; Transport Support</li></ul>`
  },
  {
    title: "Motor Insurance: Apni Gaadi, Apni Suraksha",
    slug: "motor-insurance-apni-gaadi-apni-suraksha",
    category_id: 1,
    tag: "Finance",
    status: "published",
    published_at: "2025-04-05 10:00:00",
    cover_image_url: "https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&w=1200",
    excerpt: "Gramin Bharat mein motor insurance kyun zaroori hai aur UFS Digital ke zariye aap kaise sasta aur bharosemand insurance le sakte hain.",
    content: `<h2><span style="color: #0079c8;">Insurance Kyun Zaroori Hai?</span></h2><p>Bharat mein har saal <strong>4.5 lakh se zyada road accidents</strong> hote hain. Ek accident poore parivar ki arthik stithi bigaad sakta hai — agar insurance na ho toh.</p><h2>UFS Digital Insurance Services</h2><ul><li><strong>Two-Wheeler Insurance</strong> — ₹500 se shuru</li><li>Four-Wheeler Insurance — comprehensive cover</li><li>Commercial Vehicle Insurance — truck, tractor, auto</li><li>Third Party Insurance — legally mandatory</li></ul><h2>Claim Process — Bilkul Simple</h2><ol><li>Accident hone par apne BC Agent ko call karein</li><li>Photos aur documents share karein</li><li>Claim form online fill karein</li><li>7 working days mein settlement</li></ol><blockquote>"Mere tractor ka accident hua. UFS ke agent ne sab kuch handle kar liya — sirf 5 din mein ₹85,000 mil gaye." — Suresh Yadav, Bihar</blockquote>`
  },
  {
    title: "Financial Literacy: Paisa Samjho, Paisa Badhao",
    slug: "financial-literacy-paisa-samjho-paisa-badhao",
    category_id: 3,
    tag: "Empowerment",
    status: "published",
    published_at: "2025-03-20 10:00:00",
    cover_image_url: "https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&w=1200",
    excerpt: "Financial literacy kya hai aur kyun yeh gramin Bharat ke liye sabse zaroori skill hai — UFS Digital ki comprehensive guide.",
    content: `<h2><span style="color: #0079c8;">Financial Literacy Kya Hai?</span></h2><p>Financial literacy ka matlab hai — <strong>paison ke baare mein sahi faisle lene ki samajh</strong>. Yeh jaanna ki savings kahan karein, loan kab lena chahiye, insurance kyun zaroori hai, aur fraud se kaise bachein.</p><h2>Gramin Bharat Ki Sthiti</h2><p>RBI ki ek report ke mutabik, Bharat mein sirf <span style="color: #c87900;">27% log financially literate hain</span>. Gramin areas mein yeh number aur bhi kam hai — sirf 19%.</p><h2>UFS Digital Ki Pahal</h2><p>Hum apne BC Agents ke zariye <strong>free financial literacy workshops</strong> conduct karte hain. Abhi tak 50,000+ workshops, 25 lakh+ log trained.</p><blockquote>"Pehle main apna paisa ghar mein rakhta tha. Workshop ke baad maine savings account khola, FD ki aur ab mera beta college ja raha hai." — Mohan Lal, Rajasthan</blockquote><h2>5 Zaroori Financial Tips</h2><ol><li><strong>Emergency Fund:</strong> 3-6 mahine ka kharcha hamesha bank mein rakho</li><li><strong>Insurance Pehle:</strong> investment se pehle life aur health insurance lo</li><li><strong>Debt Management:</strong> high-interest loan sabse pehle chukao</li><li><strong>Diversification:</strong> sab paisa ek jagah mat lagao</li><li><strong>Fraud Alert:</strong> kisi ko bhi OTP ya PIN mat batao</li></ol>`
  }
];

for (const blog of blogs) {
  try {
    await query(
      `INSERT INTO blogs (title, slug, category_id, tag, status, published_at, cover_image_url, excerpt, content)
       VALUES (:title, :slug, :category_id, :tag, :status, :published_at, :cover_image_url, :excerpt, :content)
       ON DUPLICATE KEY UPDATE title = VALUES(title)`,
      blog
    );
    console.log('Inserted:', blog.slug);
  } catch(e) {
    console.error('Error:', blog.slug, e.message);
  }
}
console.log('All done');
process.exit(0);
