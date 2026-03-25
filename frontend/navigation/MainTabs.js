import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import InternshipListScreen from '../components/InternshipListScreen';
import ConversationsScreen from '../components/ConversationsScreen';
import SettingsScreen from '../components/SettingsScreen';
import RequestsScreen from '../components/RequestsScreen';

const Tab = createBottomTabNavigator();

export default function MainTabs({ route }) {
  const { userRole } = route.params || {};
  const isOrg = userRole === 'Organization';

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Messages') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'Requests') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: isOrg ? '#2563EB' : '#3B82F6',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={InternshipListScreen}
        options={{ title: 'Internships' }}
      />

      <Tab.Screen
        name="Messages"
        component={ConversationsScreen}
        options={{ title: 'Messages' }}
      />

      {}
      {isOrg && (
        <Tab.Screen
          name="Requests"
          component={RequestsScreen}
          options={{ title: 'Requests' }}
        />
      )}

      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
    </Tab.Navigator>
  );
}