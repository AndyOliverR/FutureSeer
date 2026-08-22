import Image from "next/image";

const PLATFORM_ICONS = [
  { src: "/badges/icon-ios.svg", name: "iOS" },
  { src: "/badges/icon-android.svg", name: "Android" },
  { src: "/badges/icon-windows.svg", name: "Windows" },
  { src: "/badges/icon-macos.svg", name: "macOS" },
  { src: "/badges/icon-linux.svg", name: "Linux" },
  { src: "/badges/icon-chromeos.svg", name: "ChromeOS" },
] as const;

/** Public platform marks from Wikimedia / official brand SVGs. */
export function PwaPlatformIcons() {
  return (
    <div
      className="flex flex-wrap items-center gap-3"
      role="img"
      aria-label="Works on iOS, Android, Windows, macOS, Linux, and ChromeOS"
    >
      {PLATFORM_ICONS.map((icon) => (
        <Image
          key={icon.src}
          src={icon.src}
          alt=""
          title={icon.name}
          width={56}
          height={56}
          className="h-14 w-14 object-contain rounded-xl bg-white p-1.5"
          unoptimized
        />
      ))}
    </div>
  );
}
