import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Vibration,
  Animated,
  TouchableOpacity,
  TextInput,
  FlatList,
  Modal,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ===== CONFIG =====
const PASSCODE_KEY = "@user_passcode";
const BOOKS_KEY = "@books_data";
const PASSCODE_LENGTH = 4;

export default function App() {
  const [savedPasscode, setSavedPasscode] = useState<string | null>(null);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem(PASSCODE_KEY);
      if (stored) setSavedPasscode(stored);
    })();
  }, []);

  if (!authenticated) {
    if (!savedPasscode) {
      return (
        <RegisterPasscodeScreen
          onRegister={(code) => {
            setSavedPasscode(code);
            setAuthenticated(true);
          }}
        />
      );
    }
    return (
      <LoginPasscodeScreen
        correctCode={savedPasscode}
        onSuccess={() => setAuthenticated(true)}
      />
    );
  }

  return <BookCRUD onResetPasscode={() => setAuthenticated(false)} />;
}

// ===== REGISTER SCREEN =====
function RegisterPasscodeScreen({ onRegister }: { onRegister: (c: string) => void }) {
  const [code, setCode] = useState("");
  const [confirm, setConfirm] = useState("");
  const [step, setStep] = useState(1);

  const handleComplete = async () => {
    if (step === 1) {
      setStep(2);
      setConfirm(code);
      setCode("");
    } else {
      if (code === confirm) {
        await AsyncStorage.setItem(PASSCODE_KEY, code);
        onRegister(code);
      } else {
        Vibration.vibrate(300);
        setStep(1);
        setCode("");
        setConfirm("");
      }
    }
  };

  return (
    <PasscodeUI
      title={step === 1 ? "สร้างรหัสผ่านใหม่" : "ยืนยันรหัสผ่านอีกครั้ง"}
      code={code}
      onChange={setCode}
      onComplete={handleComplete}
    />
  );
}

// ===== LOGIN SCREEN =====
function LoginPasscodeScreen({
  correctCode,
  onSuccess,
}: {
  correctCode: string;
  onSuccess: () => void;
}) {
  const [code, setCode] = useState("");
  const [shakeAnim] = useState(new Animated.Value(0));

  const handleComplete = () => {
    if (code === correctCode) {
      onSuccess();
    } else {
      Vibration.vibrate(200);
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start();
      setCode("");
    }
  };

  return (
    <PasscodeUI
      title="ใส่รหัสผ่าน"
      code={code}
      onChange={setCode}
      onComplete={handleComplete}
      shakeAnim={shakeAnim}
    />
  );
}

