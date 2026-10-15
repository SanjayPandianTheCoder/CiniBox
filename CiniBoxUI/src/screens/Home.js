import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  View,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { baseURL } from "../constants/constants";
import FetchedMoviePoster from "../components/FetchedMoviePoster";

const API_URL = `${baseURL}/homedata`;
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/";

export default function Home({ navigation }) {
  const [homeData, setHomeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchHomeData = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Failed to fetch movies");
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Unable to load movies");
      }

      setHomeData(result.data);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHomeData();
  }, []);

  const renderMovie = ({ item }) => (
    <Pressable
      style={styles.movieCard}
      onPress={() =>
        navigation.navigate("MovieDetails", {
          movieId: item.id,
        })
      }
    >
      <FetchedMoviePoster posterPath={item.poster_path} style={styles.poster} />

      <View style={styles.ratingBadge}>
        <Text style={styles.ratingText}>★ {item.vote_average.toFixed(1)}</Text>
      </View>

      <Text style={styles.movieTitle} numberOfLines={2}>
        {item.title}
      </Text>

      <Text style={styles.movieYear}>{item.release_date?.slice(0, 4)}</Text>
    </Pressable>
  );

  const renderSection = (title, subtitle, movies) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>{title}</Text>
          <Text style={styles.sectionSubtitle}>{subtitle}</Text>
        </View>

        <Pressable
          onPress={() =>
            navigation.navigate("SeeAllMovies", {
              title,
              movies,
            })
          }
        >
          <Text style={styles.seeAll}>See all ›</Text>
        </Pressable>
      </View>

      <FlatList
        horizontal
        data={movies}
        renderItem={renderMovie}
        keyExtractor={(item) => String(item.id)}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.movieList}
      />
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <StatusBar barStyle="light-content" />
        <ActivityIndicator size="large" color="#F43F5E" />
        <Text style={styles.loadingText}>Loading CiniBox...</Text>
      </SafeAreaView>
    );
  }

  if (error || !homeData) {
    return (
      <SafeAreaView style={styles.center}>
        <StatusBar barStyle="light-content" />
        <Text style={styles.errorText}>{error || "No movies available"}</Text>

        <Pressable style={styles.retryButton} onPress={fetchHomeData}>
          <Text style={styles.buttonText}>Try Again</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const featuredMovie = homeData.popularMovies.results[0];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#090B10" />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>C</Text>
          </View>

          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.brandName}>CiniBox</Text>
            <Text style={styles.tagline}>YOUR MOVIE UNIVERSE</Text>
          </View>

          <Pressable onPress={() => console.log("Search movies")}>
            <Text style={styles.searchIcon}>⌕</Text>
          </Pressable>
        </View>

        {/* Featured Movie */}
        {featuredMovie && (
          <View style={styles.featuredCard}>
            <ImageBackground
              source={{
                uri: `${IMAGE_BASE_URL}w780${featuredMovie.backdrop_path}`,
              }}
              style={styles.featuredImage}
              imageStyle={styles.featuredImageStyle}
              resizeMode="cover"
            >
              <View style={styles.featuredContent}>
                <Text style={styles.featuredBadge}>✦ FEATURED MOVIE</Text>

                <Text style={styles.featuredTitle}>{featuredMovie.title}</Text>

                <Text style={styles.featuredMeta}>
                  ★ {featuredMovie.vote_average.toFixed(1)}
                  {"  •  "}
                  {featuredMovie.release_date?.slice(0, 4)}
                </Text>

                <Text style={styles.overview} numberOfLines={3}>
                  {featuredMovie.overview}
                </Text>

                <Pressable
                  style={styles.exploreButton}
                  onPress={() =>
                    navigation.navigate("MovieDetails", {
                      movieId: featuredMovie.id,
                    })
                  }
                >
                  <Text style={styles.buttonText}>Explore Movie →</Text>
                </Pressable>
              </View>
            </ImageBackground>
          </View>
        )}

        {/* Movie Categories */}
        {renderSection(
          "Popular Movies",
          "TRENDING RIGHT NOW",
          homeData.popularMovies.results,
        )}

        {renderSection(
          "Now Playing",
          "ON THE BIG SCREEN",
          homeData.nowPlayingMovies.results,
        )}

        {renderSection(
          "Top Rated",
          "MOVIE HALL OF FAME",
          homeData.topRatedMovies.results,
        )}

        <Text style={styles.footer}>Made for the love of cinema 🎬</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#090B10",
  },
  center: {
    flex: 1,
    backgroundColor: "#090B10",
    justifyContent: "center",
    alignItems: "center",
    gap: 14,
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  logo: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: "#E11D48",
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    fontSize: 28,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  brandName: {
    fontSize: 23,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  tagline: {
    fontSize: 9,
    letterSpacing: 1.5,
    color: "#858A99",
    marginTop: 3,
  },
  searchIcon: {
    fontSize: 32,
    color: "#FFFFFF",
  },
  featuredCard: {
    marginHorizontal: 16,
    marginBottom: 30,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#191C25",
  },
  featuredImage: {
    minHeight: 400,
    justifyContent: "flex-end",
  },
  featuredImageStyle: {
    borderRadius: 20,
  },
  featuredContent: {
    padding: 20,
    paddingTop: 110,
    backgroundColor: "rgba(5,7,12,0.72)",
  },
  featuredBadge: {
    color: "#FDA4AF",
    fontSize: 11,
    fontWeight: "800",
    marginBottom: 12,
  },
  featuredTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  featuredMeta: {
    color: "#FBBF24",
    fontSize: 14,
    fontWeight: "700",
    marginTop: 10,
  },
  overview: {
    color: "#D1D5DB",
    fontSize: 13,
    lineHeight: 20,
    marginTop: 12,
  },
  exploreButton: {
    alignSelf: "flex-start",
    backgroundColor: "#E11D48",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 18,
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 21,
    fontWeight: "800",
  },
  sectionSubtitle: {
    color: "#858A99",
    fontSize: 9,
    letterSpacing: 1.3,
    marginTop: 5,
  },
  seeAll: {
    color: "#FB7185",
    fontWeight: "700",
    fontSize: 13,
  },
  movieList: {
    paddingHorizontal: 20,
    gap: 14,
  },
  movieCard: {
    width: 135,
  },
  poster: {
    width: 135,
    height: 202,
    borderRadius: 12,
    backgroundColor: "#191C25",
  },
  ratingBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "rgba(9,11,16,0.9)",
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 5,
  },
  ratingText: {
    color: "#FBBF24",
    fontSize: 11,
    fontWeight: "800",
  },
  movieTitle: {
    color: "#F3F4F6",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 9,
  },
  movieYear: {
    color: "#858A99",
    fontSize: 11,
    marginTop: 5,
  },
  loadingText: {
    color: "#9CA3AF",
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
  footer: {
    color: "#656B79",
    textAlign: "center",
    paddingVertical: 20,
    fontSize: 12,
  },
});
