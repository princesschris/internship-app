import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';

export default function AddInternshipScreen({ navigation }) {
  const [title, setTitle] = useState('');
  const [state, setState] = useState('California');
  const [types, setTypes] = useState([]);

  const handleAdd = () => {
    alert('Internship added!');
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Internship</Text>
      <TextInput
        style={styles.input}
        placeholder="Title"
        value={title}
        onChangeText={setTitle}
      />
      <Picker
        selectedValue={state}
        style={styles.picker}
        onValueChange={setState}
      >
        <Picker.Item label="California" value="California" />
        <Picker.Item label="New York" value="New York" />
      </Picker>
      
      <TextInput
        style={styles.input}
        placeholder="Types (comma-separated)"
        value={types.join(', ')}
        onChangeText={(text) => setTypes(text.split(', '))}
      />
      <Button title="Add" onPress={handleAdd} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, padding: 10, marginBottom: 10 },
  picker: { height: 50, width: '100%', marginBottom: 20 },
});