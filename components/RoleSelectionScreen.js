import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';

export default function RoleSelectionScreen({ navigation }) {
  const handleRoleSelect = (role) => {
    navigation.navigate('SignUp', { role });  // Pass role to next screen
  };

  return (
    <View style={styles.container}>
      {/* Logo */}
      <Image
        source={require('../assets/favicon.png')}  // Update path to your logo file
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.title}>Welcome to Internship App</Text>
      <Text style={styles.subtitle}>Select your role to get started</Text>
      
      {/* Role Selection Buttons */}
      <TouchableOpacity style={styles.button} onPress={() => handleRoleSelect('Student')}>
        <Text style={styles.buttonText}>I am a Student</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => handleRoleSelect('Organization')}>
        <Text style={styles.buttonText}>I am an Organization</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 20, 
    backgroundColor: '#f2f8fc'  // Matching the background from previous styling
  },
  logo: { 
    width: 150, 
    height: 150, 
    marginBottom: 20 
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    marginBottom: 10, 
    textAlign: 'center' 
  },
  subtitle: { 
    fontSize: 16, 
    marginBottom: 30, 
    textAlign: 'center', 
    color: '#666' 
  },
  button: { 
    backgroundColor: 'white', 
    padding: 15, 
    marginVertical: 10, 
    width: '80%', 
    alignItems: 'center', 
    borderRadius: 5  // Optional: Add slight rounding for better UX
  },
  buttonText: { 
    fontSize: 18, 
    color: '#333' 
  },
});