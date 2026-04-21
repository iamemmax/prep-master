const SidebarBtn =({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
})=> {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3 font-inter cursor-pointer font-semibold py-2 rounded-lg text-xs transition-all duration-150 ${
        active
          ? "bg-[#F7C948] text-black font-semibold border-[0.3px] border-[#F7C948]"
          : "text-[#616980] hover:bg-slate-100 hover:text-slate-900 font-normal"
      }`}
    >
      {label}
    </button>
  );
}

export default SidebarBtn