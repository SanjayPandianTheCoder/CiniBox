import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { commonstyles } from '../styles/commonstyles';

export default function Profile() {
  return (
    <View style={commonstyles.container}>
      <Text style={commonstyles.text}>Your Profile</Text>
    </View>
  );
}