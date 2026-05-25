// In-memory rate limit store (reset at each cold start, sufficient for basic protection)
const rateLimit = new Map();

function checkRateLimit(ip) {
  const now = Date.now();
  const windowMs = 10 * 60 * 1000; // 10 minutes
  const maxRequests = 3;

  const timestamps = (rateLimit.get(ip) || []).filter((t) => now - t < windowMs);

  if (timestamps.length >= maxRequests) return false;

  timestamps.push(now);
  rateLimit.set(ip, timestamps);
  return true;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Extract real IP
  const ip =
    (req.headers["x-forwarded-for"] || "").split(",")[0].trim() ||
    req.socket?.remoteAddress ||
    "unknown";

  // Rate limiting
  if (!checkRateLimit(ip)) {
    return res
      .status(429)
      .json({ error: "Trop de tentatives. Réessayez dans 10 minutes." });
  }

  // Parse body (Vercel auto-parses JSON, but guard against edge cases)
  let body = {};
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
  } catch {
    return res.status(400).json({ error: "Corps de requête invalide." });
  }

  const { user_name, user_email, message, website } = body;
  const turnstileToken = body["cf-turnstile-response"];

  // Honeypot: bots fill this field, humans don't see it
  if (website) {
    // Silent accept — bot thinks it worked
    return res.status(200).json({ success: true });
  }

  // Turnstile verification
  if (!turnstileToken) {
    return res.status(400).json({ error: "Captcha manquant." });
  }

  let tsData;
  try {
    const tsRes = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          secret: process.env.TURNSTILE_SECRET_KEY,
          response: turnstileToken,
          remoteip: ip,
        }),
      }
    );
    tsData = await tsRes.json();
  } catch (err) {
    console.error("Turnstile fetch error:", err);
    return res
      .status(500)
      .json({ error: "Erreur de vérification du captcha." });
  }

  if (!tsData.success) {
    // Log temporaire pour debug — à retirer après résolution
    console.error("Turnstile failed:", JSON.stringify(tsData));
    return res.status(400).json({
      error: "Captcha invalide. Veuillez réessayer.",
      debug_codes: tsData["error-codes"],
    });
  }

  // Field presence
  if (!user_name || !user_email || !message) {
    return res.status(400).json({ error: "Tous les champs sont requis." });
  }

  // Email format
  if (!isValidEmail(user_email)) {
    return res.status(400).json({ error: "Adresse email invalide." });
  }

  // Length limits
  if (user_name.length > 100) {
    return res
      .status(400)
      .json({ error: "Nom trop long (max 100 caractères)." });
  }
  if (user_email.length > 200) {
    return res
      .status(400)
      .json({ error: "Email trop long (max 200 caractères)." });
  }
  if (message.length > 2000) {
    return res
      .status(400)
      .json({ error: "Message trop long (max 2000 caractères)." });
  }

  // Send via EmailJS REST API (private key stays server-side)
  let emailRes;
  try {
    emailRes = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_id: process.env.EMAILJS_SERVICE_ID,
        template_id: process.env.EMAILJS_TEMPLATE_ID,
        user_id: process.env.EMAILJS_PUBLIC_KEY,
        accessToken: process.env.EMAILJS_PRIVATE_KEY,
        template_params: {
          user_name: user_name.trim(),
          user_email: user_email.trim(),
          message: message.trim(),
        },
      }),
    });
  } catch (err) {
    console.error("EmailJS fetch error:", err);
    return res
      .status(500)
      .json({ error: "Erreur lors de l'envoi. Veuillez réessayer." });
  }

  if (!emailRes.ok) {
    const errText = await emailRes.text().catch(() => "");
    console.error("EmailJS error response:", emailRes.status, errText);
    return res
      .status(500)
      .json({ error: "Erreur lors de l'envoi. Veuillez réessayer." });
  }

  return res.status(200).json({ success: true });
};
