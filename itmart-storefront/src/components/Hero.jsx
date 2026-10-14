import Link from 'next/link';
import Image from 'next/image';
import { getBanners, imageUrl } from '@/lib/api';
import { pickLang } from '@/lib/i18nHelpers';
import HeroCarousel from './HeroCarousel';

// Top of the home page: the main banner carousel and, if the admin added
// any side-tile banners (SIDE_LEFT / SIDE), up to two small tiles on each
// side of it — ideal for animated GIFs.
export default async function Hero(props) {
  const hasMain = props.banners?.length > 0;
  const [leftTiles, rightTiles] = hasMain
    ? await Promise.all([
        getBanners('SIDE_LEFT').then((list) => list.slice(0, 2)),
        getBanners('SIDE').then((list) => list.slice(0, 2)),
      ])
    : [[], []];
  const hasLeft = leftTiles.length > 0;
  const hasRight = rightTiles.length > 0;

  // Computer: [left tiles] [main banner] [right tiles] — whichever exist.
  // Phone/tablet: main banner only.
  const columns =
    hasLeft && hasRight
      ? 'lg:grid-cols-[minmax(0,1fr)_minmax(0,3fr)_minmax(0,1fr)]'
      : hasLeft
        ? 'lg:grid-cols-[minmax(0,1fr)_minmax(0,3fr)]'
        : hasRight
          ? 'lg:grid-cols-[minmax(0,3fr)_minmax(0,1fr)]'
          : '';

  // Side tiles are a computer-only extra: hidden on phones and tablets,
  // where they made the top of the page cluttered.
  const tileColumn = (tiles) => (
    <div className="flex flex-col gap-3 h-full">
      {tiles.map((tile) => (
        <SideTile key={tile.id} tile={tile} locale={props.locale} />
      ))}
    </div>
  );

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6">
      <div className={columns ? `grid gap-3 ${columns}` : ''}>
        {hasLeft && <div className="hidden lg:block">{tileColumn(leftTiles)}</div>}
        <div className="min-w-0">
          <HeroCarousel {...props} hasSide={hasLeft || hasRight} />
        </div>
        {hasRight && <div className="hidden lg:block">{tileColumn(rightTiles)}</div>}
      </div>
    </section>
  );
}

function SideTile({ tile, locale }) {
  const alt = pickLang(tile, 'title', locale) || 'IT Mart';
  const content = (
    <>
      {/* Blurred fill + whole image, like the main banner: nothing is cropped */}
      <Image src={imageUrl(tile.image)} alt="" fill unoptimized aria-hidden="true" className="object-cover scale-110 blur-xl opacity-60" />
      {/* unoptimized: served as uploaded, so animated GIF/WebP keep moving */}
      <Image src={imageUrl(tile.image)} alt={alt} fill unoptimized className="object-contain" />
    </>
  );
  const box =
    'relative block w-full flex-1 min-h-0 overflow-hidden rounded-2xl bg-navy-900';

  return tile.ctaLink ? (
    <Link href={tile.ctaLink} className={`${box} transition-transform hover:scale-[1.02]`}>
      {content}
    </Link>
  ) : (
    <div className={box}>{content}</div>
  );
}