// ===== PASSCODE UI =====
function PasscodeUI({
  title,
  code,
  onChange,
  onComplete,
  shakeAnim,
}: {
  title: string;
  code: string;
  onChange: (c: string) => void;
  onComplete: () => void;
  shakeAnim?: Animated.Value;
}) {
  const handlePress = (num: string) => {
    if (code.length < PASSCODE_LENGTH) {
      const newCode = code + num;
      onChange(newCode);
      if (newCode.length === PASSCODE_LENGTH) {
        setTimeout(() => onComplete(), 200);
      }
    }
  };

  const handleDelete = () => {
    onChange(code.slice(0, -1));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>

      <Animated.View
        style={[styles.dotsContainer, shakeAnim ? { transform: [{ translateX: shakeAnim }] } : {}]}
      >
        {[...Array(PASSCODE_LENGTH)].map((_, i) => (
          <View
            key={i}
            style={[styles.dot, { backgroundColor: i < code.length ? "#1f6feb" : "#444" }]}
          />
        ))}
      </Animated.View>

      <View style={styles.keypad}>
        {["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"].map((item, i) => (
          <TouchableOpacity
            key={i}
            style={styles.key}
            onPress={() => {
              if (item === "⌫") handleDelete();
              else if (item !== "") handlePress(item);
            }}
          >
            <Text style={styles.keyText}>{item}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// ===== BOOK CRUD =====
function BookCRUD({ onResetPasscode }: { onResetPasscode: () => void }) {
  const [books, setBooks] = useState<{ id: string; title: string; author: string }[]>([]);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [resetModal, setResetModal] = useState(false);

  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem(BOOKS_KEY);
      if (stored) setBooks(JSON.parse(stored));
    })();
  }, []);

  const saveBooks = async (next: typeof books) => {
    setBooks(next);
    await AsyncStorage.setItem(BOOKS_KEY, JSON.stringify(next));
  };

  const handleSave = () => {
    if (!title.trim() || !author.trim()) return;

    if (editingId) {
      const next = books.map((b) =>
        b.id === editingId ? { ...b, title: title.trim(), author: author.trim() } : b
      );
      saveBooks(next);
      setEditingId(null);
    } else {
      const newBook = { id: Date.now().toString(), title: title.trim(), author: author.trim() };
      saveBooks([newBook, ...books]);
    }
    setTitle("");
    setAuthor("");
  };

  const handleEdit = (book: { id: string; title: string; author: string }) => {
    setEditingId(book.id);
    setTitle(book.title);
    setAuthor(book.author);
  };

  const handleDelete = (id: string) => {
    const next = books.filter((b) => b.id !== id);
    saveBooks(next);
  };

  const handleResetPasscode = async (newCode: string) => {
    await AsyncStorage.setItem(PASSCODE_KEY, newCode);
    setResetModal(false);
    onResetPasscode(); // กลับไปหน้า Login เพื่อให้ใส่รหัสใหม่
  };

  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: "#fff" }}>
      <Text style={{ fontSize: 22, fontWeight: "700", marginBottom: 10 }}>📚 จัดการหนังสือ</Text>

      <TextInput
        style={styles.input}
        placeholder="ชื่อหนังสือ"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={styles.input}
        placeholder="ผู้แต่ง"
        value={author}
        onChangeText={setAuthor}
      />
      <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={handleSave}>
        <Text style={styles.btnText}>{editingId ? "บันทึกการแก้ไข" : "เพิ่มหนังสือ"}</Text>
      </TouchableOpacity>

      {/* Reset Passcode Button */}
      <TouchableOpacity
        style={[styles.btn, { backgroundColor: "#f59e0b", marginTop: 15 }]}
        onPress={() => setResetModal(true)}
      >
        <Text style={styles.btnText}>เปลี่ยนรหัสผ่าน</Text>
      </TouchableOpacity>

      <FlatList
        data={books}
        keyExtractor={(item) => item.id}
        style={{ marginTop: 20 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: "700", fontSize: 16 }}>{item.title}</Text>
              <Text style={{ color: "#555" }}>✍ {item.author}</Text>
            </View>
            <TouchableOpacity
              onPress={() => handleEdit(item)}
              style={[styles.actionBtn, { backgroundColor: "#1f6feb" }]}
            >
              <Text style={{ color: "#fff" }}>แก้ไข</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleDelete(item.id)}
              style={[styles.actionBtn, { backgroundColor: "#ef4444" }]}
            >
              <Text style={{ color: "#fff" }}>ลบ</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      {/* Modal reset passcode */}
      <Modal visible={resetModal} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>สร้างรหัสใหม่</Text>
            <RegisterPasscodeScreen onRegister={handleResetPasscode} />
            <TouchableOpacity
              style={[styles.btn, styles.btnGhost]}
              onPress={() => setResetModal(false)}
            >
              <Text style={{ fontWeight: "700" }}>ยกเลิก</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ===== STYLES =====
const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#111" },
  title: { fontSize: 22, color: "white", marginBottom: 40 },
  dotsContainer: { flexDirection: "row", marginBottom: 50, gap: 20 },
  dot: { width: 18, height: 18, borderRadius: 9, backgroundColor: "#444" },
  keypad: {
    width: "80%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
  },
  key: {
    width: "30%",
    aspectRatio: 1,
    backgroundColor: "#222",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 50,
  },
  keyText: { fontSize: 24, color: "white", fontWeight: "600" },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  btn: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 5,
  },
  btnPrimary: { backgroundColor: "#1f6feb" },
  btnGhost: { backgroundColor: "#f3f4f6", marginTop: 10 },
  btnText: { color: "white", fontWeight: "700" },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    marginBottom: 10,
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#eee",
  },
  actionBtn: {
    padding: 8,
    borderRadius: 6,
    marginLeft: 8,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    padding: 16,
  },
  modalCard: { backgroundColor: "white", borderRadius: 14, padding: 16 },
  modalTitle: { fontSize: 18, fontWeight: "800", marginBottom: 12 },
});
