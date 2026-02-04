import Link from "next/link";

interface ServicesDropdownProps {
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export default function ServicesDropdown({
  onMouseEnter,
  onMouseLeave,
}: ServicesDropdownProps) {
  return (
    <div
      className="fixed left-0 right-0 top-[56px] z-50"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="bg-white border-t-4 border-red-700 shadow-xl">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-8 p-8 max-w-md mx-auto">
            {/* Services List */}
            <div>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/services/financial"
                    className="text-base text-gray-700 hover:text-red-600 flex items-center gap-2"
                  >
                    <span className="text-red-600">›</span>
                    Financial Services
                  </Link>
                </li>
                <li>
                  <Link
                    href="/services/installation"
                    className="text-base text-gray-700 hover:text-red-600 flex items-center gap-2"
                  >
                    <span className="text-red-600">›</span>
                    Installation
                  </Link>
                </li>
                <li>
                  <Link
                    href="/services/qualification"
                    className="text-base text-gray-700 hover:text-red-600 flex items-center gap-2"
                  >
                    <span className="text-red-600">›</span>
                    Qualification
                  </Link>
                </li>
                <li>
                  <Link
                    href="/services/training"
                    className="text-base text-gray-700 hover:text-red-600 flex items-center gap-2"
                  >
                    <span className="text-red-600">›</span>
                    Training
                  </Link>
                </li>
                <li>
                  <Link
                    href="/services/technical-support"
                    className="text-base text-gray-700 hover:text-red-600 flex items-center gap-2"
                  >
                    <span className="text-red-600">›</span>
                    Technical Support
                  </Link>
                </li>
                <li>
                  <Link
                    href="/services/maintenance"
                    className="text-base text-gray-700 hover:text-red-600 flex items-center gap-2"
                  >
                    <span className="text-red-600">›</span>
                    Maintenance
                  </Link>
                </li>
                <li>
                  <Link
                    href="/services/warranty"
                    className="text-base text-gray-700 hover:text-red-600 flex items-center gap-2"
                  >
                    <span className="text-red-600">›</span>
                    Warranty
                  </Link>
                </li>
                <li>
                  <Link
                    href="/services/repair"
                    className="text-base text-gray-700 hover:text-red-600 flex items-center gap-2"
                  >
                    <span className="text-red-600">›</span>
                    Repair
                  </Link>
                </li>
                <li>
                  <Link
                    href="/services/downloads"
                    className="text-base text-gray-700 hover:text-red-600 flex items-center gap-2"
                  >
                    <span className="text-red-600">›</span>
                    Downloads
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
