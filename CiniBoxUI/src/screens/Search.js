import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { baseURL } from "../constants/constants";
import FetchedMoviePoster from "../components/FetchedMoviePoster";

const API_URL = `${baseURL}/search/movie`;
const SEARCH_DEBOUNCE_MS = 400;

export default function Search({ navigation }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalResults, setTotalResults] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");

  // Holds the in-flight request so a newer search can cancel a stale one.
  const abortRef = useRef(null);

  const searchMovies = useCallback(async (searchText, pageToLoad) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const isFirstPage = pageToLoad === 1;

    try {
      if (isFirstPage) {
        setResults([]);
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError("");

      const response = await fetch(
        `${API_URL}?query=${encodeURIComponent(searchText)}&page=${pageToLoad}`,
        { signal: controller.signal },
      );

      if (!response.ok) {
        throw new Error("Failed to search movies");
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Unable to search movies");
      }

      const data = result.data;

      // TMDB can repeat a movie across pages, so drop duplicates by id.
      setResults((prev) => {
        if (isFirstPage) return data.results;
        const seen = new Set(prev.map((movie) => movie.id));
        return [...prev, ...data.results.filter((movie) => !seen.has(movie.id))];
      });
      setPage(data.page);
      setTotalPages(data.total_pages);
      setTotalResults(data.total_results);
    } catch (err) {
      if (err.name === "AbortError") return;
      setError(err.message || "Something went wrong");
    } finally {
      if (abortRef.current === controller) {
        setLoading(false);
        setLoadingMore(false);
      }
    }
  }, []);

  const handleQueryChange = (text) => {
    setQuery(text);

    if (!text.trim()) {
      abortRef.current?.abort();
      setResults([]);
      setPage(1);
      setTotalPages(0);
      setTotalResults(0);
      setError("");
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) return;

    const timer = setTimeout(() => searchMovies(trimmed, 1), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query, searchMovies]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const loadMore = () => {
    if (loading || loadingMore || error || page >= totalPages) return;
    searchMovies(query.trim(), page + 1);
  };

  const retry = () => {
    const trimmed = query.trim();
    if (!trimmed) return;
    searchMovies(trimmed, results.length > 0 ? page + 1 : 1);
  };

  const renderMovie = ({ item }) => (
    <Pressable
      style={styles.movieCard}
      onPress={() =>
        navigation.navigate("MovieDetails", {
          movieId: item.id,
        })
      }
    >
      <View>
        {item.poster_path ? (
          <FetchedMoviePoster posterPath={item.poster_path} style={styles.poster} />
        ) : (
          <View style={[styles.poster, styles.posterPlaceholder]}>
            <Ionicons name="film-outline" size={36} color="#3A3F4D" />
          </View>
        )}

        <View style={styles.ratingBadge}>
          <Text style={styles.ratingText}>
            ★ {Number(item.vote_average || 0).toFixed(1)}
          </Text>
        </View>
      </View>

      <Text style={styles.movieTitle} numberOfLines={2}>
        {item.title}
      </Text>

      <Text style={styles.movieYear}>
        {item.release_date?.slice(0, 4) || "Unknown year"}
      </Text>
    </Pressable>
  );

  const renderEmptyState = () => {
    if (loading) {
      return (
        <View style={styles.stateBox}>
          <ActivityIndicator size="large" color="#F43F5E" />
          <Text style={styles.stateText}>Searching...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.stateBox}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable style={styles.retryButton} onPress={retry}>
            <Text style={styles.buttonText}>Try Again</Text>
          </Pressable>
        </View>
      );
    }

    if (!query.trim()) {
      return (
        <View style={styles.stateBox}>
          <Ionicons name="search-outline" size={48} color="#3A3F4D" />
          <Text style={styles.stateTitle}>Find your next movie</Text>
          <Text style={styles.stateText}>Search by title to explore the TMDB catalogue.</Text>
        </View>
      );
    }

    return (
      <View style={styles.stateBox}>
        <Ionicons name="sad-outline" size={48} color="#3A3F4D" />
        <Text style={styles.stateTitle}>No movies found</Text>
        <Text style={styles.stateText}>Try a different title or spelling.</Text>
      </View>
    );
  };

  const renderFooter = () => {
    if (loadingMore) {
      return <ActivityIndicator style={styles.footerLoader} color="#F43F5E" />;
    }

    if (error && results.length > 0) {
      return (
        <View style={styles.footerError}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable style={styles.retryButton} onPress={retry}>
            <Text style={styles.buttonText}>Try Again</Text>
          </Pressable>
        </View>
      );
    }

    return null;
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor="#090B10" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Search</Text>
        <Text style={styles.subtitle}>
          {results.length > 0 && !loading
            ? `${totalResults} ${totalResults === 1 ? "RESULT" : "RESULTS"}`
            : "DISCOVER ANY MOVIE"}
        </Text>
      </View>

      {/* Search bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color="#858A99" />
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={handleQueryChange}
          placeholder="Search movies..."
          placeholderTextColor="#656B79"
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
          onSubmitEditing={Keyboard.dismiss}
          selectionColor="#F43F5E"
        />
        {query.length > 0 && (
          <Pressable onPress={() => handleQueryChange("")} hitSlop={10}>
            <Ionicons name="close-circle" size={20} color="#858A99" />
          </Pressable>
        )}
      </View>

      {/* Results */}
      <FlatList
        data={results}
        renderItem={renderMovie}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={styles.movieGrid}
        columnWrapperStyle={styles.movieRow}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={renderFooter}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#090B10",
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 23,
    fontWeight: "800",
  },

  subtitle: {
    color: "#858A99",
    fontSize: 10,
    letterSpacing: 1.5,
    marginTop: 5,
  },

  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginHorizontal: 16,
    marginBottom: 18,
    paddingHorizontal: 14,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#191C25",
  },

  searchInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 15,
  },

  movieGrid: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 25,
  },

  movieRow: {
    justifyContent: "space-between",
    gap: 14,
  },

  movieCard: {
    width: "48%",
    marginBottom: 22,
  },

  poster: {
    width: "100%",
    aspectRatio: 2 / 3,
    borderRadius: 12,
    backgroundColor: "#191C25",
    justifyContent: "center",
  },

  posterPlaceholder: {
    alignItems: "center",
  },

  ratingBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "rgba(9,11,16,0.9)",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
  },

  ratingText: {
    color: "#FBBF24",
    fontSize: 11,
    fontWeight: "800",
  },

  movieTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    marginTop: 10,
  },

  movieYear: {
    color: "#858A99",
    fontSize: 12,
    marginTop: 5,
  },

  stateBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 24,
    paddingBottom: 60,
  },

  stateTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
  },

  stateText: {
    color: "#858A99",
    fontSize: 13,
    textAlign: "center",
  },

  errorText: {
    color: "#FCA5A5",
    textAlign: "center",
  },

  retryButton: {
    backgroundColor: "#E11D48",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },

  buttonText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },

  footerLoader: {
    paddingVertical: 20,
  },

  footerError: {
    alignItems: "center",
    gap: 12,
    paddingVertical: 20,
  },
});
