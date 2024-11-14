import Image from "next/image";
import { Product } from "@/types/product";

const productData: Product[] = [
  {
    image: "/images/product/product-01.png",
    name: "Apple Watch Series 7",
    category: "Electronics",
    price: 296,
    sold: 22,
    profit: 45,
  },
  {
    image: "/images/product/product-02.png",
    name: "Macbook Pro M1",
    category: "Electronics",
    price: 546,
    sold: 12,
    profit: 125,
  },
  {
    image: "/images/product/product-03.png",
    name: "Dell Inspiron 15",
    category: "Electronics",
    price: 443,
    sold: 64,
    profit: 247,
  },
  {
    image: "/images/product/product-04.png",
    name: "HP Probook 450",
    category: "Electronics",
    price: 499,
    sold: 72,
    profit: 103,
  },
];

const TableTwo = () => {
  return (
    <div className="bg-white border rounded-lg border-stroke shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="px-4 py-6 md:px-6 xl:px-7.5">
        <h4 className="text-xl font-semibold text-black dark:text-white">
          진행중인 프로젝트
        </h4>
      </div>

      <div className="grid grid-cols-9 overflow-auto border-t border-stroke px-4 py-4.5 dark:border-strokedark sm:grid-cols-12 md:px-6 2xl:px-7.5">
        <div className="flex items-center col-span-3">
          <p className="font-medium">프로젝트명</p>
        </div>
        <div className="items-center col-span-2 sm:flex">
          <p className="font-medium">작업종류</p>
        </div>
        <div className="flex items-center col-span-1">
          <p className="font-medium">상태</p>
        </div>
        <div className="flex items-center col-span-1">
          <p className="font-medium">기간</p>
        </div>
        <div className="flex items-center col-span-1">
          <p className="font-medium">작업내용</p>
        </div>
        <div className="flex items-center col-span-1">
          <p className="font-medium">작업내용</p>
        </div>
        <div className="flex items-center col-span-1">
          <p className="font-medium">작업내용</p>
        </div>
        <div className="flex items-center col-span-1">
          <p className="font-medium">작업내용</p>
        </div>
        <div className="flex items-center col-span-1">
          <p className="font-medium">작업내용</p>
        </div>
      </div>

      {productData.map((product, key) => (
        <div
          className="grid grid-cols-9 overflow-auto border-t border-stroke px-4 py-4.5 dark:border-strokedark sm:grid-cols-12 md:px-6 2xl:px-7.5"
          key={key}
        >
          <div className="flex items-center col-span-3">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              {/* <div className="h-12.5 w-15 rounded-md">
                <Image
                  src={product.image}
                  width={60}
                  height={50}
                  alt="Product"
                />
              </div> */}
              <p className="text-sm text-black dark:text-white">
                {product.name}
              </p>
            </div>
          </div>
          <div className="items-center hidden col-span-2 sm:flex">
            <p className="text-sm text-black dark:text-white">
              {product.category}
            </p>
          </div>
          <div className="flex items-center col-span-1">
            <p className="text-sm text-black dark:text-white">
              ${product.price}
            </p>
          </div>
          <div className="flex items-center col-span-1">
            <p className="text-sm text-black dark:text-white">{product.sold}</p>
          </div>
          <div className="flex items-center col-span-1">
            <p className="text-sm text-meta-3">${product.profit}</p>
          </div>
          <div className="flex items-center col-span-1">
            <p className="text-sm text-meta-3">${product.profit}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TableTwo;
