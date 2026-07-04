import getConfig from "@/config";
import nodemailer from "nodemailer";
import { injectable } from "tsyringe";

import { CommercialOfferDto } from "./actions/commercialOfferAction";

const dateFormat = "ru-RU";
const dateOptions = {
  timeZone: "Europe/Moscow",
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
} as Intl.DateTimeFormatOptions;

@injectable()
export default class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    const config = getConfig().email;
    console.log("Email config:", {
      host: config.host,
      port: config.port,
      secure: config.secure,
      user: config.user,
      from: config.from,
      to: config.to,
    });

    this.transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        method: "LOGIN",
        user: config.user,
        pass: config.password,
        credentials: {
          user: config.user,
          pass: config.password,
        },
      },
    });
  }

  public async sendCommercialOfferEmail(offer: CommercialOfferDto): Promise<void> {
    const config = getConfig().email;
    
    const subject = "Новый запрос коммерческого предложения";
    const html = this.generateCommercialOfferEmailHtml(offer);
    const text = this.generateCommercialOfferEmailText(offer);

    try {
      await this.transporter.sendMail({
        from: config.from,
        to: config.to,
        subject: subject,
        text: text,
        html: html,
      });
      console.log("Commercial offer email sent successfully");
    } catch (error) {
      console.error("Failed to send commercial offer email:", error, JSON.stringify(error));
      throw error;
    }
  }

  private generateCommercialOfferEmailHtml(offer: CommercialOfferDto): string {
    const currentDate = new Date().toLocaleString(dateFormat, dateOptions);
    
    const brandingOptions = {
      corporate: "Corporate",
      product: "Product", 
      campaign: "Campaign",
      personal: "Personal",
      support: "Support"
    };

    const serviceOptions = {
      naming: "Naming",
      logo: "Logo",
      "brand-guidelines": "Brand Guidelines",
      "ui-ux": "UI/UX",
      "key-visual": "Key Visual",
      "social-media-branding": "Social Media Branding",
      packaging: "Packaging",
      rebranding: "Rebranding",
      "re-styling": "Re-styling"
    };

    const brandingText = offer.branding ? brandingOptions[offer.branding as keyof typeof brandingOptions] || offer.branding : "Не выбрано";
    const servicesText = offer.services.map(service => 
      serviceOptions[service as keyof typeof serviceOptions] || service
    ).join(", ");

    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Новый запрос коммерческого предложения</h2>
        <p><strong>Дата и время:</strong> ${currentDate}</p>
        
        <h3 style="color: #555;">Контактная информация:</h3>
        <ul>
          <li><strong>Имя:</strong> ${offer.name}</li>
          <li><strong>Телефон:</strong> ${offer.phone}</li>
          <li><strong>Email:</strong> ${offer.email}</li>
        </ul>

        <h3 style="color: #555;">Детали запроса:</h3>
        <ul>
          <li><strong>Тип брендинга:</strong> ${brandingText}</li>
          <li><strong>Выбранные услуги:</strong> ${servicesText || "Не выбрано"}</li>
        </ul>
      </div>
    `;
  }

  private generateCommercialOfferEmailText(offer: CommercialOfferDto): string {
    const currentDate = new Date().toLocaleString(dateFormat, dateOptions);
    
    const brandingOptions = {
      corporate: "Corporate",
      product: "Product", 
      campaign: "Campaign",
      personal: "Personal",
      support: "Support"
    };

    const serviceOptions = {
      naming: "Naming",
      logo: "Logo",
      "brand-guidelines": "Brand Guidelines",
      "ui-ux": "UI/UX",
      "key-visual": "Key Visual",
      "social-media-branding": "Social Media Branding",
      packaging: "Packaging",
      rebranding: "Rebranding",
      "re-styling": "Re-styling"
    };

    const brandingText = offer.branding ? brandingOptions[offer.branding as keyof typeof brandingOptions] || offer.branding : "Не выбрано";
    const servicesText = offer.services.map(service => 
      serviceOptions[service as keyof typeof serviceOptions] || service
    ).join(", ");

    let text = `Новый запрос коммерческого предложения\n\n`;
    text += `Дата и время: ${currentDate}\n\n`;
    
    text += `Контактная информация:\n`;
    text += `Имя: ${offer.name}\n`;
    text += `Телефон: ${offer.phone}\n`;
    text += `Email: ${offer.email}\n\n`;

    text += `Детали запроса:\n`;
    text += `Тип брендинга: ${brandingText}\n`;
    text += `Выбранные услуги: ${servicesText || "Не выбрано"}\n`;

    return text;
  }
}
