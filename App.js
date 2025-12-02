import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import RoleSelectionScreen from './components/RoleSelectionScreen';  // New screen
import SignUpScreen from './components/student/SignUpScreen';
import InternshipListScreen from './components/student/InternshipListScreen';
import AddInternshipScreen from './components/organization/AddInternshipScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="RoleSelection">  
        <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="InternshipList" component={InternshipListScreen} />
        <Stack.Screen name="AddInternship" component={AddInternshipScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
