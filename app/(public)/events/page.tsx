"use client";

import Layout from "@/app/components/Layout";
import Link from "next/link";
import { useState } from "react";

interface Event {
  id: number;
  name: string;
  date: string;
  location: string;
  city: string;
  country: string;
  booth: string;
  website: string;
  logo?: string;
  isPast?: boolean;
}

interface Impression {
  id: number;
  title: string;
  link: string;
}

export default function EventsPage() {
  const [activeTab, setActiveTab] = useState<
    "upcoming" | "past" | "impressions"
  >("upcoming");

  const upcomingEvents: Event[] = [
    {
      id: 1,
      name: "analytica 2026",
      date: "07-10 April 2026 (Tue-Fri)",
      location: "Trade Fair",
      city: "Munich",
      country: "Germany",
      booth: "hall no., stall no. 47",
      website: "www.analytica.de",
      logo: "/analytica-logo.png",
    },
  ];

  const pastEvents: Event[] = [
    {
      id: 2,
      name: "International Conference on Biomedical Engineering (ICBE)",
      date: "19-21 October 2025 (Sat-Mon)",
      location: "Thapar University",
      city: "Patiala",
      country: "Punjab",
      booth: "stall no. 25",
      website: "www.thapar.edu",
      isPast: true,
    },
    {
      id: 3,
      name: "FarmaForum 2025",
      date: "7-8 November 2025 (Thu-Fri)",
      location: "Poznań International Fair",
      city: "Poznań",
      country: "Poland",
      booth: "hall no. 15B",
      website: "www.farmaforum.pl",
      logo: "/farmaforum-logo.png",
      isPast: true,
    },
    {
      id: 4,
      name: "4º Conference 3ª Exhibition of Leuven Industry & Startups",
      date: "20-22 November 2025 (Wed-Fri)",
      location: "Leuven",
      city: "Leuven",
      country: "Belgium",
      booth: "stall no. 14B",
      website: "www.leuvenindustry.be",
      isPast: true,
    },
    {
      id: 5,
      name: "Poznań Technopharm 2025",
      date: "7-8 November 2025 (Thu-Fri)",
      location: "Trade Fair Area Poznań in Technopharm in Nuremberg",
      city: "Nuremberg",
      country: "Germany",
      booth: "hall no. 15B, stall no. 13",
      website: "www.technopharm.de",
      logo: "/powtech-logo.png",
      isPast: true,
    },
  ];

  const impressions: Impression[] = [
    {
      id: 1,
      title: "Impressions from Interphex Japan 2019",
      link: "/impressions/interphex-japan-2019",
    },
    {
      id: 2,
      title: "Impressions from analytica Vietnam 2019",
      link: "/impressions/analytica-vietnam-2019",
    },
    {
      id: 3,
      title:
        "Impressions at the 5th Damascus Scientific Pharmaceutical Days 2019",
      link: "/impressions/damascus-pharmaceutical-days-2019",
    },
    {
      id: 4,
      title:
        "Recap from the PHARMA TEST GROUP Asian Sales Seminar 2019 in Krabi, Thailand",
      link: "/impressions/asian-sales-seminar-2019",
    },
    {
      id: 5,
      title: "Recap of ACHEMA 2018 in Frankfurt/Main, Germany",
      link: "/impressions/achema-2018-frankfurt",
    },
    {
      id: 6,
      title:
        "World premiere at ACHEMA 2018 – the new 14+2 station dissolution testing instrument PTWS 1420",
      link: "/impressions/achema-2018-ptws-1420",
    },
    {
      id: 7,
      title:
        "Distributor seminar during ACHEMA 2018 – including a surprise award ceremony",
      link: "/impressions/achema-2018-distributor-seminar",
    },
    {
      id: 8,
      title: "Impressions of analytica 2018 in Munich, Germany",
      link: "/impressions/analytica-2018-munich",
    },
  ];

  const currentEvents = activeTab === "upcoming" ? upcomingEvents : pastEvents;

  return (
    <Layout>
      {/* Hero Section */}
      <div className="relative h-64 bg-gradient-to-br from-gray-100 to-gray-200">
        <div className="absolute inset-0 opacity-10">
          <div className="w-full h-full bg-[radial-gradient(circle_at_center,_#9ca3af_1px,_transparent_1px)] bg-[size:20px_20px]"></div>
        </div>
        <div className="container mx-auto px-4 h-full flex items-center justify-center">
          <h1 className="text-5xl font-bold text-gray-800">Events</h1>
        </div>
      </div>

      {/* Yellow Separator Bar */}
      <div className="h-4 bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-400"></div>

      {/* Events Content Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          {/* Introduction Text */}
          <div className="max-w-3xl mx-auto text-center mb-12">
            <p className="text-gray-700 text-lg leading-relaxed">
              You can meet us at the following{" "}
              <Link
                href="#upcoming"
                className="text-red-600 hover:underline font-semibold"
              >
                upcoming events
              </Link>{" "}
              in Germany and around the world where Pharma Test or one of our
              global partner companies will be exhibiting. We are looking
              forward to meeting you!
            </p>
          </div>

          {/* Tabs Navigation - Sticky */}
          <div className="sticky top-0 z-50 bg-white shadow-md mb-12">
            <div className="flex justify-center py-4">
              <div className="inline-flex border border-gray-300 rounded overflow-hidden">
                <button
                  onClick={() => setActiveTab("upcoming")}
                  className={`px-8 py-3 font-semibold transition-colors ${
                    activeTab === "upcoming"
                      ? "bg-red-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  Upcoming Events
                </button>
                <button
                  onClick={() => setActiveTab("past")}
                  className={`px-8 py-3 font-semibold transition-colors border-l border-gray-300 ${
                    activeTab === "past"
                      ? "bg-red-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  Past Events
                </button>
                <button
                  onClick={() => setActiveTab("impressions")}
                  className={`px-8 py-3 font-semibold transition-colors border-l border-gray-300 ${
                    activeTab === "impressions"
                      ? "bg-red-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  Impressions
                </button>
              </div>
            </div>
          </div>

          {/* Impressions Tab Content */}
          {activeTab === "impressions" && (
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-800 mb-8">
                Impressions
              </h2>
              <div className="space-y-4">
                {impressions.map((impression) => (
                  <div key={impression.id} className="flex items-start">
                    <span className="text-red-600 mr-3 mt-1">»</span>
                    <Link
                      href={impression.link}
                      className="text-red-600 hover:underline text-lg"
                    >
                      {impression.title}
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Events List */}
          {activeTab !== "impressions" && (
            <div className="space-y-8">
              {currentEvents.map((event) => (
                <div
                  key={event.id}
                  className="bg-gray-50 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="grid md:grid-cols-3 gap-6 p-8">
                    {/* Left Column - Event Details */}
                    <div className="md:col-span-2">
                      <h3 className="text-2xl font-bold text-gray-800 mb-4">
                        {event.name}
                      </h3>
                      <div className="space-y-2 text-gray-700">
                        <p>
                          <span className="font-semibold">Date:</span>{" "}
                          <span className="text-red-600">{event.date}</span>
                        </p>
                        <p>
                          <span className="font-semibold">Type:</span>{" "}
                          {event.location}
                        </p>
                        <p>
                          <span className="font-semibold">City:</span>{" "}
                          {event.city}
                        </p>
                        <p>
                          <span className="font-semibold">Country:</span>{" "}
                          {event.country}
                        </p>
                        <p>
                          <span className="font-semibold">Booth no.:</span>{" "}
                          {event.booth}
                        </p>
                        <p>
                          <span className="font-semibold">Website:</span>{" "}
                          <Link
                            href={`https://${event.website}`}
                            target="_blank"
                            className="text-red-600 hover:underline"
                          >
                            {event.website}
                          </Link>
                        </p>
                      </div>
                    </div>

                    {/* Right Column - Event Logo */}
                    <div className="flex items-center justify-center">
                      {event.logo ? (
                        <div className="w-full h-32 bg-white rounded-lg flex items-center justify-center p-4 border border-gray-200">
                          <span className="text-gray-400 text-sm">
                            Event Logo
                          </span>
                        </div>
                      ) : (
                        <div className="w-full h-32 bg-white rounded-lg flex items-center justify-center p-4 border border-gray-200">
                          <span className="text-6xl opacity-30">📅</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No Events Message for Upcoming */}
          {activeTab === "upcoming" && upcomingEvents.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">
                No upcoming events scheduled at the moment. Please check back
                later.
              </p>
            </div>
          )}

          {/* Section Title for Past Events */}
          {activeTab === "past" && pastEvents.length > 0 && (
            <div className="mt-16 mb-8">
              <h2 className="text-3xl font-bold text-gray-800 text-center">
                Past Pharma Events
              </h2>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
