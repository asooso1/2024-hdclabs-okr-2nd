const AlertItem = ({ title, message, borderColor, bgColor }) => {
  return (
    <div
      className={`flex w-full border-l-6 ${borderColor} ${bgColor} bg-opacity-[15%] px-7 py-8 shadow-md dark:bg-[#1B1B24] dark:bg-opacity-30 md:p-9`}
    >
      <div
        className={`mr-5 flex h-9 w-full max-w-[36px] items-center justify-center rounded-xl ${bgColor}`}
      >
        {/* SVG 아이콘 추가 */}
      </div>
      <div className="w-full">
        <h5 className="mb-3 text-lg font-semibold text-[#9D5425]">{title}</h5>
        <p className="leading-relaxed text-[#D0915C]">{message}</p>
      </div>
    </div>
  );
};

export default AlertItem;
