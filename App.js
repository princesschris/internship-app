import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import RoleSelectionScreen from './components/RoleSelectionScreen';  // New screen
import SignUpScreen from './components/student/StudentSignUpScreen';
import InternshipListScreen from './components/student/InternshipListScreen';
import AddInternshipScreen from './components/organization/AddInternshipScreen';
import OrganizationSignUpScreen from './components/organization/OrganizationSignUpScreen';
import OrganizationLoginScreen from './components/organization/OrganizationLogInScreen';
import StudentLoginScreen from './components/student/StudentLogInScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="RoleSelection">  
        <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="InternshipList" component={InternshipListScreen} />
        <Stack.Screen name="OrganizationSignUp" component={OrganizationSignUpScreen} /> 
        <Stack.Screen name="AddInternship" component={AddInternshipScreen} />
        <Stack.Screen name="StudentLogin" component={StudentLoginScreen} />
        <Stack.Screen name="OrganizationLogin" component={OrganizationLoginScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}