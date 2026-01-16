type PageHeaderProps = {
  title: string;
  subtitle?: string;
};

function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-1">
      <h1 className="text-3xl font-bold text-stone-800">{title}</h1>
      {subtitle && <p className="text-stone-500">{subtitle}</p>}
    </div>
  );
}

export default PageHeader;
