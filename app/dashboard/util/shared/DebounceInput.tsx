"use client";
import React, {
  useEffect,
  useState,
  // InputHTMLAttributes,
} from "react";

interface Prop extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  debounce?: number;
  onChange: (payload: string) => void; // your custom onChange
  value: string;
  className?: string;
  containerClassName?: string;
  placeHolder?: string;
  iconPosition?:"left"|"right"
}


const DebounceInput = ({
  value: initialValue,
  debounce = 500,
  onChange,
  className,
  containerClassName,
  placeHolder = "Search",
  iconPosition="right",
  ...props
}: Prop) => {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value);
    }, debounce);

    return () => clearTimeout(timeout);
  }, [value, debounce, onChange]);

  return (
    <div
      className={`gap-x-2  outline-none bg-[#F6F6FB66]/40  border-[.0375rem] border-[#E9EBEE] flex items-center text-xs h-11 px-[1.3rem] rounded-[.625rem] ${containerClassName}`}
    >
  {iconPosition==="left"&&<svg
        fill="none"
        height="18"
        viewBox="0 0 20 20"
        width="18"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M17.5 17.5L13.875 13.875M15.8333 9.16667C15.8333 12.8486 12.8486 15.8333 9.16667 15.8333C5.48477 15.8333 2.5 12.8486 2.5 9.16667C2.5 5.48477 5.48477 2.5 9.16667 2.5C12.8486 2.5 15.8333 5.48477 15.8333 9.16667Z"
          stroke="#8C8CA1"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.66667"
        />
      </svg>
}
      
      <input
        className={`h-full border-none w-full font-inter text-black bg-transparent outline-none ${className}`}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeHolder}
        {...props}
      />
      {iconPosition==="right"&&<svg
        fill="none"
        height="18"
        viewBox="0 0 20 20"
        width="18"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M17.5 17.5L13.875 13.875M15.8333 9.16667C15.8333 12.8486 12.8486 15.8333 9.16667 15.8333C5.48477 15.8333 2.5 12.8486 2.5 9.16667C2.5 5.48477 5.48477 2.5 9.16667 2.5C12.8486 2.5 15.8333 5.48477 15.8333 9.16667Z"
          stroke="#8C8CA1"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.66667"
        />
      </svg>
}
    </div>
  );
};

export default DebounceInput;
