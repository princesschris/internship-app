import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';  

// Mock data
const mockInternships = [
  { id: 1, title: 'Software Engineer Intern', state: 'California', types: ['Tech', 'Engineering'] },
  { id: 2, title: 'Marketing Intern', state: 'New York', types: ['Marketing'] },
  { id: 3, title: 'Data Analyst Intern', state: 'Texas', types: ['Tech', 'Data'] },
  
];

const states = ['All', 'California', 'New York', 'Texas', 'Florida'];
const jobTypes = ['Tech', 'Marketing', 'Engineering', 'Data', 'Design'];

export default function InternshipListScreen({ route, navigation }) {
  const { role } = route.params;
  const [internships, setInternships] = useState(mockInternships);
  const [selectedState, setSelectedState] = useState('All');
  const [selectedTypes, setSelectedTypes] = useState([]);

  useEffect(() => {
    let filtered = mockInternships;
    if (selectedState !== 'All') {
      filtered = filtered.filter(item => item.state === selectedState);
    }
    if (selectedTypes.length > 0) {
      filtered = filtered.filter(item => selectedTypes.some(type => item.types.includes(type)));
    }
    setInternships(filtered);
  }, [selectedState, selectedTypes]);

  const toggleType = (type) => {
    setSelectedTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Internships ({role})</Text>
      
      {/* State Filter */}
      <Picker
        selectedValue={selectedState}
        style={styles.picker}
        onValueChange={setSelectedState}
      >
        {states.map(state => <Picker.Item key={state} label={state} value={state} />)}
      </Picker>
      
      {/* Job Type Tags */}
      <View style={styles.tagsContainer}>
        {jobTypes.map(type => (
          <TouchableOpacity
            key={type}
            style={[styles.tag, selectedTypes.includes(type) && styles.selectedTag]}
            onPress={() => toggleType(type)}
          >
            <Text style={styles.tagText}>{type}</Text>
          </TouchableOpacity>
        ))}
      </View>
      
      {/* List */}
      <FlatList
        data={internships}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text>{item.title} - {item.state}</Text>
            <Text>Types: {item.types.join(', ')}</Text>
          </View>
        )}
      />
      
      {role === 'Organization' && (
        <Button title="Add Internship" onPress={() => navigation.navigate('AddInternship')} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 20, marginBottom: 10 },
  picker: { height: 50, width: '100%', marginBottom: 10 },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 },
  tag: { padding: 8, margin: 4, borderWidth: 1, borderRadius: 5 },
  selectedTag: { backgroundColor: 'blue' },
  tagText: { color: 'black' },
  item: { padding: 10, borderBottomWidth: 1 },
});