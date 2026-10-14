import React from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  StyleSheet,
  StatusBar,
  Pressable,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w342";

export default function SeeAllMovies({ route, navigation }) {
  const { title, movies } = route.params;
  const { width } = useWindowDimensions();

  const carouselWidth = width - 32;
  const carouselHeight = carouselWidth * 0.9;

  const renderMovie = ({ item }) => (
    <Pressable
      style={styles.movieCard}
      onPress={() => console.log("Selected movie:", item.id)}
    >
      <View>
        <Image
          source={{
            uri: item.poster_path
              ? `${IMAGE_BASE_URL}${item.poster_path}`
              : undefined,
          }}
          style={styles.poster}
          resizeMode="cover"
        />

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

  const renderFeaturedMovie = ({ item }) => (
    <Pressable
      style={[styles.carouselCard, { width: carouselWidth }]}
      onPress={() => console.log("Poster path:", item.poster_path)}
    >
      <Image
        source={{
          uri: item.poster_path
            ? `${IMAGE_BASE_URL}${item.poster_path}`
            : undefined,
        }}
        style={[styles.carouselPoster, { height: carouselHeight }]}
        resizeMode="cover"
      />

      <Text style={styles.featuredTitle} numberOfLines={2}>
        {item.title}
      </Text>

      <Text style={styles.featuredRating}>
        ★ {Number(item.vote_average || 0).toFixed(1)}
        {"  "}•{"  "}
        {item.release_date?.slice(0, 4) || "Unknown year"}
      </Text>
    </Pressable>
  );

  const featuredMovies = movies.slice(0, 5);
  const remainingMovies = movies.slice(5);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backText}>‹</Text>
        </Pressable>

        <View style={styles.headerText}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{movies.length} MOVIES</Text>
        </View>
      </View>

      {/* Featured carousel and movie grid */}
      <FlatList
        key={title}
        data={remainingMovies}
        renderItem={renderMovie}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.movieGrid}
        columnWrapperStyle={styles.movieRow}
        ListHeaderComponent={
          <View>
            {/* Featured carousel */}
            <Text style={styles.sectionTitle}>Featured Movies</Text>

            <FlatList
              horizontal
              data={featuredMovies}
              renderItem={renderFeaturedMovie}
              keyExtractor={(item) => String(item.id)}
              showsHorizontalScrollIndicator={false}
              snapToInterval={carouselWidth + 16}
              decelerationRate="fast"
              snapToAlignment="start"
              contentContainerStyle={styles.carouselList}
            />

            {/* Remaining movies heading */}
            {remainingMovies.length > 0 && (
              <Text style={styles.sectionTitle}>All Movies</Text>
            )}
          </View>
        }
        ListEmptyComponent={
          featuredMovies.length === 0 ? (
            <Text style={styles.emptyText}>No movies available.</Text>
          ) : null
        }
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
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 18,
    gap: 14,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#191C25",
    alignItems: "center",
    justifyContent: "center",
  },

  backText: {
    color: "#FFFFFF",
    fontSize: 32,
    lineHeight: 36,
  },

  headerText: {
    flex: 1,
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

  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
    paddingHorizontal: 16,
    marginTop: 12,
    marginBottom: 16,
  },

  carouselList: {
    paddingHorizontal: 16,
    gap: 16,
    paddingBottom: 24,
  },

  carouselCard: {
    flexShrink: 0,
  },

  carouselPoster: {
    width: "100%",
    borderRadius: 12,
    backgroundColor: "#191C25",
  },

  featuredTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
    marginTop: 12,
  },

  featuredRating: {
    color: "#FBBF24",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 6,
  },

  movieGrid: {
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

  emptyText: {
    color: "#858A99",
    textAlign: "center",
    padding: 24,
  },
});
