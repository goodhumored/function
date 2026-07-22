export type CommercialOfferFormData = {
  name: string;
  phone: string;
  email: string;
  branding: string | null;
  brandingType?: string | null;
  services: string;
  source?: string;
  page?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
};

const GOOGLE_SCRIPT_URL = process.env["NEXT_PUBLIC_GOOGLE_SCRIPT_URL"] ?? "";
const UTM_STORAGE_KEY = "utm_params";
const FORM_LOADED_KEY = "form_loaded_at";

function captureUtm(): Record<string, string> {
  if (typeof document === "undefined") return {};

  const params = new URLSearchParams(window.location.search);
  const utmKeys = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"];
  const utm: Record<string, string> = {};

  for (const key of utmKeys) {
    const value = params.get(key);
    if (value) {
      utm[key] = value;
    }
  }

  if (Object.keys(utm).length > 0) {
    try {
      sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(utm));
    } catch {}
  } else {
    try {
      const stored = sessionStorage.getItem(UTM_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {}
  }

  return utm;
}

export default async function submitCommercialOffer(
  formData: CommercialOfferFormData,
): Promise<{ success: boolean; message: string }> {
  try {
    const utm = captureUtm();

    // Захватываем время загрузки формы (если еще не захвачено)
    let formLoadedAt = sessionStorage.getItem(FORM_LOADED_KEY);
    if (!formLoadedAt) {
      formLoadedAt = Date.now().toString();
      sessionStorage.setItem(FORM_LOADED_KEY, formLoadedAt);
    }

    const payload = {
      name: formData.name,
      phone: formData.phone.replace("+", "＋"),
      email: formData.email,
      brandingType: formData.brandingType ?? formData.branding ?? "",
      services: formData.services,
      source: formData.source ?? "",
      page: formData.page ?? document.location.pathname,
      honeypot: "",
      formLoadedAt,
      ...utm,
    };

    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
      redirect: "follow",
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    return {
      success: true,
      message: "Sent successfully! We will contact you as soon as possible!",
    };
  } catch (err: unknown) {
    console.error("Ошибка при отправке заявки: ", err);
    return {
      success: false,
      message:
        "Failed to send. Please try again, or contact us using other methods.",
    };
  }
}
