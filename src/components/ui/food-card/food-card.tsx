type FoodCardProps = {
  title: string
  description: string
  imageUrl: string
}

export function FoodCard({ title, description, imageUrl }: FoodCardProps) {
  return (
    <div className="flex items-start gap-3 rounded-control border border-line bg-surface p-2">
      <img
        src={imageUrl}
        alt=""
        width={48}
        height={48}
        loading="lazy"
        className="size-12 shrink-0 rounded-control object-cover"
      />
      <div className="min-w-0">
        <p className="font-semibold">{title}</p>
        <p className="line-clamp-2 text-sm text-ink-muted">{description}</p>
      </div>
    </div>
  )
}
