import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Vibration, Animated } from "react-native";

const PASSCODE_LENGTH = 4; // กำหนดความยาวรหัส

export default function PasscodeScreen({ onSuccess }) {
  const [code, setCode] = useState("");
  const [shakeAnim] = useState(new Animated.Value(0));

  const handlePress = (num: string) => {
    if (code.length < PASSCODE_LENGTH) {
      const newCode = code + num;
      setCode(newCode);

      if (newCode.length === PASSCODE_LENGTH) {
        if (newCode === "1234") {
          // ✅ ใส่รหัสถูก
          onSuccess();
        } else {
          // ❌ ใส่รหัสผิด → สั่น + shake
          Vibration.vibrate(200);
          Animated.sequence([
            Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
          ]).start();
          setCode("");
        }
      }
    }
  };

  const handleDelete = () => {
    setCode(code.slice(0, -1));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ใส่รหัสผ่าน</Text>

      {/* วงกลม passcode */}
      <Animated.View style={[styles.dotsContainer, { transform: [{ translateX: shakeAnim }] }]}>
        {[...Array(PASSCODE_LENGTH)].map((_, i) => (
          <View
            key={i}
            style={[styles.dot, { backgroundColor: i < code.length ? "#1f6feb" : "#ccc" }]}
          />
        ))}
      </Animated.View>

      {/* Keypad */}
      <View style={styles.keypad}>
        {["1","2","3","4","5","6","7","8","9","","0","⌫"].map((item, i) => (
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

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#111" },
  title: { fontSize: 22, color: "white", marginBottom: 40 },
  dotsContainer: { flexDirection: "row", marginBottom: 50, gap: 20 },
  dot: { width: 18, height: 18, borderRadius: 9, backgroundColor: "#ccc" },
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
});
