import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@books_v1';

export async function getBooks() {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function saveBooks(books: any[]) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(books));
}