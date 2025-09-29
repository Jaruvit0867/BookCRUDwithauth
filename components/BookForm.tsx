import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Button } from 'react-native';

export default function BookForm({ onSubmit, initial }: any) {
  const [title, setTitle] = useState(initial?.title || '');
  const [author, setAuthor] = useState(initial?.author || '');

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="ชื่อหนังสือ"
        style={styles.input}
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        placeholder="ผู้แต่ง"
        style={styles.input}
        value={author}
        onChangeText={setAuthor}
      />
      <Button
        title="บันทึก"
        onPress={() => onSubmit({ id: initial?.id || Date.now().toString(), title, author })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 10 },
  input: { borderWidth: 1, padding: 8, marginBottom: 10, borderRadius: 8 },
});
