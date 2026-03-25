import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider } from './contexts/AuthContext';

// Import screens
import RoleSelectionScreen from './components/RoleSelectionScreen';
import StudentSignUpScreen from './components/student/StudentSignUpScreen';
import StudentLoginScreen from './components/student/StudentLogInScreen'
import OrganizationSignUpScreen from './components/organization/OrganizationSignUpScreen';
import OrganizationLoginScreen from './components/organization/OrganizationLogInScreen';
import InternshipListScreen from './components/InternshipListScreen';
import AddInternshipScreen from './components/AddInternshipScreen';
import InternshipDetailScreen from './components/InternshipDetails';
import ChatScreen from './components/ChatScreen';
import MainTabs from './navigation/MainTabs';
import EditInternshipScreen from './components/EditInternshipScreen';
import ForgotPasswordScreen from './components/ForgotPasswordScreen';
import ResetPasswordScreen from './components/ForgotPasswordScreen';
import EditProfileScreen from './components/EditProfileScreen';
import ChangePasswordScreen from './components/ChangePasswordScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="RoleSelection">
          <Stack.Screen 
            name="RoleSelection" 
            component={RoleSelectionScreen}
            options={{ headerShown: false }}
          />
          
          {/* Student Auth */}
          <Stack.Screen 
            name="SignUp" 
            component={StudentSignUpScreen}
            options={{ title: 'Student Sign Up' }}
          />
          <Stack.Screen 
            name="StudentLogin" 
            component={StudentLoginScreen}
            options={{ title: 'Student Login' }}
          />
          
          {/* Organization Auth */}
          <Stack.Screen 
            name="OrganizationSignUp" 
            component={OrganizationSignUpScreen}
            options={{ title: 'Organization Sign Up' }}
          />
          <Stack.Screen 
            name="OrganizationLogin" 
            component={OrganizationLoginScreen}
            options={{ title: 'Organization Login' }}
          />
          
          {/* Main App with Bottom Tabs */}
          <Stack.Screen 
            name="MainTabs" 
            component={MainTabs}
            options={{ headerShown: false }}
          />
          
          {/* Screens accessed from tabs */}
          <Stack.Screen 
            name="AddInternship" 
            component={AddInternshipScreen}
            options={{ title: 'Post Internship' }}
          />
          <Stack.Screen 
            name="InternshipDetail" 
            component={InternshipDetailScreen}
            options={{ title: 'Internship Details' }}
          />
          <Stack.Screen 
            name="Chat" 
            component={ChatScreen}
            options={{ title: 'Messages' }}
          />
          <Stack.Screen 
            name="EditProfile" 
            component={EditProfileScreen}
            options={{ title: 'Edit Profile' }}
          />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          <Stack.Screen name="EditInternship" component={EditInternshipScreen} />
          <Stack.Screen name="ResetPassword"  component={ResetPasswordScreen} />
          <Stack.Screen 
            name="ChangePassword" 
            component={ChangePasswordScreen}
            options={{ title: 'Change Password' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}