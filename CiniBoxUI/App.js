import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import BottomTabNavigator from "./src/navigations/BottomTabNavigator";
import SeeAllMovies from "./src/screens/SeeAllMovies";
import MovieDetails from "./src/screens/Movie";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MainTabs" component={BottomTabNavigator} />

        <Stack.Screen name="SeeAllMovies" component={SeeAllMovies} />

        <Stack.Screen
          name="MovieDetails"
          component={MovieDetails}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
