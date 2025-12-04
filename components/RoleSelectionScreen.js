import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';

export default function RoleSelectionScreen({ navigation }) {
  const handleRoleSelect = (role) => {
    if (role === 'Student') {
      navigation.navigate('SignUp', { role }); 
    } else if (role === 'Organization') {
      navigation.navigate('OrganizationSignUp', { role });  
        }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/icon.png')} 
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.title}>Welcome to Internship App</Text>
      <Text style={styles.subtitle}>Select your role to get started</Text>
      
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
    backgroundColor: '#f2f8fc'  
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
    borderRadius: 5  
  },
  buttonText: { 
    fontSize: 18, 
    color: '#333' 
  },
});