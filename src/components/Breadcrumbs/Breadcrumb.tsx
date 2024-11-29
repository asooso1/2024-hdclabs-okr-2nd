import Link from "next/link";
interface BreadcrumbProps {
  pageName: string;
}
const Breadcrumb = ({ pageName }: BreadcrumbProps) => {
  const pathSegments = pageName.split('/').filter(segment => segment !== '');

  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <h2 className="text-title-md2 font-semibold text-black dark:text-white">
        {pathSegments[pathSegments.length - 1] || pageName}
      </h2>

      {/* <nav>
        <ol className="flex items-center gap-2">
          <li>
            <Link className="font-medium" href="/">
              Home
            </Link>
          </li>

          {pathSegments.map((segment, index) => {
            const path = `/${pathSegments.slice(0, index + 1).join('/')}`;
            return (
              <li key={path} className="flex items-center gap-2">
                <span className="text-gray-500">/</span>
                {index === pathSegments.length - 1 ? (
                  <span className="font-medium text-primary">{segment}</span>
                ) : (
                  <Link className="font-medium hover:text-primary" href={path}>
                    {segment}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav> */}
    </div>
  );
};

export default Breadcrumb;
