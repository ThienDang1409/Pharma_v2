import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Authentication | VietAnh Instruments",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
