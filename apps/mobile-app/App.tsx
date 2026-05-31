import { StatusBar } from "expo-status-bar";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";

const summaryItems = ["Savings", "Loans", "Wallet"];

export default function App() {
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>SACCO Mobile</Text>
        <Text style={styles.title}>Member self-service</Text>
      </View>
      <View style={styles.grid}>
        {summaryItems.map((item) => (
          <View style={styles.card} key={item}>
            <Text style={styles.cardLabel}>{item}</Text>
            <Text style={styles.cardValue}>Ready</Text>
          </View>
        ))}
      </View>
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f7f8f5",
    padding: 24
  },
  header: {
    marginBottom: 24
  },
  eyebrow: {
    color: "#2f6f4e",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 8,
    textTransform: "uppercase"
  },
  title: {
    color: "#17211b",
    fontSize: 32,
    fontWeight: "800"
  },
  grid: {
    gap: 12
  },
  card: {
    backgroundColor: "#ffffff",
    borderColor: "#d9ded5",
    borderRadius: 8,
    borderWidth: 1,
    padding: 18
  },
  cardLabel: {
    color: "#59645c",
    marginBottom: 8
  },
  cardValue: {
    color: "#17211b",
    fontSize: 20,
    fontWeight: "800"
  }
});
