function PageHeader({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-sidebar p-5 shadow-lg">
      <h1 className="text-2xl font-heading flex items-center">
        {icon && <span className="mr-2">{icon}</span>}
        <div>{title}</div>
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

export default PageHeader;
