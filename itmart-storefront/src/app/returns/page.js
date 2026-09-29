import { getDictionary } from '@/lib/i18n';
import LegalPageLayout from '@/components/LegalPageLayout';

export async function generateMetadata() {
  return { title: 'Return Policy' };
}

// NOTE: Generic boilerplate — not legal advice specific to Cameroon. The
// specific return window and conditions below are placeholders; adjust them
// to match your actual policy, and have this reviewed by a lawyer.
const content = {
  fr: {
    title: 'Politique de retour',
    sections: [
      {
        heading: '1. Délai de retour',
        body: "Vous disposez de 48 heures après réception de votre commande pour signaler tout défaut ou non-conformité, en nous contactant directement par WhatsApp ou e-mail.",
      },
      {
        heading: '2. Conditions',
        body: "Le produit doit être retourné dans son état d'origine, avec son emballage et ses accessoires. Les produits endommagés suite à une mauvaise utilisation ne sont pas éligibles au retour.",
      },
      {
        heading: '3. Produits défectueux',
        body: "Si un produit présente un défaut de fabrication à la livraison, nous proposons un échange ou un remboursement selon la disponibilité du produit.",
      },
      {
        heading: '4. Procédure',
        body: "Contactez-nous via WhatsApp ou e-mail en indiquant votre référence de commande et la raison du retour. Nous vous indiquerons la marche à suivre.",
      },
      {
        heading: '5. Remboursement',
        body: "Les remboursements, lorsqu'applicables, sont effectués selon le mode de paiement convenu lors de la commande, dans un délai raisonnable après validation du retour.",
      },
    ],
    disclaimer:
      "Ce document est un modèle générique avec des conditions à titre indicatif. Adaptez-le à votre politique réelle et faites-le vérifier par un professionnel du droit avant utilisation.",
  },
  en: {
    title: 'Return Policy',
    sections: [
      {
        heading: '1. Return window',
        body: 'You have 48 hours after receiving your order to report any defect or non-conformity, by contacting us directly via WhatsApp or email.',
      },
      {
        heading: '2. Conditions',
        body: 'The product must be returned in its original condition, with its packaging and accessories. Products damaged due to misuse are not eligible for return.',
      },
      {
        heading: '3. Defective products',
        body: 'If a product has a manufacturing defect upon delivery, we offer an exchange or refund depending on product availability.',
      },
      {
        heading: '4. Process',
        body: 'Contact us via WhatsApp or email with your order reference and the reason for the return. We will let you know the next steps.',
      },
      {
        heading: '5. Refunds',
        body: 'Refunds, where applicable, are made according to the payment method agreed at the time of order, within a reasonable time after the return is validated.',
      },
    ],
    disclaimer:
      'This document is a generic template with placeholder conditions. Adjust it to your actual policy and have it reviewed by a legal professional before use.',
  },
};

export default async function ReturnsPage() {
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
