import { ShieldPlus } from "lucide-react";

export default function Logo() {
  return (
    <div className="flex flex-col items-center">
      <div className="mb-2 flex items-center">
        <div className="bg-primary text-primary-foreground flex size-10 items-center justify-center rounded-md ">
          <ShieldPlus className=" size-8" />
        </div>
        <h1 className=" font-mono text-4xl ml-2">PMS</h1>
      </div>

      <p className="text-sm/6 text-center sm:text-left">
        Patient Management System
      </p>
    </div>
  );
}
