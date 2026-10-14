
import React from "react";
import { Image, View, ActivityIndicator } from "react-native";
import useFetchedImage from "./useFetchedImage";

export default function FetchedMoviePoster({ posterPath, style }) {
  const imageUrl = posterPath
    ? `https://image.tmdb.org/t/p/w342${posterPath}`
    : null;

  const imageUri = useFetchedImage(imageUrl);

  return (
    <View style={style}>
      {imageUri ? (
        <Image
          source={{ uri: imageUri }}
          style={{ width: "100%", height: "100%", borderRadius: 12 }}
          resizeMode="cover"
        />
      ) : (
        <ActivityIndicator color="#F43F5E" />
      )}
    </View>
  );
}
