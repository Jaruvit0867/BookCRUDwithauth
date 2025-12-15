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

  return (
    <BookCRUD
      onResetPasscode={(newCode) => {
        if (newCode) setSavedPasscode(newCode);
        setAuthenticated(false);
      }}
    />
  );
}

// ===== REGISTER SCREEN =====
function RegisterPasscodeScreen({
  onRegister,
  variant = "fullscreen",
}: {
  onRegister: (c: string) => void;
  variant?: "fullscreen" | "modal";
}) {
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
      variant={variant}
    />
  );
}

// ===== LOGIN SCREEN =====
function LoginPasscodeScreen({
  correctCode,
  onSuccess,
  variant = "fullscreen",
}: {
  correctCode: string;
  onSuccess: () => void;
  variant?: "fullscreen" | "modal";
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
      title={variant === "modal" ? "ยืนยันรหัสผ่านเดิม" : "ใส่รหัสผ่าน"}
      code={code}
      onChange={setCode}
      onComplete={handleComplete}
      shakeAnim={shakeAnim}
      variant={variant}
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
  variant = "fullscreen",
}: {
  title: string;
  code: string;
  onChange: (c: string) => void;
  onComplete: () => void;
  shakeAnim?: Animated.Value;
  variant?: "fullscreen" | "modal";
}) {
  const isModal = variant === "modal";
  // Modal overrides
  const containerStyle = isModal ? null : styles.passcodeContainer;
  const titleStyle = isModal ? [styles.modalTitle, { marginBottom: 30 }] : styles.passcodeTitle;
  const keyBg = isModal ? "#f1f5f9" : "rgba(255,255,255,0.15)";
  const keyText = isModal ? COLORS.text : "white";
  const dotEmpty = isModal ? "#cbd5e1" : "#334155";

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
    <View style={containerStyle}>
      <Text style={titleStyle}>{title}</Text>

      <Animated.View
        style={[
          styles.dotsContainer,
          isModal && { justifyContent: "center", marginBottom: 30 },
          shakeAnim ? { transform: [{ translateX: shakeAnim }] } : {},
        ]}
      >
        {[...Array(PASSCODE_LENGTH)].map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              { backgroundColor: i < code.length ? COLORS.primary : dotEmpty },
              i < code.length && styles.dotActive,
            ]}
          />
        ))}
      </Animated.View>

      <View style={[styles.keypad, isModal && { width: "100%" }]}>
        {["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"].map((item, i) => (
          <TouchableOpacity
            key={i}
            style={[
              styles.key,
              { backgroundColor: item ? keyBg : "transparent" },
              isModal && { width: 65, height: 65, borderRadius: 32.5 },
            ]}
            disabled={item === ""}
            onPress={() => {
              if (item === "⌫") handleDelete();
              else if (item !== "") handlePress(item);
            }}
          >
            <Text style={[styles.keyText, { color: keyText }, isModal && { fontSize: 24 }]}>
              {item === "⌫" ? "⌫" : item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// ===== BOOK CRUD =====
function BookCRUD({ onResetPasscode }: { onResetPasscode: (newCode?: string) => void }) {
  const [books, setBooks] = useState<{ id: string; title: string; author: string }[]>([]);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [resetModal, setResetModal] = useState(false);
  const [resetStep, setResetStep] = useState<"verify" | "new">("verify");
  const [currentPasscodeForVerify, setCurrentPasscodeForVerify] = useState<string>("");

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
    await AsyncStorage.setItem(PASSCODE_KEY, newCode);
    setResetModal(false);
    onResetPasscode(newCode); // ส่งรหัสใหม่กลับไปอัปเดต state
  };

  return (

    <View style={styles.mainContainer}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📚 My Library</Text>
        <TouchableOpacity
          style={{ padding: 8 }}
          onPress={async () => {
            const code = await AsyncStorage.getItem(PASSCODE_KEY);
            if (code) setCurrentPasscodeForVerify(code);
            setResetStep("verify");
            setResetModal(true);
          }}
        >
          <Text style={{ fontSize: 24 }}>⚙️</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.inputCard}>
        <TextInput
          style={styles.input}
          placeholder="ชื่อหนังสือ..."
          placeholderTextColor="#94a3b8"
          value={title}
          onChangeText={setTitle}
        />
        <TextInput
          style={styles.input}
          placeholder="ชื่อผู้แต่ง..."
          placeholderTextColor="#94a3b8"
          value={author}
          onChangeText={setAuthor}
        />
        <TouchableOpacity
          style={[styles.btn, editingId ? styles.btnSecondary : styles.btnPrimary]}
          onPress={handleSave}
        >
          <Text style={styles.btnText}>
            {editingId ? "✨ บันทึกการแก้ไข" : "＋ เพิ่มหนังสือใหม่"}
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={books}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.bookCard}>
            <View style={styles.bookInfo}>
              <Text style={styles.bookTitle}>{item.title}</Text>
              <Text style={styles.bookAuthor}>✍ {item.author}</Text>
            </View>
            <View style={styles.actionRow}>
              <TouchableOpacity
                onPress={() => handleEdit(item)}
                style={[styles.iconBtn, { backgroundColor: "#e0e7ff" }]}
              >
                <Text>✏️</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleDelete(item.id)}
                style={[styles.iconBtn, { backgroundColor: "#fee2e2" }]}
              >
                <Text>🗑️</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* Modal reset passcode */}
      <Modal visible={resetModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            {resetStep === "verify" ? (
              <LoginPasscodeScreen
                correctCode={currentPasscodeForVerify}
                onSuccess={() => setResetStep("new")}
                variant="modal"
              />
            ) : (
              <RegisterPasscodeScreen onRegister={handleResetPasscode} variant="modal" />
            )}
            <TouchableOpacity
              style={[styles.btn, styles.btnGhost, { marginTop: 20 }]}
              onPress={() => setResetModal(false)}
            >
              <Text style={{ color: COLORS.textSecondary, fontWeight: "600" }}>ยกเลิก</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ===== STYLES =====
// ===== STYLES =====
const COLORS = {
  primary: "#4f46e5", // Indigo 600
  secondary: "#10b981", // Emerald 500
  danger: "#ef4444", // Red 500
  background: "#f8fafc", // Slate 50
  surface: "#ffffff",
  text: "#1e293b", // Slate 800
  textSecondary: "#64748b", // Slate 500
  border: "#e2e8f0", // Slate 200
  inputBg: "#f1f5f9", // Slate 100
  passcodeBg: "#0f172a", // Slate 900
  glass: "rgba(255, 255, 255, 0.15)",
};

const styles = StyleSheet.create({
  // Global
  mainContainer: { flex: 1, padding: 24, paddingTop: 60, backgroundColor: COLORS.background },

  // Passcode Screen
  passcodeContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.passcodeBg,
  },
  passcodeTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "white",
    marginBottom: 50,
    letterSpacing: 1,
  },
  dotsContainer: {
    flexDirection: "row",
    marginBottom: 50,
    gap: 20,
    height: 20,
    alignItems: "center",
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#334155", // Slate 700
  },
  dotActive: {
    backgroundColor: COLORS.primary,
    transform: [{ scale: 1.2 }],
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  keypad: {
    width: "80%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 24,
  },
  key: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.glass,
  },
  keyText: { fontSize: 28, color: "white", fontWeight: "500" },

  // Book CRUD Config
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  headerTitle: { fontSize: 28, fontWeight: "800", color: COLORS.text },

  inputCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  input: {
    backgroundColor: COLORS.inputBg,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    fontSize: 16,
    color: COLORS.text,
  },

  btn: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  btnPrimary: { backgroundColor: COLORS.primary },
  btnSecondary: { backgroundColor: COLORS.secondary },
  btnGhost: { backgroundColor: "transparent", shadowOpacity: 0, paddingVertical: 10 },
  btnText: { color: "white", fontWeight: "700", fontSize: 16 },

  // Card List
  bookCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#64748b",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  bookInfo: { flex: 1 },
  bookTitle: { fontSize: 17, fontWeight: "700", color: COLORS.text, marginBottom: 4 },
  bookAuthor: { fontSize: 14, color: COLORS.textSecondary, fontWeight: "500" },
  actionRow: { flexDirection: "row", gap: 10 },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  // Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    justifyContent: "center",
    padding: 24,
  },
  modalCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 28,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 24,
    color: COLORS.text,
    textAlign: "center",
  },
});
