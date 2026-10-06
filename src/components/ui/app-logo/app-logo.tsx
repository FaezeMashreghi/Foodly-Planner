import icon1x from '@/assets/brand/foodly-icon-40.webp'
import icon2x from '@/assets/brand/foodly-icon-80.webp'
import icon3x from '@/assets/brand/foodly-icon-120.webp'

export function AppLogo() {
  return (
    <span className="flex items-center gap-2 text-heading text-brand">
      <img
        src={icon2x}
        srcSet={`${icon1x} 1x, ${icon2x} 2x, ${icon3x} 3x`}
        width={62}
        height={40}
        alt=""
        className="h-10 w-auto"
      />
      Foodly
    </span>
  )
}
