'use client';

import { trackAddToCart, trackContact } from '@/lib/analytics';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Minus, Plus, ShoppingBag, ShoppingCart, MessageCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import WishlistButton from './WishlistButton';
import { useCart } from '@/context/CartContext';
import { pickLang, interpolate } from '@/lib/i18nHelpers';
import { buildProductInquiryLink } from '@/lib/contact';
import { useStoreInfo } from '@/context/StoreContext';

// product: { id, slug, variantId?, variantLabel?, nameEn, nameFr, price, discountPrice, stock, images, image? }
//
// Two buttons: "Ajouter au panier" (stays on the page) and "Acheter"
// (straight to checkout). Both send the AddToCart event to Meta / Google.
// They have fixed ids (#add-to-cart-button, #buy-now-button) and data-*
// attributes, so events can also be set up on them by clicks.
// missingChoice: the option still to choose (e.g. "Pointure") — the Buy
// button waits for it.
export default function AddToCartPanel({ product, missingChoice, dict, locale }) {
  const { addItem } = useCart();
  const { whatsappNumber } = useStoreInfo();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  // Short confirmation after "Ajouter au panier"
  const [added, setAdded] = useState(false);
  const addedTimer = useRef(null);
  useEffect(() => () => clearTimeout(addedTimer.current), []);
  const outOfStock = !missingChoice && product.stock === 0;

  const primaryImage = product.images?.find((i) => i.isPrimary) || product.images?.[0];
  const name = pickLang(product, 'name', locale);

  const putInCart = () => {
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
  };

  // "Ajouter au panier": the customer keeps browsing
  const handleAddToCart = () => {
    putInCart();
    setAdded(true);
    clearTimeout(addedTimer.current);
    addedTimer.current = setTimeout(() => setAdded(false), 5000);
  };

  // "Acheter": into the cart and straight to checkout
  const handleBuy = () => {
    putInCart();
    router.push('/checkout');
  };

  // For targeting the buttons when creating events (Meta / Google Tag Manager)
  const eventData = {
    'data-product-id': product.id,
    'data-product-name': name,
    'data-variant': product.variantLabel || undefined,
    'data-value': Number(product.discountPrice ?? product.price) * quantity,
    'data-currency': 'XAF',
  };


  // Built and opened on click rather than as a static href — the link
  // includes window.location.href, which doesn't exist during server
  // rendering, so setting it as a static attribute caused a server/client
  // hydration mismatch (server renders one URL, browser renders another).
  const handleWhatsAppInquiry = () => {
    trackContact('whatsapp');
    const fullName = product.variantLabel ? `${name} (${product.variantLabel})` : name;
    window.open(buildProductInquiryLink(product, fullName, locale, whatsappNumber), '_blank', 'noopener,noreferrer');
  };

  const whatsappButton = whatsappNumber && (
    <button
      type="button"
      onClick={handleWhatsAppInquiry}
      aria-label={dict.product.askOnWhatsapp}
      title={dict.product.askOnWhatsapp}
      className="shrink-0 h-[52px] w-[52px] rounded-full bg-whatsapp hover:bg-whatsapp-dark text-white flex items-center justify-center transition-colors"
    >
      <MessageCircle size={22} />
    </button>
  );

  if (outOfStock) {
    return (
      <div className="mt-6 flex gap-3 items-center">
        <div className="flex-1 px-4 py-3 rounded-lg bg-surface text-ink-500 text-sm font-medium text-center">
          {product.variantLabel ? `${product.variantLabel} — ${dict.product.outOfStock}` : dict.product.outOfStock}
        </div>
        <WishlistButton product={product} dict={dict} variant="page" />
        {whatsappButton}
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
        <WishlistButton product={product} dict={dict} variant="page" />
        {whatsappButton}
      </div>
    );
  }

  return (
    <div className="mt-6">
      <div className="flex items-center gap-3 mb-3">
        <div className="flex items-center border border-surface-border rounded-lg">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="h-10 w-10 flex items-center justify-center text-ink-700 hover:bg-surface"
            aria-label="Decrease quantity"
          >
            <Minus size={15} />
          </button>
          <span className="w-10 text-center text-sm font-medium">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
            className="h-10 w-10 flex items-center justify-center text-ink-700 hover:bg-surface"
            aria-label="Increase quantity"
          >
            <Plus size={15} />
          </button>
        </div>
        <span className="text-xs text-success-600 font-medium flex-1">
          {product.stock <= 5 ? interpolate(dict.product.onlyLeft, { count: product.stock }) : dict.product.inStock}
        </span>
        <WishlistButton product={product} dict={dict} variant="page" />
        {whatsappButton}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          id="add-to-cart-button"
          data-action="add-to-cart"
          {...eventData}
          onClick={handleAddToCart}
          className={`flex items-center justify-center gap-2 font-semibold rounded-full py-3.5 px-3 border-2 transition-colors ${
            added
              ? 'border-success-600 bg-success-100 text-success-600'
              : 'border-navy-900 text-navy-900 hover:bg-navy-900 hover:text-white'
          }`}
        >
          {added ? <CheckCircle2 size={17} className="shrink-0" /> : <ShoppingCart size={17} className="shrink-0" />}
          <span className="truncate">{added ? dict.product.addedShort : dict.product.addToCart}</span>
        </button>
        <button
          type="button"
          id="buy-now-button"
          data-action="buy-now"
          {...eventData}
          onClick={handleBuy}
          className="flex items-center justify-center gap-2 bg-navy-900 hover:bg-navy-800 text-white font-semibold rounded-full py-3.5 px-3 border-2 border-navy-900 transition-colors"
        >
          <ShoppingBag size={17} className="shrink-0" />
          <span className="truncate">{dict.product.buyNow}</span>
        </button>
      </div>

      {added && (
        <div role="status" className="mt-3 flex items-center justify-between gap-3 px-4 py-2.5 rounded-lg bg-success-100 text-success-600 text-sm">
          <span className="flex items-center gap-2 min-w-0">
            <CheckCircle2 size={16} className="shrink-0" />
            <span className="truncate">{dict.product.addedToCart}</span>
          </span>
          <Link href="/cart" className="shrink-0 inline-flex items-center gap-1 font-semibold hover:underline">
            {dict.product.viewCart} <ArrowRight size={14} />
          </Link>
        </div>
      )}
    </div>
  );
}
