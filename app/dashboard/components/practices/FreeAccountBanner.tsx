const FreeAccountBanner =() =>{
  return (
    <div className="flex items-center gap-3  px-4 py-3 mb-6">
      <span className="text-indigo-500 shrink-0  h-8 w-8 bg-[#155DFC] flex justify-center items-center rounded-[.625rem]">ℹ️</span>
      <p className="text-sm text-[#314158] font-inter font-semibold">
        <strong>Free Account:</strong> You have access to 50 questions per exam.{" "}
        <button className="text-[#155DFC] cursor-pointer font-inter font-semibold hover:text-indigo-800">
          Upgrade to Premium
        </button>{" "}
        for unlimited access to all 17,000 questions.
      </p>
    </div>
  );
}
export default FreeAccountBanner