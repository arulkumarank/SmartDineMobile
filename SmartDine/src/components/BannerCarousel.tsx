import React from "react";
import { ScrollView, Image, StyleSheet, View } from "react-native";

const banners = [
  "https://picsum.photos/800/400?1",
  "https://picsum.photos/800/400?2",
  "https://picsum.photos/800/400?3",
];

export default function BannerCarousel() {
  return (
    <ScrollView
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
    >
      {banners.map((banner, index) => (
        <View key={index} style={styles.slide}>
          <Image source={{ uri: banner }} style={styles.image} />
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  slide: {
    width: 360,
    height: 180,
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
  },
});
