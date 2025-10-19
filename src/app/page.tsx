"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import { Advocate } from "@/types/advocate";
import { formatPhoneNumber } from "@/utils/formatters";
import { CONST } from "@/constants/text";

export default function Home() {
  const [allAdvocates, setAllAdvocates] = useState<Advocate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [locationFilter, setLocationFilter] = useState<string>("");
  const itemsPerPage = 10;

  const fetchAdvocates = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/advocates`);
      if (!response.ok) throw new Error("Failed to fetch advocates");

      const { data } = await response.json();
      setAllAdvocates(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdvocates();
  }, [fetchAdvocates]);

  const uniqueCities = useMemo(() => {
    return Array.from(
      new Set(allAdvocates.map((advocate) => advocate.city))
    ).sort();
  }, [allAdvocates]);

  const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLocationFilter(e.target.value);
  };

  const filteredAdvocates = useMemo(() => {
    if (!searchTerm && !locationFilter) return allAdvocates;

    return allAdvocates.filter((advocate) => {
      const matchesSearch =
        !searchTerm ||
        advocate.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        advocate.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        advocate.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        advocate.degree.toLowerCase().includes(searchTerm.toLowerCase()) ||
        advocate.specialties.some((s) =>
          s.toLowerCase().includes(searchTerm.toLowerCase())
        ) ||
        advocate.yearsOfExperience.toString().includes(searchTerm);

      const matchesLocation =
        !locationFilter || advocate.city === locationFilter;

      return matchesSearch && matchesLocation;
    });
  }, [allAdvocates, searchTerm, locationFilter]);

  const totalPages = Math.ceil(filteredAdvocates.length / itemsPerPage);
  const paginatedAdvocates = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredAdvocates.slice(start, end);
  }, [filteredAdvocates, page, itemsPerPage]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 p-4 rounded-lg">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => fetchAdvocates()}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            {CONST.ERROR.RETRY_BUTTON}
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Solace Advocates
      </h1>

      <div className="mb-8">
        <div className="flex gap-4 items-center">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search advocates..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              aria-label="Search advocates"
            />
          </div>
          <select
            value={locationFilter}
            onChange={handleLocationChange}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            aria-label="Filter by location"
          >
            <option value="">All Locations</option>
            {uniqueCities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
          <button
            onClick={() => {
              setSearchTerm("");
              setLocationFilter("");
              fetchAdvocates();
            }}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            Clear
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse bg-gray-100 rounded-lg p-6 h-48"
            />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedAdvocates.map((advocate: Advocate, index: number) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <h2 className="text-xl font-semibold text-gray-900">
                  {advocate.firstName} {advocate.lastName}
                </h2>
                <p className="text-gray-600 mt-2">{advocate.city}</p>
                <p className="text-gray-600">{advocate.degree}</p>
                <div className="mt-4">
                  <h3 className="text-sm font-semibold text-gray-700">
                    {CONST.ADVOCATE_CARD.SPECIALTIES_TITLE}
                  </h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {advocate.specialties.map(
                      (specialty: string, index: number) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded"
                        >
                          {specialty}
                        </span>
                      )
                    )}
                  </div>
                </div>
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    {CONST.ADVOCATE_CARD.YEARS_EXPERIENCE.replace(
                      "{years}",
                      advocate.yearsOfExperience.toString()
                    )}
                  </span>
                  <a
                    href={`tel:${advocate.phoneNumber}`}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {formatPhoneNumber(advocate.phoneNumber)}
                  </a>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
              >
                {CONST.PAGINATION.PREVIOUS}
              </button>
              <span className="px-4 py-2">
                {CONST.PAGINATION.PAGE_OF.replace(
                  "{current}",
                  page.toString()
                ).replace("{total}", totalPages.toString())}
              </span>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
              >
                {CONST.PAGINATION.NEXT}
              </button>
            </div>
          )}
        </>
      )}
    </main>
  );
}
