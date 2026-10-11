import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { commonstyles } from '../styles/commonstyles';

export default function Home() {
  return (
    <View style={commonstyles.container}>
      <Text style={commonstyles.text}>Home</Text>
    </View>
  );
}