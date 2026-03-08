"use client";

import { X } from "lucide-react";
import { Button } from "./button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./dialog";



interface ErrorModalProps {
  isErrorModalOpen: boolean;
  setErrorModalState: React.Dispatch<React.SetStateAction<boolean>>;
  heading?: string;
  subheading: string;
  children?: React.ReactNode;
}

export function ErrorModal({
  isErrorModalOpen,
  setErrorModalState,
  heading = "An error occurred.",
  subheading,
  children,
}: ErrorModalProps) {
  return (
    <Dialog open={isErrorModalOpen} onOpenChange={setErrorModalState}>
      <DialogContent className="bg-[#150130] border-none max-w-lg text-white z-99999999999999999999999!" showCloseButton={false}>
        <DialogHeader className="bg-[#150130] w-full flex justify-between items-enter">
          <div className=" flex justify-between items-start">
           <svg width="54" height="54" viewBox="0 0 54 54" fill="none" xmlns="http://www.w3.org/2000/svg">
<circle cx="27.001" cy="27.001" r="27.001" fill="#EB001B" fill-opacity="0.64"/>
<circle cx="27.0002" cy="27.0019" r="21.2892" fill="#EB001B" fill-opacity="0.67"/>
<circle cx="26.9982" cy="26.9999" r="17.6545" fill="#EB001B"/>
<path d="M22.918 31.2647L27.0015 26.9177M27.0015 26.9177L31.085 22.5708M27.0015 26.9177L22.918 22.5708M27.0015 26.9177L31.085 31.2647" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>

          <Button 
          // icon={false}
           onClick={()=>setErrorModalState(false)} className="bg-[#F2F5FF] p-3 rounded text-black flex justify-center items-center">
             <X size={20} />
          </Button>
          </div>
        </DialogHeader>

        <div className="p-0 text-left">
          <div className="px-2 pb-6 ">
            <DialogTitle className="font-inter  text-white w-4/5  text-lg font-medium">
              {heading}
            </DialogTitle>
            <DialogDescription className="text-[#D8D8DF] text-sm font-nunito py-2">
              {subheading}
            </DialogDescription>
          </div>

          {children}
          <div className="px-2 pb-5">
            <Button
          // icon={false}

              className="grow bg-[#7E3CE0] cursor-pointer px-1.5 sm:text-sm w-full md:px-12.75"
              size="lg"
              type="button"
              onClick={() => {
                setErrorModalState(false);
                // setOpenConfirmDisbursedMadal(false)
              }}
            >
              Okay
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
