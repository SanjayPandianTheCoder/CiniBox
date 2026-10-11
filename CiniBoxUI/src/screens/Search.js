import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { commonstyles } from '../styles/commonstyles';

export default function Search() {
  return (
    <View style={commonstyles.container}>
      <Text style={commonstyles.text}>Search Place</Text>
    </View>
  );
}