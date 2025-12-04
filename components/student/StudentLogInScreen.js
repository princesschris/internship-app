import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';

export default function StudentLoginScreen({ route, navigation }) {
  const { role } = route.params;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogIn = () => {

    if (!email || !password) {
      Alert.alert('Error', 'Email and password are required.');
      return;
    }
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Invalid email address.');
      return;
    }

    Alert.alert('Success', `Logged in as ${email} (${role})!`);
    navigation.navigate('InternshipList', { role });
  };

  const handleSignUp = () => {
    navigation.navigate('SignUp', { role });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Log In as Student</Text>
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
      <TouchableOpacity onPress={handleLogIn} style={styles.link}>
        <Text style={styles.linkText}>Already have an account? Log In</Text>
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