import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';

export default function OrganizationLoginScreen({ route, navigation }) {
  const { role } = route.params;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogIn = () => {
    // Basic validation
    if (!email || !password) {
      Alert.alert('Error', 'Email and password are required.');
      return;
    }
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Invalid email address.');
      return;
    }
    // Mock login; in real app, authenticate with backend
    Alert.alert('Success', `Logged in as ${email} (${role})!`);
    navigation.navigate('InternshipList', { role });
  };

  const handleSignUp = () => {
    navigation.navigate('OrganizationSignUp', { role });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Log In as Organization</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Button title="Log In" onPress={handleLogIn} />
      <TouchableOpacity onPress={handleSignUp} style={styles.link}>
        <Text style={styles.linkText}>Don't have an account? Sign Up</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    padding: 20, 
    backgroundColor: '#f2f8fc' 
  },
  title: { 
    fontSize: 24, 
    marginBottom: 20, 
    textAlign: 'center' 
  },
  input: { 
    borderWidth: 0, 
    padding: 10, 
    marginBottom: 10, 
    backgroundColor: 'white' 
  },
  link: { 
    marginTop: 20, 
    alignItems: 'center' 
  },
  linkText: { 
    color: '#007bff', 
    textDecorationLine: 'underline' 
  },
});