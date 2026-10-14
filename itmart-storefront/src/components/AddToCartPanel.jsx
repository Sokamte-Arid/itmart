'use client';

import { trackAddToCart, trackContact } from '@/lib/analytics';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Minus, Plus, ShoppingBag, MessageCircle } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { pickLang, interpolate } from '@/lib/i18nHelpers';
import { buildProductInquiryLink } from '@/lib/contact';

// product: { id, variantId?, variantLabel?, nameEn, nameFr, price, discountPrice, stock, images, image? }
// missingChoice: the option still to choose (e.g. "Pointure") — the Buy
// button waits for it.
export default function AddToCartPanel({ product, missingChoice, dict, locale }) {
  const { addItem } = useCart();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const outOfStock = !missingChoice && product.stock === 0;

  const primaryImage = product.images?.find((i) => i.isPrimary) || product.images?.[0];
  const name = pickLang(product, 'name', locale);

  // Single "Buy" action — adds to cart and goes straight to checkout, no
  // separate "add to cart" step, matching the simpler single-item flow.
  const handleBuy = () => {
    addItem(
      {
        id: product.id,
        variantId: product.variantId,
        variantLabel: product.variantLabel,
        nameEn: product.nameEn,
        nameFr: product.nameFr,
        price: product.price,
        discountPrice: product.discountPrice,
        stock: product.stock,
        image: product.image || primaryImage?.url,
      },
      quantity
    );
    trackAddToCart(product, quantity);
    router.push('/checkout');
  };

  // Built and opened on click rather than as a static href — the link
  // includes window.location.href, which doesn't exist during server
  // rendering, so setting it as a static attribute caused a server/client
  // hydration mismatch (server renders one URL, browser renders another).
  const handleWhatsAppInquiry = () => {
    trackContact('whatsapp');
    const fullName = product.variantLabel ? `${name} (${product.variantLabel})` : name;
    window.open(buildProductInquiryLink(product, fullName, locale), '_blank', 'noopener,noreferrer');
  };

  if (outOfStock) {
    return (
      <div className="mt-6 px-4 py-3 rounded-lg bg-surface text-ink-500 text-sm font-medium text-center">
        {product.variantLabel ? `${product.variantLabel} — ${dict.product.outOfStock}` : dict.product.outOfStock}
      </div>
    );
  }

  // Colour / size not chosen yet
  if (missingChoice) {
    return (
      <div className="mt-6 flex gap-3">
        <button
          type="button"
          disabled
          className="flex-1 flex items-center justify-center gap-2 bg-navy-900/40 text-white font-semibold rounded-full py-3.5 cursor-not-allowed"
        >
          <ShoppingBag size={17} />
          {interpolate(dict.product.chooseOption, { option: missingChoice.toLowerCase() })}
        </button>
        <button
          onClick={handleWhatsAppInquiry}
          aria-label={dict.product.askOnWhatsapp}
          title={dict.product.askOnWhatsapp}
          className="shrink-0 h-[52px] w-[52px] rounded-full bg-whatsapp hover:bg-whatsapp-dark text-white flex items-center justify-center transition-colors"
        >
          <MessageCircle size={22} />
        </button>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <div className="flex items-center gap-3 mb-3">
        <div className="flex items-center border border-surface-border rounded-lg">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="h-10 w-10 flex items-center justify-center text-ink-700 hover:bg-surface"
            aria-label="Decrease quantity"
          >
            <Minus size={15} />
          </button>
          <span className="w-10 text-center text-sm font-medium">{quantity}</span>
          <button
            onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
            className="h-10 w-10 flex items-center justify-center text-ink-700 hover:bg-surface"
            aria-label="Increase quantity"
          >
            <Plus size={15} />
          </button>
        </div>
        <span className="text-xs text-success-600 font-medium">
          {product.stock <= 5 ? interpolate(dict.product.onlyLeft, { count: product.stock }) : dict.product.inStock}
        </span>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleBuy}
          className="flex-1 flex items-center justify-center gap-2 bg-navy-900 hover:bg-navy-800 text-white font-semibold rounded-full py-3.5 transition-colors"
        >
          <ShoppingBag size={17} />
          {dict.product.buyNow}
        </button>
        <button
          onClick={handleWhatsAppInquiry}
          aria-label={dict.product.askOnWhatsapp}
          title={dict.product.askOnWhatsapp}
          className="shrink-0 h-[52px] w-[52px] rounded-full bg-whatsapp hover:bg-whatsapp-dark text-white flex items-center justify-center transition-colors"
        >
          <MessageCircle size={22} />
        </button>
      </div>
    </div>
  );
}
