
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  ImageBackground,
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { baseURL } from "../constants/constants";

const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/";

export default function MovieDetails({ route, navigation }) {
  const { movieId } = route.params || {};

  const [movie, setMovie] = useState(null);
  const [cast, setCast] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [reviews, setReviews] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [expandedReviews, setExpandedReviews] = useState({});

  // One API call for all movie information
  useEffect(() => {
    let cancelled = false;

    const fetchMovieDetails = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${baseURL}/detailedmovie/${movieId}`
        );

        if (!response.ok) {
          throw new Error(`Request failed: ${response.status}`);
        }

        const result = await response.json();

        if (!result.success) {
          throw new Error(
            result.message || "Unable to load movie details"
          );
        }

        const data = result.data || {};

        if (!cancelled) {
          setMovie(data.movieData || null);
          setCast(data.castAndCrew?.cast || []);

          setRecommendations(
            data.recommendations?.results ||
              data.recommendations ||
              data.recommendedMovies?.results ||
              data.recommendedMovies ||
              data.similarMovies?.results ||
              data.similarMovies ||
              []
          );

          setGallery(
            data.gallery?.backdrops ||
              data.gallery?.images ||
              data.images?.backdrops ||
              data.images ||
              data.backdrops ||
              []
          );

          setReviews(
            data.reviews?.results ||
              data.reviews ||
              data.movieReviews?.results ||
              data.movieReviews ||
              []
          );
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Something went wrong");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    if (movieId) {
      fetchMovieDetails();
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setError("Movie ID is missing");
      setLoading(false);
    }

    return () => {
      cancelled = true;
    };
  }, [movieId]);

  const formatRuntime = (minutes) => {
    if (!minutes) return "Runtime unavailable";

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    return hours
      ? `${hours}h ${remainingMinutes}m`
      : `${remainingMinutes}m`;
  };

  const formatMoney = (amount) => {
    if (!amount) return "Not available";
    return `$${Number(amount).toLocaleString("en-US")}`;
  };

  const getImagePath = (item) => {
    if (typeof item === "string") return item;
    return item?.file_path || item?.image_path || item?.url || null;
  };

  const renderCastMember = ({ item }) => (
    <View style={styles.castCard}>
      {item.profile_path ? (
        <Image
          source={{
            uri: `${IMAGE_BASE_URL}w185${item.profile_path}`,
          }}
          style={styles.castImage}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.castImage, styles.imagePlaceholder]}>
          <Text style={styles.placeholderText}>No Image</Text>
        </View>
      )}

      <Text style={styles.castName} numberOfLines={2}>
        {item.name}
      </Text>

      <Text style={styles.castCharacter} numberOfLines={2}>
        {item.character || "Unknown role"}
      </Text>
    </View>
  );

  const renderRecommendation = ({ item }) => (
    <Pressable
      style={styles.recommendationCard}
      onPress={() => {
        if (String(item.id) !== String(movieId)) {
          navigation.push("MovieDetails", {
            movieId: item.id,
          });
        }
      }}
    >
      {item.poster_path ? (
        <Image
          source={{
            uri: `${IMAGE_BASE_URL}w342${item.poster_path}`,
          }}
          style={styles.recommendationPoster}
          resizeMode="cover"
        />
      ) : (
        <View
          style={[
            styles.recommendationPoster,
            styles.imagePlaceholder,
          ]}
        >
          <Text style={styles.placeholderText}>No Poster</Text>
        </View>
      )}

      <Text style={styles.recommendationTitle} numberOfLines={2}>
        {item.title || item.name || "Untitled"}
      </Text>

      <Text style={styles.recommendationRating}>
        ★ {Number(item.vote_average || 0).toFixed(1)}
      </Text>
    </Pressable>
  );

  const renderGalleryImage = ({ item, index }) => {
    const imagePath = getImagePath(item);

    if (!imagePath) return null;

    const imageUri = imagePath.startsWith("http")
      ? imagePath
      : `${IMAGE_BASE_URL}original${imagePath}`;

    return (
      <Pressable
        key={String(item.id || imagePath || index)}
        onPress={() => setSelectedImage(imageUri)}
      >
        <Image
          source={{ uri: imageUri }}
          style={styles.galleryImage}
          resizeMode="cover"
        />
      </Pressable>
    );
  };

  const renderReview = (review, index) => {
    const reviewId = String(review.id || index);
    const content = review.content || review.text || "";
    const author =
      review.author ||
      review.author_details?.name ||
      review.username ||
      "Anonymous";

    const rating =
      review.author_details?.rating ?? review.rating;

    const expanded = !!expandedReviews[reviewId];
    const needsExpansion = content.length > 200;

    return (
      <View key={reviewId} style={styles.reviewCard}>
        <View style={styles.reviewHeader}>
          <View style={styles.reviewAvatar}>
            <Text style={styles.reviewAvatarText}>
              {author.charAt(0).toUpperCase()}
            </Text>
          </View>

          <View style={styles.reviewAuthorInfo}>
            <Text style={styles.reviewAuthor} numberOfLines={1}>
              {author}
            </Text>

            <Text style={styles.reviewDate}>
              {review.created_at
                ? new Date(review.created_at).toLocaleDateString()
                : "Movie review"}
            </Text>
          </View>

          {rating != null && (
            <View style={styles.reviewRatingBadge}>
              <Text style={styles.reviewRating}>
                ★ {rating}/10
              </Text>
            </View>
          )}
        </View>

        {review.title ? (
          <Text style={styles.reviewTitle}>{review.title}</Text>
        ) : null}

        <Text style={styles.reviewContent}>
          {expanded || !needsExpansion
            ? content
            : `${content.slice(0, 200).trim()}...`}
        </Text>

        {needsExpansion && (
          <Pressable
            onPress={() =>
              setExpandedReviews((previous) => ({
                ...previous,
                [reviewId]: !previous[reviewId],
              }))
            }
          >
            <Text style={styles.readMore}>
              {expanded ? "Read less" : "Read more"}
            </Text>
          </Pressable>
        )}
      </View>
    );
  };

  const renderSectionEmpty = (message) => (
    <Text style={styles.emptyText}>{message}</Text>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <StatusBar barStyle="light-content" />
        <ActivityIndicator size="large" color="#F43F5E" />
        <Text style={styles.loadingText}>
          Entering the movie universe...
        </Text>
      </SafeAreaView>
    );
  }

  if (error || !movie) {
    return (
      <SafeAreaView style={styles.center}>
        <StatusBar barStyle="light-content" />
        <Text style={styles.errorText}>
          {error || "Movie not found"}
        </Text>

        <Pressable
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const backdrop = movie.backdrop_path
    ? `${IMAGE_BASE_URL}w780${movie.backdrop_path}`
    : movie.poster_path
      ? `${IMAGE_BASE_URL}w500${movie.poster_path}`
      : null;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* HERO */}
        <View style={styles.hero}>
          {backdrop ? (
            <ImageBackground
              source={{ uri: backdrop }}
              style={styles.backdrop}
              resizeMode="cover"
            >
              <View style={styles.backdropOverlay} />
            </ImageBackground>
          ) : (
            <View style={styles.backdropPlaceholder} />
          )}

          <Pressable
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>‹</Text>
          </Pressable>

          <View style={styles.heroContent}>
            {movie.poster_path ? (
              <Image
                source={{
                  uri: `${IMAGE_BASE_URL}w342${movie.poster_path}`,
                }}
                style={styles.poster}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.poster, styles.imagePlaceholder]}>
                <Text style={styles.placeholderText}>No Poster</Text>
              </View>
            )}

            <View style={styles.heroInfo}>
              <Text style={styles.movieTitle}>{movie.title}</Text>

              {!!movie.tagline && (
                <Text style={styles.tagline}>{movie.tagline}</Text>
              )}

              <Text style={styles.rating}>
                ★ {Number(movie.vote_average || 0).toFixed(1)}
                <Text style={styles.ratingCount}>
                  {" "}({movie.vote_count || 0} votes)
                </Text>
              </Text>

              <Text style={styles.meta}>
                {movie.release_date?.slice(0, 4) || "Year unknown"}
                {"  •  "}
                {formatRuntime(movie.runtime)}
              </Text>
            </View>
          </View>
        </View>

        {/* GENRES */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Genres</Text>

          <View style={styles.genreContainer}>
            {(movie.genres || []).map((genre) => (
              <View key={genre.id || genre.name} style={styles.genreChip}>
                <Text style={styles.genreText}>{genre.name}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* OVERVIEW */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <Text style={styles.overview}>
            {movie.overview || "No overview available."}
          </Text>
        </View>

        {/* CAST */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Cast</Text>

          {cast.length > 0 ? (
            <FlatList
              horizontal
              data={cast}
              renderItem={renderCastMember}
              keyExtractor={(item, index) =>
                String(item.id || index)
              }
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            />
          ) : (
            renderSectionEmpty("Cast information unavailable.")
          )}
        </View>

        {/* RECOMMENDATIONS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>You Might Also Like</Text>
          <Text style={styles.sectionSubtitle}>
            More movies for your watchlist
          </Text>

          {recommendations.length > 0 ? (
            <FlatList
              horizontal
              data={recommendations}
              renderItem={renderRecommendation}
              keyExtractor={(item, index) =>
                String(item.id || index)
              }
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            />
          ) : (
            renderSectionEmpty("No recommendations available.")
          )}
        </View>

        {/* GALLERY */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gallery</Text>
          <Text style={styles.sectionSubtitle}>
            Moments from the movie
          </Text>

          {gallery.length > 0 ? (
            <FlatList
              horizontal
              data={gallery}
              renderItem={renderGalleryImage}
              keyExtractor={(item, index) =>
                String(
                  item.id ||
                    getImagePath(item) ||
                    index
                )
              }
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            />
          ) : (
            renderSectionEmpty("No gallery images available.")
          )}
        </View>

        {/* REVIEWS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reviews</Text>
          <Text style={styles.sectionSubtitle}>
            What people are saying
          </Text>

          {reviews.length > 0 ? (
            reviews.map(renderReview)
          ) : (
            renderSectionEmpty("No reviews available for this movie.")
          )}
        </View>

        {/* MOVIE INFO */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Movie Info</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Status</Text>
            <Text style={styles.infoValue}>
              {movie.status || "Unknown"}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Original Language</Text>
            <Text style={styles.infoValue}>
              {movie.original_language?.toUpperCase() || "Unknown"}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Budget</Text>
            <Text style={styles.infoValue}>
              {formatMoney(movie.budget)}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Revenue</Text>
            <Text style={styles.infoValue}>
              {formatMoney(movie.revenue)}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Country</Text>
            <Text style={styles.infoValue}>
              {movie.origin_country?.join(", ") || "Unknown"}
            </Text>
          </View>
        </View>

        <Text style={styles.footer}>
          CiniBox • Your Movie Universe 🎬
        </Text>
      </ScrollView>

      {/* FULL-SCREEN GALLERY VIEWER */}
      <Modal
        visible={!!selectedImage}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedImage(null)}
      >
        <View style={styles.imageViewer}>
          <Pressable
            style={styles.closeImageButton}
            onPress={() => setSelectedImage(null)}
          >
            <Text style={styles.closeImageText}>✕</Text>
          </Pressable>

          {selectedImage && (
            <Image
              source={{ uri: selectedImage }}
              style={styles.fullscreenImage}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#090B10",
  },

  scrollContent: {
    paddingBottom: 20,
  },

  center: {
    flex: 1,
    backgroundColor: "#090B10",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    gap: 16,
  },

  loadingText: {
    color: "#9CA3AF",
    fontSize: 14,
    marginTop: 8,
  },

  errorText: {
    color: "#FDA4AF",
    textAlign: "center",
    fontSize: 15,
  },

  hero: {
    minHeight: 350,
    justifyContent: "flex-end",
    paddingHorizontal: 20,
    paddingBottom: 20,
    overflow: "hidden",
  },

  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },

  backdropOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(9,11,16,0.60)",
  },

  backdropPlaceholder: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#191C25",
  },

  backButton: {
    position: "absolute",
    top: 16,
    left: 18,
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: "rgba(15,17,25,0.88)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },

  backButtonText: {
    color: "#FFFFFF",
    fontSize: 30,
    lineHeight: 34,
  },

  heroContent: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 16,
    marginTop: 65,
  },

  poster: {
    width: 125,
    height: 188,
    borderRadius: 12,
    backgroundColor: "#252A38",
  },

  imagePlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },

  placeholderText: {
    color: "#9CA3AF",
    fontSize: 12,
    textAlign: "center",
  },

  heroInfo: {
    flex: 1,
    paddingBottom: 3,
  },

  movieTitle: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "900",
  },

  tagline: {
    color: "#FDA4AF",
    fontSize: 12,
    fontStyle: "italic",
    marginTop: 6,
  },

  rating: {
    color: "#FBBF24",
    fontSize: 15,
    fontWeight: "800",
    marginTop: 12,
  },

  ratingCount: {
    color: "#D1D5DB",
    fontSize: 10,
    fontWeight: "400",
  },

  meta: {
    color: "#D1D5DB",
    fontSize: 12,
    marginTop: 8,
  },

  section: {
    marginTop: 28,
    paddingLeft: 20,
  },

  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 8,
    paddingRight: 20,
  },

  sectionSubtitle: {
    color: "#858A99",
    fontSize: 12,
    marginBottom: 15,
    paddingRight: 20,
  },

  genreContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingRight: 20,
  },

  genreChip: {
    backgroundColor: "#191C25",
    borderWidth: 1,
    borderColor: "#303544",
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 20,
  },

  genreText: {
    color: "#E5E7EB",
    fontSize: 12,
    fontWeight: "600",
  },

  overview: {
    color: "#B8BECC",
    fontSize: 14,
    lineHeight: 23,
    paddingRight: 20,
  },

  horizontalList: {
    gap: 14,
    paddingRight: 20,
  },

  castCard: {
    width: 110,
  },

  castImage: {
    width: 110,
    height: 135,
    borderRadius: 12,
    backgroundColor: "#191C25",
  },

  castName: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 9,
  },

  castCharacter: {
    color: "#858A99",
    fontSize: 11,
    marginTop: 4,
  },

  recommendationCard: {
    width: 125,
  },

  recommendationPoster: {
    width: 125,
    height: 185,
    borderRadius: 12,
    backgroundColor: "#191C25",
  },

  recommendationTitle: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 9,
    lineHeight: 18,
  },

  recommendationRating: {
    color: "#FBBF24",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 5,
  },

  galleryImage: {
    width: 250,
    height: 145,
    borderRadius: 12,
    backgroundColor: "#191C25",
  },

  emptyText: {
    color: "#858A99",
    fontSize: 13,
    paddingVertical: 8,
    paddingRight: 20,
  },

  reviewCard: {
    backgroundColor: "#12151E",
    borderWidth: 1,
    borderColor: "#252A38",
    borderRadius: 14,
    padding: 15,
    marginRight: 20,
    marginBottom: 12,
  },

  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },

  reviewAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#303544",
    alignItems: "center",
    justifyContent: "center",
  },

  reviewAvatarText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
  },

  reviewAuthorInfo: {
    flex: 1,
  },

  reviewAuthor: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },

  reviewDate: {
    color: "#858A99",
    fontSize: 11,
    marginTop: 4,
  },

  reviewRatingBadge: {
    backgroundColor: "#272417",
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 8,
  },

  reviewRating: {
    color: "#FBBF24",
    fontSize: 11,
    fontWeight: "700",
  },

  reviewTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 8,
  },

  reviewContent: {
    color: "#B8BECC",
    fontSize: 13,
    lineHeight: 21,
  },

  readMore: {
    color: "#FDA4AF",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 10,
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
    paddingVertical: 13,
    paddingRight: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#202431",
  },

  infoLabel: {
    color: "#858A99",
    fontSize: 13,
  },

  infoValue: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
    flexShrink: 1,
    textAlign: "right",
  },

  footer: {
    color: "#656B79",
    textAlign: "center",
    paddingVertical: 28,
    fontSize: 12,
  },

  imageViewer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.97)",
    alignItems: "center",
    justifyContent: "center",
  },

  fullscreenImage: {
    width: "100%",
    height: "80%",
  },

  closeImageButton: {
    position: "absolute",
    top: 50,
    right: 22,
    zIndex: 2,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#252A38",
    alignItems: "center",
    justifyContent: "center",
  },

  closeImageText: {
    color: "#FFFFFF",
    fontSize: 20,
  },
});
