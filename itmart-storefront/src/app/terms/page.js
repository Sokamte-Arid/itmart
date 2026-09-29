import { getDictionary } from '@/lib/i18n';
import LegalPageLayout from '@/components/LegalPageLayout';

export async function generateMetadata() {
  return { title: 'Terms of Service' };
}

// NOTE: This is standard e-commerce boilerplate personalized with the
// business's own stated policies — not legal advice specific to Cameroon.
// Have this reviewed by a lawyer familiar with local consumer protection
// and e-commerce law before relying on it in a dispute.
const content = {
  fr: {
    title: "Conditions d'utilisation",
    sections: [
      {
        heading: '1. Objet',
        body: "Les présentes conditions régissent l'utilisation du site IT Mart et la commande de produits informatiques proposés à la vente. En utilisant ce site ou en passant une commande, vous acceptez ces conditions.",
      },
      {
        heading: '2. Commandes',
        body: "Les commandes passées sur ce site ne constituent pas un paiement en ligne. Après confirmation de votre commande, nous vous contactons directement (par WhatsApp et/ou e-mail) pour finaliser les détails de livraison et de paiement. Aucune somme n'est prélevée automatiquement lors de la validation d'une commande sur le site.",
      },
      {
        heading: '3. Prix et disponibilité',
        body: "Les prix affichés sont exprimés en Francs CFA (FCFA) et peuvent être modifiés sans préavis. La disponibilité des produits n'est pas garantie jusqu'à confirmation par notre équipe, le stock affiché pouvant évoluer entre votre commande et sa confirmation.",
      },
      {
        heading: '4. Livraison',
        body: "Nous livrons dans les zones indiquées sur le site, avec des frais de livraison qui varient selon la ville. Les délais de livraison communiqués sont indicatifs et peuvent varier selon la localisation et la disponibilité du produit.",
      },
      {
        heading: '5. Paiement',
        body: "Le paiement s'effectue selon les modalités convenues avec notre équipe au moment de la confirmation de la commande (paiement à la livraison ou autre modalité communiquée directement).",
      },
      {
        heading: '6. Propriété des biens',
        body: "Tout article vendu par IT Mart reste la propriété exclusive d'IT Mart jusqu'au paiement intégral du prix convenu. Le transfert de propriété n'intervient qu'après réception complète du paiement.",
      },
      {
        heading: '7. Produits',
        body: "Nous nous efforçons de décrire nos produits avec exactitude. Les images sont fournies à titre indicatif et peuvent légèrement différer du produit livré (emballage, accessoires inclus, etc.).",
      },
      {
        heading: '8. Modification des conditions',
        body: "Nous pouvons modifier ces conditions à tout moment. La version en vigueur au moment de votre commande s'applique.",
      },
      {
        heading: '9. Nos adresses',
        body: "Yaoundé — Camair\nDouala — Akwa",
      },
      {
        heading: '10. Contact',
        body: "Pour toute question relative à ces conditions, contactez-nous via les coordonnées indiquées en pied de page.",
      },
    ],
    disclaimer:
      "Ce document a été personnalisé avec les politiques propres à IT Mart, mais reste un modèle général et ne constitue pas un conseil juridique. Il est recommandé de le faire vérifier par un professionnel du droit avant utilisation.",
  },
  en: {
    title: 'Terms of Service',
    sections: [
      {
        heading: '1. Purpose',
        body: 'These terms govern the use of the IT Mart website and the ordering of IT products offered for sale. By using this site or placing an order, you accept these terms.',
      },
      {
        heading: '2. Orders',
        body: "Orders placed on this site do not constitute an online payment. After your order is confirmed, we contact you directly (via WhatsApp and/or email) to finalize delivery and payment details. No amount is automatically charged when you submit an order on the site.",
      },
      {
        heading: '3. Prices and availability',
        body: 'Displayed prices are in CFA Francs (FCFA) and may change without notice. Product availability is not guaranteed until confirmed by our team, as displayed stock may change between your order and its confirmation.',
      },
      {
        heading: '4. Delivery',
        body: 'We deliver to the areas indicated on the site, with delivery fees that vary by city. Stated delivery times are indicative and may vary depending on location and product availability.',
      },
      {
        heading: '5. Payment',
        body: 'Payment is made according to the terms agreed with our team at the time of order confirmation (payment on delivery or another method communicated directly).',
      },
      {
        heading: '6. Ownership of goods',
        body: 'Any item sold by IT Mart remains the exclusive property of IT Mart until the agreed price is paid in full. Ownership transfers only once payment has been fully received.',
      },
      {
        heading: '7. Products',
        body: 'We strive to describe our products accurately. Images are provided for illustrative purposes and may slightly differ from the delivered product (packaging, included accessories, etc.).',
      },
      {
        heading: '8. Changes to these terms',
        body: 'We may modify these terms at any time. The version in effect at the time of your order applies.',
      },
      {
        heading: '9. Our locations',
        body: 'Yaoundé — Camair\nDouala — Akwa',
      },
      {
        heading: '10. Contact',
        body: 'For any questions about these terms, contact us using the details shown in the footer.',
      },
    ],
    disclaimer:
      'This document has been personalized with IT Mart\'s own stated policies, but remains a general template and does not constitute legal advice. It is recommended to have it reviewed by a legal professional before use.',
  },
};

export default async function TermsPage() {
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
