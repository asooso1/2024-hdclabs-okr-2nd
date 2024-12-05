const Loader = () => {
  return (
    <div className="fixed top-0 left-0 z-9999 flex h-screen w-full items-center justify-center bg-white/75 p-4 dark:bg-black/75 md:p-6 lg:ml-52 lg:w-[calc(100vw-14rem)] 2xl:p-10">
      <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
    </div>
  );
};

export default Loader;
