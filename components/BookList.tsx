import React from 'react';
import { FlatList, Text, TouchableOpacity, View, StyleSheet } from 'react-native';

export default function BookList({ books, onSelect, onDelete }: any) {
  return (
    <FlatList
      data={books}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <TouchableOpacity onPress={() => onSelect(item)}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.author}>{item.author}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onDelete(item.id)}>
            <Text style={styles.delete}>ลบ</Text>
          </TouchableOpacity>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', justifyContent: 'space-between', padding: 12, borderBottomWidth: 1 },
  title: { fontSize: 16, fontWeight: 'bold' },
  author: { fontSize: 14, color: '#555' },
  delete: { color: 'red' },
});
