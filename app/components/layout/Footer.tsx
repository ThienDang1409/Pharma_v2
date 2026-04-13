"use client";

import Link from "next/link";
import { informationApi, Information } from "@/lib/api";
import { useEffect, useState } from "react";
import { useLanguage } from "@/app/context/LanguageContext";
import { getLocalizedText } from "@/lib/utils/string/i18n";
import { apiFetch } from "@/lib/utils/api/apiHelper";
import enTranslations from "@/locales/en.json";
import viTranslations from "@/locales/vi.json";

const translations = {
  en: enTranslations,
  vi: viTranslations,
};

function IconPin() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 shrink-0" aria-hidden="true">
      <path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7zm0 10a3 3 0 1 1 0-6 3 3 0 0 1 0 6z" />
    </svg>
  );
}

function IconMail() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 shrink-0" aria-hidden="true">
      <path d="M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zm0 2v.5l9 5.6 9-5.6V7l-9 5.6L3 7z" />
    </svg>
  );
}

function IconPhone() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 shrink-0" aria-hidden="true">
      <path d="M6.6 10.8a15.2 15.2 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.24c1.1.36 2.2.54 3.4.54a1 1 0 0 1 1 1V21a1 1 0 0 1-1 1C10.1 22 2 13.9 2 4a1 1 0 0 1 1-1h4.5a1 1 0 0 1 1 1c0 1.2.18 2.3.54 3.4a1 1 0 0 1-.24 1l-2.2 2.2z" />
    </svg>
  );
}

function IconFacebook() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7" aria-hidden="true">
      <path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9v-2.9h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.2c-1.2 0-1.6.7-1.6 1.5v1.9h2.8l-.4 2.9h-2.4v7A10 10 0 0 0 22 12z" />
    </svg>
  );
}

function IconLinkedIn() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7" aria-hidden="true">
      <path d="M6.4 8.8a1.8 1.8 0 1 1 0-3.6 1.8 1.8 0 0 1 0 3.6zM4.8 10h3.2v9.2H4.8V10zm5 0h3v1.3h.04c.4-.8 1.4-1.6 2.9-1.6 3 0 3.6 2 3.6 4.5v5h-3.2v-4.4c0-1-.02-2.4-1.5-2.4s-1.7 1.1-1.7 2.3v4.5H9.8V10z" />
    </svg>
  );
}

function IconYoutube() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7" aria-hidden="true">
      <path d="M23 8.3a3 3 0 0 0-2.1-2.1C19 5.6 12 5.6 12 5.6s-7 0-8.9.6A3 3 0 0 0 1 8.3C.4 10.2.4 12 .4 12s0 1.8.6 3.7a3 3 0 0 0 2.1 2.1c1.9.6 8.9.6 8.9.6s7 0 8.9-.6a3 3 0 0 0 2.1-2.1c.6-1.9.6-3.7.6-3.7s0-1.8-.6-3.7zM10 15.1V8.9L15.2 12 10 15.1z" />
    </svg>
  );
}

export default function Footer() {
  const { language } = useLanguage();
  const [categories, setCategories] = useState<Information[]>([]);
  const [loading, setLoading] = useState(true);
  const t = translations[language];

  useEffect(() => {
    const fetchFooterData = async () => {
      setLoading(true);
      await apiFetch(
        () => informationApi.getAll(),
        {
          onSuccess: (response) => {
            setCategories(response?.items || []);
          },
          onError: () => setCategories([]),
        }
      );
      setLoading(false);
    };

    fetchFooterData();
  }, []);

  const mainCategories = categories.filter((cat) => !cat.parentId).slice(0, 4);

  if (loading) {
    return (
      <footer className="bg-primary-900 text-white">
        <div className="py-10 text-center">
          <div className="inline-block animate-spin rounded-full h-7 w-7 border-4 border-white/25 border-t-white" />
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-primary-900 text-white relative">
      <div className="container mx-auto w-[92%] py-10 md:py-12 lg:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-[1.45fr_1fr_0.9fr] gap-8 lg:gap-12">
          <div>
            <h2 className="text-3xl  font-bold tracking-tight uppercase mb-4 md:mb-5">
              CÔNG TY CP THIẾT BỊ VIỆT ANH
            </h2>

            <div className="space-y-4 md:space-y-5 text-sm md:text-md leading-[1.5] text-white/75 max-w-[640px]">
              <p className="flex items-start gap-3">
                <span className="text-white mt-1"><IconPin /></span>
                <span>
                  <strong className="text-white">Hồ Chí Minh:</strong> 11A Nguyễn An, Khu phố 4, P. Cát Lái, Tp. HCM
                </span>
              </p>

              <p className="flex items-start gap-3">
                <span className="text-white mt-1"><IconPin /></span>
                <span>
                  <strong className="text-white">Hà Nội:</strong> P808, 8/F, Vivaseen Building 48 Tố Hữu, P. Đại Mỗ, Tp. Hà Nội
                </span>
              </p>

              <p className="flex items-center gap-3">
                <span className="text-white"><IconMail /></span>
                <span>
                  <strong className="text-white">{t.footer.email}:</strong> trung.nt@vietanh.vn
                </span>
              </p>

              <p className="flex items-center gap-3">
                <span className="text-white"><IconPhone /></span>
                <span>
                  <strong className="text-white">Hotline:</strong> 0937998390
                </span>
              </p>
            </div>
          </div>

          <div>
            <ul className="space-y-2 md:space-y-3 text-md md:text-xl font-medium leading-[1.2]">
              {mainCategories.map((item) => (
                <li key={item._id}>
                  <Link href={`/category/${item.slug}`} className="hover:text-third-500 transition-colors">
                    {getLocalizedText(item.name, item.name_en, language)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col justify-between">
            <ul className="space-y-2 md:space-y-3 text-md md:text-xl leading-[1.3] text-white/70">
              <li>
                <Link href="/blog/privacy" className="hover:text-white transition-colors">
                  {t.footer.privacy}
                </Link>
              </li>
              <li>
                <Link href="/blog/terms" className="hover:text-white transition-colors">
                  {t.footer.terms}
                </Link>
              </li>
              <li>
                <Link href="/blog/warranty" className="hover:text-white transition-colors">
                  {t.footer.warranty}
                </Link>
              </li>
            </ul>

            <div className="mt-6 pt-4 border-t border-white/30 flex items-center gap-4 md:gap-5 max-w-[540px]">
              <Link href="https://facebook.com" target="_blank" aria-label="Facebook" className="text-white hover:text-third-500 transition-colors">
                <IconFacebook />
              </Link>
              <Link href="https://linkedin.com" target="_blank" aria-label="LinkedIn" className="text-white hover:text-third-500 transition-colors">
                <IconLinkedIn />
              </Link>
              <Link href="https://youtube.com" target="_blank" aria-label="Youtube" className="text-white hover:text-third-500 transition-colors">
                <IconYoutube />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <a
        href="https://zalo.me/0937998390"
        className="hidden md:flex fixed right-4 bottom-40 z-40 w-16 h-16 items-center justify-center hover:scale-110 transition-transform"
        aria-label="Zalo"
      >
        <img src="/ico/zalo.ico" alt="Zalo" className="w-15 h-15" />
      </a>

      <a
        href="tel:0937998390"
        className="hidden md:flex fixed right-4 bottom-24 bg-primary-950 text-white rounded-2xl px-4 py-2 items-center gap-2 shadow-lg z-40 max-w-[300px]"
        aria-label="Hotline"
      >
        <span className="text-white"><IconPhone /></span>
        <span className="text-sm font-semibold leading-none">0937998390</span>
      </a>
    </footer>
  );
}
