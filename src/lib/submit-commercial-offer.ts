export type CommercialOfferFormData = {
  name: string;
  phone: string;
  email: string;
  branding: string | null;
  services: string;
};

const GOOGLE_SCRIPT_URL =
  process.env["NEXT_PUBLIC_GOOGLE_SCRIPT_URL"] ?? "";

export default async function submitCommercialOffer(
  formData: CommercialOfferFormData,
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(formData),
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
