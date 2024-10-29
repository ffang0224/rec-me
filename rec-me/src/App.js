import React, { useState } from "react";
import { X, PlusCircle, Search } from "lucide-react";

const ContentRecommender = () => {
  const [queries, setQueries] = useState([{ value: "", type: "movie" }]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedVideo, setExpandedVideo] = useState(null);

  const API_BASE_URL = "http://localhost:3001/api/recommendations";

  const contentTypes = [
    "music",
    "movie",
    "show",
    "podcast",
    "book",
    "game",
    "person",
    "place",
    "brand",
  ];

  const addQuery = () => {
    if (queries.length < 5) {
      setQueries([...queries, { value: "", type: "movie" }]);
    }
  };

  const removeQuery = (index) => {
    const newQueries = queries.filter((_, i) => i !== index);
    setQueries(newQueries);
  };

  const handleQueryChange = (index, field, value) => {
    const newQueries = [...queries];
    newQueries[index][field] = value;
    setQueries(newQueries);
    setError(null);
  };

  const formatQueryString = () => {
    return queries
      .filter((q) => q.value.trim())
      .map((q) => `${q.type}:${encodeURIComponent(q.value.trim())}`)
      .join(",");
  };

  const getYouTubeVideoId = (url) => {
    if (!url) return null;
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);

    try {
      const queryString = formatQueryString();
      if (!queryString) {
        throw new Error("Please enter at least one search term.");
      }

      const recommendationType = queries[0].type;
      const response = await fetch(
        `${API_BASE_URL}?q=${encodeURIComponent(
          queryString
        )}&type=${recommendationType}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch recommendations");
      }

      if (!data?.similar?.results?.length) {
        setError("No recommendations found. Try different search terms.");
        setResults(null);
        return;
      }

      setResults(data);
    } catch (error) {
      console.error("Error:", error);
      setError(error.message);
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Search Section */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center gap-2 mb-6">
          <Search className="w-6 h-6 text-blue-500" />
          <h1 className="text-2xl font-bold">Content Recommender</h1>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="space-y-3">
          {queries.map((query, index) => (
            <div key={index} className="flex gap-2 items-center">
              <select
                value={query.type}
                onChange={(e) =>
                  handleQueryChange(index, "type", e.target.value)
                }
                className="w-[180px] rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {contentTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Enter title..."
                value={query.value}
                onChange={(e) =>
                  handleQueryChange(index, "value", e.target.value)
                }
                className="flex-1 rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              {queries.length > 1 && (
                <button
                  onClick={() => removeQuery(index)}
                  className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        {queries.length < 5 && (
          <button
            onClick={addQuery}
            className="mt-4 w-full py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            Add Another Item
          </button>
        )}

        <button
          onClick={fetchRecommendations}
          disabled={loading || !queries.some((q) => q.value.trim())}
          className="mt-4 w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Finding Recommendations..." : "Get Recommendations"}
        </button>
      </div>

      {/* Results Section */}
      {results?.similar && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-6">Recommendations</h2>

          {/* Search Info */}
          {results.similar.info && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Content similar to:</h3>
              <div className="flex flex-wrap gap-2">
                {results.similar.info.map((item, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 rounded-full text-sm"
                  >
                    {item.name} ({item.type})
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Results Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {results.similar.results.map((item, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4 shadow">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold">{item.name}</h3>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {item.type}
                  </span>
                </div>

                {/* Video Player */}
                {item.yUrl && getYouTubeVideoId(item.yUrl) && (
                  <div className="mt-4">
                    {expandedVideo === index ? (
                      <div className="relative pt-[56.25%]">
                        <iframe
                          className="absolute top-0 left-0 w-full h-full rounded-lg"
                          src={`https://www.youtube.com/embed/${getYouTubeVideoId(
                            item.yUrl
                          )}`}
                          title={item.name}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    ) : (
                      <button
                        onClick={() => setExpandedVideo(index)}
                        className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
                      >
                        <div className="w-4 h-4">▶</div>
                        Play Video
                      </button>
                    )}
                  </div>
                )}

                {/* Description */}
                {item.wTeaser && (
                  <p className="mt-3 text-gray-600 text-sm line-clamp-3">
                    {item.wTeaser}
                  </p>
                )}

                {/* Links */}
                <div className="mt-4 space-y-2">
                  {item.wUrl && (
                    <a
                      href={item.wUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full text-center py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
                    >
                      Read on Wikipedia
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentRecommender;
