import { getDictionary } from '@/lib/i18n';
import LegalPageLayout from '@/components/LegalPageLayout';

export async function generateMetadata() {
  return { title: 'Privacy Policy' };
}

// NOTE: Generic boilerplate — not legal advice specific to Cameroon. Have
// this reviewed by a lawyer before relying on it, especially regarding data
// protection obligations that may apply to your business.
const content = {
  fr: {
    title: 'Politique de confidentialité',
    sections: [
      {
        heading: '1. Données collectées',
        body: "Lorsque vous passez une commande, nous collectons : votre nom, numéro de téléphone, adresse de livraison, ville, et éventuellement votre e-mail. Si vous vous inscrivez à notre newsletter, nous collectons votre adresse e-mail.",
      },
      {
        heading: '2. Utilisation des données',
        body: "Ces données sont utilisées uniquement pour traiter votre commande, vous contacter à son sujet, et — si vous y avez consenti — vous envoyer des informations sur nos produits et offres par e-mail.",
      },
      {
        heading: '3. Partage des données',
        body: "Nous ne vendons ni ne louons vos données personnelles à des tiers. Vos informations peuvent être partagées avec les prestataires strictement nécessaires à la livraison de votre commande.",
      },
      {
        heading: '4. Conservation',
        body: "Vos données sont conservées aussi longtemps que nécessaire pour traiter votre commande et répondre à nos obligations légales et comptables.",
      },
      {
        heading: '5. Vos droits',
        body: "Vous pouvez à tout moment demander l'accès, la correction ou la suppression de vos données, ou vous désinscrire de notre newsletter, en nous contactant via les coordonnées indiquées en pied de page.",
      },
      {
        heading: '6. Sécurité',
        body: "Nous mettons en œuvre des mesures raisonnables pour protéger vos données contre l'accès non autorisé.",
      },
    ],
    disclaimer:
      "Ce document est un modèle générique et ne constitue pas un conseil juridique. Il est recommandé de le faire vérifier par un professionnel du droit avant utilisation.",
  },
  en: {
    title: 'Privacy Policy',
    sections: [
      {
        heading: '1. Data we collect',
        body: 'When you place an order, we collect: your name, phone number, delivery address, city, and optionally your email. If you sign up for our newsletter, we collect your email address.',
      },
      {
        heading: '2. How we use it',
        body: "This data is used only to process your order, contact you about it, and — if you've opted in — send you information about our products and offers by email.",
      },
      {
        heading: '3. Data sharing',
        body: 'We do not sell or rent your personal data to third parties. Your information may be shared with providers strictly necessary to deliver your order.',
      },
      {
        heading: '4. Retention',
        body: 'Your data is kept for as long as necessary to process your order and meet our legal and accounting obligations.',
      },
      {
        heading: '5. Your rights',
        body: 'You can request access to, correction of, or deletion of your data, or unsubscribe from our newsletter, at any time by contacting us using the details in the footer.',
      },
      {
        heading: '6. Security',
        body: 'We implement reasonable measures to protect your data against unauthorized access.',
      },
    ],
    disclaimer:
      'This document is a generic template and does not constitute legal advice. It is recommended to have it reviewed by a legal professional before use.',
  },
};

export default async function PrivacyPage() {
  const { locale } = await getDictionary();
  const c = content[locale];
  return (
    <LegalPageLayout
      title={c.title}
      lastUpdated={new Date().toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', {
        year: 'numeric',
        month: 'long',
      })}
      disclaimer={c.disclaimer}
      sections={c.sections}
    />
  );
}
