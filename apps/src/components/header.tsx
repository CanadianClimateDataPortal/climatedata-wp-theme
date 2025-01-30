import { LogOut } from "lucide-react";
import { useI18n } from "@wordpress/react-i18n";
import Logo from "@/assets/logo.svg";

export default function Header(): JSX.Element {
  const { __ } = useI18n();

  return (
    <header className="flex items-center justify-between px-4 py-1.5">
      <div className="flex items-center">
        <img src={Logo} alt={__('Climate Data')} />
        <h2 className="py-2 px-4 text-zinc-900 text-base font-light leading-tight">{__('Climate Data')}</h2>
      </div>
      <a href="#" className="flex gap-x-2 px-4 py-2">
        <span className="underline text-sm">{__('Go back to the main website')}</span>
        <LogOut />
      </a>
    </header>
  )
}
