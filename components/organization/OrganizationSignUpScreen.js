import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const states = ['California', 'New York', 'Texas', 'Florida', 'Illinois'];  

export default function OrganizationSignUpScreen({ route, navigation }) {
  const { role } = route.params;
  const [orgName, setOrgName] = useState('');
  const [email, setEmail] = useState('');
  const [primaryPhone, setPrimaryPhone] = useState('');
  const [secondaryPhone, setSecondaryPhone] = useState('');
  const [state, setState] = useState('California');
  const [localGov, setLocalGov] = useState('');

  const handleSignUp = () => {

    if (!orgName || !email || !primaryPhone || !state || !localGov) {
      Alert.alert('Error', 'Required fields are missing.');
      return;
    }
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Invalid email address.');
      return;
    }
   
    Alert.alert('Success', `Welcome, ${orgName}!`);
    navigation.navigate('InternshipList', { role });
  };

  const handleLogIn = () => {
    navigation.navigate('Login'); 
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up as Organization</Text>
      <TextInput
        style={styles.input}
        placeholder="Organization Name"
        value={orgName}
        onChangeText={setOrgName}
      />
      <TextInput
        style={styles.input}
        placeholder="Email Address"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Primary Phone Number"
        value={primaryPhone}
        onChangeText={setPrimaryPhone}
        keyboardType="phone-pad"
      />
      <TextInput
        style={styles.input}
        placeholder="Secondary Phone Number (Optional)"
        value={secondaryPhone}
        onChangeText={setSecondaryPhone}
        keyboardType="phone-pad"
      />
      <Picker
        selectedValue={state}
        style={styles.picker}
        onValueChange={setState}
      >
        {states.map(stateItem => <Picker.Item key={stateItem} label={stateItem} value={stateItem} />)}
      </Picker>
      <TextInput
        style={styles.input}
        placeholder="Local Government"
        value={localGov}
        onChangeText={setLocalGov}
      />
      <Button title="Sign Up" onPress={handleSignUp} />
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
  picker: { 
    height: 50, 
    width: '100%', 
    marginBottom: 10, 
    borderWidth: 0, 
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