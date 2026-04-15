"use client";

import { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/app/context/LanguageContext";
import { contactApi, SubmitContactDto } from "@/lib/api";
import { siteConfig } from "@/config/site";
import enTranslations from "@/locales/en.json";
import viTranslations from "@/locales/vi.json";

const translations = {
  en: enTranslations,
  vi: viTranslations,
};

type FormState = {
  fullName: string;
  email: string;
  phone: string;
  company: string;
  subject: string;
  message: string;
};

type ConnectSectionProps = {
  compact?: boolean;
};

const initialForm: FormState = {
  fullName: "",
  email: "",
  phone: "",
  company: "",
  subject: "",
  message: "",
};

export default function ConnectSection({ compact = false }: ConnectSectionProps) {
  const { language } = useLanguage();
  const lang = language === "en" ? "en" : "vi";
  const t = translations[lang];

  const [formData, setFormData] = useState<FormState>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const connectT = t.connect;

  const socialLinks = [
    { href: siteConfig.social.facebook, label: "Facebook", icon: "M24 12.073c0-6.627-5.373-12-12-12S0 5.446 0 12.073c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" },
    { href: siteConfig.social.twitter, label: "X", icon: "M18.901 1.153h3.68l-8.036 9.19L24 22.846h-7.406l-5.8-7.584-6.633 7.584H.48l8.595-9.826L0 1.154h7.594l5.243 6.932zM17.61 20.644h2.039L6.486 3.24H4.298z" },
    { href: siteConfig.social.youtube, label: "YouTube", icon: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" },
    { href: siteConfig.social.instagram, label: "Instagram", icon: "M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06z" },
    { href: siteConfig.social.linkedin, label: "LinkedIn", icon: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" },
  ];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) return false;
    if (!formData.email.trim()) return false;
    if (!formData.message.trim()) return false;
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      setFeedback({
        type: "error",
        message: connectT.error,
      });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const payload: SubmitContactDto = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
        company: formData.company.trim() || undefined,
        subject: formData.subject.trim() || undefined,
        message: formData.message.trim(),
        sourcePage: typeof window !== "undefined" ? window.location.pathname : "/",
        language: lang,
      };

      await contactApi.submit(payload);

      setFormData(initialForm);
      setFeedback({ type: "success", message: connectT.success });
    } catch (error) {
      console.error("Contact submit error:", error);
      setFeedback({ type: "error", message: connectT.error });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="bg-white">
      {!compact && (
        <div className="py-16 border-b border-gray-100">
          <div className="container mx-auto px-4">
            <div
              className="relative h-150 w-full flex items-center justify-center bg-contain bg-center bg-no-repeat"
              style={{ backgroundImage: "url('/images/pharma-test-world.png')" }}
            >
              <div className="relative z-10 text-center p-6 max-w-xl bg-white/70 backdrop-blur-[1px] rounded-3xl border border-white shadow-sm">
                <p className="text-gray-700 mb-2 font-medium">{connectT.partnersWorldwide}</p>
                <p className="text-gray-700 mb-5 font-medium">{connectT.fullyTrained}</p>
                <Link
                  href="/distributors"
                  className="inline-flex items-center justify-center bg-primary-900 text-white px-6 py-2.5 rounded-xl hover:bg-primary-800 transition-colors text-sm font-semibold"
                >
                  {connectT.findLocalReps}
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="py-14 bg-linear-to-b from-white to-slate-50/60">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="h-px bg-gray-300 w-16 md:w-48"></div>
              <h2 className="text-2xl md:text-3xl font-bold text-primary-900">{connectT.letsConnect}</h2>
              <div className="h-px bg-gray-300 w-16 md:w-48"></div>
            </div>

            <div className="flex justify-center gap-6 md:gap-10 mb-6">
              {socialLinks.map((social) => (
                <Link
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  className="text-gray-400 hover:text-primary-900 transition-colors"
                  aria-label={social.label}
                >
                  <svg className="w-9 h-9" fill="currentColor" viewBox="0 0 24 24">
                    <path d={social.icon} />
                  </svg>
                </Link>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-6 bg-white border border-gray-200 rounded-3xl p-6 md:p-8 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900">{connectT.formTitle}</h3>
              <p className="text-sm text-gray-600 mt-2 mb-6">{connectT.formDescription}</p>

              {feedback && (
                <div
                  className={`mb-5 px-4 py-3 rounded-xl text-sm font-medium ${
                    feedback.type === "success"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-rose-50 text-rose-700 border border-rose-200"
                  }`}
                >
                  {feedback.message}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                      {connectT.fullName} *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                      maxLength={120}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                      {connectT.email} *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                      maxLength={150}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                      {connectT.phone}
                    </label>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                      maxLength={30}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                      {connectT.company}
                    </label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                      maxLength={120}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                    {connectT.subject}
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    maxLength={160}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                    {connectT.message} *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none min-h-[140px]"
                    maxLength={4000}
                    required
                  />
                </div>

                <p className="text-xs text-gray-500">{connectT.requiredHint}</p>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full md:w-auto inline-flex items-center justify-center px-6 py-3 rounded-xl bg-primary-900 text-white font-semibold hover:bg-primary-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? connectT.submitting : connectT.submit}
                </button>
              </form>
            </div>

            <div className="lg:col-span-6 space-y-5">
              <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-1">{connectT.mapTitle}</h3>
                <p className="text-sm text-gray-600 mb-4">{connectT.mapDescription}</p>

                <div className="rounded-2xl overflow-hidden border border-gray-200 h-[320px]">
                  <iframe
                    src={siteConfig.contact.mapEmbedUrl}
                    className="w-full h-full"
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Pharma Test Office Map"
                  />
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  <Link
                    href={siteConfig.contact.mapDirectionsUrl}
                    target="_blank"
                    className="inline-flex items-center justify-center px-4 py-2 rounded-xl border border-primary-900 text-primary-900 hover:bg-primary-900 hover:text-white transition-colors text-sm font-semibold"
                  >
                    {connectT.openDirections}
                  </Link>
                </div>
              </div>

              <div className="bg-primary-900 text-white rounded-3xl p-5 shadow-sm space-y-2">
                <p className="text-sm text-white/80">{t.footer.address}: {siteConfig.contact.address}</p>
                <p className="text-sm text-white/80">{t.footer.phone}: {siteConfig.contact.phone}</p>
                <p className="text-sm text-white/80">{t.footer.email}: {siteConfig.contact.email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
