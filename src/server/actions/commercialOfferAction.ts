"use server";
import "reflect-metadata";

import LeadTable from "@/infrastructure/lead-table";
import { container } from "tsyringe";
import WithTimeout from "../../lib/with-timeout";
import EmailService from "@/server/email-service";

export type CommercialOfferFormData = {
  name: string;
  phone: string;
  email: string;
  branding: string | null;
  services: string;
};

export type CommercialOfferDto = {
  name: string;
  phone: string;
  email: string;
  branding: string | null;
  services: string[];
  timestamp: Date;
};

const leadTable = container.resolve(LeadTable);
const emailService = container.resolve(EmailService);

export default async function submitCommercialOfferAction(
  formData: CommercialOfferFormData,
): Promise<{ success: boolean; message: string }> {
  const dto: CommercialOfferDto = {
    ...formData,
    services: formData.services ? formData.services.split(",") : [],
    timestamp: new Date(),
  };

  try {
    await WithTimeout(500)(leadTable.addCommercialOffer(dto));

    try {
      await WithTimeout(500)(emailService.sendCommercialOfferEmail(dto));
    } catch (emailError) {
      console.error("Failed to send email:", emailError);
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
