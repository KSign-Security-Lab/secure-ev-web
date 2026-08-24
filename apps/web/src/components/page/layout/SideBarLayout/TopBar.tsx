"use client";

import React, { ReactNode } from "react";

interface TopbarProps {
  leftEnhancer?: ReactNode;
}

const Topbar: React.FC<TopbarProps> = ({ leftEnhancer }) => {
  return (
    <div className="flex flex-row w-full mb-6 items-center">
      {leftEnhancer}
    </div>
  );
};

export default Topbar;
