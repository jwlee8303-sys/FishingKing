import { useId } from 'react'

interface PagePlaceholderProps {
  title: string
  description: string
  headingLevel?: 'h1' | 'h2' | 'h3'
}

export function PagePlaceholder({ title, description, headingLevel: Heading = 'h1' }: PagePlaceholderProps) {
  const titleId = useId()
  return (
    <section aria-labelledby={titleId} className="panel max-w-2xl">
      <p className="mb-3 text-sm font-medium text-fk-muted">개발 예정</p>
      <Heading id={titleId} className="text-2xl font-semibold sm:text-3xl">{title}</Heading>
      <p className="mt-4 leading-7 text-fk-muted">{description}</p>
    </section>
  )
}
