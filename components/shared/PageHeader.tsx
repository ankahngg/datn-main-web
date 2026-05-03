function PageHeader(
    {
        title,
        description,
    }
    :
    {        
        title: string;
        description: string;
    }
) {
    return (
        <div className="rounded-2xl bg-sidebar p-5 shadow-lg">
          <h1 className="text-2xl font-heading">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {description}
          </p>
        </div>
      );
}

export default PageHeader;