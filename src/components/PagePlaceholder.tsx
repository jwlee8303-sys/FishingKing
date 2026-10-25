interface PagePlaceholderProps {
  title: string
  description: string
}

export function PagePlaceholder({ title, description }: PagePlaceholderProps) {
  return (
    <section aria-labelledby="page-title" className="max-w-2xl rounded-lg border border-slate-200 bg-white p-6 sm:p-10">
      <p className="mb-3 text-sm font-medium text-slate-600">개발 예정</p>
      <h1 id="page-title" className="text-2xl font-semibold sm:text-3xl">{title}</h1>
      <p className="mt-4 leading-7 text-slate-600">{description}</p>
    </section>
  )
}
