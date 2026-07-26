import Image from "next/image";

import fightListLogo from "./icon.png";

export function BrandMark() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <Image
        className="brand-logo"
        src={fightListLogo}
        alt=""
        priority
        sizes="44px"
      />
    </span>
  );
}
